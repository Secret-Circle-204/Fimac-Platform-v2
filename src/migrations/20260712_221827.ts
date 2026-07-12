import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_properties_hospitality_star_rating" AS ENUM('1', '2', '3', '4', '5');
  DROP INDEX "properties_hospitality_hotel_hospitality_hotel_star_rati_idx";
  ALTER TABLE "properties" ADD COLUMN "hospitality_floors" numeric DEFAULT 1;
  ALTER TABLE "properties" ADD COLUMN "hospitality_star_rating" "enum_properties_hospitality_star_rating";
  ALTER TABLE "properties" ADD COLUMN "hospitality_brand" varchar;
  ALTER TABLE "properties" ADD COLUMN "hospitality_last_renovation_year" numeric;
  ALTER TABLE "properties" ADD COLUMN "hospitality_motel_parking_spaces" numeric DEFAULT 0;
  ALTER TABLE "properties" ADD COLUMN "hospitality_motel_drive_up_rooms" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_resort_suites" numeric DEFAULT 0;
  CREATE INDEX "properties_hospitality_hospitality_star_rating_idx" ON "properties" USING btree ("hospitality_star_rating");
  ALTER TABLE "properties" DROP COLUMN "hospitality_hotel_star_rating";
  ALTER TABLE "properties" DROP COLUMN "hospitality_hotel_has_spa";
  ALTER TABLE "properties" DROP COLUMN "hospitality_hotel_has_gym";
  ALTER TABLE "properties" DROP COLUMN "hospitality_hotel_operator";
  ALTER TABLE "properties" DROP COLUMN "hospitality_motel_has_parking";
  ALTER TABLE "properties" DROP COLUMN "hospitality_motel_has_breakfast";
  ALTER TABLE "properties" DROP COLUMN "hospitality_resort_star_rating";
  ALTER TABLE "properties" DROP COLUMN "hospitality_resort_restaurants";
  ALTER TABLE "properties" DROP COLUMN "hospitality_resort_has_spa";
  ALTER TABLE "properties" DROP COLUMN "hospitality_resort_has_gym";
  ALTER TABLE "properties" DROP COLUMN "hospitality_resort_all_inclusive";
  DROP TYPE "public"."enum_properties_hospitality_hotel_star_rating";
  DROP TYPE "public"."enum_properties_hospitality_resort_star_rating";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_properties_hospitality_hotel_star_rating" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_properties_hospitality_resort_star_rating" AS ENUM('3', '4', '5');
  DROP INDEX "properties_hospitality_hospitality_star_rating_idx";
  ALTER TABLE "properties" ADD COLUMN "hospitality_hotel_star_rating" "enum_properties_hospitality_hotel_star_rating";
  ALTER TABLE "properties" ADD COLUMN "hospitality_hotel_has_spa" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_hotel_has_gym" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_hotel_operator" varchar;
  ALTER TABLE "properties" ADD COLUMN "hospitality_motel_has_parking" boolean DEFAULT true;
  ALTER TABLE "properties" ADD COLUMN "hospitality_motel_has_breakfast" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_resort_star_rating" "enum_properties_hospitality_resort_star_rating";
  ALTER TABLE "properties" ADD COLUMN "hospitality_resort_restaurants" numeric DEFAULT 1;
  ALTER TABLE "properties" ADD COLUMN "hospitality_resort_has_spa" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_resort_has_gym" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_resort_all_inclusive" boolean DEFAULT false;
  CREATE INDEX "properties_hospitality_hotel_hospitality_hotel_star_rati_idx" ON "properties" USING btree ("hospitality_hotel_star_rating");
  ALTER TABLE "properties" DROP COLUMN "hospitality_floors";
  ALTER TABLE "properties" DROP COLUMN "hospitality_star_rating";
  ALTER TABLE "properties" DROP COLUMN "hospitality_brand";
  ALTER TABLE "properties" DROP COLUMN "hospitality_last_renovation_year";
  ALTER TABLE "properties" DROP COLUMN "hospitality_motel_parking_spaces";
  ALTER TABLE "properties" DROP COLUMN "hospitality_motel_drive_up_rooms";
  ALTER TABLE "properties" DROP COLUMN "hospitality_resort_suites";
  DROP TYPE "public"."enum_properties_hospitality_star_rating";`)
}
