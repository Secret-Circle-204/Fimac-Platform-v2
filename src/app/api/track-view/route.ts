import { NextRequest, NextResponse, after } from "next/server"
import { getPayloadClient } from "@/db/client"
import { sql } from "@payloadcms/db-postgres"
import { createHash } from "crypto"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import fs from "fs"
import path from "path"
import maxmind, { CityResponse, Reader } from "maxmind"
import { viewsMemoryCache } from "@/lib/cache/views-memory-cache"
import { getClientIP, isPrivateIP } from "@/lib/security/ip-utils"
import { ipLocationsCache } from "@/lib/cache/ip-locations-cache"

// Global singleton GeoIP reader instance
let geoipReader: Reader<CityResponse> | null = null

async function getGeoIPReader() {
  if (geoipReader) return geoipReader
  const dbPath = path.join(process.cwd(), 'data', 'dbip-city-lite.mmdb')
  if (fs.existsSync(dbPath)) {
    try {
      geoipReader = await maxmind.open(dbPath)
      console.log(`✅ Loaded local GeoIP database: ${dbPath}`)
    } catch (err) {
      console.error(`❌ Failed to open local GeoIP database:`, err)
    }
  } else {
    console.warn(`⚠️ Local GeoIP database file not found at: ${dbPath}`)
  }
  return geoipReader
}

// Helper to generate visitor fingerprint
function generateVisitorId(req: NextRequest, userId?: string): string {
  const userAgent = req.headers.get("user-agent") || ""
  const ip = getClientIP(req)

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
  if (
    ua.includes("tablet") ||
    ua.includes("ipad") ||
    ua.includes("playbook") ||
    ua.includes("silk") ||
    (ua.includes("android") && !ua.includes("mobi"))
  ) {
    return "tablet"
  }
  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone") ||
    ua.includes("ipod") ||
    ua.includes("iemobile") ||
    ua.includes("blackberry") ||
    ua.includes("kindle") ||
    ua.includes("silk-accelerated") ||
    ua.includes("hpwos") ||
    ua.includes("webos") ||
    ua.includes("opera mobi") ||
    ua.includes("opera mini")
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

// Helper to resolve geographical location (internal pipeline)
async function resolveIPLocation(ip: string): Promise<{ country: string; city: string; region: string; source: string } | null> {
  const cleanIp = ip.trim()
  console.log(`🔍 [IP Lookup] Server-side resolveIPLocation requested for IP: "${cleanIp}"`)
  
  if (isPrivateIP(cleanIp)) {
    console.log(`🏠 [IP Lookup] Local/Private IP detected ("${cleanIp}"). Skipping GeoIP checks.`)
    return null
  }

  // 1. Try local GeoIP database (DB-IP City Lite)
  try {
    const reader = await getGeoIPReader()
    if (reader) {
      const geo = reader.get(cleanIp)
      if (geo && (geo.country || geo.city || geo.subdivisions)) {
        const country = geo.country?.names?.en || geo.country?.iso_code || ""
        const city = geo.city?.names?.en || ""
        const region = geo.subdivisions?.[0]?.names?.en || ""
        
        if (country || city || region) {
          console.log(`🌍 [GeoIP Local] Resolved IP ${cleanIp} to: ${city}, ${region}, ${country}`)
          return {
            country: getCountryName(country),
            city,
            region,
            source: "local-db",
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ [GeoIP Local] Failed to read from local DB-IP mmdb:", err)
  }

  // 2. Try ipinfo.io as fallback 1
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1200) // 1.2s timeout
    
    console.log(`📡 [GeoIP API Fallback] Querying ipinfo.io for public IP: "${cleanIp}"`)
    const response = await fetch(`https://ipinfo.io/${cleanIp}/json`, {
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const geo = await response.json()
      console.log(`📡 [GeoIP API Fallback] ipinfo.io response:`, geo)
      if (geo.city || geo.country) {
        return {
          country: getCountryName(geo.country || ""),
          city: geo.city || "",
          region: geo.region || "",
          source: "api",
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ [GeoIP API Fallback] ipinfo.io lookup failed/timed out, trying fallback...", err)
  }

  // 3. Try ip-api.com as fallback 2
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1200) // 1.2s timeout
    
    console.log(`📡 [GeoIP API Fallback] Querying ip-api.com for public IP: "${cleanIp}"`)
    const response = await fetch(`http://ip-api.com/json/${cleanIp}`, {
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const geo = await response.json()
      console.log(`📡 [GeoIP API Fallback] ip-api.com response:`, geo)
      if (geo.status === "success") {
        return {
          country: geo.country || "",
          city: geo.city || "",
          region: geo.regionName || "",
          source: "api",
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ [GeoIP API Fallback] ip-api.com fallback lookup failed:", err)
  }

  console.log(`❌ [GeoIP API Fallback] All lookup providers failed for IP: "${cleanIp}"`)
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
    const uaLow = userAgent.toLowerCase()
    const isBot = uaLow.includes("bot") || uaLow.includes("crawler") || uaLow.includes("spider") || uaLow.includes("robot") || uaLow.includes("crawling") || uaLow.includes("lighthouse")
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
      let currentViews = viewsMemoryCache.get(propertyId.toString())
      if (currentViews === null) {
        currentViews = property.views || 0
        viewsMemoryCache.set(propertyId.toString(), currentViews)
      }
      return NextResponse.json({
        success: true,
        isUniqueView: false,
        views: currentViews,
      })
    }

    // 6. Register Unique View
    let ip = getClientIP(request)

    // Detailed diagnostic logging if a private IP is encountered in production
    if (isPrivateIP(ip) && process.env.NODE_ENV === "production") {
      const allHeaders: Record<string, string> = {}
      request.headers.forEach((value, key) => {
        allHeaders[key] = value
      })
      console.warn(
        `⚠️ [Track View] Private/local IP detected in production: "${ip}". ` +
        `This usually indicates a reverse proxy configuration issue where headers are not being forwarded correctly. ` +
        `Request headers for diagnostics:`,
        JSON.stringify(allHeaders, null, 2)
      )
    }

    const hashedIp = hashIP(ip)
    let location = null
    let isCdnOrClientResolved = false

    // ⚡ Performance: Read CDN Geolocation headers (Vercel, Cloudflare, etc.) to get instant offline geo-resolution
    const cdnCountry = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry")
    const cdnCity = request.headers.get("x-vercel-ip-city") || request.headers.get("cf-ipcity")
    const cdnRegion = request.headers.get("x-vercel-ip-country-region") || request.headers.get("cf-region")

    if (cdnCountry) {
      location = {
        country: getCountryName(cdnCountry),
        city: cdnCity ? decodeURIComponent(cdnCity) : "",
        region: cdnRegion ? decodeURIComponent(cdnRegion) : "",
      }
      isCdnOrClientResolved = true
      console.log("🌍 [Track View] Resolved location via CDN headers:", location)
    }

    console.log(`\n👤 [Track View] Incoming view request. Hashed IP: "${hashedIp}"`)

    if (location) {
      // Already resolved via CDN
    } else if (clientLocation && (clientLocation.city || clientLocation.country)) {
      console.log("🌍 [Track View] Using client-provided geolocation:", clientLocation)
      location = {
        city: clientLocation.city || "",
        country: clientLocation.country || "",
        region: clientLocation.region || "",
      }
      isCdnOrClientResolved = true
      if (clientLocation.ip) {
        ip = clientLocation.ip
        console.log(`🌍 [Track View] Overriding server IP with client IP: "${ip}"`)
      }
    } else {
      // 1. Check L1 Memory Cache
      const memoryCached = ipLocationsCache.get(hashedIp)
      if (memoryCached) {
        console.log("🌍 [Track View] L1 Memory Geolocation cache hit!", memoryCached)
        location = memoryCached
      } else {
        // 2. Check L2 Database Cache
        console.log(`🔍 [Track View] Checking L2 database cache for hashed IP: "${hashedIp}"`)
        const cachedLoc = await payload.find({
          collection: "ip-locations",
          where: {
            hashedIp: { equals: hashedIp },
          },
          limit: 1,
          depth: 0,
        })

        if (cachedLoc.docs.length > 0) {
          const cached = cachedLoc.docs[0]
          console.log("🌍 [Track View] L2 Geolocation cache hit!", cached)
          location = {
            country: cached.country || "",
            city: cached.city || "",
            region: cached.region || "",
          }
          
          // Write to L1 Memory Cache for future hits
          ipLocationsCache.set(hashedIp, location)
          
          // Update lastUsed timestamp in background
          after(async () => {
            try {
              const backgroundPayload = await getPayloadClient()
              await backgroundPayload.update({
                collection: "ip-locations",
                id: cached.id,
                data: {
                  lastUsed: new Date().toISOString(),
                },
              })
            } catch (e) {
              console.warn("⚠️ Failed to update lastUsed in background:", e)
            }
          })
        }
      }
    }

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
        ipAddress: hashedIp,
        source,
        referrer: referrer || undefined,
        device,
        ...(location ? { location } : {}),
        ...(currentUser ? {
          user: currentUser.collection === "sellers" ? {
            relationTo: "sellers" as const,
            value: Number(currentUser.id),
          } : {
            relationTo: "buyers" as const,
            value: Number(currentUser.id),
          }
        } : {}),
      },
    })

    // Synchronously increment property views and update memory cache
    let currentViews = property.views || 0
    try {
      const db = payload.db.drizzle
      const result = await db.execute(
        sql`UPDATE properties SET views = COALESCE(views, 0) + 1 WHERE id = ${propertyId} RETURNING views`
      )
      const rows = (result && typeof result === "object" && "rows" in result)
        ? (result as unknown as { rows: { views: number | null }[] }).rows
        : (Array.isArray(result) ? result as unknown as { views: number | null }[] : [])
      
      if (rows && rows[0]) {
        currentViews = rows[0].views || 0
      } else {
        currentViews += 1
      }
      console.log(`🆕 Unique view registered! Incremented property ${propertyId} views to ${currentViews}.`)
    } catch (err) {
      console.error("❌ Failed to increment property views:", err)
      currentViews += 1
    }
    viewsMemoryCache.set(propertyId.toString(), currentViews)

    // 7. Process background actions after sending response
    after(async () => {
      // 7b. Cache resolving & Fallback resolution chain (Increment views is already done synchronously)
      try {
        const backgroundPayload = await getPayloadClient()

        if (location && isCdnOrClientResolved) {
          // Resolved via CDN or Client, write to L1 Cache
          ipLocationsCache.set(hashedIp, {
            country: location.country,
            city: location.city,
            region: location.region,
          })

          // Check if cached in L2 DB. If not, write it to database cache.
          const cached = await backgroundPayload.find({
            collection: "ip-locations",
            where: { hashedIp: { equals: hashedIp } },
            limit: 1,
            depth: 0,
          })
          if (cached.docs.length === 0) {
            await backgroundPayload.create({
              collection: "ip-locations",
              data: {
                hashedIp,
                country: location.country,
                city: location.city,
                region: location.region,
                source: "cdn",
                lastUsed: new Date().toISOString(),
              },
            })
            console.log(`🌍 [Track View Background] Cached CDN/Client resolved location for ${hashedIp}`)
          } else {
            // Update lastUsed
            await backgroundPayload.update({
              collection: "ip-locations",
              id: cached.docs[0].id,
              data: {
                lastUsed: new Date().toISOString(),
              },
            })
          }
        } else if (!location) {
          // Geolocation cache miss. Trigger background resolution chain.
          console.log("📡 [Track View Background] Cache miss. Running resolution chain...")
          const resolved = await resolveIPLocation(ip)

          if (resolved) {
            // Write to L1 Memory Cache
            ipLocationsCache.set(hashedIp, {
              country: resolved.country,
              city: resolved.city,
              region: resolved.region,
            })

            // Cache resolved location in L2 DB
            await backgroundPayload.create({
              collection: "ip-locations",
              data: {
                hashedIp,
                country: resolved.country,
                city: resolved.city,
                region: resolved.region,
                source: resolved.source,
                lastUsed: new Date().toISOString(),
              },
            })
            // Update the view record
            await backgroundPayload.update({
              collection: "property-views",
              id: newView.id,
              data: {
                location: {
                  country: resolved.country,
                  city: resolved.city,
                  region: resolved.region,
                },
              },
            })
            console.log(`🌍 [Track View Background] Cached and resolved location for ${hashedIp} -> ${resolved.city}, ${resolved.region}, ${resolved.country}`)
          } else {
            // Write "Unknown" to L1 Memory Cache
            ipLocationsCache.set(hashedIp, {
              country: "Unknown",
              city: "Unknown",
              region: "Unknown",
            })

            // All options failed (or local IP in development). Cache as "Unknown" in L2 DB to avoid future lookups.
            await backgroundPayload.create({
              collection: "ip-locations",
              data: {
                hashedIp,
                country: "Unknown",
                city: "Unknown",
                region: "Unknown",
                source: "unknown",
                lastUsed: new Date().toISOString(),
              },
            })
            // Update the view record
            await backgroundPayload.update({
              collection: "property-views",
              id: newView.id,
              data: {
                location: {
                  country: "Unknown",
                  city: "Unknown",
                  region: "Unknown",
                },
              },
            })
            console.log(`🌍 [Track View Background] Resolution failed. Cached as Unknown for ${hashedIp}`)
          }
        }
      } catch (err) {
        console.error("❌ [Track View Background] Error in cache/resolution execution:", err)
      }
    })

    return NextResponse.json({
      success: true,
      viewId: newView.id,
      isUniqueView: true,
      views: currentViews,
    })
  } catch (error) {
    console.error("Track view error:", error)
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
  }
}
