import { unstable_cache } from "next/cache"
import { local } from "@/repository"
import { Property } from "@/payload-types"

/**
 * Retrieves a single property by ID via serialization-safe cache.
 * Follows the same architectural pattern as featured-properties and property-types caches:
 *  - Stores raw JSON documents (not decorator instances) to prevent prototype chain destruction
 *  - Reconstitution via PropertyDecorator occurs post-cache retrieval
 * 
 * Duration: 1 Day (86400s) — safety net only; on-demand revalidation handles normal purges
 * Tags: 'property-detail', 'property:{id}'
 * 
 * @internal Cache boundary — business logic should use getCachedPropertyDetail()
 */
export const getCachedPropertyDetail = async (id: string | number) => {
  const normalizedId = String(id)
  const cacheKey = `property-detail-${normalizedId}`

  const rawDoc = await unstable_cache(
    async () => {
      console.log(`⚡ [CACHE MISS]: property-detail-${normalizedId} (Querying PostgreSQL Remote DB...)`)
      const docs = await local.property._getRawInternal(
        { id: { equals: id } },
        {
          depth: 1,
          select: {
            title: true,
            description: true,
            price: true,
            currency: true,
            photos: true,
            location: true,
            details: true,
            propertyType: true,
            listingStatus: true,
            constructionStatus: true,
            street: true,
            features: true,
            seller: true,
            views: true,
          },
        }
      )
      return docs[0] ?? null
    },
    [cacheKey],
    {
      revalidate: 86400,
      tags: ["property-detail", `property:${normalizedId}`],
    }
  )()

  if (!rawDoc) {
    return null
  }

  // Rehydrate decorator instance with prototype methods/getters intact
  return local.property.decorateMany([rawDoc as Property])[0]
}
