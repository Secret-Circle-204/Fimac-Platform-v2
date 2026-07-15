import { unstable_cache } from "next/cache"
import { local } from "@/repository"

/**
 * Retrieves all property types via serialization-safe cache.
 * Next.js native caching stores raw JSON documents. Reconstitution via Decorators
 * occurs post-cache retrieval to preserve class prototype integrity.
 * 
 * Duration: 1 Day (86400s) — safety net only; on-demand revalidation handles normal purges
 * Tags: 'property-types'
 */
export const getCachedPropertyTypes = async () => {
  const cacheKey = "property-types-all"
  
  const rawData = await unstable_cache(
    async () => {
      console.log(`⚡ [CACHE MISS]: property-types-all (Querying PostgreSQL Remote DB...)`)
      const data = await local.propertyType._getRawInternal({}, { depth: 1 })
      return data
    },
    [cacheKey],
    {
      revalidate: 86400,
      tags: ["property-types"],
    }
  )()

  // Rehydrate decorator instances with getter methods
  return local.propertyType.decorateMany(rawData)
}
