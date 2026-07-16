import { postgresAdapter, sql } from '@payloadcms/db-postgres'

import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

import { DATABASE_URL, SERVER_URL, PAYLOAD_SECRET } from '@/env'
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
  secret: PAYLOAD_SECRET,
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
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  async onInit(payload) {
    // ⚡ Database Performance Tuning: Setup pg_trgm and GIN indexes for fast ILIKE/contains substring searches
    try {
      const db = payload.db.drizzle
      await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`)
      await db.execute(
        sql`CREATE INDEX IF NOT EXISTS properties_title_trgm_idx ON properties USING gin (title gin_trgm_ops)`,
      )
      await db.execute(
        sql`CREATE INDEX IF NOT EXISTS properties_city_trgm_idx ON properties USING gin (location_address_city gin_trgm_ops)`,
      )
      await db.execute(
        sql`CREATE INDEX IF NOT EXISTS properties_state_trgm_idx ON properties USING gin (location_address_state gin_trgm_ops)`,
      )
      await db.execute(
        sql`CREATE INDEX IF NOT EXISTS properties_zip_trgm_idx ON properties USING gin (location_address_zip gin_trgm_ops)`,
      )
      payload.logger.info('✅ Database search performance indexes initialized successfully!')
    } catch (err) {
      payload.logger.error(
        `❌ Failed to initialize pg_trgm search indexes: ${err instanceof Error ? err.message : 'Unknown'}`,
      )
    }

    await seedPropertyCategories(payload)
    await seedPropertyTypes(payload)
    await seedFeatures(payload)
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
