import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { getPayloadClient } from "@/db/client"

export type CurrentUser = {
  id: string
  email: string
  full_name: string
  company_name?: string
  phone: string
  verification_status: string
  role: "investor" | "seller"
  collection: "investors" | "sellers"
}

const TOKEN_COOKIE_CONFIG = [
  { name: "payload-token-investors", collection: "investors" as const, role: "investor" as const },
  { name: "payload-token-sellers", collection: "sellers" as const, role: "seller" as const },
]

function mapUserRecord<T extends { id: string | number }>(
  user: T,
  role: "investor" | "seller",
  collection: "investors" | "sellers"
): CurrentUser {
  const u = user as unknown as Record<string, unknown>
  return {
    id: String(user.id),
    email: u.email as string,
    full_name: u.full_name as string,
    company_name: (u.company_name as string) || "",
    phone: u.phone as string,
    verification_status: u.verification_status as string,
    role,
    collection,
  }
}

async function verifyTokenAndFetchUser(
  token: string,
  collection: "investors" | "sellers",
  role: "investor" | "seller"
) {
  const payload = await getPayloadClient()
  const encoder = new TextEncoder()
  const { payload: decoded } = await jwtVerify(token, encoder.encode(payload.secret))
  const userId = decoded?.id

  if (!userId) {
    throw new Error("Token missing user id")
  }

  try {
    const user = await payload.findByID({
      collection: collection,
      id: String(userId),
    })

    if (!user) {
      return null
    }

    return mapUserRecord(user, role, collection)
  } catch (error: unknown) {
    const payloadErr = error as { status?: number; name?: string }
    if (payloadErr.status === 404 || payloadErr.name === 'NotFound') {
      return null
    }
    throw error
  }
}

async function authenticateViaHeaders(headers: Headers): Promise<CurrentUser | null> {
  const payload = await getPayloadClient()
  try {
    const authResult = await payload.auth({ headers })
    const user = authResult.user as (Record<string, unknown> & { id: string | number }) | null
    if (!user?.collection) {
      return null
    }

    if (user.collection === "investors") {
      return mapUserRecord(user, "investor", "investors")
    }
    if (user.collection === "sellers") {
      return mapUserRecord(user, "seller", "sellers")
    }
  } catch (_error) {
    return null
  }

  return null
}

type GetCurrentUserOptions = {
  headers?: Headers
}

export async function getCurrentUser(options?: GetCurrentUserOptions): Promise<CurrentUser | null> {
  if (options?.headers) {
    const headerUser = await authenticateViaHeaders(options.headers)
    if (headerUser) {
      return headerUser
    }
  }

  const cookieStore = await cookies()

  for (const { name, collection, role } of TOKEN_COOKIE_CONFIG) {
    const cookie = cookieStore.get(name)
    if (!cookie?.value) {
      continue
    }

    try {
      const user = await verifyTokenAndFetchUser(cookie.value, collection, role)
      if (user) {
        return user
      }
    } catch (error: unknown) {
      const err = error as Record<string, unknown> & { code?: string; message?: string }
      const isJwtError = !!(err && err.code && (
        err.code === "ERR_JWT_EXPIRED" ||
        err.code === "ERR_JWS_INVALID" ||
        err.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED" ||
        err.code === "ERR_JWT_CLAIM_VALIDATION_FAILED"
      ))

      if (isJwtError) {
        // Safe, clean logging for expected client session state/expiration
        console.log(`[Auth] Cookie ${name} is invalid or expired (${err.code})`)
      } else {
        // Unexpected error (e.g. database connection, config mismatch) should be logged as a warning
        console.warn(`[Auth] Failed to verify auth cookie ${name}:`, err?.message || err)
      }
    }
  }

  return null
}

export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireInvestor(): Promise<CurrentUser> {
  const user = await requireAuth()
  if (user.role !== "investor") {
    throw new Error("Insufficient permissions")
  }
  return user
}

export async function requireSeller(): Promise<CurrentUser> {
  const user = await requireAuth()
  if (user.role !== "seller") {
    throw new Error("Insufficient permissions")
  }
  return user
}
