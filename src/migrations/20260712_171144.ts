import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "features" DROP COLUMN "category";
  DROP TYPE "public"."enum_features_category";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_features_category" AS ENUM('interior', 'exterior', 'community', 'other');
  ALTER TABLE "features" ADD COLUMN "category" "enum_features_category" NOT NULL;`)
}
