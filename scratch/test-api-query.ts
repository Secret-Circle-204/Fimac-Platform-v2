import "dotenv/config"
import { getPayload } from "payload"
import config from "../src/payload.config"

async function test() {
  const payload = await getPayload({ config })
  
  const userId = 6; // Hamiltonian investor ID
  const relationTo = "investors";
  
  // Test case 1: Query with user.value and user.relationTo, depth: 2, overrideAccess: false (simulating no admin user on payload client)
  try {
    console.log("Test 1: Querying with user.value and user.relationTo, depth: 2, overrideAccess: false")
    const res1 = await payload.find({
      collection: "property-views",
      where: {
        and: [
          {
            "user.value": {
              equals: userId,
            },
          },
          {
            "user.relationTo": {
              equals: relationTo,
            },
          },
        ],
      },
      sort: "-viewedAt",
      limit: 50,
      depth: 2,
    })
    console.log("Test 1 Success! Total docs:", res1.totalDocs)
  } catch (err: any) {
    console.error("Test 1 Failed:", err.message || err, err.stack)
  }

  // Test case 2: Same query but with overrideAccess: true
  try {
    console.log("\nTest 2: Same query but with overrideAccess: true")
    const res2 = await payload.find({
      collection: "property-views",
      where: {
        and: [
          {
            "user.value": {
              equals: userId,
            },
          },
          {
            "user.relationTo": {
              equals: relationTo,
            },
          },
        ],
      },
      sort: "-viewedAt",
      limit: 50,
      depth: 2,
      overrideAccess: true,
    })
    console.log("Test 2 Success! Total docs:", res2.totalDocs)
  } catch (err: any) {
    console.error("Test 2 Failed:", err.message || err)
  }

  // Test case 3: Try simple user equals with overrideAccess: true and depth: 2
  try {
    console.log("\nTest 3: Query with user: userId, depth: 2, overrideAccess: true")
    const res3 = await payload.find({
      collection: "property-views",
      where: {
        user: {
          equals: userId,
        },
      },
      sort: "-viewedAt",
      limit: 50,
      depth: 2,
      overrideAccess: true,
    })
    console.log("Test 3 Success! Total docs:", res3.totalDocs)
  } catch (err: any) {
    console.error("Test 3 Failed:", err.message || err)
  }

  // Test case 4: Query with user: userId, depth: 2, overrideAccess: false
  try {
    console.log("\nTest 4: Query with user: userId, depth: 2, overrideAccess: false")
    const res4 = await payload.find({
      collection: "property-views",
      where: {
        user: {
          equals: userId,
        },
      },
      sort: "-viewedAt",
      limit: 50,
      depth: 2,
    })
    console.log("Test 4 Success! Total docs:", res4.totalDocs)
  } catch (err: any) {
    console.error("Test 4 Failed:", err.message || err)
  }
}

test().catch(console.error)
