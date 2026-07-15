import "dotenv/config"
import { getPayload } from "payload"
import config from "../src/payload.config"

async function run() {
  const payload = await getPayload({ config })
  const properties = await payload.find({
    collection: "properties",
    limit: 100,
    depth: 1,
  })

  console.log("TOTAL PROPERTIES:", properties.totalDocs)
  properties.docs.forEach((doc: any) => {
    console.log(`- ID: ${doc.id}`)
    console.log(`  Title: ${doc.title}`)
    console.log(`  Category: ${doc.category}`)
    console.log(`  Location: ${doc.location?.address?.city || "N/A"}`)
  })
  process.exit(0)
}

run().catch(console.error)
