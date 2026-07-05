import { NextRequest, NextResponse } from "next/server"
import { getPayloadClient } from "@/db/client"
import { createHash } from "crypto"
import { triggerRevalidate } from "@/lib/cache/revalidate"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { analyticsCache } from "@/lib/cache/analytics-cache"

// Helper to generate visitor fingerprint
function generateVisitorId(req: NextRequest, userId?: string): string {
  const userAgent = req.headers.get("user-agent") || ""
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"

  // If user is logged in (but not owner/admin), include userId for better uniqueness
  const fingerprint = userId ? `${ip}-${userAgent}-${userId}` : `${ip}-${userAgent}`

  // Create a hash from IP + User Agent + userId for privacy
  return createHash("sha256").update(fingerprint).digest("hex")
}

// Helper to hash IP for privacy
function hashIP(ip: string): string {
  return createHash("sha256").update(ip).digest("hex")
}

// Helper to detect device type
function detectDevice(userAgent: string): "desktop" | "mobile" | "tablet" {
  const ua = userAgent.toLowerCase()
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet"
  }
  if (
    /mobile|android|ip(hone|od)|iemobile|blackberry|kindle|silk-accelerated|(hpw|web)os|opera m(obi|ini)/i.test(
      ua,
    )
  ) {
    return "mobile"
  }
  return "desktop"
}

// Helper to determine traffic source
function getTrafficSource(
  referrer: string | null,
): "direct" | "search" | "social" | "email" | "referral" | "other" {
  if (!referrer) {return "direct"}

  const ref = referrer.toLowerCase()

  // Search engines
  if (
    ref.includes("google") ||
    ref.includes("bing") ||
    ref.includes("yahoo") ||
    ref.includes("duckduckgo")
  ) {
    return "search"
  }

  // Social media
  if (
    ref.includes("facebook") ||
    ref.includes("twitter") ||
    ref.includes("linkedin") ||
    ref.includes("instagram") ||
    ref.includes("tiktok") ||
    ref.includes("pinterest")
  ) {
    return "social"
  }

  // Email
  if (ref.includes("mail") || ref.includes("email")) {
    return "email"
  }

  return "referral"
}

// Helper to convert country code to name
function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    EG: "Egypt",
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    AU: "Australia",
    DE: "Germany",
    FR: "France",
    IT: "Italy",
    ES: "Spain",
    AE: "United Arab Emirates",
    SA: "Saudi Arabia",
    KW: "Kuwait",
    QA: "Qatar",
    BH: "Bahrain",
    OM: "Oman",
    JO: "Jordan",
    LB: "Lebanon",
  }
  return countries[code.toUpperCase()] || code
}

// Helper to fetch geographical location from IP address
async function getIPLocation(ip: string): Promise<{ country: string; city: string; region: string } | null> {
  const cleanIp = ip.trim()
  console.log(`🔍 [IP Lookup] Server-side getIPLocation requested for IP: "${cleanIp}"`)
  
  // Detect local/private IP addresses
  const isLocal = 
    cleanIp === "::1" || 
    cleanIp === "127.0.0.1" || 
    cleanIp === "localhost" || 
    cleanIp === "unknown" ||
    cleanIp.startsWith("192.168.") || 
    cleanIp.startsWith("10.") || 
    cleanIp.startsWith("172.16.") || 
    cleanIp.startsWith("172.31.")

  if (isLocal) {
    console.log(`🏠 [IP Lookup] Local/Private IP detected ("${cleanIp}"). Skipping server-side external API query.`)
    return null
  }

  // 1. Try ipinfo.io (highest accuracy for Egypt ISPs resolving to Hurghada/Red Sea)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1200) // 1.2s timeout
    
    console.log(`📡 [IP Lookup] Querying ipinfo.io for public IP: "${cleanIp}"`)
    const response = await fetch(`https://ipinfo.io/${cleanIp}/json`, {
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const geo = await response.json()
      console.log(`📡 [IP Lookup] ipinfo.io response:`, geo)
      if (geo.city || geo.country) {
        return {
          country: getCountryName(geo.country || ""),
          city: geo.city || "",
          region: geo.region || "",
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ ipinfo.io lookup failed/timed out, trying fallback...", err)
  }

  // 2. Try FreeIPAPI (fallback 1)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1200) // 1.2s timeout
    
    console.log(`📡 [IP Lookup] Querying free.freeipapi.com for public IP: "${cleanIp}"`)
    const response = await fetch(`https://free.freeipapi.com/api/json/${cleanIp}`, {
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const geo = await response.json()
      console.log(`📡 [IP Lookup] free.freeipapi.com response:`, geo)
      if (geo.cityName || geo.countryName) {
        return {
          country: geo.countryName || "",
          city: geo.cityName || "",
          region: geo.regionName || "",
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ free.freeipapi.com lookup failed/timed out, trying fallback...", err)
  }

  // 3. Try ip-api.com as fallback 2
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1200) // 1.2s timeout
    
    console.log(`📡 [IP Lookup] Querying ip-api.com for public IP: "${cleanIp}"`)
    const response = await fetch(`http://ip-api.com/json/${cleanIp}`, {
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const geo = await response.json()
      console.log(`📡 [IP Lookup] ip-api.com response:`, geo)
      if (geo.status === "success") {
        return {
          country: geo.country || "",
          city: geo.city || "",
          region: geo.regionName || "",
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ ip-api.com fallback lookup failed/timed out:", err)
  }

  console.log(`❌ [IP Lookup] All lookup providers failed for IP: "${cleanIp}"`)
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId, sessionId, userId, clientLocation } = body

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    const payload = await getPayloadClient()

    // 2. Bot / Crawler Exclusion Check
    const userAgent = request.headers.get("user-agent") || ""
    const isBot = /bot|googlebot|bingbot|yandexbot|baiduspider|crawler|spider|robot|crawling|lighthouse/i.test(userAgent)
    if (isBot) {
      console.log(`🤖 Ignored view request from bot/crawler: ${userAgent}`)
      return NextResponse.json({ success: true, ignored: "bot" })
    }

    // 3. Retrieve Property details to check owner
    const property = await payload.findByID({
      collection: "properties",
      id: propertyId,
      depth: 0,
      select: { seller: true, views: true },
    })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // 4. Admin / Owner Exemption Check
    const cookieStore = await cookies()
    const hasAdminToken = cookieStore.get("payload-token")?.value
    if (hasAdminToken) {
      console.log("❌ Admin user view - skipping tracking")
      return NextResponse.json({ success: true, ignored: "admin" })
    }

    const currentUser = await getCurrentUser()
    const sellerId = typeof property.seller === "object" ? property.seller?.id : property.seller
    const isOwner = currentUser && 
                    currentUser.collection === "sellers" && 
                    sellerId && 
                    currentUser.id.toString() === sellerId.toString()

    if (isOwner) {
      console.log(`❌ Owner seller view (ID: ${currentUser.id}) - skipping tracking`)
      return NextResponse.json({ success: true, ignored: "owner" })
    }

    // 5. Generate visitor fingerprint & check for deduplication (24h unique window)
    const visitorId = generateVisitorId(request, userId)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const recentView = await payload.find({
      collection: "property-views",
      where: {
        and: [
          { property: { equals: propertyId } },
          { visitorId: { equals: visitorId } },
          { viewedAt: { greater_than: oneDayAgo.toISOString() } },
        ],
      },
      limit: 1,
      depth: 0,
    })

    const isUniqueView = recentView.docs.length === 0

    if (!isUniqueView) {
      console.log(`🔄 Repeat visitor (${visitorId.substring(0, 8)}) - Skipping write/increment`)
      return NextResponse.json({
        success: true,
        isUniqueView: false,
      })
    }

    // 6. Register Unique View
    let ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    if (ip && ip.includes(",")) {
      ip = ip.split(",")[0].trim()
    }

    let location = null
    console.log(`\n👤 [Track View] Incoming view request. Detected server IP: "${ip}"`)
    if (clientLocation) {
      console.log("🌍 [Track View] Client provided location object:", clientLocation)
    }

    if (clientLocation && (clientLocation.city || clientLocation.country)) {
      console.log("🌍 [Track View] Using client-provided geolocation:", clientLocation)
      location = {
        city: clientLocation.city || "",
        country: clientLocation.country || "",
        region: clientLocation.region || "",
      }
      if (clientLocation.ip) {
        ip = clientLocation.ip
        console.log(`🌍 [Track View] Overriding server IP with client IP: "${ip}"`)
      }
    } else {
      console.log("🌍 [Track View] Client geolocation not provided or incomplete. Falling back to server-side lookup.")
      location = await getIPLocation(ip)
    }
    console.log("🌍 [Track View] Final resolved view location:", location)

    const referrer = request.headers.get("referer")
    const device = detectDevice(userAgent)
    const source = getTrafficSource(referrer)

    const newView = await payload.create({
      collection: "property-views",
      data: {
        property: propertyId,
        visitorId,
        sessionId: sessionId || visitorId,
        viewedAt: new Date().toISOString(),
        userAgent,
        ipAddress: hashIP(ip),
        source,
        referrer: referrer || undefined,
        device,
        ...(location ? { location } : {}),
        ...(currentUser ? {
          user: currentUser.collection === "sellers" ? {
            relationTo: "sellers" as const,
            value: Number(currentUser.id),
          } : {
            relationTo: "investors" as const,
            value: Number(currentUser.id),
          }
        } : {}),
      },
    })

    // 7. Atomic-style Increment to prevent recalculating table sum
    const currentViews = property.views || 0
    const newViewsCount = currentViews + 1
    
    await payload.update({
      collection: "properties",
      id: propertyId,
      data: {
        views: newViewsCount,
      },
    })
    
    console.log(`🆕 Unique view registered! Created view ${newView.id}. Incremented property ${propertyId} views from ${currentViews} to ${newViewsCount}`)

    // 8. Revalidate Next.js cache and clear memory analytics cache
    triggerRevalidate("featured-properties")
    triggerRevalidate(`property:${propertyId}`)
    analyticsCache.clear()

    return NextResponse.json({
      success: true,
      viewId: newView.id,
      isUniqueView: true,
    })
  } catch (error) {
    console.error("Track view error:", error)
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
  }
}
