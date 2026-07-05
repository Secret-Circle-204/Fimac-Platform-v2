import { unstable_cache } from "next/cache"
import { local } from "@/repository"

type FilterOption = { label: string; value: string }

type SearchFilters = {
  countryOptions: FilterOption[]
  stateOptions: FilterOption[]
  cityOptions: FilterOption[]
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Retrieves the unique filter dropdown values (countries, states, cities) for the search page.
 * Queries all for-sale properties at depth 0 with minimal field selection, then extracts
 * and deduplicates location values into sorted option arrays.
 * 
 * This replaces the previous pattern of calling getAll() on every /search page load
 * to compute dropdown values — a major performance bottleneck that scaled linearly
 * with the total number of properties in the database.
 * 
 * Duration: 1 Day (86400s) — safety net only; on-demand revalidation handles normal purges
 * Tags: 'search-filters' — revalidated on-demand when properties are created/updated/deleted
 */
export const getCachedSearchFilters = async (): Promise<SearchFilters> => {
  return await unstable_cache(
    async () => {
      console.log(`⚡ [CACHE MISS]: search-filters (Querying PostgreSQL Remote DB...)`)
      const rawDocs = await local.property._getRawInternal(
        { listingStatus: { equals: 'forsale' } },
        {
          depth: 0,
          select: {
            location: true,
          },
          limit: 5000, // Safety cap — should never be hit in normal operation
        }
      )

      // Extract unique countries
      const uniqueCountries = Array.from(
        new Set(
          rawDocs
            .map((p) => {
              const raw = p.location?.address?.country?.trim() || 'Egypt'
              return toTitleCase(raw)
            })
            .filter(Boolean)
        )
      ).sort()

      // Extract unique states
      const uniqueStates = Array.from(
        new Set(
          rawDocs
            .map((p) => {
              const raw = p.location?.address?.state?.trim()
              return raw ? toTitleCase(raw) : ''
            })
            .filter(Boolean)
        )
      ).sort()

      // Extract unique cities
      const uniqueCities = Array.from(
        new Set(
          rawDocs
            .map((p) => {
              const rawCity = p.location?.address?.city?.trim()
              return rawCity ? toTitleCase(rawCity) : ''
            })
            .filter(Boolean)
        )
      ).sort()

      return {
        countryOptions: uniqueCountries.map((c) => ({ label: c, value: c })),
        stateOptions: uniqueStates.map((s) => ({ label: s, value: s })),
        cityOptions: uniqueCities.map((c) => ({ label: c, value: c })),
      }
    },
    ["search-filters-all"],
    {
      revalidate: 86400,
      tags: ["search-filters"],
    }
  )()
}
