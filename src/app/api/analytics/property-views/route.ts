import { NextRequest, NextResponse } from "next/server"
import { getPayloadClient } from "@/db/client"
import { analyticsCache } from "@/lib/cache/analytics-cache"

export const dynamic = "force-dynamic"

interface PropertyEngagement {
  id: string
  title: string
  views: number
  avgDurationSeconds: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get("refresh") === "true"

    if (forceRefresh) {
      analyticsCache.clear()
    } else {
      const cached = analyticsCache.get(30000) // 30s TTL
      if (cached) {
        return NextResponse.json(cached)
      }
    }

    const payload = await getPayloadClient()
    const allViews = await payload.find({
      collection: "property-views",
      limit: 10000,
      depth: 1,
      sort: "-viewedAt"
    })

    const totalViews = allViews.docs.length

    // Unique visitors (using set on visitorId)
    const visitorIds = new Set(allViews.docs.map((doc) => doc.visitorId))
    const totalUniqueVisitors = visitorIds.size

    // Average duration (stay/dwell time tracking disabled)
    const avgDuration = 0

    // 2. Timeline: Last 30 days
    const last30Days: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      last30Days[dateStr] = 0
    }

    allViews.docs.forEach((doc) => {
      const dateStr = doc.viewedAt.split("T")[0]
      if (dateStr in last30Days) {
        last30Days[dateStr]++
      }
    })

    const timelineData = Object.entries(last30Days).map(([date, count]) => {
      const formattedDate = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      return {
        date: formattedDate,
        views: count,
      }
    })

    // 3. Devices breakdown
    const devices: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 }
    allViews.docs.forEach((doc) => {
      const dev = doc.device || "desktop"
      devices[dev] = (devices[dev] || 0) + 1
    })

    const deviceData = Object.entries(devices).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))

    // 4. Traffic sources breakdown
    const sources: Record<string, number> = {}
    allViews.docs.forEach((doc) => {
      const src = doc.source || "direct"
      sources[src] = (sources[src] || 0) + 1
    })

    const sourceData = Object.entries(sources).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))

    // 5. Popular properties (top 5 viewed)
    const propertyViewsMap: Record<string, { title: string; count: number }> = {}
    allViews.docs.forEach((doc) => {
      const prop = doc.property
      if (prop && typeof prop === "object") {
        const title = prop.title || `Property ${prop.id}`
        if (!propertyViewsMap[prop.id]) {
          propertyViewsMap[prop.id] = { title, count: 0 }
        }
        propertyViewsMap[prop.id].count++
      }
    })

    const popularProperties = Object.values(propertyViewsMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 25)

    // 6. Top Locations breakdown (top 25 geolocated cities)
    const locationsMap: Record<string, { city: string; country: string; count: number }> = {}
    allViews.docs.forEach((doc) => {
      const loc = doc.location
      if (loc && (loc.city || loc.country)) {
        const city = loc.city || "Unknown City"
        const country = loc.country || "Unknown Country"
        const key = `${city}, ${country}`
        if (!locationsMap[key]) {
          locationsMap[key] = { city, country, count: 0 }
        }
        locationsMap[key].count++
      }
    })

    const totalViewsWithLocation = Object.values(locationsMap).reduce((sum, item) => sum + item.count, 0)
    const locationData = Object.values(locationsMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 25)
      .map((item) => ({
        city: item.city,
        country: item.country,
        count: item.count,
        percentage: totalViewsWithLocation > 0 ? Math.round((item.count / totalViewsWithLocation) * 100) : 0,
      }))

    // 7. Top Properties by Engagement (stay/dwell time tracking disabled)
    const engagementData: PropertyEngagement[] = []

    const result = {
      success: true,
      stats: {
        totalViews,
        totalUniqueVisitors,
        avgDuration,
      },
      timelineData,
      deviceData,
      sourceData,
      popularProperties,
      locationData,
      engagementData,
      latestViews: allViews.docs.slice(0, 50).map((doc) => {
        let userLabel = "Anonymous"
        if (doc.user && typeof doc.user === "object") {
          userLabel = "relationTo" in doc.user ? `User (${doc.user.relationTo})` : "Logged User"
        }
        
        let locationLabel = ""
        if (doc.location) {
          const { city, country } = doc.location
          if (city && country) {
            locationLabel = `${city}, ${country}`
          } else if (country) {
            locationLabel = country
          }
        }

        return {
          id: doc.id,
          propertyTitle: typeof doc.property === "object" ? doc.property.title : "Unknown Property",
          viewedAt: doc.viewedAt,
          device: doc.device || "desktop",
          source: doc.source || "direct",
          userLabel,
          locationLabel,
        }
      }),
    }

    analyticsCache.set(result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: "Failed to get analytics" }, { status: 500 })
  }
}
