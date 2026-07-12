import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })

  console.log('🔍 Fetching some media IDs...')
  const mediaResult = await payload.find({
    collection: 'media',
    limit: 5,
  })
  const mediaId = mediaResult.docs[0]?.id

  if (!mediaId) {
    console.error('❌ No media found in database to use as project image.')
    process.exit(1)
  }

  console.log('🔍 Fetching first 10 properties...')
  const propertiesResult = await payload.find({
    collection: 'properties',
    limit: 10,
  })

  const desc = {
    root: {
      type: 'root',
      direction: null as 'ltr' | 'rtl' | null,
      format: '' as 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          format: '' as 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'text',
              text: "This exclusive development features state-of-the-art building design, dedicated concierge, and smart home automation integrated throughout the property. Residents enjoy access to premium infinity pools, private clubhouses, and secure underground spaces.",
              format: 0,
              style: '',
              version: 1
            }
          ]
        }
      ]
    }
  }

  for (const property of propertiesResult.docs) {
    console.log(`✏️ Activating project details for property ID: ${property.id}...`)
    await payload.update({
      collection: 'properties',
      id: property.id,
      data: {
        hasProject: true,
        projectImage: Number(mediaId),
        projectDescription: desc,
      },
    })
  }

  console.log('✅ Finished activating project details for the first 10 properties!')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
