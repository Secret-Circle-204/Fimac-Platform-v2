/**
 * CORS Configuration - تحسين الأمان والتوافقية
 */

export interface CORSConfig {
  allowedOrigins: string[]
  allowedMethods: string[]
  allowedHeaders: string[]
  exposedHeaders: string[]
  credentials: boolean
  maxAge: number
}

/**
 * الإعدادات الافتراضية للـ CORS
 */
export const DEFAULT_CORS_CONFIG: CORSConfig = {
  allowedOrigins: [
    'http://localhost:8181',
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_SITE_URL || '',
    process.env.NEXT_PUBLIC_SERVER_URL || '',
  ].filter(Boolean),
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400, // 24 ساعة
}

/**
 * التحقق من أن الـ origin مسموح به
 */
export function isOriginAllowed(origin: string | null, config: CORSConfig): boolean {
  if (!origin) {
    return false
  }
  return config.allowedOrigins.includes(origin)
}

/**
 * الحصول على رؤوس CORS
 */
export function getCORSHeaders(
  origin: string | null,
  config: CORSConfig = DEFAULT_CORS_CONFIG,
): Record<string, string> {
  const isAllowed = isOriginAllowed(origin, config)

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin! : config.allowedOrigins[0],
    'Access-Control-Allow-Methods': config.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': config.allowedHeaders.join(', '),
    'Access-Control-Expose-Headers': config.exposedHeaders.join(', '),
    'Access-Control-Allow-Credentials': config.credentials ? 'true' : 'false',
    'Access-Control-Max-Age': config.maxAge.toString(),
  }
}

/**
 * رؤوس الأمان الإضافية
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // منع MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    // منع Clickjacking
    'X-Frame-Options': 'DENY',
    // منع XSS
    'X-XSS-Protection': '1; mode=block',
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Permissions Policy (Feature Policy)
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
    // HSTS - إجبار HTTPS
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join('; '),
  }
}

/**
 * التحقق من أن الطلب يحتوي على رؤوس CORS صحيحة
 */
export function validateCORSRequest(
  origin: string | null,
  method: string,
  config: CORSConfig = DEFAULT_CORS_CONFIG,
): { valid: boolean; reason?: string } {
  // التحقق من الـ origin
  if (!isOriginAllowed(origin, config)) {
    return {
      valid: false,
      reason: `Origin '${origin}' is not allowed`,
    }
  }

  // التحقق من الـ method
  if (!config.allowedMethods.includes(method)) {
    return {
      valid: false,
      reason: `Method '${method}' is not allowed`,
    }
  }

  return { valid: true }
}
