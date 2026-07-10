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
import { seedPropertyTypes } from './db/seedPropertyTypes'
import { activeProvider } from './lib/storage'
import { CompanySettings } from './globals/CompanySettings'

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
  globals: [CompanySettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL,
      min: 0,
      max: 10,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 20000,
    },
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  async onInit(payload) {
    await seedFeatures(payload)
    await seedPropertyTypes(payload)
  },
  plugins: [...(activeProvider.getPayloadPlugin() ? [activeProvider.getPayloadPlugin()!] : [])],
})
