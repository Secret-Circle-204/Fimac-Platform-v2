import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "company_settings" ALTER COLUMN "partner_badge_text" SET DEFAULT 'Imagine your home with';
  CREATE INDEX "properties_title_idx" ON "properties" USING btree ("title");
  CREATE INDEX "properties_location_address_location_address_city_idx" ON "properties" USING btree ("location_address_city");
  CREATE INDEX "properties_location_address_location_address_state_idx" ON "properties" USING btree ("location_address_state");
  CREATE INDEX "properties_location_address_location_address_zip_idx" ON "properties" USING btree ("location_address_zip");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "properties_title_idx";
  DROP INDEX "properties_location_address_location_address_city_idx";
  DROP INDEX "properties_location_address_location_address_state_idx";
  DROP INDEX "properties_location_address_location_address_zip_idx";
  ALTER TABLE "company_settings" ALTER COLUMN "partner_badge_text" SET DEFAULT 'تخيل منزلك مع';`)
}
