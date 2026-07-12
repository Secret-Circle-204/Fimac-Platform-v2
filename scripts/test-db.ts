import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })

  const propertiesCount = await payload.count({
    collection: 'properties',
  })
  console.log(`📊 Actual Properties Count: ${propertiesCount.totalDocs}`)

  const listingStatuses = await payload.find({
    collection: 'listing-statuses',
    limit: 100,
  })
  console.log('📋 Listing Statuses in DB:')
  listingStatuses.docs.forEach((doc) => {
    console.log(`  - ID: ${doc.id}, Name: ${doc.name}, Slug: ${doc.slug}`)
  })

  const constructionStatuses = await payload.find({
    collection: 'construction-statuses',
    limit: 100,
  })
  console.log('📋 Construction Statuses in DB:')
  constructionStatuses.docs.forEach((doc) => {
    console.log(`  - ID: ${doc.id}, Name: ${doc.name}, Slug: ${doc.slug}`)
  })

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
