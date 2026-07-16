import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../payload.config'
import { seedPropertyCategories } from './seedPropertyCategories'
import { seedPropertyTypes } from './seedPropertyTypes'
import { seedFeatures } from './seedFeatures'
import { seedListingStatuses } from './seedListingStatuses'
import { seedConstructionStatuses } from './seedConstructionStatuses'

async function run() {
  console.log('⚡ Starting database seed script...')
  const payload = await getPayload({ config: configPromise })

  console.log('🌱 Seeding Property Categories...')
  await seedPropertyCategories(payload)

  console.log('🌱 Seeding Property Types...')
  await seedPropertyTypes(payload)

  console.log('🌱 Seeding Features...')
  await seedFeatures(payload)

  console.log('🌱 Seeding Listing Statuses...')
  await seedListingStatuses(payload)

  console.log('🌱 Seeding Construction Statuses...')
  await seedConstructionStatuses(payload)

  console.log('✅ Seeding completed successfully!')
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Seeding failed with error:', err)
  process.exit(1)
})
