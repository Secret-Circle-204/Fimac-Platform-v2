import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "properties" ALTER COLUMN "listing_status" SET DATA TYPE text;
  DROP TYPE "public"."enum_properties_listing_status";
  CREATE TYPE "public"."enum_properties_listing_status" AS ENUM('forsale', 'pending', 'contract', 'contingent', 'sold', 'offmarket', 'draft');
  ALTER TABLE "properties" ALTER COLUMN "listing_status" SET DATA TYPE "public"."enum_properties_listing_status" USING "listing_status"::"public"."enum_properties_listing_status";
  ALTER TABLE "sellers" ALTER COLUMN "properties_count" SET DEFAULT 0;
  ALTER TABLE "verification_codes" ADD COLUMN "attempts" numeric DEFAULT 0;
  CREATE INDEX "property_views_ip_address_idx" ON "property_views" USING btree ("ip_address");
  CREATE INDEX "contact_messages_confirmation_token_idx" ON "contact_messages" USING btree ("confirmation_token");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "properties" ALTER COLUMN "listing_status" SET DATA TYPE text;
  DROP TYPE "public"."enum_properties_listing_status";
  CREATE TYPE "public"."enum_properties_listing_status" AS ENUM('forsale', 'pending', 'contract', 'contingent', 'sold', 'offmarket', 'notforsale');
  ALTER TABLE "properties" ALTER COLUMN "listing_status" SET DATA TYPE "public"."enum_properties_listing_status" USING "listing_status"::"public"."enum_properties_listing_status";
  DROP INDEX "property_views_ip_address_idx";
  DROP INDEX "contact_messages_confirmation_token_idx";
  ALTER TABLE "sellers" ALTER COLUMN "properties_count" DROP DEFAULT;
  ALTER TABLE "verification_codes" DROP COLUMN "attempts";`)
}
