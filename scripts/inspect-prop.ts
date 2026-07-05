import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'properties',
    where: {
      title: {
        contains: 'The View',
      },
    },
    depth: 1,
  })

  console.log('INSPECT_PROP_RESULT:')
  if (result.docs.length > 0) {
    console.log(JSON.stringify(result.docs[0], null, 2))
  } else {
    console.log('No properties found matching "The View"')
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
