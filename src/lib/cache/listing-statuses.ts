import { cached } from './wrapper'
import { getPayloadClient } from '@/db/client'

/**
 * Retrieves all listing statuses via serialization-safe cache.
 * NEXT.js caching stores raw JSON documents.
 * 
 * Duration: 1 Day (86400s) — safety net only; on-demand revalidation handles normal purges
 * Tags: 'listing-statuses'
 */
export const getCachedListingStatuses = async () => {
  const cacheKey = 'listing-statuses-all'
  
  return await cached(
    async () => {
      const payload = await getPayloadClient()
      const data = await payload.find({
        collection: 'listing-statuses',
        limit: 100,
        depth: 0,
      })
      return data.docs
    },
    [cacheKey],
    {
      revalidate: 86400,
      tags: ['listing-statuses'],
    }
  )()
}

