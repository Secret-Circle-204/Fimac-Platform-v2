import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { getPayloadClient } from "@/db/client"
import type { Property, PropertyView } from "@/payload-types"

// Get investor statistics
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.collection !== "investors") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await getPayloadClient()

    // Get properties viewed count
    const views = await payload.find({
      collection: "property-views",
      where: {
        user: {
          equals: Number(user.id),
        },
      },
      limit: 1,
      depth: 0,
    })

    // Get unique properties viewed
    const allViews = await payload.find({
      collection: "property-views",
      where: {
        user: {
          equals: Number(user.id),
        },
      },
      limit: 1000,
      depth: 0,
    })

    const uniqueProperties = new Set()
    allViews.docs.forEach((view: PropertyView) => {
      const propId = typeof view.property === "object" ? (view.property as Property).id : view.property
      uniqueProperties.add(propId)
    })

    // Get signed NDAs count (Removed - NDA logic removed)

    // Get favorites/watchlist (if implemented)
    // For now, return 0
    const favorites = 0

    return NextResponse.json({
      success: true,
      stats: {
        totalViews: views.totalDocs,
        uniquePropertiesViewed: uniqueProperties.size,
        favoritesCount: favorites,
      },
    })
  } catch (error) {
    console.error("Get investor stats error:", error)
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 })
  }
}
