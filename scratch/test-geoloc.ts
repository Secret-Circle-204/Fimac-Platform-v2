import 'dotenv/config'

async function testIpLookup(ip: string) {
  console.log(`=== Testing IP Lookup for: ${ip} ===\n`)

  // 1. ipinfo.io
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    console.log(`📡 Querying ipinfo.io...`)
    const response = await fetch(`https://ipinfo.io/${ip}/json`, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    console.log(`Response Status: ${response.status} ${response.statusText}`)
    const text = await response.text()
    console.log(`Content:`, text.substring(0, 500))
  } catch (err: any) {
    console.error(`❌ ipinfo.io failed:`, err.message)
  }

  console.log('\n----------------------------------------\n')

  // 2. freeipapi.com
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    console.log(`📡 Querying free.freeipapi.com...`)
    const response = await fetch(`https://free.freeipapi.com/api/json/${ip}`, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    console.log(`Response Status: ${response.status} ${response.statusText}`)
    const text = await response.text()
    console.log(`Content:`, text.substring(0, 500))
  } catch (err: any) {
    console.error(`❌ free.freeipapi.com failed:`, err.message)
  }

  console.log('\n----------------------------------------\n')

  // 2b. Alternative freeipapi endpoint
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    console.log(`📡 Querying freeipapi.com/api/json/ (no sub)...`)
    const response = await fetch(`https://freeipapi.com/api/json/${ip}`, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    console.log(`Response Status: ${response.status} ${response.statusText}`)
    const text = await response.text()
    console.log(`Content:`, text.substring(0, 500))
  } catch (err: any) {
    console.error(`❌ freeipapi.com (no sub) failed:`, err.message)
  }

  console.log('\n----------------------------------------\n')

  // 3. ip-api.com
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    console.log(`📡 Querying ip-api.com...`)
    const response = await fetch(`http://ip-api.com/json/${ip}`, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    console.log(`Response Status: ${response.status} ${response.statusText}`)
    const text = await response.text()
    console.log(`Content:`, text.substring(0, 500))
  } catch (err: any) {
    console.error(`❌ ip-api.com failed:`, err.message)
  }
}

async function main() {
  // Test with a public IP (e.g. Google DNS 8.8.8.8 or an Egypt public IP)
  await testIpLookup('8.8.8.8')
  console.log('\n========================================\n')
  await testIpLookup('197.34.0.1') // Sample Egypt IP
}

main().catch(console.error)
