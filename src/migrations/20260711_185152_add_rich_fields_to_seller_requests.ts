import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_seller_requests_currency" AS ENUM('EGP', 'USD', 'EUR');
  CREATE TYPE "public"."enum_seller_requests_construction_status" AS ENUM('ready', 'under_construction', 'brand_new', 'off_plan', 'renovated');
  ALTER TABLE "seller_requests" ALTER COLUMN "asking_price" SET NOT NULL;
  ALTER TABLE "seller_requests" ADD COLUMN "city" varchar NOT NULL;
  ALTER TABLE "seller_requests" ADD COLUMN "state" varchar NOT NULL;
  ALTER TABLE "seller_requests" ADD COLUMN "country" varchar DEFAULT 'Egypt' NOT NULL;
  ALTER TABLE "seller_requests" ADD COLUMN "currency" "enum_seller_requests_currency" DEFAULT 'USD' NOT NULL;
  ALTER TABLE "seller_requests" ADD COLUMN "bedrooms" numeric;
  ALTER TABLE "seller_requests" ADD COLUMN "bathrooms" numeric;
  ALTER TABLE "seller_requests" ADD COLUMN "construction_status" "enum_seller_requests_construction_status" DEFAULT 'ready' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "seller_requests" ALTER COLUMN "asking_price" DROP NOT NULL;
  ALTER TABLE "seller_requests" DROP COLUMN "city";
  ALTER TABLE "seller_requests" DROP COLUMN "state";
  ALTER TABLE "seller_requests" DROP COLUMN "country";
  ALTER TABLE "seller_requests" DROP COLUMN "currency";
  ALTER TABLE "seller_requests" DROP COLUMN "bedrooms";
  ALTER TABLE "seller_requests" DROP COLUMN "bathrooms";
  ALTER TABLE "seller_requests" DROP COLUMN "construction_status";
  DROP TYPE "public"."enum_seller_requests_currency";
  DROP TYPE "public"."enum_seller_requests_construction_status";`)
}
