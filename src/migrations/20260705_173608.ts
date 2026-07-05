import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_media_health_status" AS ENUM('ready', 'missing', 'broken', 'migrating', 'deleted');
  ALTER TABLE "media" ADD COLUMN "health_status" "enum_media_health_status" DEFAULT 'ready';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DROP COLUMN "health_status";
  DROP TYPE "public"."enum_media_health_status";`)
}
