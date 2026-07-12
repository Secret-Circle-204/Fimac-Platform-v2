import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "seller_requests" ADD COLUMN "latitude" numeric;
  ALTER TABLE "seller_requests" ADD COLUMN "longitude" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "seller_requests" DROP COLUMN "latitude";
  ALTER TABLE "seller_requests" DROP COLUMN "longitude";`)
}
