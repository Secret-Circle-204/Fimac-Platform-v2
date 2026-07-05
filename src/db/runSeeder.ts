import 'dotenv/config'
import { getPayloadClient } from './client'

async function run() {
  console.log('🚀 Initializing Payload to trigger auto-seeding...')
  try {
    const payload = await getPayloadClient()
    console.log('✅ Payload initialized successfully!')
    
    // Double check count
    const typesCount = await payload.count({
      collection: 'property-types',
    })
    console.log(`📊 Total Property Types in DB: ${typesCount.totalDocs}`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during bootstrap:', error)
    process.exit(1)
  }
}

run()
