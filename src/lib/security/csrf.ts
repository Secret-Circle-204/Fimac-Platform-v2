import { cookies } from "next/headers"
import { randomBytes } from "node:crypto"
const _CSRF_TOKEN_NAME = "X-CSRF-Token"
const CSRF_COOKIE_NAME = "__csrf_token"

/**
 * إنشاء وحفظ CSRF Token
 */
export async function generateAndSetCSRFToken(): Promise<string> {
  const token = generateRandomToken(32)
  const cookieStore = await cookies()

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 ساعة
  })

  return token
}

/**
 * التحقق من CSRF Token
 */
export async function verifyCSRFToken(token: string): Promise<boolean> {
  const cookieStore = await cookies()
  const storedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value

  if (!storedToken || !token) {
    return false
  }

  // استخدام timing-safe comparison لتجنب timing attacks
  return timingSafeEqual(token, storedToken)
}

/**
 * الحصول على CSRF Token من الـ cookies
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null
}

/**
 * توليد token عشوائي
 */
function generateRandomToken(length: number): string {
  // Convert length to bytes (hex string is 2 chars per byte)
  const byteLength = Math.ceil(length / 2);
  return randomBytes(byteLength).toString('hex').slice(0, length);
}

/**
 * مقارنة آمنة من حيث التوقيت (Timing-Safe Comparison)
 * تمنع timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}
