import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_listing_statuses_color_theme" AS ENUM('emerald', 'blue', 'gray', 'amber', 'rose', 'gold');
  CREATE TABLE "listing_statuses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"color_theme" "enum_listing_statuses_color_theme" DEFAULT 'gray' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  -- Seed initial listing status entries
  INSERT INTO "listing_statuses" ("name", "slug", "color_theme") VALUES 
    ('Open Contract', 'forsale', 'emerald'),
    ('Closed Contract', 'sold', 'blue'),
    ('Draft', 'draft', 'gray');
  
  DROP INDEX "properties_listing_status_idx";
  ALTER TABLE "properties" ADD COLUMN "listing_status_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "listing_statuses_id" integer;

  -- Populate listing_status_id based on old listing_status column values
  UPDATE "properties" SET "listing_status_id" = (SELECT "id" FROM "listing_statuses" WHERE "slug" = 'forsale') WHERE "listing_status" = 'forsale';
  UPDATE "properties" SET "listing_status_id" = (SELECT "id" FROM "listing_statuses" WHERE "slug" = 'sold') WHERE "listing_status" = 'sold';
  UPDATE "properties" SET "listing_status_id" = (SELECT "id" FROM "listing_statuses" WHERE "slug" = 'forsale') WHERE "listing_status" IN ('pending', 'contract', 'contingent');
  UPDATE "properties" SET "listing_status_id" = (SELECT "id" FROM "listing_statuses" WHERE "slug" = 'draft') WHERE "listing_status_id" IS NULL;

  -- Now enforce NOT NULL constraint on properties.listing_status_id
  ALTER TABLE "properties" ALTER COLUMN "listing_status_id" SET NOT NULL;

  CREATE UNIQUE INDEX "listing_statuses_name_idx" ON "listing_statuses" USING btree ("name");
  CREATE UNIQUE INDEX "listing_statuses_slug_idx" ON "listing_statuses" USING btree ("slug");
  CREATE INDEX "listing_statuses_updated_at_idx" ON "listing_statuses" USING btree ("updated_at");
  CREATE INDEX "listing_statuses_created_at_idx" ON "listing_statuses" USING btree ("created_at");
  ALTER TABLE "properties" ADD CONSTRAINT "properties_listing_status_id_listing_statuses_id_fk" FOREIGN KEY ("listing_status_id") REFERENCES "public"."listing_statuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_listing_statuses_fk" FOREIGN KEY ("listing_statuses_id") REFERENCES "public"."listing_statuses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "properties_views_idx" ON "properties" USING btree ("views");
  CREATE INDEX "payload_locked_documents_rels_listing_statuses_id_idx" ON "payload_locked_documents_rels" USING btree ("listing_statuses_id");
  CREATE INDEX "properties_listing_status_idx" ON "properties" USING btree ("listing_status_id");
  ALTER TABLE "properties" DROP COLUMN "listing_status";
  DROP TYPE "public"."enum_properties_listing_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_properties_listing_status" AS ENUM('forsale', 'pending', 'contract', 'contingent', 'sold', 'offmarket', 'draft');
  ALTER TABLE "properties" ADD COLUMN "listing_status" "enum_properties_listing_status";

  -- Map new status slugs back to enum values
  UPDATE "properties" SET "listing_status" = (SELECT "slug"::"enum_properties_listing_status" FROM "listing_statuses" WHERE "id" = "properties"."listing_status_id");
  UPDATE "properties" SET "listing_status" = 'draft' WHERE "listing_status" IS NULL;

  ALTER TABLE "properties" ALTER COLUMN "listing_status" SET NOT NULL;

  ALTER TABLE "listing_statuses" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "listing_statuses" CASCADE;
  ALTER TABLE "properties" DROP CONSTRAINT "properties_listing_status_id_listing_statuses_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_listing_statuses_fk";
  
  DROP INDEX "properties_views_idx";
  DROP INDEX "payload_locked_documents_rels_listing_statuses_id_idx";
  DROP INDEX "properties_listing_status_idx";
  CREATE INDEX "properties_listing_status_idx" ON "properties" USING btree ("listing_status");
  ALTER TABLE "properties" DROP COLUMN "listing_status_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "listing_statuses_id";
  DROP TYPE "public"."enum_listing_statuses_color_theme";`)
}
