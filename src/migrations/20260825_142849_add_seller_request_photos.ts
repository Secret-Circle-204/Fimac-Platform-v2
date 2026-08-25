import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TYPE "enum_seller_requests_status" ADD VALUE IF NOT EXISTS 'draft';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    ALTER TABLE "seller_requests" ADD COLUMN IF NOT EXISTS "idempotency_key" varchar;
    CREATE UNIQUE INDEX IF NOT EXISTS "seller_requests_idempotency_key_idx" ON "seller_requests" ("idempotency_key");

    CREATE TABLE IF NOT EXISTS "seller_requests_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "features_id" integer
    );

    ALTER TABLE "seller_requests_rels" ADD COLUMN IF NOT EXISTS "media_id" integer;

    CREATE INDEX IF NOT EXISTS "seller_requests_rels_order_idx" ON "seller_requests_rels" ("order");
    CREATE INDEX IF NOT EXISTS "seller_requests_rels_parent_idx" ON "seller_requests_rels" ("parent_id");
    CREATE INDEX IF NOT EXISTS "seller_requests_rels_path_idx" ON "seller_requests_rels" ("path");
    CREATE INDEX IF NOT EXISTS "seller_requests_rels_media_id_idx" ON "seller_requests_rels" ("media_id");

    DO $$ BEGIN
      ALTER TABLE "seller_requests_rels" ADD CONSTRAINT "seller_requests_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."seller_requests"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "seller_requests_rels" ADD CONSTRAINT "seller_requests_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "seller_requests_rels" DROP COLUMN IF EXISTS "media_id";
    DROP INDEX IF EXISTS "seller_requests_idempotency_key_idx";
    ALTER TABLE "seller_requests" DROP COLUMN IF EXISTS "idempotency_key";
  `);
}
