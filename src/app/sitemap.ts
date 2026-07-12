import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/db/client'
import { SERVER_URL } from '@/env'
import { buildPropertyUrl } from '@/repository/property/generate-url'

/**
 * Production Sitemap Generator
 *
 * Design decisions:
 * - Fetches only the minimal fields required (id, updatedAt, location.address, street)
 *   to avoid loading heavy relations (photos, seller, features) into memory.
 * - Uses a high limit with Payload's internal pagination to handle thousands of properties.
 *   For >10,000 properties, consider splitting into sitemapIndex with multiple sitemaps.
 * - All URLs are built via the canonical buildPropertyUrl to guarantee consistency
 *   with the routing layer — no hardcoded strings.
 * - No draft mode exists on Properties collection, so all returned docs are publishable.
 *   The only non-indexable properties are those with 'offmarket' or 'draft' status,
 *   which are still valid URLs but lower SEO priority. We include all to avoid 404s on
 *   already-indexed pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()

  // Lightweight query: only select the fields needed for URL generation and lastModified.
  // Payload's `select` reduces serialization overhead significantly for large collections.
  const result = await payload.find({
    collection: 'properties',
    where: {
      'listingStatus.slug': {
        not_equals: 'draft',
      },
    },
    limit: 5000, // Safe upper bound; increase or split to sitemapIndex if collection grows past this
    depth: 0,    // Depth 0 prevents loading any relations — id, updatedAt, and scalar fields only
    select: {
      id: true,
      updatedAt: true,
      street: true,
      location: true,
    },
    pagination: false, // Disable pagination metadata for maximum throughput
  })

  const entries: MetadataRoute.Sitemap = result.docs
    // Type-safe guard: ensure id exists before generating the URL
    .filter((doc) => typeof doc.id === 'string' && doc.id.length > 0)
    .map((doc) => {
      // Access location address at depth 0 (populated as plain object, not relation)
      const address = (doc.location as Record<string, unknown> | undefined)?.address as Record<string, unknown> | undefined ?? {}

      return {
        url: `${SERVER_URL}${buildPropertyUrl(doc.id, {
          street: typeof address.street === 'string' ? address.street : (doc.street as string | undefined),
          city:   typeof address.city   === 'string' ? address.city   : undefined,
          state:  typeof address.state  === 'string' ? address.state  : undefined,
        })}`,
        lastModified: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
        // changeFrequency and priority intentionally omitted:
        // Google largely ignores these hints; keeping the sitemap lean is better practice.
      }
    })

  return entries
}
