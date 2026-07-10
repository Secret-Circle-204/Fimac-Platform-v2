import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_investors_verification_status" RENAME TO "enum_buyers_verification_status";
  ALTER TABLE "investors_sessions" RENAME TO "buyers_sessions";
  ALTER TABLE "investors" RENAME TO "buyers";
  ALTER TABLE "property_views_rels" RENAME COLUMN "investors_id" TO "buyers_id";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "investors_id" TO "buyers_id";
  ALTER TABLE "payload_preferences_rels" RENAME COLUMN "investors_id" TO "buyers_id";
  ALTER TABLE "buyers_sessions" DROP CONSTRAINT "investors_sessions_parent_id_fk";
  
  ALTER TABLE "buyers" DROP CONSTRAINT "investors_proof_of_funds_id_media_id_fk";
  
  ALTER TABLE "property_views_rels" DROP CONSTRAINT "property_views_rels_investors_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_investors_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_investors_fk";
  
  ALTER TABLE "verification_codes" ALTER COLUMN "user_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_verification_codes_user_type";
  CREATE TYPE "public"."enum_verification_codes_user_type" AS ENUM('buyers', 'sellers');
  UPDATE "verification_codes" SET "user_type" = 'buyers' WHERE "user_type" = 'investors';
  ALTER TABLE "verification_codes" ALTER COLUMN "user_type" SET DATA TYPE "public"."enum_verification_codes_user_type" USING "user_type"::"public"."enum_verification_codes_user_type";
  ALTER TABLE "contact_messages" ALTER COLUMN "inquiry_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_contact_messages_inquiry_type";
  CREATE TYPE "public"."enum_contact_messages_inquiry_type" AS ENUM('buyer', 'property-owner', 'general', 'partnership', 'support', 'other');
  UPDATE "contact_messages" SET "inquiry_type" = 'buyer' WHERE "inquiry_type" = 'investor';
  ALTER TABLE "contact_messages" ALTER COLUMN "inquiry_type" SET DATA TYPE "public"."enum_contact_messages_inquiry_type" USING "inquiry_type"::"public"."enum_contact_messages_inquiry_type";
  DROP INDEX "investors_sessions_order_idx";
  DROP INDEX "investors_sessions_parent_id_idx";
  DROP INDEX "investors_google_id_idx";
  DROP INDEX "investors_proof_of_funds_idx";
  DROP INDEX "investors_updated_at_idx";
  DROP INDEX "investors_created_at_idx";
  DROP INDEX "investors_email_idx";
  DROP INDEX "property_views_rels_investors_id_idx";
  DROP INDEX "payload_locked_documents_rels_investors_id_idx";
  DROP INDEX "payload_preferences_rels_investors_id_idx";
  ALTER TABLE "buyers_sessions" ADD CONSTRAINT "buyers_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."buyers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "buyers" ADD CONSTRAINT "buyers_proof_of_funds_id_media_id_fk" FOREIGN KEY ("proof_of_funds_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "property_views_rels" ADD CONSTRAINT "property_views_rels_buyers_fk" FOREIGN KEY ("buyers_id") REFERENCES "public"."buyers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_buyers_fk" FOREIGN KEY ("buyers_id") REFERENCES "public"."buyers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_buyers_fk" FOREIGN KEY ("buyers_id") REFERENCES "public"."buyers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "buyers_sessions_order_idx" ON "buyers_sessions" USING btree ("_order");
  CREATE INDEX "buyers_sessions_parent_id_idx" ON "buyers_sessions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "buyers_google_id_idx" ON "buyers" USING btree ("google_id");
  CREATE INDEX "buyers_proof_of_funds_idx" ON "buyers" USING btree ("proof_of_funds_id");
  CREATE INDEX "buyers_updated_at_idx" ON "buyers" USING btree ("updated_at");
  CREATE INDEX "buyers_created_at_idx" ON "buyers" USING btree ("created_at");
  CREATE UNIQUE INDEX "buyers_email_idx" ON "buyers" USING btree ("email");
  CREATE INDEX "property_views_rels_buyers_id_idx" ON "property_views_rels" USING btree ("buyers_id");
  CREATE INDEX "payload_locked_documents_rels_buyers_id_idx" ON "payload_locked_documents_rels" USING btree ("buyers_id");
  CREATE INDEX "payload_preferences_rels_buyers_id_idx" ON "payload_preferences_rels" USING btree ("buyers_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_buyers_verification_status" RENAME TO "enum_investors_verification_status";
  ALTER TABLE "buyers_sessions" RENAME TO "investors_sessions";
  ALTER TABLE "buyers" RENAME TO "investors";
  ALTER TABLE "property_views_rels" RENAME COLUMN "buyers_id" TO "investors_id";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "buyers_id" TO "investors_id";
  ALTER TABLE "payload_preferences_rels" RENAME COLUMN "buyers_id" TO "investors_id";
  ALTER TABLE "investors_sessions" DROP CONSTRAINT "buyers_sessions_parent_id_fk";
  
  ALTER TABLE "investors" DROP CONSTRAINT "buyers_proof_of_funds_id_media_id_fk";
  
  ALTER TABLE "property_views_rels" DROP CONSTRAINT "property_views_rels_buyers_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_buyers_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_buyers_fk";
  
  ALTER TABLE "verification_codes" ALTER COLUMN "user_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_verification_codes_user_type";
  CREATE TYPE "public"."enum_verification_codes_user_type" AS ENUM('investors', 'sellers');
  UPDATE "verification_codes" SET "user_type" = 'investors' WHERE "user_type" = 'buyers';
  ALTER TABLE "verification_codes" ALTER COLUMN "user_type" SET DATA TYPE "public"."enum_verification_codes_user_type" USING "user_type"::"public"."enum_verification_codes_user_type";
  ALTER TABLE "contact_messages" ALTER COLUMN "inquiry_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_contact_messages_inquiry_type";
  CREATE TYPE "public"."enum_contact_messages_inquiry_type" AS ENUM('investor', 'property-owner', 'general', 'partnership', 'support', 'other');
  UPDATE "contact_messages" SET "inquiry_type" = 'investor' WHERE "inquiry_type" = 'buyer';
  ALTER TABLE "contact_messages" ALTER COLUMN "inquiry_type" SET DATA TYPE "public"."enum_contact_messages_inquiry_type" USING "inquiry_type"::"public"."enum_contact_messages_inquiry_type";
  DROP INDEX "buyers_sessions_order_idx";
  DROP INDEX "buyers_sessions_parent_id_idx";
  DROP INDEX "buyers_google_id_idx";
  DROP INDEX "buyers_proof_of_funds_idx";
  DROP INDEX "buyers_updated_at_idx";
  DROP INDEX "buyers_created_at_idx";
  DROP INDEX "buyers_email_idx";
  DROP INDEX "property_views_rels_buyers_id_idx";
  DROP INDEX "payload_locked_documents_rels_buyers_id_idx";
  DROP INDEX "payload_preferences_rels_buyers_id_idx";
  ALTER TABLE "investors_sessions" ADD CONSTRAINT "investors_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."investors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "investors" ADD CONSTRAINT "investors_proof_of_funds_id_media_id_fk" FOREIGN KEY ("proof_of_funds_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "property_views_rels" ADD CONSTRAINT "property_views_rels_investors_fk" FOREIGN KEY ("investors_id") REFERENCES "public"."investors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_investors_fk" FOREIGN KEY ("investors_id") REFERENCES "public"."investors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_investors_fk" FOREIGN KEY ("investors_id") REFERENCES "public"."investors"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "investors_sessions_order_idx" ON "investors_sessions" USING btree ("_order");
  CREATE INDEX "investors_sessions_parent_id_idx" ON "investors_sessions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "investors_google_id_idx" ON "investors" USING btree ("google_id");
  CREATE INDEX "investors_proof_of_funds_idx" ON "investors" USING btree ("proof_of_funds_id");
  CREATE INDEX "investors_updated_at_idx" ON "investors" USING btree ("updated_at");
  CREATE INDEX "investors_created_at_idx" ON "investors" USING btree ("created_at");
  CREATE UNIQUE INDEX "investors_email_idx" ON "investors" USING btree ("email");
  CREATE INDEX "property_views_rels_investors_id_idx" ON "property_views_rels" USING btree ("investors_id");
  CREATE INDEX "payload_locked_documents_rels_investors_id_idx" ON "payload_locked_documents_rels" USING btree ("investors_id");
  CREATE INDEX "payload_preferences_rels_investors_id_idx" ON "payload_preferences_rels" USING btree ("investors_id");`)
}
