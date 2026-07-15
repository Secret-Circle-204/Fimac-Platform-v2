import type { Payload } from 'payload'

export const defaultConstructionStatuses = [
  {
    name: 'Ready to Move In',
    slug: 'ready',
    colorTheme: 'emerald',
  },
  {
    name: 'Under Construction',
    slug: 'under_construction',
    colorTheme: 'amber',
  },
  {
    name: 'Brand New (First Occupancy)',
    slug: 'brand_new',
    colorTheme: 'blue',
  },
  {
    name: 'Off-Plan',
    slug: 'off_plan',
    colorTheme: 'indigo',
  },
  {
    name: 'Fully Renovated',
    slug: 'renovated',
    colorTheme: 'purple',
  },
] as const

export async function seedConstructionStatuses(payload: Payload): Promise<void> {
  try {
    for (const item of defaultConstructionStatuses) {
      const existing = await payload.find({
        collection: 'construction-statuses',
        where: { slug: { equals: item.slug } },
        limit: 1,
      })

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'construction-statuses',
          context: { skipCacheInvalidation: true },
          data: item,
        })
        payload.logger.info(`✅ [Seeder]: Seeded missing construction status: ${item.name}`)
      }
    }
  } catch (error) {
    payload.logger.error(
      `❌ [Seeder]: Error occurred while seeding default construction statuses: ${error instanceof Error ? error.message : 'Unknown'}`,
    )
  }
}
