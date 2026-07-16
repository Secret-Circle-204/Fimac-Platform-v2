import 'dotenv/config'
import { getPayloadClient } from '../src/db/client'

async function cleanup() {
  console.log('🧹 Connecting to Payload for cleanup...')
  const payload = await getPayloadClient()
  console.log('✅ Connected!')

  const duplicates = [
    'infinity-edge-pool',
    '247-gated-community-security',
    '24-7-gated-community-security',
    'high-speed-fiber-wifi',
    'central-air-conditioning',
    'extensive-landscaped-garden',
    'underground-parking-garage',
  ]

  for (const slug of duplicates) {
    const found = await payload.find({
      collection: 'features',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    if (found.docs.length > 0) {
      console.log(`🗑️ Deleting duplicate feature: ${found.docs[0].name}`)
      await payload.delete({
        collection: 'features',
        id: found.docs[0].id,
      })
    }
  }

  console.log('🎉 Cleanup complete!')
  process.exit(0)
}

cleanup().catch(console.error)
