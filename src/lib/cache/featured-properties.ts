import { unstable_cache } from "next/cache"
import { local } from "@/repository"

/**
 * Retrieves featured properties via serialization-safe cache.
 * Preserves Depth: 1 and explicit Select Projections to minimize payload sizes.
 * Next.js native caching stores raw JSON documents. Reconstitution via Decorators
 * occurs post-cache retrieval to preserve class prototype integrity.
 * 
 * Duration: 1 Day (86400s) — safety net only; on-demand revalidation handles normal purges
 * Tags: 'featured-properties'
 */
export const getCachedFeaturedProperties = async () => {
  const cacheKey = "featured-properties-list"

  const rawData = await unstable_cache(
    async () => {
      console.log(`⚡ [CACHE MISS]: featured-properties-list (Querying PostgreSQL Remote DB...)`)
      const data = await local.property._getRawInternal(
        {
          'listingStatus.slug': {
            in: ["forsale", "for-sale"],
          },
        },
        {
          depth: 1,
          limit: 12,
          select: {
            title: true,
            price: true,
            currency: true,
            photos: true,
            location: true,
            category: true,
            area: true,
            residential: true,
            commercial: true,
            hospitality: true,
            land: true,
            features: true,
            propertyType: true,
            listingStatus: true,
            constructionStatus: true,
            street: true,
            views: true,
          },
        }
      )
      return data
    },
    [cacheKey],
    {
      revalidate: 86400,
      tags: ["featured-properties"],
    }
  )()

  // Rehydrate decorator instances with prototype methods intact
  return local.property.decorateMany(rawData)
}
