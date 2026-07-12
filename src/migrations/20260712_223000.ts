import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_properties_custom_specifications_value_type" AS ENUM('text', 'number', 'date', 'boolean', 'url');
  CREATE TABLE "properties_custom_specifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"icon" varchar,
  	"value_type" "enum_properties_custom_specifications_value_type" DEFAULT 'text' NOT NULL,
  	"value" varchar NOT NULL
  );
  
  DROP TABLE "properties_custom_attributes" CASCADE;
  ALTER TABLE "properties_custom_specifications" ADD CONSTRAINT "properties_custom_specifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "properties_custom_specifications_order_idx" ON "properties_custom_specifications" USING btree ("_order");
  CREATE INDEX "properties_custom_specifications_parent_id_idx" ON "properties_custom_specifications" USING btree ("_parent_id");
  DROP TYPE "public"."enum_properties_custom_attributes_value_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_properties_custom_attributes_value_type" AS ENUM('text', 'number', 'date', 'boolean', 'url');
  CREATE TABLE "properties_custom_attributes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value_type" "enum_properties_custom_attributes_value_type" DEFAULT 'text' NOT NULL,
  	"value" varchar NOT NULL
  );
  
  DROP TABLE "properties_custom_specifications" CASCADE;
  ALTER TABLE "properties_custom_attributes" ADD CONSTRAINT "properties_custom_attributes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "properties_custom_attributes_order_idx" ON "properties_custom_attributes" USING btree ("_order");
  CREATE INDEX "properties_custom_attributes_parent_id_idx" ON "properties_custom_attributes" USING btree ("_parent_id");
  DROP TYPE "public"."enum_properties_custom_specifications_value_type";`)
}
