import type { Payload } from 'payload'

export const defaultPropertyTypes = [
  { name: 'Hotel', slug: 'hotel', categorySlug: 'hospitality' },
  { name: 'Motel', slug: 'motel', categorySlug: 'hospitality' },
  { name: 'Resort', slug: 'resort', categorySlug: 'hospitality' },
  { name: 'Land', slug: 'land', categorySlug: 'land' },
  { name: 'Elite Real Estate', slug: 'elite-real-estate', categorySlug: 'residential' },
  { name: 'Commercial', slug: 'commercial', categorySlug: 'commercial' },
] as const

export async function seedPropertyTypes(payload: Payload): Promise<void> {
  try {
    // 1. Get all categories to map slugs to IDs
    const categoriesResult = await payload.find({
      collection: 'property-categories',
      limit: 100,
    })

    const categoryMap = new Map<string, string>()
    categoriesResult.docs.forEach((cat) => {
      categoryMap.set(cat.slug, cat.id)
    })

    const typesCount = await payload.count({
      collection: 'property-types',
    })

    if (typesCount.totalDocs === 0) {
      payload.logger.info(
        '⚡ [Seeder]: Property Types collection is empty. Seeding default property types...',
      )

      for (const item of defaultPropertyTypes) {
        const categoryId = categoryMap.get(item.categorySlug)
        if (!categoryId) {
          payload.logger.error(`❌ [Seeder]: Category with slug '${item.categorySlug}' not found. Skipping '${item.name}'`)
          continue
        }

        await payload.create({
          collection: 'property-types',
          data: {
            name: item.name,
            slug: item.slug,
            category: categoryId,
          },
        })
      }

      payload.logger.info('✅ [Seeder]: Property Types seeding completed successfully!')
    } else {
      payload.logger.info(
        `ℹ️ [Seeder]: Property Types already exist (${typesCount.totalDocs} found). Ensuring categories are linked...`,
      )

      // Ensure existing property types have categories linked
      const existingTypes = await payload.find({
        collection: 'property-types',
        limit: 100,
      })

      for (const doc of existingTypes.docs) {
        if (!doc.category) {
          // Find matching default item to determine category
          const defaultItem = defaultPropertyTypes.find((item) => item.slug === doc.slug)
          const categorySlug = defaultItem ? defaultItem.categorySlug : 'residential' // fallback
          const categoryId = categoryMap.get(categorySlug)

          if (categoryId) {
            payload.logger.info(`⚡ [Seeder]: Linking property type '${doc.name}' to category '${categorySlug}'`)
            await payload.update({
              collection: 'property-types',
              id: doc.id,
              data: {
                category: categoryId,
              },
            })
          }
        }
      }
    }
  } catch (error) {
    payload.logger.error(
      `❌ [Seeder]: Error occurred while seeding default property types: ${error instanceof Error ? error.message : 'Unknown'}`,
    )
  }
}
