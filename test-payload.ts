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
  
  const media = await payload.find({
    collection: 'media',
    sort: '-createdAt',
    limit: 20,
    depth: 0
  })

  console.log('--- LAST 20 UPLOADED MEDIA FILENAMES ---')
  media.docs.forEach((doc: any) => {
    console.log(`ID: ${doc.id}, Filename: ${doc.filename}, Original: ${doc.originalFilename}`)
  })
  
  process.exit(0)
}
run().catch(console.error)
