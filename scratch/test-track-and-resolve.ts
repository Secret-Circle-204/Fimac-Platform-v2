import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import path from 'path'
import maxmind from 'maxmind'

function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    EG: "Egypt",
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
  }
  return countries[code.toUpperCase()] || code
}

async function resolveIPLocation(ip: string): Promise<{ country: string; city: string; region: string; source: string } | null> {
  const cleanIp = ip.trim()
  const dbPath = path.join(process.cwd(), 'data', 'dbip-city-lite.mmdb')
  
  try {
    const reader = await maxmind.open(dbPath)
    const geo: any = reader.get(cleanIp)
    if (geo && (geo.country || geo.city || geo.subdivisions)) {
      const country = geo.country?.names?.en || geo.country?.iso_code || ""
      const city = geo.city?.names?.en || ""
      const region = geo.subdivisions?.[0]?.names?.en || ""
      
      return {
        country: getCountryName(country),
        city,
        region,
        source: "local-db",
      }
    }
  } catch (err) {
    console.error("❌ Failed to read from local DB-IP mmdb:", err)
  }
  return null
}

async function main() {
  const payload = await getPayload({ config: configPromise })
  
  const testIp = '197.34.0.1' // Egyptian IP (Giza)
  const hashedIp = 'test_hash_ip_giza_123'
  
  console.log(`\n1. Resolving IP location for ${testIp} using MMDB...`)
  const location = await resolveIPLocation(testIp)
  console.log(`Resolved Location:`, location)
  
  if (!location) {
    console.error(`❌ Could not resolve location.`)
    process.exit(1)
  }

  // Clear existing test cache if any
  console.log(`\n2. Cleaning up any previous cache for ${hashedIp}...`)
  await payload.delete({
    collection: 'ip-locations',
    where: {
      hashedIp: { equals: hashedIp }
    }
  })

  // Cache resolved location
  console.log(`\n3. Caching resolved location in payload (ip-locations)...`)
  const cacheEntry = await payload.create({
    collection: 'ip-locations',
    data: {
      hashedIp,
      country: location.country,
      city: location.city,
      region: location.region,
      source: location.source,
      lastUsed: new Date().toISOString(),
    }
  })
  console.log(`Cached Entry created:`, cacheEntry)

  // Verify caching lookup works
  console.log(`\n4. Verifying lookup from database cache...`)
  const cachedLoc = await payload.find({
    collection: "ip-locations",
    where: {
      hashedIp: { equals: hashedIp },
    },
    limit: 1,
    depth: 0,
  })

  if (cachedLoc.docs.length > 0) {
    console.log(`✅ Success! Database geolocation cache hit:`, cachedLoc.docs[0])
  } else {
    console.error(`❌ Failed! Could not retrieve entry from database cache.`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
