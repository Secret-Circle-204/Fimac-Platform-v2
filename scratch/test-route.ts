import "dotenv/config"
import { getPayloadClient } from "../src/db/client"

async function test() {
  try {
    const user = {
      id: "6",
      email: "hamzamode202@gmail.com",
      full_name: "HAssssss",
      phone: "+201063134412",
      verification_status: "verified",
      role: "investor" as const,
      collection: "investors" as const
    }

    const payload = await getPayloadClient()

    console.log("Querying property-views...")
    const views = await payload.find({
      collection: "property-views",
      where: {
        and: [
          {
            "user.value": {
              equals: Number(user.id),
            },
          },
          {
            "user.relationTo": {
              equals: "investors",
            },
          },
        ],
      },
      sort: "-viewedAt",
      limit: 50,
      depth: 2,
    })

    console.log("Success! Total views docs:", views.totalDocs)
    console.log("Querying recommendations...")
    // Let's also test recommendations query
    const recViews = await payload.find({
      collection: "property-views",
      where: {
        and: [
          {
            "user.value": {
              equals: Number(user.id),
            },
          },
          {
            "user.relationTo": {
              equals: "investors",
            },
          },
        ],
      },
      limit: 100,
      depth: 2,
    })
    console.log("Success! Total recViews docs:", recViews.totalDocs)

  } catch (err: any) {
    console.error("Query failed:", err.message || err, err.stack)
  }
}

test().catch(console.error)
