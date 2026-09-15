import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "social_media_facebook" varchar;
    ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "social_media_instagram" varchar;
    ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "social_media_youtube" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "company_settings" DROP COLUMN IF EXISTS "social_media_facebook";
    ALTER TABLE "company_settings" DROP COLUMN IF EXISTS "social_media_instagram";
    ALTER TABLE "company_settings" DROP COLUMN IF EXISTS "social_media_youtube";
  `);
}
