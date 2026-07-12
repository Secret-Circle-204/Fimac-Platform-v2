import type { Payload } from 'payload'

export const defaultListingStatuses = [
  { name: 'For Sale', slug: 'forsale', colorTheme: 'emerald' },
  { name: 'Sold', slug: 'sold', colorTheme: 'blue' },
  { name: 'Draft', slug: 'draft', colorTheme: 'gray' },
] as const

export async function seedListingStatuses(payload: Payload): Promise<void> {
  try {
    for (const item of defaultListingStatuses) {
      const normalizedSlug = item.slug === 'forsale' ? 'for-sale' : item.slug
      const existing = await payload.find({
        collection: 'listing-statuses',
        where: {
          or: [
            { slug: { equals: item.slug } },
            { slug: { equals: normalizedSlug } },
            { name: { equals: item.name } }
          ]
        },
        limit: 1,
      })

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'listing-statuses',
          data: item,
        })
        payload.logger.info(`✅ [Seeder]: Seeded missing listing status: ${item.name}`)
      } else {
        const doc = existing.docs[0]
        if ((doc.slug === 'forsale' || doc.slug === 'for-sale') && doc.name !== 'For Sale') {
          await payload.update({
            collection: 'listing-statuses',
            id: doc.id,
            data: { name: 'For Sale' },
          })
          payload.logger.info('✅ [Seeder]: Corrected slug forsale status name to For Sale')
        } else if (doc.slug === 'sold' && doc.name !== 'Sold') {
          await payload.update({
            collection: 'listing-statuses',
            id: doc.id,
            data: { name: 'Sold' },
          })
          payload.logger.info('✅ [Seeder]: Corrected slug sold status name to Sold')
        }
      }
    }
  } catch (error) {
    payload.logger.error(
      `❌ [Seeder]: Error occurred while seeding default listing statuses: ${error instanceof Error ? error.message : 'Unknown'}`,
    )
  }
}
