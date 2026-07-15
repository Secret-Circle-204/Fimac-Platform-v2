import path from 'path'
import maxmind from 'maxmind'

async function main() {
  const dbPath = path.join(process.cwd(), 'data', 'dbip-city-lite.mmdb')
  console.log(`Loading database from: ${dbPath}`)
  
  const lookup = await maxmind.open(dbPath)
  
  // Test with Google DNS (US) and Egyptian IP (197.34.0.1)
  const testIps = ['8.8.8.8', '197.34.0.1']
  
  for (const ip of testIps) {
    const geo = lookup.get(ip)
    console.log(`\n=== IP: ${ip} ===`)
    console.log(JSON.stringify(geo, null, 2))
  }
}

main().catch(console.error)
