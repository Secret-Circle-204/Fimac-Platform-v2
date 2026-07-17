import { NextRequest, NextResponse } from 'next/server'
import { getCORSHeaders, getSecurityHeaders } from './lib/security/cors'
import { checkRateLimit, RATE_LIMIT_PRESETS } from './lib/security/rate-limit'
import { getClientIP, isPrivateIP } from './lib/security/ip-utils'
import { jwtVerify } from 'jose'

const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || ''

// Configuration: API prefixes and collection media path
const API_PREFIX = '/api'
const MEDIA_ROUTE = `${API_PREFIX}/media/`

// No in-memory cache to prevent memory leaks and expiration mismatches

// Helper function to verify JWT signatures natively at Edge speed (<1ms) and validate collection claim
async function isValidSessionToken(
  token: string | undefined,
  expectedCollection: string,
): Promise<boolean> {
  if (!token) return false
  try {
    const encoder = new TextEncoder()
    const { payload } = await jwtVerify(token, encoder.encode(PAYLOAD_SECRET))
    return payload && typeof payload === 'object' && payload.collection === expectedCollection
  } catch (_err) {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const ip = getClientIP(request)

  // 1. تخطي الملفات الثابتة والـ public وملفات الميديا الخاصة بـ Payload مبكراً لتخفيف العبء
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.startsWith(MEDIA_ROUTE) ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next()
  }

  // الحصول على معرف العميل (IP أو User ID)
  const clientId = ip

  // 2. التحقق من الكوكيز وتجاوز الـ Rate Limiter للمسؤولين والبائعين الموثقين
  const adminToken = request.cookies.get('payload-token')?.value
  const sellerToken = request.cookies.get('payload-token-sellers')?.value
  const activeToken = adminToken || sellerToken

  const isDev = process.env.NODE_ENV === 'development'
  const isLocal = isPrivateIP(clientId)
  let isBypassed = isDev || isLocal

  // فحص حالة الجلسة قبل الدخول للـ Rate Limiter لمنع المسؤولين من استهلاك العداد العام للموقع
  if (!isBypassed && activeToken) {
    const hasValidAdmin = adminToken && await isValidSessionToken(adminToken, 'users')
    const hasValidSeller = sellerToken && await isValidSessionToken(sellerToken, 'sellers')
    isBypassed = !!(hasValidAdmin || hasValidSeller)
  }

  // تخطي تحديد معدل الطلبات تماماً للجلسات الموثقة
  if (isBypassed) {
    return NextResponse.next()
  }

  // تحديد الحد المناسب والمفتاح الخاص به حسب المسار
  let limitPreset = RATE_LIMIT_PRESETS.API
  let limitKey = 'api'

  if (pathname.startsWith(`${API_PREFIX}/`)) {
    if (pathname.startsWith(`${API_PREFIX}/contact`)) {
      limitPreset = RATE_LIMIT_PRESETS.CONTACT
      limitKey = 'contact'
    } else if (pathname.startsWith(`${API_PREFIX}/upload-photo`)) {
      limitPreset = RATE_LIMIT_PRESETS.UPLOAD
      limitKey = 'upload'
    } else if (pathname.startsWith(`${API_PREFIX}/track-view`)) {
      limitPreset = RATE_LIMIT_PRESETS.TRACK_VIEW
      limitKey = 'track_view'
      
      // استخلاص معرف العقار من الجسم بدون التأثير على قراءة الطلب الأساسية (Request cloning)
      if (request.method === 'POST') {
        try {
          const clone = request.clone()
          const body = await clone.json()
          if (body && body.propertyId) {
            limitKey = `track_view:${body.propertyId}`
          }
        } catch (e) {
          console.warn('⚠️ Middleware: failed to extract propertyId from body:', e)
        }
      }
    }
  } else if (pathname.startsWith('/search')) {
    limitPreset = RATE_LIMIT_PRESETS.SEARCH
    limitKey = 'search'
  } else {
    // لصفحات العرض العادية (HTML)
    limitPreset = RATE_LIMIT_PRESETS.PUBLIC_PAGE
    limitKey = 'page'
  }

  // 3. التحقق من حد الطلبات لغير المسؤولين (الزوار العامين)
  if (!checkRateLimit(`${clientId}:${limitKey}`, limitPreset)) {
    // لا توجد جلسة صالحة وتم تجاوز الحد -> حظر الطلب بـ 429 وكتابة تحذير
    console.warn(
      `⚠️ [RATE LIMIT BLOCKED] IP: ${clientId} | Key: ${limitKey} | Path: ${request.method} ${pathname}`
    )

    const acceptHeader = request.headers.get('accept') || ''
    if (acceptHeader.includes('application/json') || request.nextUrl.pathname.startsWith(`${API_PREFIX}/`)) {
      return NextResponse.json({ error: 'Too Many Requests' }, {
        status: 429,
        headers: {
          'Retry-After': '900', // 15 دقيقة
        },
      })
    }
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '900', // 15 دقيقة
      },
    })
  }

  // معالجة CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        ...getCORSHeaders(request.headers.get('origin')),
        ...getSecurityHeaders(),
      },
    })
  }

  // إنشاء response
  const response = NextResponse.next()

  // إضافة CORS headers
  const corsHeaders = getCORSHeaders(request.headers.get('origin'))
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // إضافة Security headers
  const securityHeaders = getSecurityHeaders()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // إضافة CSRF token في الـ response (يمكن استخدامه في الـ frontend)
  const csrfToken = generateCSRFToken()
  response.headers.set('X-CSRF-Token', csrfToken)

  return response
}

function generateCSRFToken(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export const config = {
  matcher: [
    /*
     * تطبيق على جميع المسارات ما عدا:
     * - api/auth (لتجنب مشاكل المصادقة)
     * - _next/static (ملفات ثابتة)
     * - _next/image (تحسين الصور)
     * - favicon.ico (أيقونة)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
