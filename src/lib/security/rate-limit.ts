/**
 * Rate Limiting - منع الهجمات والاستخدام المفرط
 * في الإنتاج، استخدم Redis بدلاً من Map
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

// تخزين مؤقت في الذاكرة (في الإنتاج استخدم Redis)
const rateLimitStore = new Map<string, RateLimitRecord>()

// تنظيف السجلات منتهية الصلاحية بشكل دوري (Lazy Cleanup) لتجنب استخدام setInterval في بيئة Edge
function lazyCleanup() {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

export interface RateLimitConfig {
  windowMs: number // مدة النافذة الزمنية بالميلي ثانية
  maxRequests: number // عدد الطلبات المسموح بها
}

export const RATE_LIMIT_PRESETS = {
  // حدود صارمة للمصادقة
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    maxRequests: 5, // 5 محاولات فقط
  },
  // حدود معتدلة للـ API
  API: {
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    maxRequests: 100, // 100 طلب
  },
  // حدود للـ Search
  SEARCH: {
    windowMs: 1 * 60 * 1000, // دقيقة واحدة
    maxRequests: 100, // 100 طلب في الدقيقة
  },
  // حدود لتسجيل المشاهدات (لكل عقار على حدة)
  TRACK_VIEW: {
    windowMs: 1 * 60 * 1000, // دقيقة واحدة
    maxRequests: 30, // 30 طلب في الدقيقة لكل عقار
  },
  // حدود صارمة للـ Upload
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // ساعة واحدة
    maxRequests: 10, // 10 uploads فقط
  },
  // حدود صارمة جداً للـ Contact Form
  CONTACT: {
    windowMs: 60 * 60 * 1000, // ساعة واحدة
    maxRequests: 3, // 3 رسائل فقط
  },
}

/**
 * التحقق من حد الطلبات
 * @param identifier معرف فريد (IP، User ID، إلخ)
 * @param config إعدادات حد الطلبات
 * @returns true إذا كان الطلب مسموح به، false إذا تم تجاوز الحد
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): boolean {
  lazyCleanup() // تنظيف كسول للسجلات المنتهية لمنع تسريب الذاكرة
  const now = Date.now()
  const record = rateLimitStore.get(identifier)
  const storeSize = rateLimitStore.size

  // إذا لم تكن هناك سجلات أو انتهت الفترة الزمنية
  if (!record || now > record.resetTime) {
    const resetTime = now + config.windowMs
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    })
    console.log(
      `[RATE LIMIT INITIALIZE] Key: "${identifier}" | Count: 1/${config.maxRequests} | Store Size: ${storeSize + 1} | Reset: ${new Date(resetTime).toISOString()}`
    )
    return true
  }

  const before = record.count
  const resetTime = record.resetTime

  // إذا تم تجاوز الحد
  if (record.count >= config.maxRequests) {
    console.warn(
      `⚠️ [RATE LIMIT BLOCKED] Key: "${identifier}" | Count: ${record.count}/${config.maxRequests} | Store Size: ${storeSize} | Reset: ${new Date(resetTime).toISOString()}`
    )
    return false
  }

  // زيادة العداد
  record.count++
  console.log(
    `[RATE LIMIT INCREMENT] Key: "${identifier}" | Count: ${before} -> ${record.count}/${config.maxRequests} | Store Size: ${storeSize} | Reset: ${new Date(resetTime).toISOString()}`
  )
  return true
}

/**
 * الحصول على معلومات حد الطلبات
 */
export function getRateLimitInfo(
  identifier: string,
  config: RateLimitConfig
): {
  remaining: number
  resetTime: number
  isLimited: boolean
} {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    return {
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
      isLimited: false,
    }
  }

  return {
    remaining: Math.max(0, config.maxRequests - record.count),
    resetTime: record.resetTime,
    isLimited: record.count >= config.maxRequests,
  }
}

/**
 * إعادة تعيين حد الطلبات لمعرف معين
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}

/**
 * الحصول على عدد الطلبات المتبقية
 */
export function getRemainingRequests(
  identifier: string,
  config: RateLimitConfig
): number {
  const info = getRateLimitInfo(identifier, config)
  return info.remaining
}
