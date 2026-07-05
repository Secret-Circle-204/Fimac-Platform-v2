import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_properties_currency" AS ENUM('EGP', 'USD', 'EUR');
  ALTER TABLE "properties" ADD COLUMN "currency" "enum_properties_currency" DEFAULT 'EGP' NOT NULL;
  ALTER TABLE "properties" ADD COLUMN "base_price_in_u_s_d" numeric;
  CREATE INDEX "properties_currency_idx" ON "properties" USING btree ("currency");
  CREATE INDEX "properties_base_price_in_u_s_d_idx" ON "properties" USING btree ("base_price_in_u_s_d");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "properties_currency_idx";
  DROP INDEX "properties_base_price_in_u_s_d_idx";
  ALTER TABLE "properties" DROP COLUMN "currency";
  ALTER TABLE "properties" DROP COLUMN "base_price_in_u_s_d";
  DROP TYPE "public"."enum_properties_currency";`)
}
