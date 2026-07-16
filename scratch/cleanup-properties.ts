import 'dotenv/config'
import { getPayloadClient } from '../src/db/client'
import { sql } from '@payloadcms/db-postgres'

async function cleanup() {
  console.log('🧹 Connecting to Payload for raw database cleanup...')
  const payload = await getPayloadClient()
  console.log('✅ Connected!')

  try {
    const db = payload.db.drizzle
    console.log('🗑️ Running TRUNCATE TABLE properties CASCADE...')
    
    // Using raw SQL truncate with CASCADE to clean up properties and all referencing tables
    await db.execute(sql`TRUNCATE TABLE properties CASCADE;`)
    
    console.log('🎉 Truncate complete! Properties database tables cleaned successfully.')
  } catch (err) {
    console.error('❌ Failed to truncate properties:', err instanceof Error ? err.message : err)
  }

  process.exit(0)
}

cleanup().catch(console.error)
