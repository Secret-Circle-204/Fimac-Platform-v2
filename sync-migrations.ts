import { getPayload } from 'payload'
import config from './src/payload.config'

async function sync() {
  const payload = await getPayload({ config })
  const migrations = [
    '20260609_100132_init',
    '20260609_114128_add_currency_fields',
    '20260704_165904',
    '20260704_191146',
    '20260705_082010',
    '20260705_173608'
  ]
  for (const name of migrations) {
    try {
      await payload.create({
        collection: 'payload-migrations',
        data: {
          name,
          batch: 1
        }
      })
      console.log(`✅ Marked ${name} as completed.`)
    } catch (e) {
      console.log(`⏩ Skipped ${name} (already exists or error).`)
    }
  }
  process.exit(0)
}
sync()
