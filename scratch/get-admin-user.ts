import "dotenv/config"
import { getPayload } from "payload"
import config from "../src/payload.config"

async function test() {
  const payload = await getPayload({ config })
  const users = await payload.find({
    collection: "users",
    where: {
      email: {
        equals: "admin@fimac.me"
      }
    }
  })
  console.log("Admin user:", JSON.stringify(users.docs[0], null, 2))
}

test().catch(console.error)
