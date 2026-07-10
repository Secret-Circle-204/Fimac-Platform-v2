import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "company_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"company_name" varchar DEFAULT 'Fimac' NOT NULL,
  	"company_logo_id" integer,
  	"partner_is_active" boolean DEFAULT false,
  	"partner_name" varchar,
  	"partner_website_url" varchar,
  	"partner_logo_id" integer,
  	"partner_badge_text" varchar DEFAULT 'تخيل منزلك مع',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_company_logo_id_media_id_fk" FOREIGN KEY ("company_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_partner_logo_id_media_id_fk" FOREIGN KEY ("partner_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "company_settings_company_logo_idx" ON "company_settings" USING btree ("company_logo_id");
  CREATE INDEX "company_settings_partner_partner_logo_idx" ON "company_settings" USING btree ("partner_logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "company_settings" CASCADE;`)
}
