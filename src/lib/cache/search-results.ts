import { unstable_cache } from "next/cache"
import { local } from "@/repository"
import { Property } from "@/payload-types"
import type { Where } from "payload"

type SearchResultsResponse = {
  docs: Property[]
  totalDocs: number
  totalPages: number
  page: number
}

/**
 * Builds a deterministic, stable cache key from the search page parameters.
 * The key is sorted alphabetically to ensure the same parameter combination
 * always produces the same string regardless of URL parameter order.
 * 
 * @param params - The resolved search parameters from the URL
 * @returns A unique string identifier for this search configuration
 */
export function buildSearchCacheKey(params: Record<string, string>): string {
  const sorted = Object.entries(params)
    .filter(([, v]) => v !== '' && v !== 'all')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  return `search-results:${sorted || 'default'}`
}

/**
 * Retrieves paginated search results via serialization-safe cache.
 * Uses deterministic cache keys derived from canonicalized search parameters
 * so identical searches across users share the same cached result set.
 * 
 * The raw Property[] documents are stored in the cache. Decoration (PropertyDecorator)
 * is intentionally omitted because the search page passes raw `.original` documents
 * directly to the client component.
 * 
 * Duration: 1 Day (86400s) — safety net only; on-demand revalidation handles normal purges
 * Tags: 'search-results' — purged on any property create/update/delete
 * 
 * @param where - The fully-constructed Payload Where clause
 * @param cacheKey - Deterministic key from buildSearchCacheKey()
 * @param page - Page number for pagination (default: 1)
 */
export const getCachedSearchResults = async (
  where: Where,
  cacheKey: string,
  page: number = 1,
  sort: string | string[] = '-createdAt'
): Promise<SearchResultsResponse> => {
  const sortKey = Array.isArray(sort) ? sort.join(',') : sort
  const paginatedKey = `${cacheKey}:p${page}:s${sortKey}`

  return await unstable_cache(
    async () => {
      console.log(`⚡ [CACHE MISS]: ${paginatedKey} (Querying PostgreSQL Remote DB...)`)
      const result = await local.property._getRawPaginatedInternal(
        where,
        {
          depth: 1,
          select: {
            title: true,
            price: true,
            currency: true,
            photos: true,
            location: true,
            details: true,
            propertyType: true,
            listingStatus: true,
            constructionStatus: true,
            street: true,
            views: true,
          },
          limit: 24,
          page,
          sort,
        }
      )
      return result
    },
    [paginatedKey],
    {
      revalidate: 86400,
      tags: ["search-results"],
    }
  )()
}
