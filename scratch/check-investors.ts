import "dotenv/config"
import { getPayload } from "payload"
import config from "../src/payload.config"

async function test() {
  const payload = await getPayload({ config })
  const investors = await payload.find({
    collection: "investors",
    limit: 5,
  })
  console.log("Total investors:", investors.totalDocs)
  investors.docs.forEach((inv: any) => {
    console.log(`Investor ID: ${inv.id} (type: ${typeof inv.id}), Name: ${inv.full_name}, Email: ${inv.email}`)
  })

  const views = await payload.find({
    collection: "property-views",
    limit: 5,
    depth: 0
  })
  console.log("Total property views:", views.totalDocs)
  views.docs.forEach((view: any) => {
    console.log(`Property View ID: ${view.id} (type: ${typeof view.id}), User in View:`, JSON.stringify(view.user))
  })
}

test().catch(console.error)
