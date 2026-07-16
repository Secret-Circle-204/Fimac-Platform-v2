import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import { env } from 'process'
process.loadEnvFile(path.resolve(__dirname, '.env'))

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('./src/payload.config')
  
  const payload = await getPayload({ config })
  
  console.log('🧹 [Cleanup] Initializing database GeoIP cache purge...')
  
  // Find all IP locations resolved with local-db or unknown
  const result = await payload.delete({
    collection: 'ip-locations',
    where: {
      or: [
        { source: { equals: 'local-db' } },
        { source: { equals: 'unknown' } }
      ]
    }
  })

  console.log(`✅ [Cleanup] Purged stale cached IP locations.`)
  
  process.exit(0)
}
run().catch(console.error)
