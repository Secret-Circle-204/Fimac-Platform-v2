import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import { env } from 'process'
process.loadEnvFile(path.resolve(__dirname, '../.env'))

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../src/payload.config')
  
  const payload = await getPayload({ config })
  
  // Find the last modified property in the database
  const properties = await payload.find({
    collection: 'properties',
    sort: '-updatedAt',
    limit: 1,
    depth: 1
  })

  if (properties.docs.length === 0) {
    console.log('No properties found.')
    process.exit(0)
  }

  const prop = properties.docs[0] as any
  console.log('=== PROPERTY DETAIL IN DATABASE ===')
  console.log('ID:', prop.id)
  console.log('Title:', prop.title)
  console.log('Category:', prop.category)
  console.log('Property Type Slug (from field):', prop.propertyTypeSlug)
  console.log('Property Type Populated Object:', prop.propertyType)
  console.log('Hospitality Object:', JSON.stringify(prop.hospitality, null, 2))
  
  process.exit(0)
}
run().catch(console.error)
