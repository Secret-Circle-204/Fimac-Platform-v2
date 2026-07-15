import type { Payload } from 'payload'

export const defaultPropertyTypes = [
  // Commercial
  { name: 'Office', slug: 'office', categorySlug: 'commercial', specificationProfile: 'office' },
  { name: 'Retail Shop', slug: 'retail-shop', categorySlug: 'commercial', specificationProfile: 'retail' },
  { name: 'Restaurant', slug: 'restaurant', categorySlug: 'commercial', specificationProfile: 'restaurant' },
  { name: 'Cafe', slug: 'cafe', categorySlug: 'commercial', specificationProfile: 'restaurant' },
  { name: 'Showroom', slug: 'showroom', categorySlug: 'commercial', specificationProfile: 'retail' },
  { name: 'Warehouse', slug: 'warehouse', categorySlug: 'commercial', specificationProfile: 'warehouse' },
  { name: 'Factory', slug: 'factory', categorySlug: 'commercial', specificationProfile: 'factory' },
  { name: 'Workshop', slug: 'workshop', categorySlug: 'commercial', specificationProfile: 'factory' },
  { name: 'Clinic', slug: 'clinic', categorySlug: 'commercial', specificationProfile: 'medical' },
  { name: 'Business Center', slug: 'business-center', categorySlug: 'commercial', specificationProfile: 'office' },
  { name: 'Coworking Space', slug: 'coworking-space', categorySlug: 'commercial', specificationProfile: 'office' },
  { name: 'Commercial Building', slug: 'commercial-building', categorySlug: 'commercial', specificationProfile: 'none' },
  { name: 'Mixed Use Building', slug: 'mixed-use-building', categorySlug: 'commercial', specificationProfile: 'none' },

  // Residential
  { name: 'Apartment', slug: 'apartment', categorySlug: 'residential', specificationProfile: 'apartment' },
  { name: 'Studio', slug: 'studio', categorySlug: 'residential', specificationProfile: 'apartment' },
  { name: 'Duplex', slug: 'duplex', categorySlug: 'residential', specificationProfile: 'apartment' },
  { name: 'Penthouse', slug: 'penthouse', categorySlug: 'residential', specificationProfile: 'villa' },
  { name: 'Villa', slug: 'villa', categorySlug: 'residential', specificationProfile: 'villa' },
  { name: 'Townhouse', slug: 'townhouse', categorySlug: 'residential', specificationProfile: 'villa' },
  { name: 'Twin House', slug: 'twin-house', categorySlug: 'residential', specificationProfile: 'villa' },
  { name: 'Chalet', slug: 'chalet', categorySlug: 'residential', specificationProfile: 'chalet' },
  { name: 'Cabin', slug: 'cabin', categorySlug: 'residential', specificationProfile: 'chalet' },
  { name: 'Farm House', slug: 'farm-house', categorySlug: 'residential', specificationProfile: 'villa' },
  { name: 'Mansion', slug: 'mansion', categorySlug: 'residential', specificationProfile: 'villa' },
  { name: 'Palace', slug: 'palace', categorySlug: 'residential', specificationProfile: 'villa' },
  { name: 'Compound Unit', slug: 'compound-unit', categorySlug: 'residential', specificationProfile: 'none' },
  { name: 'Serviced Apartment', slug: 'serviced-apartment', categorySlug: 'residential', specificationProfile: 'apartment' },
  { name: 'Loft', slug: 'loft', categorySlug: 'residential', specificationProfile: 'apartment' },

  // Hospitality
  { name: 'Hotel', slug: 'hotel', categorySlug: 'hospitality', specificationProfile: 'hotel' },
  { name: 'Boutique Hotel', slug: 'boutique-hotel', categorySlug: 'hospitality', specificationProfile: 'hotel' },
  { name: 'Resort', slug: 'resort', categorySlug: 'hospitality', specificationProfile: 'resort' },
  { name: 'Motel', slug: 'motel', categorySlug: 'hospitality', specificationProfile: 'motel' },
  { name: 'Aparthotel', slug: 'aparthotel', categorySlug: 'hospitality', specificationProfile: 'hotel' },
  { name: 'Hotel Apartment', slug: 'hotel-apartment', categorySlug: 'hospitality', specificationProfile: 'hotel' },
  { name: 'Eco Lodge', slug: 'eco-lodge', categorySlug: 'hospitality', specificationProfile: 'camp' },
  { name: 'Lodge', slug: 'lodge', categorySlug: 'hospitality', specificationProfile: 'camp' },
  { name: 'Guest House', slug: 'guest-house', categorySlug: 'hospitality', specificationProfile: 'motel' },
  { name: 'Hostel', slug: 'hostel', categorySlug: 'hospitality', specificationProfile: 'motel' },
  { name: 'Bed & Breakfast', slug: 'bed-and-breakfast', categorySlug: 'hospitality', specificationProfile: 'motel' },
  { name: 'Camp', slug: 'camp', categorySlug: 'hospitality', specificationProfile: 'camp' },
  { name: 'Glamping Site', slug: 'glamping-site', categorySlug: 'hospitality', specificationProfile: 'camp' },
  { name: 'Holiday Village', slug: 'holiday-village', categorySlug: 'hospitality', specificationProfile: 'resort' },

  // Land
  { name: 'Residential Land', slug: 'residential-land', categorySlug: 'land', specificationProfile: 'land' },
  { name: 'Commercial Land', slug: 'commercial-land', categorySlug: 'land', specificationProfile: 'land' },
  { name: 'Industrial Land', slug: 'industrial-land', categorySlug: 'land', specificationProfile: 'land' },
  { name: 'Agricultural Land', slug: 'agricultural-land', categorySlug: 'land', specificationProfile: 'land' },
  { name: 'Mixed-Use Land', slug: 'mixed-use-land', categorySlug: 'land', specificationProfile: 'land' },
  { name: 'Investment Land', slug: 'investment-land', categorySlug: 'land', specificationProfile: 'land' },
  { name: 'Farm Land', slug: 'farm-land', categorySlug: 'land', specificationProfile: 'land' },
  { name: 'Desert Land', slug: 'desert-land', categorySlug: 'land', specificationProfile: 'land' },
  { name: 'Coastal Land', slug: 'coastal-land', categorySlug: 'land', specificationProfile: 'land' },
  { name: 'Mountain Land', slug: 'mountain-land', categorySlug: 'land', specificationProfile: 'land' },
  { name: 'Island', slug: 'island', categorySlug: 'land', specificationProfile: 'land' },
  { name: 'Development Site', slug: 'development-site', categorySlug: 'land', specificationProfile: 'land' },
  { name: 'Building Plot', slug: 'building-plot', categorySlug: 'land', specificationProfile: 'land' },
] as const

export async function seedPropertyTypes(payload: Payload): Promise<void> {
  try {
    // 1. Get all categories to map slugs to IDs
    const categoriesResult = await payload.find({
      collection: 'property-categories',
      limit: 100,
    })

    const categoryMap = new Map<string, number>()
    categoriesResult.docs.forEach((cat) => {
      categoryMap.set(cat.slug, cat.id)
    })

    payload.logger.info('⚡ [Seeder]: Syncing all default property types...')

    for (const item of defaultPropertyTypes) {
      const categoryId = categoryMap.get(item.categorySlug)
      if (!categoryId) {
        payload.logger.error(`❌ [Seeder]: Category '${item.categorySlug}' not found. Skipping '${item.name}'`)
        continue
      }

      // Check if this type already exists by slug
      const existsResult = await payload.find({
        collection: 'property-types',
        where: {
          slug: {
            equals: item.slug,
          },
        },
      })

      if (existsResult.docs.length === 0) {
        payload.logger.info(`⚡ [Seeder]: Creating property type '${item.name}'`)
        await payload.create({
          collection: 'property-types',
          context: { skipCacheInvalidation: true },
          data: {
            name: item.name,
            slug: item.slug,
            category: categoryId,
            specificationProfile: item.specificationProfile,
          },
        })
      } else {
        const existingDoc = existsResult.docs[0]
        // Update to sync category and profile mappings
        await payload.update({
          collection: 'property-types',
          id: existingDoc.id,
          context: { skipCacheInvalidation: true },
          data: {
            category: categoryId,
            specificationProfile: item.specificationProfile,
          },
        })
      }
    }

    payload.logger.info('✅ [Seeder]: Property Types syncing completed successfully!')
  } catch (error) {
    payload.logger.error(
      `❌ [Seeder]: Error occurred while seeding default property types: ${error instanceof Error ? error.message : 'Unknown'}`,
    )
  }
}
