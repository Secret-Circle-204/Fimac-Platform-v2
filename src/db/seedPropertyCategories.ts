import type { Payload } from 'payload'

export const defaultPropertyCategories = [
  { name: 'Residential', slug: 'residential', icon: 'Home', sortOrder: 1 },
  { name: 'Commercial', slug: 'commercial', icon: 'Building2', sortOrder: 2 },
  { name: 'Hospitality', slug: 'hospitality', icon: 'Hotel', sortOrder: 3 },
  { name: 'Land', slug: 'land', icon: 'Map', sortOrder: 4 },
] as const

export async function seedPropertyCategories(payload: Payload): Promise<void> {
  try {
    const count = await payload.count({
      collection: 'property-categories',
    })

    if (count.totalDocs === 0) {
      payload.logger.info(
        '⚡ [Seeder]: Property Categories collection is empty. Seeding default categories...',
      )

      for (const item of defaultPropertyCategories) {
        await payload.create({
          collection: 'property-categories',
          data: {
            name: item.name,
            icon: item.icon,
            sortOrder: item.sortOrder,
          },
        })
      }

      payload.logger.info('✅ [Seeder]: Property Categories seeding completed successfully!')
    } else {
      payload.logger.info(
        `ℹ️ [Seeder]: Property Categories already exist (${count.totalDocs} found). Skipping seeding.`,
      )
    }
  } catch (error) {
    payload.logger.error(
      `❌ [Seeder]: Error occurred while seeding default property categories: ${error instanceof Error ? error.message : 'Unknown'}`,
    )
  }
}
