import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_properties_custom_attributes_value_type" AS ENUM('text', 'number', 'date', 'boolean', 'url');
  CREATE TYPE "public"."enum_properties_category" AS ENUM('residential', 'commercial', 'hospitality', 'land');
  CREATE TYPE "public"."enum_properties_residential_heating_type" AS ENUM('central', 'electric', 'gas', 'oil', 'propane');
  CREATE TYPE "public"."enum_properties_commercial_office_internet_type" AS ENUM('fiber', 'adsl', 'none');
  CREATE TYPE "public"."enum_properties_commercial_office_security_level" AS ENUM('24_7', 'business_hours', 'none');
  CREATE TYPE "public"."enum_properties_commercial_warehouse_fire_system" AS ENUM('sprinkler', 'extinguisher', 'full', 'none');
  CREATE TYPE "public"."enum_properties_commercial_factory_hazard_zone" AS ENUM('none', 'low', 'medium', 'high');
  CREATE TYPE "public"."enum_properties_hospitality_hotel_star_rating" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_properties_hospitality_resort_star_rating" AS ENUM('3', '4', '5');
  CREATE TYPE "public"."enum_properties_land_zoning" AS ENUM('residential', 'commercial', 'industrial', 'agricultural', 'mixed');
  CREATE TYPE "public"."enum_properties_land_slope" AS ENUM('flat', 'gentle', 'moderate', 'steep');
  CREATE TYPE "public"."enum_features_visible_in_categories" AS ENUM('residential', 'commercial', 'hospitality', 'land');
  CREATE TYPE "public"."enum_features_feature_group" AS ENUM('lifestyle', 'security', 'utilities', 'amenities');
  CREATE TABLE "properties_custom_attributes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value_type" "enum_properties_custom_attributes_value_type" DEFAULT 'text' NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "features_visible_in_categories" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_features_visible_in_categories",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "features_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"property_types_id" integer
  );
  
  CREATE TABLE "property_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"icon" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DROP INDEX "properties_details_details_bedrooms_idx";
  DROP INDEX "properties_details_details_bathrooms_idx";
  ALTER TABLE "properties" ALTER COLUMN "construction_status_id" DROP NOT NULL;
  ALTER TABLE "properties" ADD COLUMN "category" "enum_properties_category";
  ALTER TABLE "properties" ADD COLUMN "area" numeric;
  ALTER TABLE "properties" ADD COLUMN "residential_bedrooms" numeric;
  ALTER TABLE "properties" ADD COLUMN "residential_bathrooms" numeric;
  ALTER TABLE "properties" ADD COLUMN "residential_floor" numeric;
  ALTER TABLE "properties" ADD COLUMN "residential_floors" numeric;
  ALTER TABLE "properties" ADD COLUMN "residential_year_built" numeric;
  ALTER TABLE "properties" ADD COLUMN "residential_heating_type" "enum_properties_residential_heating_type";
  ALTER TABLE "properties" ADD COLUMN "residential_villa_pools" numeric DEFAULT 0;
  ALTER TABLE "properties" ADD COLUMN "residential_villa_has_garden" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "residential_villa_has_garage" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "residential_villa_has_majlis" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "residential_villa_has_driver_room" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "residential_villa_has_maid_room" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "residential_apartment_has_balcony" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "residential_apartment_has_maid_room" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "residential_chalet_has_pool" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "residential_chalet_has_garden" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "residential_chalet_is_beachfront" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "commercial_floor" numeric;
  ALTER TABLE "properties" ADD COLUMN "commercial_parking_spaces" numeric;
  ALTER TABLE "properties" ADD COLUMN "commercial_license_type" varchar;
  ALTER TABLE "properties" ADD COLUMN "commercial_office_meeting_rooms" numeric DEFAULT 0;
  ALTER TABLE "properties" ADD COLUMN "commercial_office_has_reception" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "commercial_office_internet_type" "enum_properties_commercial_office_internet_type";
  ALTER TABLE "properties" ADD COLUMN "commercial_office_security_level" "enum_properties_commercial_office_security_level";
  ALTER TABLE "properties" ADD COLUMN "commercial_office_elevators" numeric DEFAULT 0;
  ALTER TABLE "properties" ADD COLUMN "commercial_restaurant_kitchen_count" numeric DEFAULT 1;
  ALTER TABLE "properties" ADD COLUMN "commercial_restaurant_has_exhaust" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "commercial_restaurant_has_gas_connection" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "commercial_restaurant_outdoor_seating_capacity" numeric DEFAULT 0;
  ALTER TABLE "properties" ADD COLUMN "commercial_warehouse_loading_docks" numeric DEFAULT 0;
  ALTER TABLE "properties" ADD COLUMN "commercial_warehouse_ceiling_height" numeric;
  ALTER TABLE "properties" ADD COLUMN "commercial_warehouse_has_truck_access" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "commercial_warehouse_fire_system" "enum_properties_commercial_warehouse_fire_system";
  ALTER TABLE "properties" ADD COLUMN "commercial_factory_power_capacity_k_w" numeric;
  ALTER TABLE "properties" ADD COLUMN "commercial_factory_hazard_zone" "enum_properties_commercial_factory_hazard_zone";
  ALTER TABLE "properties" ADD COLUMN "commercial_factory_industrial_license" varchar;
  ALTER TABLE "properties" ADD COLUMN "commercial_retail_frontage_width" numeric;
  ALTER TABLE "properties" ADD COLUMN "commercial_retail_has_storage_room" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "commercial_retail_ceiling_height" numeric;
  ALTER TABLE "properties" ADD COLUMN "commercial_medical_has_waiting_room" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "commercial_medical_medical_license" varchar;
  ALTER TABLE "properties" ADD COLUMN "commercial_medical_number_of_exam_rooms" numeric DEFAULT 0;
  ALTER TABLE "properties" ADD COLUMN "hospitality_total_rooms" numeric;
  ALTER TABLE "properties" ADD COLUMN "hospitality_has_beach_access" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_hotel_star_rating" "enum_properties_hospitality_hotel_star_rating";
  ALTER TABLE "properties" ADD COLUMN "hospitality_hotel_suites" numeric DEFAULT 0;
  ALTER TABLE "properties" ADD COLUMN "hospitality_hotel_restaurants" numeric DEFAULT 0;
  ALTER TABLE "properties" ADD COLUMN "hospitality_hotel_conference_rooms" numeric DEFAULT 0;
  ALTER TABLE "properties" ADD COLUMN "hospitality_hotel_has_spa" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_hotel_has_gym" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_hotel_operator" varchar;
  ALTER TABLE "properties" ADD COLUMN "hospitality_motel_has_parking" boolean DEFAULT true;
  ALTER TABLE "properties" ADD COLUMN "hospitality_motel_has_breakfast" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_motel_is_highway_access" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_resort_star_rating" "enum_properties_hospitality_resort_star_rating";
  ALTER TABLE "properties" ADD COLUMN "hospitality_resort_restaurants" numeric DEFAULT 1;
  ALTER TABLE "properties" ADD COLUMN "hospitality_resort_has_spa" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_resort_has_gym" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_resort_has_private_beach" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_resort_has_golf_course" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_resort_all_inclusive" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_camp_tent_capacity" numeric DEFAULT 1;
  ALTER TABLE "properties" ADD COLUMN "hospitality_camp_has_showers" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "hospitality_camp_has_electricity" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "land_zoning" "enum_properties_land_zoning";
  ALTER TABLE "properties" ADD COLUMN "land_road_width" numeric;
  ALTER TABLE "properties" ADD COLUMN "land_frontage_width" numeric;
  ALTER TABLE "properties" ADD COLUMN "land_has_utilities" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "land_allowed_floors" numeric;
  ALTER TABLE "properties" ADD COLUMN "land_building_ratio" numeric;
  ALTER TABLE "properties" ADD COLUMN "land_is_corner" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "land_slope" "enum_properties_land_slope";
  ALTER TABLE "properties" ADD COLUMN "land_soil_type" varchar;
  ALTER TABLE "properties" ADD COLUMN "operational_data_avg_daily_rate" numeric;
  ALTER TABLE "properties" ADD COLUMN "operational_data_occupancy_rate" numeric;
  ALTER TABLE "properties" ADD COLUMN "operational_data_rev_p_a_r" numeric;
  ALTER TABLE "properties" ADD COLUMN "operational_data_last_report_date" timestamp(3) with time zone;
  ALTER TABLE "features" ADD COLUMN "slug" varchar;
  ALTER TABLE "features" ADD COLUMN "icon" varchar;
  ALTER TABLE "features" ADD COLUMN "feature_group" "enum_features_feature_group";
  ALTER TABLE "property_types" ADD COLUMN "category_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "property_categories_id" integer;
  ALTER TABLE "properties_custom_attributes" ADD CONSTRAINT "properties_custom_attributes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "features_visible_in_categories" ADD CONSTRAINT "features_visible_in_categories_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "features_rels" ADD CONSTRAINT "features_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "features_rels" ADD CONSTRAINT "features_rels_property_types_fk" FOREIGN KEY ("property_types_id") REFERENCES "public"."property_types"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "properties_custom_attributes_order_idx" ON "properties_custom_attributes" USING btree ("_order");
  CREATE INDEX "properties_custom_attributes_parent_id_idx" ON "properties_custom_attributes" USING btree ("_parent_id");
  CREATE INDEX "features_visible_in_categories_order_idx" ON "features_visible_in_categories" USING btree ("order");
  CREATE INDEX "features_visible_in_categories_parent_idx" ON "features_visible_in_categories" USING btree ("parent_id");
  CREATE INDEX "features_rels_order_idx" ON "features_rels" USING btree ("order");
  CREATE INDEX "features_rels_parent_idx" ON "features_rels" USING btree ("parent_id");
  CREATE INDEX "features_rels_path_idx" ON "features_rels" USING btree ("path");
  CREATE INDEX "features_rels_property_types_id_idx" ON "features_rels" USING btree ("property_types_id");
  CREATE UNIQUE INDEX "property_categories_name_idx" ON "property_categories" USING btree ("name");
  CREATE UNIQUE INDEX "property_categories_slug_idx" ON "property_categories" USING btree ("slug");
  CREATE INDEX "property_categories_updated_at_idx" ON "property_categories" USING btree ("updated_at");
  CREATE INDEX "property_categories_created_at_idx" ON "property_categories" USING btree ("created_at");
  ALTER TABLE "property_types" ADD CONSTRAINT "property_types_category_id_property_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."property_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_property_categories_fk" FOREIGN KEY ("property_categories_id") REFERENCES "public"."property_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "properties_category_idx" ON "properties" USING btree ("category");
  CREATE INDEX "properties_area_idx" ON "properties" USING btree ("area");
  CREATE INDEX "properties_residential_residential_bedrooms_idx" ON "properties" USING btree ("residential_bedrooms");
  CREATE INDEX "properties_residential_residential_bathrooms_idx" ON "properties" USING btree ("residential_bathrooms");
  CREATE INDEX "properties_commercial_commercial_parking_spaces_idx" ON "properties" USING btree ("commercial_parking_spaces");
  CREATE INDEX "properties_hospitality_hospitality_total_rooms_idx" ON "properties" USING btree ("hospitality_total_rooms");
  CREATE INDEX "properties_hospitality_hotel_hospitality_hotel_star_rati_idx" ON "properties" USING btree ("hospitality_hotel_star_rating");
  CREATE INDEX "properties_land_land_zoning_idx" ON "properties" USING btree ("land_zoning");
  CREATE INDEX "properties_land_land_is_corner_idx" ON "properties" USING btree ("land_is_corner");
  CREATE UNIQUE INDEX "features_slug_idx" ON "features" USING btree ("slug");
  CREATE INDEX "property_types_category_idx" ON "property_types" USING btree ("category_id");
  CREATE INDEX "payload_locked_documents_rels_property_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("property_categories_id");
  ALTER TABLE "properties" DROP COLUMN "details_bedrooms";
  ALTER TABLE "properties" DROP COLUMN "details_bathrooms";
  ALTER TABLE "properties" DROP COLUMN "details_square_meters";
  ALTER TABLE "properties" DROP COLUMN "details_lot_size";
  ALTER TABLE "properties" DROP COLUMN "details_year_built";
  ALTER TABLE "properties" DROP COLUMN "details_heating_type";
  DROP TYPE "public"."enum_properties_details_heating_type";
  
  -- Seed property categories
  INSERT INTO "property_categories" ("name", "slug", "icon", "sort_order", "updated_at", "created_at")
  VALUES 
    ('Residential', 'residential', 'Home', 1, now(), now()),
    ('Commercial', 'commercial', 'Building2', 2, now(), now()),
    ('Hospitality', 'hospitality', 'Hotel', 3, now(), now()),
    ('Land', 'land', 'Map', 4, now(), now())
  ON CONFLICT ("slug") DO NOTHING;

  -- Populate category_id on property_types
  UPDATE "property_types" pt
  SET "category_id" = pc.id
  FROM "property_categories" pc
  WHERE pc.slug = (
    CASE 
      WHEN pt.slug IN ('hotel', 'motel', 'resort') THEN 'hospitality'
      WHEN pt.slug = 'land' THEN 'land'
      WHEN pt.slug = 'elite-real-estate' THEN 'residential'
      WHEN pt.slug = 'commercial' THEN 'commercial'
      ELSE 'residential'
    END
  );
  ALTER TABLE "property_types" ALTER COLUMN "category_id" SET NOT NULL;

  -- Populate category on properties
  UPDATE "properties" p
  SET "category" = (
    CASE 
      WHEN pt.slug IN ('hotel', 'motel', 'resort') THEN 'hospitality'::"enum_properties_category"
      WHEN pt.slug = 'land' THEN 'land'::"enum_properties_category"
      WHEN pt.slug = 'elite-real-estate' THEN 'residential'::"enum_properties_category"
      WHEN pt.slug = 'commercial' THEN 'commercial'::"enum_properties_category"
      ELSE 'residential'::"enum_properties_category"
    END
  )
  FROM "property_types" pt
  WHERE p.property_type_id = pt.id;
  UPDATE "properties" SET "category" = 'residential' WHERE "category" IS NULL;
  ALTER TABLE "properties" ALTER COLUMN "category" SET NOT NULL;

  -- Populate features slug
  UPDATE "features" 
  SET "slug" = LOWER(REGEXP_REPLACE(TRIM("name"), '[^a-zA-Z0-9]+', '-', 'g'));
  UPDATE "features" SET "slug" = 'feature-' || "id" WHERE "slug" IS NULL OR "slug" = '';
  ALTER TABLE "features" ALTER COLUMN "slug" SET NOT NULL;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_properties_details_heating_type" AS ENUM('central', 'electric', 'gas', 'oil', 'propane');
  ALTER TABLE "properties_custom_attributes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "features_visible_in_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "features_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "property_categories" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "properties_custom_attributes" CASCADE;
  DROP TABLE "features_visible_in_categories" CASCADE;
  DROP TABLE "features_rels" CASCADE;
  DROP TABLE "property_categories" CASCADE;
  ALTER TABLE "property_types" DROP CONSTRAINT "property_types_category_id_property_categories_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_property_categories_fk";
  
  DROP INDEX "properties_category_idx";
  DROP INDEX "properties_area_idx";
  DROP INDEX "properties_residential_residential_bedrooms_idx";
  DROP INDEX "properties_residential_residential_bathrooms_idx";
  DROP INDEX "properties_commercial_commercial_parking_spaces_idx";
  DROP INDEX "properties_hospitality_hospitality_total_rooms_idx";
  DROP INDEX "properties_hospitality_hotel_hospitality_hotel_star_rati_idx";
  DROP INDEX "properties_land_land_zoning_idx";
  DROP INDEX "properties_land_land_is_corner_idx";
  DROP INDEX "features_slug_idx";
  DROP INDEX "property_types_category_idx";
  DROP INDEX "payload_locked_documents_rels_property_categories_id_idx";
  ALTER TABLE "properties" ALTER COLUMN "construction_status_id" SET NOT NULL;
  ALTER TABLE "properties" ADD COLUMN "details_bedrooms" numeric;
  ALTER TABLE "properties" ADD COLUMN "details_bathrooms" numeric;
  ALTER TABLE "properties" ADD COLUMN "details_square_meters" numeric;
  ALTER TABLE "properties" ADD COLUMN "details_lot_size" numeric;
  ALTER TABLE "properties" ADD COLUMN "details_year_built" numeric;
  ALTER TABLE "properties" ADD COLUMN "details_heating_type" "enum_properties_details_heating_type";
  CREATE INDEX "properties_details_details_bedrooms_idx" ON "properties" USING btree ("details_bedrooms");
  CREATE INDEX "properties_details_details_bathrooms_idx" ON "properties" USING btree ("details_bathrooms");
  ALTER TABLE "properties" DROP COLUMN "category";
  ALTER TABLE "properties" DROP COLUMN "area";
  ALTER TABLE "properties" DROP COLUMN "residential_bedrooms";
  ALTER TABLE "properties" DROP COLUMN "residential_bathrooms";
  ALTER TABLE "properties" DROP COLUMN "residential_floor";
  ALTER TABLE "properties" DROP COLUMN "residential_floors";
  ALTER TABLE "properties" DROP COLUMN "residential_year_built";
  ALTER TABLE "properties" DROP COLUMN "residential_heating_type";
  ALTER TABLE "properties" DROP COLUMN "residential_villa_pools";
  ALTER TABLE "properties" DROP COLUMN "residential_villa_has_garden";
  ALTER TABLE "properties" DROP COLUMN "residential_villa_has_garage";
  ALTER TABLE "properties" DROP COLUMN "residential_villa_has_majlis";
  ALTER TABLE "properties" DROP COLUMN "residential_villa_has_driver_room";
  ALTER TABLE "properties" DROP COLUMN "residential_villa_has_maid_room";
  ALTER TABLE "properties" DROP COLUMN "residential_apartment_has_balcony";
  ALTER TABLE "properties" DROP COLUMN "residential_apartment_has_maid_room";
  ALTER TABLE "properties" DROP COLUMN "residential_chalet_has_pool";
  ALTER TABLE "properties" DROP COLUMN "residential_chalet_has_garden";
  ALTER TABLE "properties" DROP COLUMN "residential_chalet_is_beachfront";
  ALTER TABLE "properties" DROP COLUMN "commercial_floor";
  ALTER TABLE "properties" DROP COLUMN "commercial_parking_spaces";
  ALTER TABLE "properties" DROP COLUMN "commercial_license_type";
  ALTER TABLE "properties" DROP COLUMN "commercial_office_meeting_rooms";
  ALTER TABLE "properties" DROP COLUMN "commercial_office_has_reception";
  ALTER TABLE "properties" DROP COLUMN "commercial_office_internet_type";
  ALTER TABLE "properties" DROP COLUMN "commercial_office_security_level";
  ALTER TABLE "properties" DROP COLUMN "commercial_office_elevators";
  ALTER TABLE "properties" DROP COLUMN "commercial_restaurant_kitchen_count";
  ALTER TABLE "properties" DROP COLUMN "commercial_restaurant_has_exhaust";
  ALTER TABLE "properties" DROP COLUMN "commercial_restaurant_has_gas_connection";
  ALTER TABLE "properties" DROP COLUMN "commercial_restaurant_outdoor_seating_capacity";
  ALTER TABLE "properties" DROP COLUMN "commercial_warehouse_loading_docks";
  ALTER TABLE "properties" DROP COLUMN "commercial_warehouse_ceiling_height";
  ALTER TABLE "properties" DROP COLUMN "commercial_warehouse_has_truck_access";
  ALTER TABLE "properties" DROP COLUMN "commercial_warehouse_fire_system";
  ALTER TABLE "properties" DROP COLUMN "commercial_factory_power_capacity_k_w";
  ALTER TABLE "properties" DROP COLUMN "commercial_factory_hazard_zone";
  ALTER TABLE "properties" DROP COLUMN "commercial_factory_industrial_license";
  ALTER TABLE "properties" DROP COLUMN "commercial_retail_frontage_width";
  ALTER TABLE "properties" DROP COLUMN "commercial_retail_has_storage_room";
  ALTER TABLE "properties" DROP COLUMN "commercial_retail_ceiling_height";
  ALTER TABLE "properties" DROP COLUMN "commercial_medical_has_waiting_room";
  ALTER TABLE "properties" DROP COLUMN "commercial_medical_medical_license";
  ALTER TABLE "properties" DROP COLUMN "commercial_medical_number_of_exam_rooms";
  ALTER TABLE "properties" DROP COLUMN "hospitality_total_rooms";
  ALTER TABLE "properties" DROP COLUMN "hospitality_has_beach_access";
  ALTER TABLE "properties" DROP COLUMN "hospitality_hotel_star_rating";
  ALTER TABLE "properties" DROP COLUMN "hospitality_hotel_suites";
  ALTER TABLE "properties" DROP COLUMN "hospitality_hotel_restaurants";
  ALTER TABLE "properties" DROP COLUMN "hospitality_hotel_conference_rooms";
  ALTER TABLE "properties" DROP COLUMN "hospitality_hotel_has_spa";
  ALTER TABLE "properties" DROP COLUMN "hospitality_hotel_has_gym";
  ALTER TABLE "properties" DROP COLUMN "hospitality_hotel_operator";
  ALTER TABLE "properties" DROP COLUMN "hospitality_motel_has_parking";
  ALTER TABLE "properties" DROP COLUMN "hospitality_motel_has_breakfast";
  ALTER TABLE "properties" DROP COLUMN "hospitality_motel_is_highway_access";
  ALTER TABLE "properties" DROP COLUMN "hospitality_resort_star_rating";
  ALTER TABLE "properties" DROP COLUMN "hospitality_resort_restaurants";
  ALTER TABLE "properties" DROP COLUMN "hospitality_resort_has_spa";
  ALTER TABLE "properties" DROP COLUMN "hospitality_resort_has_gym";
  ALTER TABLE "properties" DROP COLUMN "hospitality_resort_has_private_beach";
  ALTER TABLE "properties" DROP COLUMN "hospitality_resort_has_golf_course";
  ALTER TABLE "properties" DROP COLUMN "hospitality_resort_all_inclusive";
  ALTER TABLE "properties" DROP COLUMN "hospitality_camp_tent_capacity";
  ALTER TABLE "properties" DROP COLUMN "hospitality_camp_has_showers";
  ALTER TABLE "properties" DROP COLUMN "hospitality_camp_has_electricity";
  ALTER TABLE "properties" DROP COLUMN "land_zoning";
  ALTER TABLE "properties" DROP COLUMN "land_road_width";
  ALTER TABLE "properties" DROP COLUMN "land_frontage_width";
  ALTER TABLE "properties" DROP COLUMN "land_has_utilities";
  ALTER TABLE "properties" DROP COLUMN "land_allowed_floors";
  ALTER TABLE "properties" DROP COLUMN "land_building_ratio";
  ALTER TABLE "properties" DROP COLUMN "land_is_corner";
  ALTER TABLE "properties" DROP COLUMN "land_slope";
  ALTER TABLE "properties" DROP COLUMN "land_soil_type";
  ALTER TABLE "properties" DROP COLUMN "operational_data_avg_daily_rate";
  ALTER TABLE "properties" DROP COLUMN "operational_data_occupancy_rate";
  ALTER TABLE "properties" DROP COLUMN "operational_data_rev_p_a_r";
  ALTER TABLE "properties" DROP COLUMN "operational_data_last_report_date";
  ALTER TABLE "features" DROP COLUMN "slug";
  ALTER TABLE "features" DROP COLUMN "icon";
  ALTER TABLE "features" DROP COLUMN "feature_group";
  ALTER TABLE "property_types" DROP COLUMN "category_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "property_categories_id";
  DROP TYPE "public"."enum_properties_custom_attributes_value_type";
  DROP TYPE "public"."enum_properties_category";
  DROP TYPE "public"."enum_properties_residential_heating_type";
  DROP TYPE "public"."enum_properties_commercial_office_internet_type";
  DROP TYPE "public"."enum_properties_commercial_office_security_level";
  DROP TYPE "public"."enum_properties_commercial_warehouse_fire_system";
  DROP TYPE "public"."enum_properties_commercial_factory_hazard_zone";
  DROP TYPE "public"."enum_properties_hospitality_hotel_star_rating";
  DROP TYPE "public"."enum_properties_hospitality_resort_star_rating";
  DROP TYPE "public"."enum_properties_land_zoning";
  DROP TYPE "public"."enum_properties_land_slope";
  DROP TYPE "public"."enum_features_visible_in_categories";
  DROP TYPE "public"."enum_features_feature_group";`)
}
