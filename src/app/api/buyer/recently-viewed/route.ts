import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { getPayloadClient } from "@/db/client"


// Get recently viewed properties for logged-in buyer
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.collection !== "buyers") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await getPayloadClient()

    // Get all views for this user (polymorphic relationship requires .value + .relationTo)
    const views = await payload.find({
      collection: "property-views",
      where: {
        and: [
          {
            "user.value": {
              equals: Number(user.id),
            },
          },
          {
            "user.relationTo": {
              equals: "buyers",
            },
          },
        ],
      },
      sort: "-viewedAt",
      limit: 50,
      depth: 1,
    })

    // Extract unique properties with their last view date
    const propertyMap = new Map()
    
    for (const view of views.docs) {
      const propertyId = typeof view.property === 'object' ? view.property.id : view.property
      
      if (!propertyMap.has(propertyId)) {
        propertyMap.set(propertyId, {
          property: view.property,
          lastViewed: view.viewedAt,
          viewCount: 1,
        })
      } else {
        const existing = propertyMap.get(propertyId)
        existing.viewCount += 1
      }
    }

    // Convert to array and get full property details
    const recentlyViewed = Array.from(propertyMap.values())
      .filter(item => typeof item.property === 'object') // Only include populated properties
      .slice(0, 12) // Limit to 12 most recent

    return NextResponse.json({
      success: true,
      totalViews: views.totalDocs,
      recentlyViewed,
    })
  } catch (error) {
    console.error("Get recently viewed error:", error)
    return NextResponse.json({ error: "Failed to get recently viewed properties" }, { status: 500 })
  }
}
