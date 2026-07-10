import { NextRequest, NextResponse } from 'next/server'
import { getCORSHeaders, getSecurityHeaders } from './lib/security/cors'
import { checkRateLimit, RATE_LIMIT_PRESETS } from './lib/security/rate-limit'

export function middleware(request: NextRequest) {
  // سجل أي طلب فوراً قبل أي شرط
  console.log(`[DEBUG] Incoming Request: ${request.method} ${request.nextUrl.pathname}`);

  const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
  console.log(`[MIDDLEWARE] ${request.method} ${request.nextUrl.pathname} | IP: ${ip} | Time: ${new Date().toISOString()}`);

  const pathname = request.nextUrl.pathname

  // تخطي الملفات الثابتة والـ public
  if (pathname.startsWith('/_next') || pathname.startsWith('/public')) {
    return NextResponse.next()
  }

  // الحصول على معرف العميل (IP أو User ID)
  const clientId =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  // تحديد الحد المناسب حسب المسار
  let limitPreset = RATE_LIMIT_PRESETS.API // الافتراضي للـ API

  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/contact') || pathname.startsWith('/api/newsletter')) {
      limitPreset = RATE_LIMIT_PRESETS.CONTACT // حد صارم لرسائل التواصل والنشرة البريدية
    } else if (pathname.startsWith('/api/upload-photo')) {
      limitPreset = RATE_LIMIT_PRESETS.UPLOAD // حد لرفع الصور
    } else if (pathname.includes('search') || pathname.includes('track-view')) {
      limitPreset = RATE_LIMIT_PRESETS.SEARCH // حد للبحث والأنشطة المتكررة
    }
  } else {
    // لصفحات العرض العادية (HTML)، نضع حداً مرتفعاً جداً لمنع حظر المستخدمين الحقيقيين أثناء التصفح
    limitPreset = {
      windowMs: 15 * 60 * 1000, // 15 دقيقة
      maxRequests: 1500, // 1500 طلب
    }
  }

  // التحقق من Rate Limiting
  if (!checkRateLimit(clientId, limitPreset)) {
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
