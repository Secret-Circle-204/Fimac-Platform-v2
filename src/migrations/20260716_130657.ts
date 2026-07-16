import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_seller_requests_custom_specifications_value_type" AS ENUM('text', 'number', 'date', 'boolean', 'url');
  CREATE TABLE "seller_requests_custom_specifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"icon" varchar,
  	"value_type" "enum_seller_requests_custom_specifications_value_type" DEFAULT 'text' NOT NULL,
  	"value" varchar NOT NULL
  );
  
  ALTER TABLE "seller_requests_custom_specifications" ADD CONSTRAINT "seller_requests_custom_specifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seller_requests"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "seller_requests_custom_specifications_order_idx" ON "seller_requests_custom_specifications" USING btree ("_order");
  CREATE INDEX "seller_requests_custom_specifications_parent_id_idx" ON "seller_requests_custom_specifications" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "seller_requests_custom_specifications" CASCADE;
  DROP TYPE "public"."enum_seller_requests_custom_specifications_value_type";`)
}
