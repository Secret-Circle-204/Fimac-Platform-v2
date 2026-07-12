import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1. Create the enum type and construction_statuses table
  await db.execute(sql`
    CREATE TYPE "public"."enum_construction_statuses_color_theme" AS ENUM('emerald', 'amber', 'blue', 'indigo', 'purple', 'gray');
    CREATE TABLE "construction_statuses" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "name_ar" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "icon" varchar NOT NULL,
      "color_theme" "enum_construction_statuses_color_theme" DEFAULT 'gray' NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX "construction_statuses_name_idx" ON "construction_statuses" USING btree ("name");
    CREATE UNIQUE INDEX "construction_statuses_name_ar_idx" ON "construction_statuses" USING btree ("name_ar");
    CREATE UNIQUE INDEX "construction_statuses_slug_idx" ON "construction_statuses" USING btree ("slug");
    CREATE INDEX "construction_statuses_updated_at_idx" ON "construction_statuses" USING btree ("updated_at");
    CREATE INDEX "construction_statuses_created_at_idx" ON "construction_statuses" USING btree ("created_at");
  `)

  // 2. Seed default values in construction_statuses table
  await db.execute(sql`
    INSERT INTO "construction_statuses" (name, name_ar, slug, icon, color_theme) VALUES
      ('Ready to Move In', 'جاهز للسكن', 'ready', '🔑', 'emerald'),
      ('Under Construction', 'تحت الإنشاء', 'under_construction', '🏗️', 'amber'),
      ('Brand New (First Occupancy)', 'أول سكن / أول مفتاح', 'brand_new', '✨', 'blue'),
      ('Off-Plan', 'على الخارطة', 'off_plan', '📋', 'indigo'),
      ('Fully Renovated', 'مجدد بالكامل', 'renovated', '🛠️', 'purple');
  `)

  // 3. Drop old index on properties
  await db.execute(sql`
    DROP INDEX IF EXISTS "properties_construction_status_idx";
  `)

  // 4. Add nullable column first
  await db.execute(sql`
    ALTER TABLE "properties" ADD COLUMN "construction_status_id" integer;
    ALTER TABLE "seller_requests" ADD COLUMN "construction_status_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "construction_statuses_id" integer;
  `)

  // 5. Update construction_status_id based on previous values
  await db.execute(sql`
    UPDATE "properties" SET "construction_status_id" = (
      SELECT id FROM "construction_statuses" WHERE slug = "properties"."construction_status"::text
    );
    UPDATE "seller_requests" SET "construction_status_id" = (
      SELECT id FROM "construction_statuses" WHERE slug = "seller_requests"."construction_status"::text
    );
  `)

  // 6. Set any remaining NULL values to the 'ready' default
  await db.execute(sql`
    UPDATE "properties" SET "construction_status_id" = (
      SELECT id FROM "construction_statuses" WHERE slug = 'ready'
    ) WHERE "construction_status_id" IS NULL;

    UPDATE "seller_requests" SET "construction_status_id" = (
      SELECT id FROM "construction_statuses" WHERE slug = 'ready'
    ) WHERE "construction_status_id" IS NULL;
  `)

  // 7. Make column NOT NULL
  await db.execute(sql`
    ALTER TABLE "properties" ALTER COLUMN "construction_status_id" SET NOT NULL;
    ALTER TABLE "seller_requests" ALTER COLUMN "construction_status_id" SET NOT NULL;
  `)

  // 8. Add foreign keys and indexes
  await db.execute(sql`
    ALTER TABLE "properties" ADD CONSTRAINT "properties_construction_status_id_construction_statuses_id_fk" FOREIGN KEY ("construction_status_id") REFERENCES "public"."construction_statuses"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "seller_requests" ADD CONSTRAINT "seller_requests_construction_status_id_construction_statuses_id_fk" FOREIGN KEY ("construction_status_id") REFERENCES "public"."construction_statuses"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_construction_statuses_fk" FOREIGN KEY ("construction_statuses_id") REFERENCES "public"."construction_statuses"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "seller_requests_construction_status_idx" ON "seller_requests" USING btree ("construction_status_id");
    CREATE INDEX "payload_locked_documents_rels_construction_statuses_id_idx" ON "payload_locked_documents_rels" USING btree ("construction_statuses_id");
    CREATE INDEX "properties_construction_status_idx" ON "properties" USING btree ("construction_status_id");
  `)

  // 9. Drop old columns and types
  await db.execute(sql`
    ALTER TABLE "properties" DROP COLUMN "construction_status";
    ALTER TABLE "seller_requests" DROP COLUMN "construction_status";
    DROP TYPE IF EXISTS "public"."enum_properties_construction_status";
    DROP TYPE IF EXISTS "public"."enum_seller_requests_construction_status";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // 1. Create old types
  await db.execute(sql`
    CREATE TYPE "public"."enum_properties_construction_status" AS ENUM('ready', 'under_construction', 'brand_new', 'off_plan', 'renovated');
    CREATE TYPE "public"."enum_seller_requests_construction_status" AS ENUM('ready', 'under_construction', 'brand_new', 'off_plan', 'renovated');
  `)

  // 2. Add old columns as nullable
  await db.execute(sql`
    ALTER TABLE "properties" ADD COLUMN "construction_status" "enum_properties_construction_status";
    ALTER TABLE "seller_requests" ADD COLUMN "construction_status" "enum_seller_requests_construction_status";
  `)

  // 3. Map back slugs to old enum columns
  await db.execute(sql`
    UPDATE "properties" SET "construction_status" = (
      SELECT slug::"enum_properties_construction_status" FROM "construction_statuses" WHERE id = "properties"."construction_status_id"
    );
    UPDATE "seller_requests" SET "construction_status" = (
      SELECT slug::"enum_seller_requests_construction_status" FROM "construction_statuses" WHERE id = "seller_requests"."construction_status_id"
    );
  `)

  // 4. Fill defaults for any null values
  await db.execute(sql`
    UPDATE "properties" SET "construction_status" = 'ready' WHERE "construction_status" IS NULL;
    UPDATE "seller_requests" SET "construction_status" = 'ready' WHERE "construction_status" IS NULL;
  `)

  // 5. Enforce NOT NULL on old columns
  await db.execute(sql`
    ALTER TABLE "properties" ALTER COLUMN "construction_status" SET NOT NULL;
    ALTER TABLE "seller_requests" ALTER COLUMN "construction_status" SET NOT NULL;
  `)

  // 6. Restore original index
  await db.execute(sql`
    CREATE INDEX "properties_construction_status_idx" ON "properties" USING btree ("construction_status");
  `)

  // 7. Cleanup new relationship columns, constraints, index and tables
  await db.execute(sql`
    ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_construction_status_id_construction_statuses_id_fk";
    ALTER TABLE "seller_requests" DROP CONSTRAINT IF EXISTS "seller_requests_construction_status_id_construction_statuses_id_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_construction_statuses_fk";
    DROP INDEX IF EXISTS "seller_requests_construction_status_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_construction_statuses_id_idx";
    DROP INDEX IF EXISTS "properties_construction_status_idx";
    ALTER TABLE "properties" DROP COLUMN IF EXISTS "construction_status_id";
    ALTER TABLE "seller_requests" DROP COLUMN IF EXISTS "construction_status_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "construction_statuses_id";
    DROP TABLE IF EXISTS "construction_statuses" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_construction_statuses_color_theme";
  `)
}
