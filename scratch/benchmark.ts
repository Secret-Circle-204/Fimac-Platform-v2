import dotenv from "dotenv"
dotenv.config({ path: ".env" })

async function run() {
  const { getPayloadClient } = await import("../src/db/client")
  const payload = await getPayloadClient()

  console.log("\n--- BENCHMARK: Properties ---")
  
  console.log("1. payload.find({ collection: 'properties', depth: 2 })")
  const t1 = performance.now()
  const res2 = await payload.find({ collection: 'properties', depth: 2 })
  console.log(`   Time: ${(performance.now() - t1).toFixed(2)}ms, Docs: ${res2.docs.length}`)

  console.log("2. payload.find({ collection: 'properties', depth: 1 })")
  const t1_1 = performance.now()
  const res1 = await payload.find({ collection: 'properties', depth: 1 })
  console.log(`   Time: ${(performance.now() - t1_1).toFixed(2)}ms, Docs: ${res1.docs.length}`)

  console.log("3. payload.find({ collection: 'properties', depth: 1, select: { ... } })")
  const t1_select = performance.now()
  const resSelect = await payload.find({
    collection: 'properties',
    depth: 1,
    select: {
      title: true,
      price: true,
      photos: true,
      location: true,
      details: true,
      propertyType: true,
      listingStatus: true,
      street: true,
    }
  })
  console.log(`   Time: ${(performance.now() - t1_select).toFixed(2)}ms, Docs: ${resSelect.docs.length}`)

  console.log("4. payload.find({ collection: 'properties', depth: 0 })")
  const t2 = performance.now()
  const res0 = await payload.find({ collection: 'properties', depth: 0 })
  console.log(`   Time: ${(performance.now() - t2).toFixed(2)}ms, Docs: ${res0.docs.length}`)

  console.log("\n--- BENCHMARK: Property Types ---")
  
  console.log("1. payload.find({ collection: 'property-types', depth: 2 })")
  const t3 = performance.now()
  await payload.find({ collection: 'property-types', depth: 2 })
  console.log(`   Time: ${(performance.now() - t3).toFixed(2)}ms`)

  console.log("2. payload.find({ collection: 'property-types', depth: 0 })")
  const t4 = performance.now()
  await payload.find({ collection: 'property-types', depth: 0 })
  console.log(`   Time: ${(performance.now() - t4).toFixed(2)}ms`)

  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
