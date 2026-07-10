import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_media_folders_color" AS ENUM('default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink');
  ALTER TABLE "media_folders" ADD COLUMN "sort_order" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "media_folders" ADD COLUMN "color" "enum_media_folders_color" DEFAULT 'default';
  CREATE INDEX "media_folders_sort_order_idx" ON "media_folders" USING btree ("sort_order");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_folders_sort_order_idx";
  ALTER TABLE "media_folders" DROP COLUMN "sort_order";
  ALTER TABLE "media_folders" DROP COLUMN "color";
  DROP TYPE "public"."enum_media_folders_color";`)
}
