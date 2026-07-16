import type { Payload } from 'payload'
import slugify from 'slugify'

export interface DefaultFeature {
  name: string
  featureGroup:
    | 'interior'
    | 'outdoor'
    | 'security'
    | 'parking'
    | 'utilities'
    | 'accessibility'
    | 'business'
    | 'hospitality'
    | 'land_development'
    | 'agriculture'
    | 'sustainability'
    | 'luxury'
  visibleInCategories?: ('residential' | 'commercial' | 'hospitality' | 'land')[]
  visibleInPropertyTypes?: string[]
}

export const defaultFeatures: DefaultFeature[] = [
  // 1. General & Infrastructure (visible everywhere, no restrictions)
  { name: 'Fiber Optic Connectivity', featureGroup: 'utilities' },
  { name: 'Backup Generator', featureGroup: 'utilities' },
  { name: 'Water Connected', featureGroup: 'utilities' },
  { name: 'Electricity Connected', featureGroup: 'utilities' },
  { name: 'Sewer Connection', featureGroup: 'utilities' },
  { name: 'High-Speed Internet', featureGroup: 'utilities' },
  { name: 'Water Tank', featureGroup: 'utilities' },
  { name: 'Water Well', featureGroup: 'utilities' },
  { name: 'Solar Panels', featureGroup: 'sustainability' },
  {
    name: 'Rainwater Harvesting',
    featureGroup: 'sustainability',
    visibleInCategories: ['residential', 'commercial', 'hospitality', 'land'],
  },
  {
    name: 'Greywater Recycling',
    featureGroup: 'sustainability',
    visibleInCategories: ['residential', 'commercial', 'hospitality'],
  },
  {
    name: 'Green Building Certified',
    featureGroup: 'sustainability',
    visibleInCategories: ['commercial', 'residential', 'hospitality'],
    visibleInPropertyTypes: [
      'office',
      'commercial-building',
      'mixed-use-building',
      'business-center',
      'apartment',
      'villa',
      'mansion',
      'palace',
      'hotel',
      'boutique-hotel',
      'resort',
    ],
  },
  {
    name: 'Irrigation System',
    featureGroup: 'utilities',
    visibleInCategories: ['land', 'residential', 'hospitality'],
  },

  // 2. Interior & Amenities (group: interior)
  {
    name: 'Air Conditioning',
    featureGroup: 'interior',
    visibleInCategories: ['residential', 'commercial', 'hospitality'],
  },
  {
    name: 'Central Heating',
    featureGroup: 'interior',
    visibleInCategories: ['residential', 'commercial', 'hospitality'],
  },
  {
    name: 'Fireplace',
    featureGroup: 'interior',
    visibleInCategories: ['residential', 'hospitality'],
    visibleInPropertyTypes: [
      'villa',
      'penthouse',
      'chalet',
      'farm-house',
      'mansion',
      'palace',
      'eco-lodge',
      'lodge',
    ],
  },
  {
    name: 'Walk-in Closet',
    featureGroup: 'interior',
    visibleInCategories: ['residential'],
    visibleInPropertyTypes: [
      'villa',
      'penthouse',
      'mansion',
      'palace',
      'duplex',
      'apartment',
      'loft',
    ],
  },
  {
    name: 'Built-in Wardrobes',
    featureGroup: 'interior',
    visibleInCategories: ['residential', 'hospitality'],
  },
  {
    name: 'Laundry Room',
    featureGroup: 'interior',
    visibleInCategories: ['residential', 'hospitality'],
  },
  {
    name: 'Storage Room',
    featureGroup: 'interior',
    visibleInCategories: ['residential', 'commercial', 'hospitality'],
  },
  {
    name: "Maid's Room",
    featureGroup: 'interior',
    visibleInCategories: ['residential', 'hospitality'],
    visibleInPropertyTypes: [
      'villa',
      'penthouse',
      'mansion',
      'palace',
      'duplex',
      'serviced-apartment',
      'resort',
      'hotel-apartment',
    ],
  },
  {
    name: "Driver's Room",
    featureGroup: 'interior',
    visibleInCategories: ['residential', 'commercial', 'hospitality'],
    visibleInPropertyTypes: ['villa', 'mansion', 'palace', 'penthouse', 'business-center', 'hotel'],
  },
  {
    name: 'Home Office',
    featureGroup: 'interior',
    visibleInCategories: ['residential'],
    visibleInPropertyTypes: [
      'villa',
      'penthouse',
      'mansion',
      'palace',
      'duplex',
      'apartment',
      'loft',
    ],
  },
  {
    name: 'Sauna & Steam Room',
    featureGroup: 'interior',
    visibleInCategories: ['residential', 'hospitality'],
    visibleInPropertyTypes: [
      'villa',
      'mansion',
      'palace',
      'penthouse',
      'resort',
      'hotel',
      'boutique-hotel',
    ],
  },
  {
    name: 'Jacuzzi',
    featureGroup: 'interior',
    visibleInCategories: ['residential', 'hospitality'],
    visibleInPropertyTypes: [
      'villa',
      'penthouse',
      'mansion',
      'palace',
      'chalet',
      'hotel',
      'resort',
      'boutique-hotel',
      'hotel-apartment',
    ],
  },
  {
    name: 'Fully Furnished',
    featureGroup: 'interior',
    visibleInCategories: ['residential', 'hospitality'],
  },
  {
    name: 'Equipped Kitchen',
    featureGroup: 'interior',
    visibleInCategories: ['residential', 'hospitality', 'commercial'],
    visibleInPropertyTypes: [
      'apartment',
      'studio',
      'duplex',
      'villa',
      'penthouse',
      'chalet',
      'cabin',
      'hotel-apartment',
      'serviced-apartment',
      'guest-house',
      'restaurant',
      'cafe',
    ],
  },

  // 3. Outdoor Features (group: outdoor)
  {
    name: 'Private Garden',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality'],
    visibleInPropertyTypes: [
      'villa',
      'townhouse',
      'twin-house',
      'farm-house',
      'mansion',
      'palace',
      'chalet',
      'eco-lodge',
      'lodge',
      'resort',
    ],
  },
  {
    name: 'Landscaped Garden',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'commercial', 'hospitality'],
  },
  {
    name: 'Private Pool',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality'],
    visibleInPropertyTypes: [
      'villa',
      'penthouse',
      'mansion',
      'palace',
      'chalet',
      'farm-house',
      'resort',
      'hotel',
    ],
  },
  {
    name: 'Infinity Pool',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality'],
    visibleInPropertyTypes: [
      'villa',
      'mansion',
      'palace',
      'penthouse',
      'resort',
      'hotel',
      'boutique-hotel',
    ],
  },
  {
    name: "Children's Pool",
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality'],
  },
  {
    name: 'BBQ Area',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality'],
  },
  {
    name: 'Outdoor Kitchen',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality'],
  },
  {
    name: 'Terrace',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality', 'commercial'],
  },
  {
    name: 'Balcony',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality', 'commercial'],
  },
  {
    name: 'Rooftop Terrace',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'commercial', 'hospitality'],
    visibleInPropertyTypes: [
      'penthouse',
      'villa',
      'mansion',
      'palace',
      'apartment',
      'office',
      'showroom',
      'coworking-space',
      'hotel',
      'boutique-hotel',
      'commercial-building',
      'mixed-use-building',
    ],
  },
  { name: 'Patio', featureGroup: 'outdoor', visibleInCategories: ['residential', 'hospitality'] },
  {
    name: 'Courtyard',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'commercial', 'hospitality'],
  },
  {
    name: 'Private Beach',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality'],
  },
  {
    name: 'Private Dock',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality', 'land'],
  },
  {
    name: 'Boat Slip',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality', 'land'],
  },
  {
    name: 'Marina Access',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality', 'land'],
  },
  {
    name: 'Waterfront',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality', 'land'],
  },
  {
    name: 'Sea View',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality'],
  },
  {
    name: 'Lake View',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality'],
  },
  {
    name: 'Mountain View',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality'],
  },
  { name: 'City View', featureGroup: 'outdoor' },
  {
    name: 'Golf View',
    featureGroup: 'outdoor',
    visibleInCategories: ['residential', 'hospitality'],
  },

  // 4. Security & Safety (group: security)
  { name: '24/7 Security', featureGroup: 'security' },
  {
    name: 'Gated Community',
    featureGroup: 'security',
    visibleInCategories: ['residential', 'hospitality'],
    visibleInPropertyTypes: [
      'villa',
      'townhouse',
      'twin-house',
      'penthouse',
      'apartment',
      'duplex',
      'compound-unit',
      'resort',
      'holiday-village',
    ],
  },
  { name: 'Security Cameras', featureGroup: 'security' },
  { name: 'Alarm System', featureGroup: 'security' },
  { name: 'Smart Access', featureGroup: 'security' },
  { name: 'Fire Alarm', featureGroup: 'security' },
  { name: 'Fire Sprinklers', featureGroup: 'security' },
  { name: 'Emergency Exit', featureGroup: 'security' },
  {
    name: 'Reception',
    featureGroup: 'security',
    visibleInCategories: ['commercial', 'hospitality', 'residential'],
  },
  {
    name: 'Concierge',
    featureGroup: 'security',
    visibleInCategories: ['hospitality', 'residential', 'commercial'],
  },
  { name: 'Access Control', featureGroup: 'security' },
  { name: 'Security Gate', featureGroup: 'security' },

  // 5. Parking & Transportation (group: parking)
  {
    name: 'Underground Parking',
    featureGroup: 'parking',
    visibleInCategories: ['residential', 'commercial', 'hospitality'],
  },
  {
    name: 'Private Garage',
    featureGroup: 'parking',
    visibleInCategories: ['residential', 'commercial'],
    visibleInPropertyTypes: [
      'villa',
      'townhouse',
      'twin-house',
      'mansion',
      'palace',
      'farm-house',
      'showroom',
      'warehouse',
      'factory',
      'workshop',
    ],
  },
  {
    name: 'Visitor Parking',
    featureGroup: 'parking',
    visibleInCategories: ['residential', 'commercial', 'hospitality'],
  },
  {
    name: 'EV Charging Station',
    featureGroup: 'parking',
    visibleInCategories: ['residential', 'commercial', 'hospitality'],
  },
  {
    name: 'Truck Loading Dock',
    featureGroup: 'parking',
    visibleInCategories: ['commercial'],
    visibleInPropertyTypes: [
      'warehouse',
      'factory',
      'workshop',
      'showroom',
      'commercial-building',
      'mixed-use-building',
    ],
  },

  // 6. Accessibility (group: accessibility)
  {
    name: 'Elevator',
    featureGroup: 'accessibility',
    visibleInCategories: ['residential', 'commercial', 'hospitality'],
    visibleInPropertyTypes: [
      'apartment',
      'penthouse',
      'duplex',
      'office',
      'business-center',
      'coworking-space',
      'commercial-building',
      'mixed-use-building',
      'showroom',
      'clinic',
      'hotel',
      'boutique-hotel',
      'resort',
      'serviced-apartment',
      'hotel-apartment',
    ],
  },
  {
    name: 'Internal Private Elevator',
    featureGroup: 'accessibility',
    visibleInCategories: ['residential', 'hospitality'],
    visibleInPropertyTypes: ['villa', 'mansion', 'palace', 'duplex', 'penthouse', 'boutique-hotel'],
  },

  // 7. Business & Commercial (group: business)
  {
    name: 'Meeting Rooms',
    featureGroup: 'business',
    visibleInCategories: ['commercial', 'hospitality'],
    visibleInPropertyTypes: [
      'office',
      'business-center',
      'coworking-space',
      'hotel',
      'boutique-hotel',
      'resort',
      'commercial-building',
      'mixed-use-building',
    ],
  },
  {
    name: 'Conference Hall',
    featureGroup: 'business',
    visibleInCategories: ['commercial', 'hospitality'],
    visibleInPropertyTypes: [
      'business-center',
      'hotel',
      'resort',
      'boutique-hotel',
      'commercial-building',
      'mixed-use-building',
    ],
  },
  {
    name: 'Reception Area',
    featureGroup: 'business',
    visibleInCategories: ['commercial', 'hospitality', 'residential'],
  },
  {
    name: 'Open Workspace',
    featureGroup: 'business',
    visibleInCategories: ['commercial'],
    visibleInPropertyTypes: [
      'office',
      'business-center',
      'coworking-space',
      'commercial-building',
      'mixed-use-building',
    ],
  },
  {
    name: 'Private Offices',
    featureGroup: 'business',
    visibleInCategories: ['commercial'],
    visibleInPropertyTypes: [
      'office',
      'business-center',
      'coworking-space',
      'commercial-building',
      'mixed-use-building',
    ],
  },
  {
    name: 'Server Room',
    featureGroup: 'business',
    visibleInCategories: ['commercial'],
    visibleInPropertyTypes: [
      'office',
      'business-center',
      'coworking-space',
      'commercial-building',
      'mixed-use-building',
      'factory',
      'warehouse',
    ],
  },
  {
    name: 'IT Room',
    featureGroup: 'business',
    visibleInCategories: ['commercial'],
    visibleInPropertyTypes: [
      'office',
      'business-center',
      'coworking-space',
      'commercial-building',
      'mixed-use-building',
    ],
  },
  {
    name: 'Showroom Area',
    featureGroup: 'business',
    visibleInCategories: ['commercial'],
    visibleInPropertyTypes: [
      'showroom',
      'retail-shop',
      'commercial-building',
      'mixed-use-building',
    ],
  },
  {
    name: 'Cold Storage',
    featureGroup: 'business',
    visibleInCategories: ['commercial'],
    visibleInPropertyTypes: ['warehouse', 'factory', 'restaurant', 'cafe', 'workshop'],
  },
  {
    name: 'Loading Area',
    featureGroup: 'business',
    visibleInCategories: ['commercial'],
    visibleInPropertyTypes: [
      'warehouse',
      'factory',
      'workshop',
      'showroom',
      'commercial-building',
      'mixed-use-building',
    ],
  },
  {
    name: 'Freight Elevator',
    featureGroup: 'business',
    visibleInCategories: ['commercial'],
    visibleInPropertyTypes: [
      'warehouse',
      'factory',
      'workshop',
      'showroom',
      'commercial-building',
      'mixed-use-building',
      'office',
    ],
  },
  {
    name: 'Industrial Power',
    featureGroup: 'business',
    visibleInCategories: ['commercial'],
    visibleInPropertyTypes: ['factory', 'warehouse', 'workshop'],
  },
  {
    name: 'Production Area',
    featureGroup: 'business',
    visibleInCategories: ['commercial'],
    visibleInPropertyTypes: ['factory', 'workshop'],
  },
  {
    name: 'Clean Room',
    featureGroup: 'business',
    visibleInCategories: ['commercial'],
    visibleInPropertyTypes: ['factory', 'workshop', 'clinic'],
  },
  {
    name: 'Medical License Ready',
    featureGroup: 'business',
    visibleInCategories: ['commercial'],
    visibleInPropertyTypes: ['clinic', 'office', 'business-center'],
  },
  {
    name: 'Commercial License Ready',
    featureGroup: 'business',
    visibleInCategories: ['commercial', 'land'],
    visibleInPropertyTypes: [
      'office',
      'retail-shop',
      'restaurant',
      'cafe',
      'showroom',
      'warehouse',
      'factory',
      'workshop',
      'business-center',
      'coworking-space',
      'commercial-building',
      'mixed-use-building',
      'commercial-land',
      'mixed-use-land',
      'investment-land',
    ],
  },

  // 8. Hospitality Services (group: hospitality)
  {
    name: 'Restaurant',
    featureGroup: 'hospitality',
    visibleInCategories: ['hospitality', 'commercial'],
  },
  {
    name: 'Coffee Shop',
    featureGroup: 'hospitality',
    visibleInCategories: ['hospitality', 'commercial'],
  },
  { name: 'Spa', featureGroup: 'hospitality', visibleInCategories: ['hospitality'] },
  { name: 'Wellness Center', featureGroup: 'hospitality', visibleInCategories: ['hospitality'] },
  {
    name: 'Fitness Center',
    featureGroup: 'hospitality',
    visibleInCategories: ['hospitality', 'residential', 'commercial'],
  },
  {
    name: 'Kids Club',
    featureGroup: 'hospitality',
    visibleInCategories: ['hospitality', 'residential'],
  },
  {
    name: 'Swimming Pool',
    featureGroup: 'hospitality',
    visibleInCategories: ['hospitality', 'residential'],
  },
  {
    name: 'Conference Center',
    featureGroup: 'hospitality',
    visibleInCategories: ['hospitality', 'commercial'],
  },
  { name: 'Ballroom', featureGroup: 'hospitality', visibleInCategories: ['hospitality'] },
  { name: 'Wedding Venue', featureGroup: 'hospitality', visibleInCategories: ['hospitality'] },
  {
    name: 'Business Lounge',
    featureGroup: 'hospitality',
    visibleInCategories: ['hospitality', 'commercial'],
  },
  { name: 'Room Service', featureGroup: 'hospitality', visibleInCategories: ['hospitality'] },
  { name: 'Laundry Service', featureGroup: 'hospitality', visibleInCategories: ['hospitality'] },
  { name: 'Housekeeping', featureGroup: 'hospitality', visibleInCategories: ['hospitality'] },
  { name: 'Airport Shuttle', featureGroup: 'hospitality', visibleInCategories: ['hospitality'] },
  {
    name: 'Valet Parking',
    featureGroup: 'hospitality',
    visibleInCategories: ['hospitality', 'commercial'],
  },
  {
    name: 'Beach Access',
    featureGroup: 'hospitality',
    visibleInCategories: ['hospitality', 'residential'],
  },
  { name: 'Water Park', featureGroup: 'hospitality', visibleInCategories: ['hospitality'] },
  { name: 'Private Villas', featureGroup: 'hospitality', visibleInCategories: ['hospitality'] },
  { name: 'All Inclusive', featureGroup: 'hospitality', visibleInCategories: ['hospitality'] },
  {
    name: 'Entertainment Area',
    featureGroup: 'hospitality',
    visibleInCategories: ['hospitality', 'residential'],
  },

  // 9. Land & Development (group: land_development)
  {
    name: 'Building Permit Available',
    featureGroup: 'land_development',
    visibleInCategories: ['land'],
  },
  {
    name: 'Approved Master Plan',
    featureGroup: 'land_development',
    visibleInCategories: ['land'],
    visibleInPropertyTypes: [
      'development-site',
      'building-plot',
      'residential-land',
      'commercial-land',
      'mixed-use-land',
      'investment-land',
    ],
  },
  { name: 'Corner Plot', featureGroup: 'land_development', visibleInCategories: ['land'] },
  { name: 'Road Access', featureGroup: 'land_development', visibleInCategories: ['land'] },
  {
    name: 'Paved Road Connection',
    featureGroup: 'land_development',
    visibleInCategories: ['land'],
  },
  { name: 'Zoning Certificate', featureGroup: 'land_development', visibleInCategories: ['land'] },

  // 10. Agriculture & Farm (group: agriculture)
  {
    name: 'Greenhouse',
    featureGroup: 'agriculture',
    visibleInCategories: ['land'],
    visibleInPropertyTypes: ['agricultural-land', 'farm-land'],
  },
  {
    name: 'Water Canal & Irrigation Network',
    featureGroup: 'agriculture',
    visibleInCategories: ['land'],
    visibleInPropertyTypes: ['agricultural-land', 'farm-land'],
  },
  {
    name: 'Livestock Barn & Stables',
    featureGroup: 'agriculture',
    visibleInCategories: ['land', 'residential'],
    visibleInPropertyTypes: ['agricultural-land', 'farm-land', 'farm-house'],
  },
  {
    name: 'Fertile Soil Report',
    featureGroup: 'agriculture',
    visibleInCategories: ['land'],
    visibleInPropertyTypes: ['agricultural-land', 'farm-land'],
  },

  // 11. Luxury & Premium (group: luxury)
  {
    name: 'Private Cinema',
    featureGroup: 'luxury',
    visibleInCategories: ['residential', 'hospitality'],
    visibleInPropertyTypes: ['villa', 'mansion', 'palace', 'penthouse', 'boutique-hotel', 'resort'],
  },
  {
    name: 'Helipad Access',
    featureGroup: 'luxury',
    visibleInCategories: ['hospitality', 'commercial', 'residential'],
    visibleInPropertyTypes: [
      'resort',
      'hotel',
      'commercial-building',
      'business-center',
      'palace',
      'mansion',
    ],
  },
  {
    name: 'Private Yacht Dock',
    featureGroup: 'luxury',
    visibleInCategories: ['residential', 'hospitality', 'land'],
    visibleInPropertyTypes: [
      'villa',
      'mansion',
      'palace',
      'chalet',
      'resort',
      'hotel',
      'coastal-land',
      'island',
    ],
  },
  {
    name: 'Private Wine Cellar',
    featureGroup: 'luxury',
    visibleInCategories: ['residential', 'hospitality'],
    visibleInPropertyTypes: ['villa', 'mansion', 'palace', 'hotel', 'boutique-hotel', 'resort'],
  },
  {
    name: 'Double-Height Lobby',
    featureGroup: 'luxury',
    visibleInCategories: ['commercial', 'hospitality', 'residential'],
    visibleInPropertyTypes: [
      'office',
      'showroom',
      'business-center',
      'commercial-building',
      'mixed-use-building',
      'hotel',
      'boutique-hotel',
      'resort',
      'penthouse',
      'palace',
      'mansion',
      'villa',
      'apartment',
    ],
  },
]

/**
 * Seeds the features collection, syncing feature groups, categories, and property types.
 */
export async function seedFeatures(payload: Payload): Promise<void> {
  try {
    payload.logger.info('⚡ [Seeder]: Fetching property types to map feature restrictions...')

    // 1. Fetch all property types to build slug -> ID map
    const propertyTypesResult = await payload.find({
      collection: 'property-types',
      limit: 300,
    })

    const propertyTypeMap = new Map<string, number>()
    propertyTypesResult.docs.forEach((doc) => {
      propertyTypeMap.set(doc.slug, doc.id)
    })

    payload.logger.info(
      `⚡ [Seeder]: Synced ${propertyTypeMap.size} property types for relationship mappings.`,
    )

    // 2. Sync each feature
    for (const feature of defaultFeatures) {
      const featureSlug = slugify(feature.name, { lower: true, strict: true })

      // Resolve property type IDs from slugs
      const typeIds: number[] = []
      if (feature.visibleInPropertyTypes) {
        for (const typeSlug of feature.visibleInPropertyTypes) {
          const id = propertyTypeMap.get(typeSlug)
          if (id) {
            typeIds.push(id)
          }
        }
      }

      // Check if feature already exists
      const existsResult = await payload.find({
        collection: 'features',
        where: {
          slug: {
            equals: featureSlug,
          },
        },
        limit: 1,
      })

      const data = {
        name: feature.name,
        slug: featureSlug,
        featureGroup: feature.featureGroup,
        visibleInCategories: feature.visibleInCategories || null,
        visibleInPropertyTypes: typeIds.length > 0 ? typeIds : null,
      }

      if (existsResult.docs.length === 0) {
        payload.logger.info(`⚡ [Seeder]: Creating feature '${feature.name}'`)
        await payload.create({
          collection: 'features',
          context: { skipCacheInvalidation: true },
          data,
        })
      } else {
        const existingDoc = existsResult.docs[0]
        payload.logger.info(`⚡ [Seeder]: Syncing existing feature '${feature.name}'`)
        await payload.update({
          collection: 'features',
          id: existingDoc.id,
          context: { skipCacheInvalidation: true },
          data,
        })
      }
    }

    payload.logger.info('✅ [Seeder]: Features syncing completed successfully!')
  } catch (error) {
    payload.logger.error(
      `❌ [Seeder]: Error occurred while seeding features: ${error instanceof Error ? error.message : 'Unknown'}`,
    )
  }
}
