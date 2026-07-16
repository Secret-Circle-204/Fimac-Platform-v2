import { NextRequest, NextResponse } from 'next/server'
import { getCORSHeaders, getSecurityHeaders } from './lib/security/cors'
import { checkRateLimit, RATE_LIMIT_PRESETS } from './lib/security/rate-limit'
import { getClientIP, isPrivateIP } from './lib/security/ip-utils'

export async function middleware(request: NextRequest) {
  // سجل أي طلب فوراً قبل أي شرط
  console.log(`[DEBUG] Incoming Request: ${request.method} ${request.nextUrl.pathname}`);

  const ip = getClientIP(request);
  console.log(`[MIDDLEWARE] ${request.method} ${request.nextUrl.pathname} | IP: ${ip} | Time: ${new Date().toISOString()}`);

  const pathname = request.nextUrl.pathname

  // تخطي الملفات الثابتة والـ public
  if (pathname.startsWith('/_next') || pathname.startsWith('/public')) {
    return NextResponse.next()
  }

  // الحصول على معرف العميل (IP أو User ID)
  const clientId = ip


  // تحديد الحد المناسب والمفتاح الخاص به حسب المسار
  let limitPreset = RATE_LIMIT_PRESETS.API
  let limitKey = 'api'

  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/contact')) {
      limitPreset = RATE_LIMIT_PRESETS.CONTACT
      limitKey = 'contact'
    } else if (pathname.startsWith('/api/upload-photo')) {
      limitPreset = RATE_LIMIT_PRESETS.UPLOAD
      limitKey = 'upload'
    } else if (pathname.startsWith('/api/track-view')) {
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
    // لصفحات العرض العادية (HTML)، نضع حداً مرتفعاً جداً لمنع حظر المستخدمين الحقيقيين أثناء التصفح
    limitPreset = {
      windowMs: 15 * 60 * 1000, // 15 دقيقة
      maxRequests: 1500, // 1500 طلب
    }
    limitKey = 'page'
  }

  // التحقق من Rate Limiting (يتم تخطيه في التطوير المحلي لتجنب حظر المطور أثناء العمل)
  const isDev = process.env.NODE_ENV === 'development'
  const isLocal = isPrivateIP(clientId)

  if (!isDev && !isLocal && !checkRateLimit(`${clientId}:${limitKey}`, limitPreset)) {
    const acceptHeader = request.headers.get('accept') || ''
    if (acceptHeader.includes('application/json') || request.nextUrl.pathname.startsWith('/api/')) {
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
