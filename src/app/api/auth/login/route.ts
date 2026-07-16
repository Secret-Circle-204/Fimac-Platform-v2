import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/db/client'
import { cookies } from 'next/headers'
import { AUTH_COOKIE_DOMAIN, NODE_ENV } from '@/env'
import { checkRateLimit, RATE_LIMIT_PRESETS } from '@/lib/security/rate-limit'
import { getClientIP } from '@/lib/security/ip-utils'

export async function POST(request: NextRequest) {
  try {
    // الحصول على معرف العميل (IP)
    const clientId = getClientIP(request)

    // التحقق من Rate Limiting باستخدام مفتاح فريد ومستقل للمصادقة
    if (!checkRateLimit(`${clientId}:auth`, RATE_LIMIT_PRESETS.AUTH)) {
      return NextResponse.json(
        {
          error: 'Too many login attempts',
          message: 'Please try again after 15 minutes',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '900', // 15 دقيقة
          },
        },
      )
    }

    const body = await request.json()
    const { email, password, user_type = "buyers" } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (user_type !== "buyers" && user_type !== "sellers") {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    try {
      // Authenticate user using Payload's built-in auth
      const result = await payload.login({
        collection: user_type,
        data: {
          email,
          password,
        },
      })

      if (!result.user) {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
      }

      // Check if user is verified
      const u = result.user as unknown as Record<string, unknown>
      if (u.verification_status !== 'verified') {
        return NextResponse.json(
          {
            error: 'Email not verified',
            code: 'EMAIL_NOT_VERIFIED',
            message: 'Please verify your email before logging in',
          },
          { status: 403 },
        )
      }

      // Set auth cookie
      const cookieStore = await cookies()
      const isSeller = user_type === 'sellers'
      const cookieName = isSeller ? 'payload-token-sellers' : 'payload-token-buyers'
      const otherCookieName = isSeller ? 'payload-token-buyers' : 'payload-token-sellers'

      // Delete the other role's cookie to avoid role/session conflicts in the same browser
      cookieStore.delete(otherCookieName)

      const isProduction = NODE_ENV === 'production'
      const cookieOptions: Parameters<typeof cookieStore.set>[2] = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      }

      if (AUTH_COOKIE_DOMAIN) {
        cookieOptions.domain = AUTH_COOKIE_DOMAIN
      }

      cookieStore.set(cookieName, result.token as string, cookieOptions)

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          id: result.user.id,
          email: result.user.email,
          role: user_type,
        },
        token: result.token,
      })
    } catch (authError: unknown) {
      if (
        authError instanceof Error &&
        (authError.message?.includes('incorrect') ||
          authError.message?.includes('credentials') ||
          (authError as Error & { status?: number }).status === 401)
      ) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
      throw authError
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 },
    )
  }
}
