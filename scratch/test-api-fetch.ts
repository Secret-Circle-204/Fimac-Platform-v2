import "dotenv/config"
import { getPayload } from "payload"
import config from "../src/payload.config"
import { SignJWT } from "jose"

async function test() {
  const payload = await getPayload({ config })
  
  // Sign a JWT token for investor 6 (hamzamode202@gmail.com)
  const encoder = new TextEncoder()
  const secret = encoder.encode(payload.secret)
  
  const token = await new SignJWT({ id: 6 })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret)
    
  console.log("Generated token:", token)
  
  // Send request to locally running server
  try {
    const url = "http://localhost:8181/api/investor/recently-viewed"
    console.log(`Sending GET request to ${url} with auth cookie...`)
    
    const response = await fetch(url, {
      headers: {
        Cookie: `payload-token-investors=${token}`
      }
    })
    
    console.log("Status:", response.status)
    const data = await response.json()
    console.log("Response:", JSON.stringify(data, null, 2))
  } catch (err: any) {
    console.error("Fetch request failed:", err.message || err)
  }
}

test().catch(console.error)
