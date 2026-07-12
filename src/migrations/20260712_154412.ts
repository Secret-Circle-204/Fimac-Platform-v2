import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "construction_statuses_name_ar_idx";
  ALTER TABLE "seller_requests" ADD COLUMN "seller_label" varchar;
  ALTER TABLE "construction_statuses" DROP COLUMN "name_ar";
  ALTER TABLE "construction_statuses" DROP COLUMN "icon";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "construction_statuses" ADD COLUMN "name_ar" varchar NOT NULL;
  ALTER TABLE "construction_statuses" ADD COLUMN "icon" varchar NOT NULL;
  CREATE UNIQUE INDEX "construction_statuses_name_ar_idx" ON "construction_statuses" USING btree ("name_ar");
  ALTER TABLE "seller_requests" DROP COLUMN "seller_label";`)
}
