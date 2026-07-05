import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })
  
  console.log('🔄 Deleting all property-views logs...')
  const viewsResult = await payload.find({
    collection: 'property-views',
    limit: 10000,
    depth: 0,
  })
  
  for (const doc of viewsResult.docs) {
    await payload.delete({
      collection: 'property-views',
      id: doc.id,
    })
  }
  console.log(`✅ Deleted ${viewsResult.docs.length} property-views logs.`)
  
  console.log('🔄 Fetching all properties to reset views...')
  const result = await payload.find({
    collection: 'properties',
    limit: 1000,
    depth: 0,
    select: { id: true, title: true, views: true },
  })

  console.log(`Found ${result.docs.length} properties.`)

  for (const doc of result.docs) {
    await payload.update({
      collection: 'properties',
      id: doc.id,
      data: {
        views: 0,
      },
    })
    console.log(`✅ Reset views to 0 for property: "${doc.title}" (ID: ${doc.id})`)
  }

  console.log('🎉 Reset complete! All database logs cleared and views set to 0.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
