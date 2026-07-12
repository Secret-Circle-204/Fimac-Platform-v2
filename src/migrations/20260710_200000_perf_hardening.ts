import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "properties_location_address_country_idx" ON "properties" USING btree ("location_address_country");
    CREATE INDEX IF NOT EXISTS "property_views_dedup_idx" ON "property_views" USING btree ("property_id", "visitor_id", "viewed_at" DESC);
    CREATE INDEX IF NOT EXISTS "locations_city_idx" ON "locations" USING btree ("city");
    CREATE INDEX IF NOT EXISTS "locations_state_name_idx" ON "locations" USING btree ("state_name");
    CREATE INDEX IF NOT EXISTS "locations_state_abbr_idx" ON "locations" USING btree ("state_abbr");
    CREATE INDEX IF NOT EXISTS "locations_county_idx" ON "locations" USING btree ("county");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "properties_location_address_country_idx";
    DROP INDEX IF EXISTS "property_views_dedup_idx";
    DROP INDEX IF EXISTS "locations_city_idx";
    DROP INDEX IF EXISTS "locations_state_name_idx";
    DROP INDEX IF EXISTS "locations_state_abbr_idx";
    DROP INDEX IF EXISTS "locations_county_idx";
  `)
}
