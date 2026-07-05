import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'


async function main() {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'property-views',
    depth: 1,
    limit: 10,
    sort: '-viewedAt'
  })

  console.log('INSPECT_VIEWS_RESULT:')
  console.log(JSON.stringify(result.docs, null, 2))
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
