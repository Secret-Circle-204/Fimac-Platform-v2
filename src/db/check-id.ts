import { getPayloadClient } from './client'

async function check() {
  const payload = await getPayloadClient()
  const doc = await payload.findByID({
    collection: 'property-types',
    id: 29,
    depth: 1,
  })
  console.log("=== HOTEL DOC ===")
  console.log(JSON.stringify(doc, null, 2))
  console.log("=================")
  process.exit(0)
}

check()
