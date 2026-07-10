import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_folders_order_idx";
  ALTER TABLE "media_folders" DROP COLUMN "order";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_folders" ADD COLUMN "order" numeric DEFAULT 0;
  CREATE INDEX "media_folders_order_idx" ON "media_folders" USING btree ("order");`)
}
