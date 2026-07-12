import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Enable pg_trgm extension for fast ILIKE text search
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    
    -- Create GIN indexes on text fields used in search
    CREATE INDEX IF NOT EXISTS properties_title_trgm_idx ON properties USING gin (title gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS properties_city_trgm_idx ON properties USING gin (location_address_city gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS properties_state_trgm_idx ON properties USING gin (location_address_state gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS properties_zip_trgm_idx ON properties USING gin (location_address_zip gin_trgm_ops);
    
    CREATE INDEX IF NOT EXISTS locations_city_trgm_idx ON locations USING gin (city gin_trgm_ops);
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS properties_title_trgm_idx;
    DROP INDEX IF EXISTS properties_city_trgm_idx;
    DROP INDEX IF EXISTS properties_state_trgm_idx;
    DROP INDEX IF EXISTS properties_zip_trgm_idx;
    
    DROP INDEX IF EXISTS locations_city_trgm_idx;
    
    DROP EXTENSION IF EXISTS pg_trgm;
  `)
}
