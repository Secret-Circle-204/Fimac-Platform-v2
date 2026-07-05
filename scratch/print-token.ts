import "dotenv/config"
import { getPayload } from "payload"
import config from "../src/payload.config"
import { SignJWT } from "jose"

async function test() {
  const payload = await getPayload({ config })
  const encoder = new TextEncoder()
  const secret = encoder.encode(payload.secret)
  
  const token = await new SignJWT({
    id: 1,
    email: "admin@fimac.me",
    collection: "users"
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret)
    
  console.log("ADMIN_TOKEN:", token)
}

test().catch(console.error)
