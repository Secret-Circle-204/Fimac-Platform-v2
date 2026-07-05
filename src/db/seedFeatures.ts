import type { Payload } from 'payload'

export const defaultFeatures = [
  // Interior Features
  { name: '24-Hour Room Service', category: 'interior' },
  { name: 'High-Speed Fiber WiFi', category: 'interior' },
  { name: 'Smart Home Automation', category: 'interior' },
  { name: 'Private Home Cinema', category: 'interior' },
  { name: 'Internal Private Elevator', category: 'interior' },
  { name: 'Underfloor Heating System', category: 'interior' },
  { name: 'Central Air Conditioning', category: 'interior' },
  { name: 'Walk-in Custom Closets', category: 'interior' },
  { name: 'Panic Room / Vault', category: 'interior' },
  { name: 'Luxury Marble Bathrooms', category: 'interior' },
  { name: 'Soundproof Rooms', category: 'interior' },

  // Exterior Features
  { name: 'Infinity Edge Pool', category: 'exterior' },
  { name: 'Private Beachfront Access', category: 'exterior' },
  { name: 'Extensive Landscaped Garden', category: 'exterior' },
  { name: 'BBQ & Outdoor Dining Area', category: 'exterior' },
  { name: 'Underground Parking Garage', category: 'exterior' },
  { name: 'Helipad Access', category: 'exterior' },
  { name: 'Rooftop Terrace / Sky Lounge', category: 'exterior' },
  { name: 'Fenced & Gated Perimeter', category: 'exterior' },
  { name: 'Private Boat Dock', category: 'exterior' },

  // Community Features
  { name: '24/7 Gated Community Security', category: 'community' },
  { name: 'Concierge & Reception', category: 'community' },
  { name: 'Elite Gym & Fitness Center', category: 'community' },
  { name: 'Spa & Wellness Retreat', category: 'community' },
  { name: 'Kids Adventure Playgrounds', category: 'community' },
  { name: 'Championship Golf Course Access', category: 'community' },
  { name: 'Retail & Commercial Outlets', category: 'community' },
  { name: 'Tennis & Basketball Courts', category: 'community' },
  { name: 'Paved Asphalt Roads', category: 'community' },

  // Other Features
  { name: 'Commercial Building Permit', category: 'other' },
  { name: 'Solar Power Grid & Backup', category: 'other' },
  { name: 'Water & Electricity Ready', category: 'other' },
  { name: 'Fiber Optic Connectivity', category: 'other' },
] as const

/**
 * Seeds the features collection if it is empty.
 * Admin retains full capabilities to edit, add or delete seeded data afterwards.
 */
export async function seedFeatures(payload: Payload): Promise<void> {
  try {
    const featuresCount = await payload.count({
      collection: 'features',
    })

    if (featuresCount.totalDocs === 0) {
      payload.logger.info('⚡ [Seeder]: Features collection is empty. Seeding professional default features...')
      
      for (const feature of defaultFeatures) {
        await payload.create({
          collection: 'features',
          data: feature,
        })
      }
      
      payload.logger.info('✅ [Seeder]: Feature seeding completed successfully!')
    } else {
      payload.logger.info(`ℹ️ [Seeder]: Features already exist (${featuresCount.totalDocs} found). Skipping seeding.`)
    }
  } catch (error) {
    payload.logger.error(`❌ [Seeder]: Error occurred while seeding default features: ${error instanceof Error ? error.message : 'Unknown'}`)
  }
}
