import { unstable_cache } from "next/cache"
import { getPayloadClient } from "@/db/client"
import { sql } from "@payloadcms/db-postgres"

type FilterOption = { label: string; value: string }

type SearchFilters = {
  countryOptions: FilterOption[]
  cityOptions: FilterOption[]
}

interface DBRowCountry {
  location_address_country: string | null
}
interface DBRowCity {
  location_address_city: string | null
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Retrieves the unique filter dropdown values (countries, cities) for the search page.
 * Queries distinct values directly from PostgreSQL using indices to avoid event loop blockages
 * and memory overheads associated with in-memory JSON aggregations.
 * 
 * Duration: 1 Day (86400s) — safety net only; on-demand revalidation handles normal purges
 * Tags: 'search-filters' — revalidated on-demand when properties are created/updated/deleted
 */
export const getCachedSearchFilters = async (): Promise<SearchFilters> => {
  return await unstable_cache(
    async () => {
      console.log(`⚡ [CACHE MISS]: search-filters (Querying PostgreSQL Remote DB...)`)
      const payload = await getPayloadClient()
      const db = payload.db.drizzle

      const [countriesResRaw, citiesResRaw] = await Promise.all([
        db.execute(
          sql`SELECT DISTINCT location_address_country FROM properties WHERE listing_status_id != (SELECT id FROM listing_statuses WHERE slug = 'draft') AND location_address_country IS NOT NULL AND location_address_country != '' ORDER BY location_address_country ASC`
        ) as Promise<unknown>,
        db.execute(
          sql`SELECT DISTINCT location_address_city FROM properties WHERE listing_status_id != (SELECT id FROM listing_statuses WHERE slug = 'draft') AND location_address_city IS NOT NULL AND location_address_city != '' ORDER BY location_address_city ASC`
        ) as Promise<unknown>
      ])

      let countriesRes: DBRowCountry[] = []
      if (Array.isArray(countriesResRaw)) {
        countriesRes = countriesResRaw as DBRowCountry[]
      } else if (countriesResRaw && typeof countriesResRaw === 'object' && 'rows' in countriesResRaw) {
        countriesRes = (countriesResRaw as { rows: DBRowCountry[] }).rows
      }

      let citiesRes: DBRowCity[] = []
      if (Array.isArray(citiesResRaw)) {
        citiesRes = citiesResRaw as DBRowCity[]
      } else if (citiesResRaw && typeof citiesResRaw === 'object' && 'rows' in citiesResRaw) {
        citiesRes = (citiesResRaw as { rows: DBRowCity[] }).rows
      }

      // Extract and normalize unique countries
      const uniqueCountries = Array.from(
        new Set(
          countriesRes
            .map((row) => {
              const raw = row.location_address_country?.trim() || 'Egypt'
              return toTitleCase(raw)
            })
            .filter(Boolean)
        )
      ).sort()

      // Extract and normalize unique cities
      const uniqueCities = Array.from(
        new Set(
          citiesRes
            .map((row) => {
              const rawCity = row.location_address_city?.trim()
              return rawCity ? toTitleCase(rawCity) : ''
            })
            .filter(Boolean)
        )
      ).sort()

      return {
        countryOptions: uniqueCountries.map((c) => ({ label: c, value: c })),
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
