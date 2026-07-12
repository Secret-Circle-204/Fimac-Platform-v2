import type { Payload } from 'payload'

export const defaultFeatures = [
  // Features
  { name: '24-Hour Room Service' },
  { name: 'High-Speed Fiber WiFi' },
  { name: 'Smart Home Automation' },
  { name: 'Private Home Cinema' },
  { name: 'Internal Private Elevator' },
  { name: 'Underfloor Heating System' },
  { name: 'Central Air Conditioning' },
  { name: 'Walk-in Custom Closets' },
  { name: 'Panic Room / Vault' },
  { name: 'Luxury Marble Bathrooms' },
  { name: 'Soundproof Rooms' },
  { name: 'Infinity Edge Pool' },
  { name: 'Private Beachfront Access' },
  { name: 'Extensive Landscaped Garden' },
  { name: 'BBQ & Outdoor Dining Area' },
  { name: 'Underground Parking Garage' },
  { name: 'Helipad Access' },
  { name: 'Rooftop Terrace / Sky Lounge' },
  { name: 'Fenced & Gated Perimeter' },
  { name: 'Private Boat Dock' },
  { name: '24/7 Gated Community Security' },
  { name: 'Concierge & Reception' },
  { name: 'Elite Gym & Fitness Center' },
  { name: 'Spa & Wellness Retreat' },
  { name: 'Kids Adventure Playgrounds' },
  { name: 'Championship Golf Course Access' },
  { name: 'Retail & Commercial Outlets' },
  { name: 'Tennis & Basketball Courts' },
  { name: 'Paved Asphalt Roads' },
  { name: 'Commercial Building Permit' },
  { name: 'Solar Power Grid & Backup' },
  { name: 'Water & Electricity Ready' },
  { name: 'Fiber Optic Connectivity' },
]

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
