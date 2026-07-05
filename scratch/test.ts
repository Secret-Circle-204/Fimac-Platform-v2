import "dotenv/config"
import { getPayload } from "payload"
import config from "../src/payload.config"

async function test() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "properties",
  })
  console.log("Total properties:", result.totalDocs)
  const forSale = result.docs.filter((d: any) => d.listingStatus === "forsale")
  console.log("For sale:", forSale.length)
  console.log("Status of first 3:", result.docs.slice(0, 3).map((d: any) => d.listingStatus))
}

test().catch(console.error)
