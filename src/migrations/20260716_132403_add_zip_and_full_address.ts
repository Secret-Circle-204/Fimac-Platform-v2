import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "seller_requests" ADD COLUMN "zip" varchar;
  ALTER TABLE "seller_requests" ADD COLUMN "full_address" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "seller_requests" DROP COLUMN "zip";
  ALTER TABLE "seller_requests" DROP COLUMN "full_address";`)
}
