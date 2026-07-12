import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { getPayloadClient } from "@/db/client"
import { sql } from "@payloadcms/db-postgres"

// Get buyer statistics
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.collection !== "buyers") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await getPayloadClient()

    // 1. Get properties viewed count using payload.count (database-level SELECT COUNT)
    const viewsCountRes = await payload.count({
      collection: "property-views",
      where: {
        user: {
          equals: Number(user.id),
        },
      },
    })
    const totalViews = viewsCountRes.totalDocs

    // 2. Get unique properties viewed using direct SQL distinct count
    const db = payload.db.drizzle
    const uniqueQuery = await db.execute(
      sql`SELECT COUNT(DISTINCT pv.property_id)::int as count 
          FROM property_views pv
          JOIN property_views_rels pvr ON pvr.parent_id = pv.id
          WHERE pvr.path = 'user' AND pvr.buyers_id = ${Number(user.id)}`
    )

    let uniquePropertiesCount = 0
    const row = Array.isArray(uniqueQuery) ? uniqueQuery[0] : (uniqueQuery.rows ? uniqueQuery.rows[0] : null)
    if (row) {
      uniquePropertiesCount = Number((row as { count: number | string }).count) || 0
    }

    // Get favorites/watchlist (if implemented)
    // For now, return 0
    const favorites = 0

    return NextResponse.json({
      success: true,
      stats: {
        totalViews,
        uniquePropertiesViewed: uniquePropertiesCount,
        favoritesCount: favorites,
      },
    })
  } catch (error) {
    console.error("Get buyer stats error:", error)
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 })
  }
}
