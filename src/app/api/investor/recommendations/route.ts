import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { getPayloadClient } from "@/db/client"
import type { Where } from "payload"
import type { Property } from "@/payload-types"

/**
 * GET: Smart behavioral-based automated property recommender system.
 * Analyzes the logged-in investor's real-time property viewing history (interests,
 * budget limits, preferred categories) and matches them with active portfolios.
 */
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.collection !== "investors") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await getPayloadClient()

    // 1. Fetch user's property views to analyze interests dynamically
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
              equals: user.collection,
            },
          },
        ],
      },
      limit: 100,
      depth: 2,
    })

    // 2. Fetch popular/recent active properties as fallback
    const popularProperties = await payload.find({
      collection: "properties",
      where: {
        listingStatus: {
          equals: "forsale",
        },
      },
      limit: 6,
      depth: 2,
      sort: "-createdAt",
    })

    // If the investor has no view history, return popular properties immediately
    if (views.totalDocs === 0) {
      return NextResponse.json({
        success: true,
        recommendations: popularProperties.docs,
        totalRecommendations: popularProperties.docs.length,
        isBehavioral: false,
        popularProperties: popularProperties.docs,
      })
    }

    // 3. Extract viewed property details to learn user intent
    const viewedIds = new Set<string>()
    const propertyTypeCounts: Record<string, number> = {}
    const prices: number[] = []

    views.docs.forEach((view) => {
      const prop = view.property as Property | null
      if (prop && typeof prop === "object") {
        viewedIds.add(String(prop.id))
        if (prop.price) {
          prices.push(prop.price)
        }
        const propType = prop.propertyType
        if (propType) {
          const typeId = typeof propType === "object" ? propType.id : propType
          if (typeId) {
            propertyTypeCounts[String(typeId)] = (propertyTypeCounts[String(typeId)] || 0) + 1
          }
        }
      }
    })

    // Extract user's favorite property types ranked by view count
    const favoritePropertyTypes = Object.entries(propertyTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([typeId]) => typeId)

    // Calculate budget range based on viewed properties (average price +/- 35% margin)
    let minPrice: number | null = null
    let maxPrice: number | null = null
    if (prices.length > 0) {
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
      minPrice = avgPrice * 0.65
      maxPrice = avgPrice * 1.35
    }

    // 4. Construct smart query based on behavioral attributes
    const andConditions: Where[] = [
      {
        listingStatus: {
          equals: "forsale",
        },
      },
    ]

    // Smart: Exclude properties they have already viewed to suggest fresh opportunities
    if (viewedIds.size > 0) {
      andConditions.push({
        id: {
          not_in: Array.from(viewedIds),
        },
      })
    }

    // Filter by budget range (optional constraint based on history)
    if (minPrice && maxPrice) {
      andConditions.push({
        price: {
          greater_than_equal: minPrice,
          less_than_equal: maxPrice,
        },
      })
    }

    // Filter by preferred property categories
    if (favoritePropertyTypes.length > 0) {
      andConditions.push({
        propertyType: {
          in: favoritePropertyTypes,
        },
      })
    }

    const behavioralQuery: Where = {
      and: andConditions,
    }

    console.log("🔍 Behavioral Recommendations Query:", JSON.stringify(behavioralQuery, null, 2))

    let recommended = await payload.find({
      collection: "properties",
      where: behavioralQuery,
      limit: 6,
      depth: 2,
      sort: "-createdAt",
    })

    // If query is too restrictive (e.g. no results in exact price range), relax budget limit
    if (recommended.totalDocs === 0 && favoritePropertyTypes.length > 0) {
      console.log("⚠️ Restrictive constraints, relaxing behavioral budget limits...")
      const relaxedConditions: Where[] = [
        {
          listingStatus: {
            equals: "forsale",
          },
        },
        {
          propertyType: {
            in: favoritePropertyTypes,
          },
        },
      ]
      if (viewedIds.size > 0) {
        relaxedConditions.push({
          id: {
            not_in: Array.from(viewedIds),
          },
        })
      }
      recommended = await payload.find({
        collection: "properties",
        where: { and: relaxedConditions },
        limit: 6,
        depth: 2,
        sort: "-createdAt",
      })
    }

    // Final fallback: if still empty, combine behavioral matches with popular ones (excluding viewed)
    let finalRecommendations = recommended.docs
    if (finalRecommendations.length === 0) {
      console.log("ℹ️ No exact behavioral matches found. Suggesing popular unseen properties...")
      finalRecommendations = popularProperties.docs.filter((p) => !viewedIds.has(String(p.id)))
    }

    // Absolute fallback
    if (finalRecommendations.length === 0) {
      finalRecommendations = popularProperties.docs
    }

    return NextResponse.json({
      success: true,
      recommendations: finalRecommendations,
      totalRecommendations: finalRecommendations.length,
      isBehavioral: true,
      popularProperties: popularProperties.docs,
    })
  } catch (error) {
    console.error("Get recommendations error:", error)
    return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 })
  }
}
