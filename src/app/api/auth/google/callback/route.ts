import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/db/client'
import { cookies } from 'next/headers'
import { AUTH_COOKIE_DOMAIN, NODE_ENV } from '@/env'
import type { Buyer } from '@/payload-types'

interface GoogleTokenResponse {
  access_token: string
  id_token: string
  token_type: string
}

interface GoogleUserInfo {
  sub: string // Google unique ID
  name: string
  email: string
  email_verified: boolean
  picture: string
}

export async function GET(request: NextRequest) {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8181'
  const siteUrl = rawSiteUrl.replace(/\/$/, "")

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(`${siteUrl}/auth/login?error=google_denied`)
    }

    if (!code) {
      return NextResponse.redirect(`${siteUrl}/auth/login?error=no_code`)
    }

    // 1. Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${siteUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Google token exchange failed:', await tokenResponse.text())
      return NextResponse.redirect(`${siteUrl}/auth/login?error=token_failed`)
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json()

    // 2. Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(`${siteUrl}/auth/login?error=userinfo_failed`)
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json()

    if (!googleUser.email_verified) {
      return NextResponse.redirect(`${siteUrl}/auth/login?error=email_not_verified`)
    }

    const payload = await getPayloadClient()

    // 3. Find existing buyer by google_id or email
    let buyer: Buyer | null = null

    // Search by google_id first
    const byGoogleId = await payload.find({
      collection: 'buyers',
      where: { google_id: { equals: googleUser.sub } },
      limit: 1,
    })

    if (byGoogleId.docs.length > 0) {
      buyer = byGoogleId.docs[0]
    } else {
      // Search by email
      const byEmail = await payload.find({
        collection: 'buyers',
        where: { email: { equals: googleUser.email } },
        limit: 1,
      })

      if (byEmail.docs.length > 0) {
        buyer = byEmail.docs[0]
        // Link Google account to existing buyer
        await payload.update({
          collection: 'buyers',
          id: buyer.id,
          data: {
            google_id: googleUser.sub,
            profile_image: googleUser.picture || undefined,
          },
        })
      }
    }

    // 4. Create new buyer if not found
    if (!buyer) {
      // Generate a random password for the Google user (they'll use Google to login)
      const randomPassword = crypto.randomUUID() + 'Aa1!'

      buyer = await payload.create({
        collection: 'buyers',
        data: {
          email: googleUser.email,
          password: randomPassword,
          full_name: googleUser.name,
          google_id: googleUser.sub,
          profile_image: googleUser.picture || '',
          verification_status: 'verified', // Google emails are pre-verified
          phone: '',
        },
      })
    }

    // 5. Login the user via Payload to generate JWT
    // Use Payload's internal auth to get a token
    const loginResult = await payload
      .login({
        collection: 'buyers',
        data: {
          email: googleUser.email,
          password: 'dummy', // This won't work for password auth
        },
      })
      .catch(() => null)

    // If password login fails (expected for Google users), generate token manually
    let token: string

    if (loginResult?.token) {
      token = loginResult.token
    } else {
      // Generate JWT manually using jose
      const { SignJWT } = await import('jose')
      const encoder = new TextEncoder()
      const secret = encoder.encode(payload.secret)

      token = await new SignJWT({
        id: buyer.id,
        email: buyer.email,
        collection: 'buyers',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(secret)
    }

    // 6. Set auth cookie
    const cookieStore = await cookies()
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

    cookieStore.set('payload-token-buyers', token, cookieOptions)

    // 7. Redirect to home page with a hard refresh to bypass Next.js client cache
    return new NextResponse(
      `<html>
        <head>
          <script>
            window.location.replace('${siteUrl}');
          </script>
        </head>
        <body>
          <p>Redirecting to home...</p>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    )
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return new NextResponse(
      `<html>
        <head>
          <script>
            window.location.replace('${siteUrl}/auth/login?error=server_error');
          </script>
        </head>
        <body>
          <p>Redirecting to login...</p>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    )
  }
}
