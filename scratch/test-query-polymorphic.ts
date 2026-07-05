import "dotenv/config"
import { getPayload } from "payload"
import config from "../src/payload.config"

async function test() {
  const payload = await getPayload({ config })
  
  // 1. Fetch any property view with depth 0 to see raw values
  const views = await payload.find({
    collection: "property-views",
    depth: 0,
    limit: 5,
  })
  
  console.log("Total property views found:", views.totalDocs)
  if (views.docs.length > 0) {
    console.log("First view (depth 0):", JSON.stringify(views.docs[0], null, 2))
    
    const userField = views.docs[0].user
    if (userField && typeof userField === "object") {
      const relationTo = (userField as any).relationTo
      const userId = (userField as any).value
      console.log(`\nTesting query with numeric ID: ${userId} (${typeof userId}) for collection: ${relationTo}`)
      
      const tests = [
        {
          name: "user: { equals: userId }",
          where: { user: { equals: userId } }
        },
        {
          name: "user.value: { equals: userId }",
          where: { "user.value": { equals: userId } }
        },
        {
          name: "user: userId",
          where: { user: userId }
        },
        {
          name: "user: relationTo + | + userId (value)",
          where: { user: { equals: `${relationTo}|${userId}` } }
        },
        {
          name: "user.value + user.relationTo combined",
          where: {
            and: [
              { "user.value": { equals: userId } },
              { "user.relationTo": { equals: relationTo } }
            ]
          }
        }
      ]

      for (const t of tests) {
        try {
          console.log(`\n--- Running test: ${t.name} ---`)
          console.log("Where clause:", JSON.stringify(t.where, null, 2))
          const res = await payload.find({
            collection: "property-views",
            where: t.where,
            limit: 5,
            depth: 0
          })
          console.log(`Success! Found ${res.totalDocs} documents.`)
        } catch (err: any) {
          console.error(`Failed:`, err.message || err)
        }
      }
    }
  } else {
    console.log("No property views found to test query on.")
  }
}

test().catch(console.error)
