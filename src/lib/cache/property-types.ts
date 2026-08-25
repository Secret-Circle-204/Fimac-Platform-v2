import { cached } from "./wrapper"
import { local } from "@/repository"
import { getPayloadClient } from "@/db/client"
import { sql } from "@payloadcms/db-postgres"

/**
 * Retrieves all property types via serialization-safe cache.
 * Used by admin dashboards, seller workflows, and seller requests to show all possible types.
 * 
 * Duration: 1 Day (86400s) — safety net only; on-demand revalidation handles normal purges
 * Tags: 'property-types'
 */
export const getCachedPropertyTypes = async () => {
  const cacheKey = "property-types-all"
  
  const rawData = await cached(
    async () => {
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

/**
 * Retrieves active property types (associated with at least one non-draft property) via serialization-safe cache.
 * Used by the search page filters.
 * 
 * Duration: 1 Day (86400s) — safety net only; on-demand revalidation handles normal purges
 * Tags: 'property-types-active'
 */
export const getCachedActivePropertyTypes = async () => {
  const cacheKey = "property-types-active"
  
  const rawData = await cached(
    async () => {
      const payload = await getPayloadClient()
      const db = payload.db.drizzle

      // 1. Get distinct active property type IDs (only properties whose status is not 'draft')
      const resRaw = await db.execute(
        sql`SELECT DISTINCT property_type_id FROM properties 
            WHERE listing_status_id IN (
              SELECT id FROM listing_statuses WHERE slug != 'draft'
            ) 
            AND property_type_id IS NOT NULL`
      ) as unknown

      let activeIds: (string | number)[] = []
      if (Array.isArray(resRaw)) {
        activeIds = resRaw.map((row: unknown) => {
          const r = row as { property_type_id: string | number }
          return r.property_type_id
        })
      } else if (resRaw && typeof resRaw === 'object' && 'rows' in resRaw) {
        const resultWithRows = resRaw as { rows: { property_type_id: string | number }[] }
        activeIds = resultWithRows.rows.map((row) => row.property_type_id)
      }

      if (activeIds.length === 0) {
        return []
      }

      // 2. Fetch the corresponding property types
      const data = await local.propertyType._getRawInternal(
        {
          id: {
            in: activeIds
          }
        },
        { depth: 1 }
      )
      return data
    },
    [cacheKey],
    {
      revalidate: 86400,
      tags: ["property-types-active"],
    }
  )()

  // Rehydrate decorator instances with getter methods
  return local.propertyType.decorateMany(rawData)
}
