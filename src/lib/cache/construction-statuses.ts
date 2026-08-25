import { cached } from './wrapper'
import { getPayloadClient } from '@/db/client'

export interface CachedConstructionStatus {
  id: number
  name: string
  slug: string
  colorTheme: 'emerald' | 'amber' | 'blue' | 'indigo' | 'purple' | 'gray'
}

/**
 * Retrieves the listing construction statuses via serialization-safe cache.
 * Tags: 'construction-statuses'
 */
export const getCachedConstructionStatuses = async (): Promise<CachedConstructionStatus[]> => {
  const cacheKey = 'construction-statuses-all'

  return await cached(
    async () => {
      const payload = await getPayloadClient()
      const data = await payload.find({
        collection: 'construction-statuses',
        limit: 100,
        sort: 'name',
      })

      return data.docs.map((doc) => ({
        id: Number(doc.id),
        name: doc.name,
        slug: doc.slug,
        colorTheme: doc.colorTheme as CachedConstructionStatus['colorTheme'],
      }))
    },
    [cacheKey],
    {
      revalidate: 86400,
      tags: ['construction-statuses'],
    }
  )()
}

