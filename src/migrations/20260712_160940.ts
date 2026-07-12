import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "properties" ADD COLUMN "has_project" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "project_image_id" integer;
  ALTER TABLE "properties" ADD COLUMN "project_description" jsonb;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_project_image_id_media_id_fk" FOREIGN KEY ("project_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "properties_project_image_idx" ON "properties" USING btree ("project_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "properties" DROP CONSTRAINT "properties_project_image_id_media_id_fk";
  
  DROP INDEX "properties_project_image_idx";
  ALTER TABLE "properties" DROP COLUMN "has_project";
  ALTER TABLE "properties" DROP COLUMN "project_image_id";
  ALTER TABLE "properties" DROP COLUMN "project_description";`)
}
