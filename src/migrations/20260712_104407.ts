import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "seller_requests" ADD COLUMN "published_property_id" varchar;
  ALTER TABLE "seller_requests" ADD CONSTRAINT "seller_requests_published_property_id_properties_id_fk" FOREIGN KEY ("published_property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "seller_requests_published_property_idx" ON "seller_requests" USING btree ("published_property_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "seller_requests" DROP CONSTRAINT "seller_requests_published_property_id_properties_id_fk";
  
  DROP INDEX "seller_requests_published_property_idx";
  ALTER TABLE "seller_requests" DROP COLUMN "published_property_id";`)
}
