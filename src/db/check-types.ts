import { getPayloadClient } from './client'
import type { PropertyType } from '../payload-types'

async function check() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'property-types',
    limit: 100,
    depth: 1,
  })
  console.log("=== DB PROPERTY TYPES WITH IDS ===")
  result.docs.forEach((d: PropertyType) => {
    console.log(JSON.stringify({
      id: d.id,
      name: d.name,
      slug: d.slug,
      categorySlug: d.category && typeof d.category === 'object' ? d.category.slug : d.category,
      specificationProfile: d.specificationProfile,
    }))
  })
  console.log("=========================")
  process.exit(0)
}

check()
