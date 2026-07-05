import { getPayload } from "payload"
import config from "../src/payload.config"

async function test() {
  try {
    console.log("Starting database check...")
    const payload = await getPayload({ config })
    const propertyId = "c1caaf5d4d91053a"

    console.log("1. Searching property-views for property:", propertyId)
    const allViews = await payload.find({
      collection: "property-views",
      where: {
        property: { equals: propertyId },
      },
    })
    
    console.log(`   - Total views records found in DB: ${allViews.totalDocs}`)
    console.log(`   - Sample record IDs:`, allViews.docs.map(d => d.id))

    console.log("\n2. Fetching Property document directly:")
    const property = await payload.findByID({
      collection: "properties",
      id: propertyId,
      depth: 0,
    })

    console.log(`   - Property ID: ${property.id}`)
    console.log(`   - Property Title: ${property.title}`)
    console.log(`   - Current 'views' value in DB: ${property.views}`)

  } catch (err) {
    console.error("❌ Check failed:", err)
  }
  process.exit(0)
}

test()
