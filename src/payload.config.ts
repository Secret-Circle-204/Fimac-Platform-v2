import { postgresAdapter } from '@payloadcms/db-postgres'

import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

import { DATABASE_URL, SERVER_URL } from '@/env'
import { collections } from './collections'
import { seedFeatures } from './db/seedFeatures'
import { seedPropertyCategories } from './db/seedPropertyCategories'
import { seedPropertyTypes } from './db/seedPropertyTypes'
import { seedListingStatuses } from './db/seedListingStatuses'
import { seedConstructionStatuses } from './db/seedConstructionStatuses'
import { activeProvider } from './lib/storage'
import { CompanySettings } from './globals/CompanySettings'
import { AboutPage } from './globals/AboutPage'

export default buildConfig({
  serverURL: SERVER_URL,
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeNavLinks: ['@/components/admin/Nav/CustomBeforeNav#CustomBeforeNav'],
    },
  },

  collections,
  globals: [CompanySettings, AboutPage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL,
      min: 0,
      max: 50,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 20000,
    },
    push: true,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  async onInit(payload) {
    await seedFeatures(payload)
    await seedPropertyCategories(payload)
    await seedPropertyTypes(payload)
    await seedListingStatuses(payload)
    await seedConstructionStatuses(payload)

    if (process.env.NODE_ENV === 'production' && process.env.STORAGE_PROVIDER === 'local') {
      payload.logger.warn(
        '⚠️ WARNING: Using local storage provider in production. Media uploads will not scale and will be lost on container recycling!',
      )
    }
  },
  plugins: [...(activeProvider.getPayloadPlugin() ? [activeProvider.getPayloadPlugin()!] : [])],
})
