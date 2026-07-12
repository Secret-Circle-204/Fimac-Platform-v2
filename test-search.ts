import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import { env } from 'process'
process.loadEnvFile(path.resolve(__dirname, '.env'))

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('./src/payload.config')
  const { buildPropertySearchQuery } = await import('./src/repository/property/query-builder')
  
  const payload = await getPayload({ config })
  
  // 1. Test basic filter matching Sharm El Sheikh city
  const query1 = buildPropertySearchQuery({
    city: 'Sharm El Sheikh'
  })
  
  const results1 = await payload.find({
    collection: 'properties',
    where: query1,
    limit: 5,
    depth: 1,
    sort: '-createdAt'
  })

  console.log(`\n--- TEST 1: Basic City Filter ---`)
  console.log(`Found ${results1.totalDocs} properties in Sharm El Sheikh`)
  results1.docs.slice(0, 3).forEach((doc: any) => {
    console.log(`ID: ${doc.id}, Title: ${doc.title}, CreatedAt: ${doc.createdAt}`)
  })

  // 2. Test sorting (Ascending vs Descending)
  const resultsSortAsc = await payload.find({
    collection: 'properties',
    where: query1,
    limit: 3,
    depth: 0,
    sort: 'createdAt'
  })
  
  console.log(`\n--- TEST 2: Sorting verification (Ascending) ---`)
  resultsSortAsc.docs.forEach((doc: any) => {
    console.log(`ID: ${doc.id}, CreatedAt: ${doc.createdAt}`)
  })

  // 3. Test bedrooms and bathrooms filter
  const query3 = buildPropertySearchQuery({
    city: 'Sharm El Sheikh',
    bedrooms: 3
  })
  
  const results3 = await payload.find({
    collection: 'properties',
    where: query3,
    limit: 5,
    depth: 0
  })

  console.log(`\n--- TEST 3: Advanced Filter (City = Sharm, Bedrooms >= 3) ---`)
  console.log(`Found ${results3.totalDocs} properties matching criteria`)
  results3.docs.forEach((doc: any) => {
    console.log(`ID: ${doc.id}, Title: ${doc.title}, Bedrooms: ${doc.details?.bedrooms}, Bathrooms: ${doc.details?.bathrooms}`)
  })

  process.exit(0)
}
run().catch(console.error)
