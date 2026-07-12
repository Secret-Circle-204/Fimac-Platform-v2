import { NextRequest, NextResponse } from "next/server"
import { getPayloadClient } from "@/db/client"
import { analyticsCache } from "@/lib/cache/analytics-cache"
import { sql } from "@payloadcms/db-postgres"

export const dynamic = "force-dynamic"

interface PropertyEngagement {
  id: string
  title: string
  views: number
  avgDurationSeconds: number
}

const parseRows = <T>(res: unknown): T[] => {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object' && 'rows' in res) {
    return (res as { rows: T[] }).rows
  }
  return []
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
    const db = payload.db.drizzle

    // 1. Fetch metrics via direct SQL aggregations
    const [totalViewsRaw, uniqueVisitorsRaw, deviceResRaw, sourceResRaw, timelineResRaw, popularResRaw, locationResRaw, latestResRaw] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as count FROM property_views`),
      db.execute(sql`SELECT COUNT(DISTINCT visitor_id) as count FROM property_views`),
      db.execute(sql`SELECT device, COUNT(*) as value FROM property_views GROUP BY device`),
      db.execute(sql`SELECT source, COUNT(*) as value FROM property_views GROUP BY source`),
      db.execute(
        sql`
          SELECT 
            TO_CHAR(viewed_at, 'YYYY-MM-DD') as date_str,
            COUNT(*) as views_count
          FROM property_views
          WHERE viewed_at >= NOW() - INTERVAL '30 days'
          GROUP BY TO_CHAR(viewed_at, 'YYYY-MM-DD')
          ORDER BY date_str ASC
        `
      ),
      db.execute(
        sql`
          SELECT 
            p.id as property_id,
            p.title as property_title,
            COUNT(*) as count
          FROM property_views pv
          LEFT JOIN properties p ON pv.property_id = p.id
          WHERE p.id IS NOT NULL
          GROUP BY p.id, p.title
          ORDER BY count DESC
          LIMIT 25
        `
      ),
      db.execute(
        sql`
          SELECT 
            location_city as city,
            location_country as country,
            COUNT(*) as count
          FROM property_views
          WHERE location_city IS NOT NULL OR location_country IS NOT NULL
          GROUP BY location_city, location_country
          ORDER BY count DESC
          LIMIT 25
        `
      ),
      db.execute(
        sql`
          SELECT 
            pv.id,
            pv.viewed_at,
            pv.device,
            pv.source,
            pv.location_city,
            pv.location_country,
            p.title as property_title,
            pvr.path as relation_path,
            pvr.buyers_id,
            pvr.sellers_id,
            b.full_name as buyer_name,
            s.full_name as seller_name
          FROM property_views pv
          LEFT JOIN properties p ON pv.property_id = p.id
          LEFT JOIN property_views_rels pvr ON pvr.parent_id = pv.id AND pvr.path = 'user'
          LEFT JOIN buyers b ON pvr.buyers_id = b.id
          LEFT JOIN sellers s ON pvr.sellers_id = s.id
          ORDER BY pv.viewed_at DESC
          LIMIT 50
        `
      )
    ])

    // Parse counts
    const totalViews = Number(parseRows<{ count: string | number }>(totalViewsRaw)[0]?.count || 0)
    const totalUniqueVisitors = Number(parseRows<{ count: string | number }>(uniqueVisitorsRaw)[0]?.count || 0)
    const avgDuration = 0 // stay/dwell time tracking disabled

    // Parse Devices
    const devices: Record<string, number> = { Desktop: 0, Mobile: 0, Tablet: 0 }
    parseRows<{ device: string | null; value: string | number }>(deviceResRaw).forEach((row) => {
      const dev = row.device || 'desktop'
      const name = dev.charAt(0).toUpperCase() + dev.slice(1)
      devices[name] = Number(row.value)
    })
    const deviceData = Object.entries(devices).map(([name, value]) => ({ name, value }))

    // Parse Sources
    const sources: Record<string, number> = {}
    parseRows<{ source: string | null; value: string | number }>(sourceResRaw).forEach((row) => {
      const src = row.source || 'direct'
      const name = src.charAt(0).toUpperCase() + src.slice(1)
      sources[name] = Number(row.value)
    })
    const sourceData = Object.entries(sources).map(([name, value]) => ({ name, value }))

    // Parse Timeline
    const timelineMap: Record<string, number> = {}
    parseRows<{ date_str: string; views_count: string | number }>(timelineResRaw).forEach((row) => {
      timelineMap[row.date_str] = Number(row.views_count)
    })

    const last30Days: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      last30Days[dateStr] = timelineMap[dateStr] || 0
    }

    const timelineData = Object.entries(last30Days).map(([date, count]) => {
      const formattedDate = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      return {
        date: formattedDate,
        views: count,
      }
    })

    // Parse Popular Properties
    const popularProperties = parseRows<{ property_id: string; property_title: string; count: string | number }>(popularResRaw).map((row) => ({
      title: row.property_title || `Property ${row.property_id}`,
      count: Number(row.count),
    }))

    // Parse Location Breakdown
    const locationRows = parseRows<{ city: string | null; country: string | null; count: string | number }>(locationResRaw)
    const totalViewsWithLocation = locationRows.reduce((sum, item) => sum + Number(item.count), 0)
    const locationData = locationRows.map((item) => ({
      city: item.city || "Unknown City",
      country: item.country || "Unknown Country",
      count: Number(item.count),
      percentage: totalViewsWithLocation > 0 ? Math.round((Number(item.count) / totalViewsWithLocation) * 100) : 0,
    }))

    // Top Properties by Engagement (stay/dwell time tracking disabled)
    const engagementData: PropertyEngagement[] = []

    // Parse Latest Views
    const latestViews = parseRows<{
      id: number
      viewed_at: string
      device: string | null
      source: string | null
      location_city: string | null
      location_country: string | null
      property_title: string | null
      relation_path: string | null
      buyers_id: number | null
      sellers_id: number | null
      buyer_name: string | null
      seller_name: string | null
    }>(latestResRaw).map((row) => {
      let userLabel = "Anonymous"
      if (row.buyers_id) {
        userLabel = `User (buyers)`
      } else if (row.sellers_id) {
        userLabel = `User (sellers)`
      }
      
      let locationLabel = ""
      if (row.location_city && row.location_country) {
        locationLabel = `${row.location_city}, ${row.location_country}`
      } else if (row.location_country) {
        locationLabel = row.location_country
      }

      return {
        id: row.id,
        propertyTitle: row.property_title || "Unknown Property",
        viewedAt: row.viewed_at,
        device: row.device || "desktop",
        source: row.source || "direct",
        userLabel,
        locationLabel,
      }
    })

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
      latestViews,
    }

    analyticsCache.set(result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: "Failed to get analytics" }, { status: 500 })
  }
}
