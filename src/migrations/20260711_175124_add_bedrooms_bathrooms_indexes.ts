import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE INDEX "properties_details_details_bedrooms_idx" ON "properties" USING btree ("details_bedrooms");
  CREATE INDEX "properties_details_details_bathrooms_idx" ON "properties" USING btree ("details_bathrooms");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "properties_details_details_bedrooms_idx";
  DROP INDEX "properties_details_details_bathrooms_idx";`)
}
