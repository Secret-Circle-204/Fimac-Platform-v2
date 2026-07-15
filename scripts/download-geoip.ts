import fs from 'fs'
import path from 'path'
import https from 'https'
import zlib from 'zlib'

const DB_URL = 'https://cdn.jsdelivr.net/npm/dbip-city-lite/dbip-city-lite.mmdb.gz'
const OUTPUT_DIR = path.join(process.cwd(), 'data')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'dbip-city-lite.mmdb')

async function downloadGeoIP() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  console.log(`📡 Downloading DB-IP City Lite from: ${DB_URL}...`)

  return new Promise<void>((resolve, reject) => {
    https.get(DB_URL, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download database. Status Code: ${res.statusCode}`))
        return
      }

      const fileStream = fs.createWriteStream(OUTPUT_FILE)
      const gunzip = zlib.createGunzip()

      res.pipe(gunzip).pipe(fileStream)

      fileStream.on('finish', () => {
        fileStream.close()
        console.log(`✅ Successfully downloaded and extracted database to: ${OUTPUT_FILE}`)
        resolve()
      })

      fileStream.on('error', (err) => {
        fs.unlink(OUTPUT_FILE, () => {}) // delete partial file
        reject(err)
      })
    }).on('error', (err) => {
      reject(err)
    })
  })
}

downloadGeoIP().catch((err) => {
  console.error('❌ Failed to download GeoIP database:', err)
  process.exit(1)
})
