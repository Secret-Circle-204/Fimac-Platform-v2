import type { Payload } from 'payload'

export const defaultPropertyTypes = [
  { name: 'Hotel', slug: 'hotel' },
  { name: 'Motel', slug: 'motel' },
  { name: 'Resort', slug: 'resort' },
  { name: 'Land', slug: 'land' },
  { name: 'Elite Real Estate', slug: 'elite-real-estate' },
  { name: 'Commercial', slug: 'commercial' },
] as const

export async function seedPropertyTypes(payload: Payload): Promise<void> {
  try {
    const typesCount = await payload.count({
      collection: 'property-types',
    })

    if (typesCount.totalDocs === 0) {
      payload.logger.info(
        '⚡ [Seeder]: Property Types collection is empty. Seeding default architectural categories...',
      )

      for (const item of defaultPropertyTypes) {
        await payload.create({
          collection: 'property-types',
          data: item,
        })
      }

      payload.logger.info('✅ [Seeder]: Property Types seeding completed successfully!')
    } else {
      payload.logger.info(
        `ℹ️ [Seeder]: Property Types already exist (${typesCount.totalDocs} found). Skipping seeding.`,
      )
    }
  } catch (error) {
    payload.logger.error(
      `❌ [Seeder]: Error occurred while seeding default property types: ${error instanceof Error ? error.message : 'Unknown'}`,
    )
  }
}
