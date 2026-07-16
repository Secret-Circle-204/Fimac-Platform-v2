import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_media_health_status" AS ENUM('ready', 'missing', 'broken', 'migrating', 'deleted');
  CREATE TYPE "public"."enum_media_folders_color" AS ENUM('default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink');
  CREATE TYPE "public"."enum_properties_custom_specifications_value_type" AS ENUM('text', 'number', 'date', 'boolean', 'url');
  CREATE TYPE "public"."enum_properties_category" AS ENUM('residential', 'commercial', 'hospitality', 'land');
  CREATE TYPE "public"."enum_properties_currency" AS ENUM('EGP', 'USD', 'EUR');
  CREATE TYPE "public"."enum_properties_residential_heating_type" AS ENUM('central', 'electric', 'gas', 'oil', 'propane');
  CREATE TYPE "public"."enum_properties_commercial_office_internet_type" AS ENUM('fiber', 'adsl', 'none');
  CREATE TYPE "public"."enum_properties_commercial_office_security_level" AS ENUM('24_7', 'business_hours', 'none');
  CREATE TYPE "public"."enum_properties_commercial_warehouse_fire_system" AS ENUM('sprinkler', 'extinguisher', 'full', 'none');
  CREATE TYPE "public"."enum_properties_commercial_factory_hazard_zone" AS ENUM('none', 'low', 'medium', 'high');
  CREATE TYPE "public"."enum_properties_hospitality_star_rating" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_properties_land_zoning" AS ENUM('residential', 'commercial', 'industrial', 'agricultural', 'mixed');
  CREATE TYPE "public"."enum_properties_land_slope" AS ENUM('flat', 'gentle', 'moderate', 'steep');
  CREATE TYPE "public"."enum_properties_location_meta_source" AS ENUM('manual', 'google_maps', 'imported');
  CREATE TYPE "public"."enum_features_visible_in_categories" AS ENUM('residential', 'commercial', 'hospitality', 'land');
  CREATE TYPE "public"."enum_features_feature_group" AS ENUM('interior', 'outdoor', 'security', 'parking', 'utilities', 'accessibility', 'business', 'hospitality', 'land_development', 'agriculture', 'sustainability', 'luxury');
  CREATE TYPE "public"."enum_buyers_verification_status" AS ENUM('pending', 'submitted', 'verified', 'rejected');
  CREATE TYPE "public"."enum_sellers_verification_status" AS ENUM('pending', 'verified', 'rejected');
  CREATE TYPE "public"."enum_verification_codes_user_type" AS ENUM('buyers', 'sellers');
  CREATE TYPE "public"."enum_property_views_source" AS ENUM('direct', 'search', 'social', 'email', 'referral', 'other');
  CREATE TYPE "public"."enum_property_views_device" AS ENUM('desktop', 'mobile', 'tablet');
  CREATE TYPE "public"."enum_blog_categories_color" AS ENUM('blue', 'green', 'red', 'yellow', 'purple', 'gray');
  CREATE TYPE "public"."enum_blog_posts_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_contact_messages_inquiry_type" AS ENUM('buyer', 'property-owner', 'general', 'partnership', 'support', 'other');
  CREATE TYPE "public"."enum_contact_messages_preferred_contact" AS ENUM('email', 'phone', 'whatsapp');
  CREATE TYPE "public"."enum_contact_messages_buying_timeline" AS ENUM('immediate', '1_to_3_months', '3_to_6_months', '6_plus_months', 'browsing');
  CREATE TYPE "public"."enum_contact_messages_status" AS ENUM('new', 'in-progress', 'resolved', 'archived');
  CREATE TYPE "public"."enum_contact_messages_priority" AS ENUM('low', 'normal', 'high', 'urgent');
  CREATE TYPE "public"."enum_seller_requests_category" AS ENUM('residential', 'commercial', 'hospitality', 'land');
  CREATE TYPE "public"."enum_seller_requests_currency" AS ENUM('EGP', 'USD', 'EUR');
  CREATE TYPE "public"."enum_seller_requests_residential_heating_type" AS ENUM('central', 'electric', 'gas', 'oil', 'propane');
  CREATE TYPE "public"."enum_seller_requests_commercial_office_internet_type" AS ENUM('fiber', 'adsl', 'none');
  CREATE TYPE "public"."enum_seller_requests_commercial_office_security_level" AS ENUM('24_7', 'business_hours', 'none');
  CREATE TYPE "public"."enum_seller_requests_commercial_warehouse_fire_system" AS ENUM('sprinkler', 'extinguisher', 'full', 'none');
  CREATE TYPE "public"."enum_seller_requests_commercial_factory_hazard_zone" AS ENUM('none', 'low', 'medium', 'high');
  CREATE TYPE "public"."enum_seller_requests_hospitality_star_rating" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_seller_requests_land_zoning" AS ENUM('residential', 'commercial', 'industrial', 'agricultural', 'mixed');
  CREATE TYPE "public"."enum_seller_requests_land_slope" AS ENUM('flat', 'gentle', 'moderate', 'steep');
  CREATE TYPE "public"."enum_seller_requests_status" AS ENUM('new', 'reviewing', 'approved', 'rejected', 'listed');
  CREATE TYPE "public"."enum_property_types_specification_profile" AS ENUM('villa', 'apartment', 'chalet', 'office', 'restaurant', 'warehouse', 'factory', 'retail', 'medical', 'hotel', 'motel', 'resort', 'camp', 'land', 'none');
  CREATE TYPE "public"."enum_listing_statuses_color_theme" AS ENUM('emerald', 'blue', 'gray', 'amber', 'rose', 'gold');
  CREATE TYPE "public"."enum_construction_statuses_color_theme" AS ENUM('emerald', 'amber', 'blue', 'indigo', 'purple', 'gray');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar,
  	"storage_key" varchar,
  	"alt" varchar NOT NULL,
  	"folder_id" integer,
  	"caption" varchar,
  	"health_status" "enum_media_health_status" DEFAULT 'ready',
  	"original_filename" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "media_folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"parent_id" integer,
  	"path" varchar NOT NULL,
  	"depth" numeric DEFAULT 0 NOT NULL,
  	"sort_order" numeric DEFAULT 0 NOT NULL,
  	"color" "enum_media_folders_color" DEFAULT 'default',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "locations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"formatted_location" varchar,
  	"zip" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"state_abbr" varchar NOT NULL,
  	"state_name" varchar NOT NULL,
  	"county" varchar,
  	"latitude" numeric,
  	"longitude" numeric,
  	"est_population" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "properties_custom_specifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"icon" varchar,
  	"value_type" "enum_properties_custom_specifications_value_type" DEFAULT 'text' NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "properties" (
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sort_order" numeric DEFAULT 99999,
  	"seller_id" integer,
  	"seller_request_id" integer,
  	"views" numeric DEFAULT 0,
  	"property_type_slug" varchar,
  	"title" varchar NOT NULL,
  	"category" "enum_properties_category" NOT NULL,
  	"property_type_id" integer,
  	"listing_status_id" integer NOT NULL,
  	"construction_status_id" integer,
  	"description" varchar NOT NULL,
  	"price" numeric,
  	"currency" "enum_properties_currency" DEFAULT 'EGP' NOT NULL,
  	"area" numeric,
  	"base_price_in_u_s_d" numeric,
  	"residential_bedrooms" numeric,
  	"residential_bathrooms" numeric,
  	"residential_floor" numeric,
  	"residential_floors" numeric,
  	"residential_year_built" numeric,
  	"residential_heating_type" "enum_properties_residential_heating_type",
  	"residential_villa_pools" numeric,
  	"residential_villa_has_garden" boolean,
  	"residential_villa_has_garage" boolean,
  	"residential_villa_has_majlis" boolean,
  	"residential_villa_has_driver_room" boolean,
  	"residential_villa_has_maid_room" boolean,
  	"residential_apartment_has_balcony" boolean,
  	"residential_apartment_has_maid_room" boolean,
  	"residential_chalet_has_pool" boolean,
  	"residential_chalet_has_garden" boolean,
  	"residential_chalet_is_beachfront" boolean,
  	"commercial_floor" numeric,
  	"commercial_parking_spaces" numeric,
  	"commercial_license_type" varchar,
  	"commercial_office_meeting_rooms" numeric,
  	"commercial_office_has_reception" boolean,
  	"commercial_office_internet_type" "enum_properties_commercial_office_internet_type",
  	"commercial_office_security_level" "enum_properties_commercial_office_security_level",
  	"commercial_office_elevators" numeric,
  	"commercial_restaurant_kitchen_count" numeric,
  	"commercial_restaurant_has_exhaust" boolean,
  	"commercial_restaurant_has_gas_connection" boolean,
  	"commercial_restaurant_outdoor_seating_capacity" numeric,
  	"commercial_warehouse_loading_docks" numeric,
  	"commercial_warehouse_ceiling_height" numeric,
  	"commercial_warehouse_has_truck_access" boolean,
  	"commercial_warehouse_fire_system" "enum_properties_commercial_warehouse_fire_system",
  	"commercial_factory_power_capacity_k_w" numeric,
  	"commercial_factory_hazard_zone" "enum_properties_commercial_factory_hazard_zone",
  	"commercial_factory_industrial_license" varchar,
  	"commercial_retail_frontage_width" numeric,
  	"commercial_retail_has_storage_room" boolean,
  	"commercial_retail_ceiling_height" numeric,
  	"commercial_medical_has_waiting_room" boolean,
  	"commercial_medical_medical_license" varchar,
  	"commercial_medical_number_of_exam_rooms" numeric,
  	"hospitality_total_rooms" numeric,
  	"hospitality_floors" numeric,
  	"hospitality_star_rating" "enum_properties_hospitality_star_rating",
  	"hospitality_brand" varchar,
  	"hospitality_last_renovation_year" numeric,
  	"hospitality_has_beach_access" boolean,
  	"hospitality_hotel_suites" numeric,
  	"hospitality_hotel_restaurants" numeric,
  	"hospitality_hotel_conference_rooms" numeric,
  	"hospitality_motel_parking_spaces" numeric,
  	"hospitality_motel_drive_up_rooms" boolean,
  	"hospitality_motel_is_highway_access" boolean,
  	"hospitality_resort_suites" numeric,
  	"hospitality_resort_has_private_beach" boolean,
  	"hospitality_resort_private_beach_area" numeric,
  	"hospitality_resort_has_golf_course" boolean,
  	"hospitality_camp_tent_capacity" numeric,
  	"hospitality_camp_has_showers" boolean,
  	"hospitality_camp_has_electricity" boolean,
  	"land_zoning" "enum_properties_land_zoning",
  	"land_road_width" numeric,
  	"land_frontage_width" numeric,
  	"land_has_utilities" boolean,
  	"land_allowed_floors" numeric,
  	"land_building_ratio" numeric,
  	"land_is_corner" boolean,
  	"land_slope" "enum_properties_land_slope",
  	"land_soil_type" varchar,
  	"operational_data_avg_daily_rate" numeric,
  	"operational_data_occupancy_rate" numeric,
  	"operational_data_rev_p_a_r" numeric,
  	"operational_data_last_report_date" timestamp(3) with time zone,
  	"maps_url_input" varchar,
  	"location_geo_lat" numeric,
  	"location_geo_lng" numeric,
  	"location_address_street" varchar,
  	"location_address_city" varchar,
  	"location_address_state" varchar,
  	"location_address_country" varchar DEFAULT 'Egypt',
  	"location_address_zip" varchar,
  	"location_address_full_address" varchar,
  	"location_search_city_slug" varchar,
  	"location_search_state_slug" varchar,
  	"location_search_normalized_address" varchar,
  	"location_meta_source" "enum_properties_location_meta_source" DEFAULT 'manual',
  	"location_meta_extracted_at" timestamp(3) with time zone,
  	"location_meta_extraction_confidence" numeric,
  	"street" varchar,
  	"location_legacy_id" integer,
  	"has_project" boolean DEFAULT false,
  	"project_image_id" integer,
  	"project_description" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "properties_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"features_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "features_visible_in_categories" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_features_visible_in_categories",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "features" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"icon" varchar,
  	"feature_group" "enum_features_feature_group",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "features_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"property_types_id" integer
  );
  
  CREATE TABLE "buyers_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "buyers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"company_name" varchar,
  	"phone" varchar,
  	"google_id" varchar,
  	"profile_image" varchar,
  	"verification_status" "enum_buyers_verification_status" DEFAULT 'pending' NOT NULL,
  	"proof_of_funds_id" integer,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "sellers_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "sellers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"company_name" varchar,
  	"verification_status" "enum_sellers_verification_status" DEFAULT 'pending' NOT NULL,
  	"notes" varchar,
  	"properties_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "verification_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"user_type" "enum_verification_codes_user_type" NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"verified" boolean DEFAULT false,
  	"verified_at" timestamp(3) with time zone,
  	"attempts" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "property_views" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"property_id" varchar NOT NULL,
  	"visitor_id" varchar NOT NULL,
  	"session_id" varchar,
  	"viewed_at" timestamp(3) with time zone NOT NULL,
  	"user_agent" varchar,
  	"ip_address" varchar,
  	"source" "enum_property_views_source",
  	"referrer" varchar,
  	"device" "enum_property_views_device",
  	"location_country" varchar,
  	"location_city" varchar,
  	"location_region" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "property_views_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"buyers_id" integer,
  	"sellers_id" integer
  );
  
  CREATE TABLE "blog_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"color" "enum_blog_categories_color" DEFAULT 'blue',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "blog_posts_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "blog_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"excerpt" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"featured_image_id" integer NOT NULL,
  	"author" varchar DEFAULT 'Fimac Group Team' NOT NULL,
  	"category_id" integer NOT NULL,
  	"status" "enum_blog_posts_status" DEFAULT 'draft' NOT NULL,
  	"published_date" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_meta_keywords" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"inquiry_type" "enum_contact_messages_inquiry_type" NOT NULL,
  	"subject" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"property_id" varchar,
  	"preferred_contact" "enum_contact_messages_preferred_contact",
  	"buying_timeline" "enum_contact_messages_buying_timeline",
  	"budget_range_min" numeric,
  	"budget_range_max" numeric,
  	"status" "enum_contact_messages_status" DEFAULT 'new' NOT NULL,
  	"priority" "enum_contact_messages_priority" DEFAULT 'normal',
  	"assigned_to_id" integer,
  	"notes" varchar,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"double_opt_in_confirmed" boolean DEFAULT false,
  	"confirmed_at" timestamp(3) with time zone,
  	"confirmation_token" varchar,
  	"confirmation_expires_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "seller_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"property_type_slug" varchar,
  	"category" "enum_seller_requests_category",
  	"property_type_id" integer NOT NULL,
  	"property_title" varchar NOT NULL,
  	"property_description" varchar NOT NULL,
  	"property_location" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"state" varchar NOT NULL,
  	"country" varchar DEFAULT 'Egypt' NOT NULL,
  	"asking_price" numeric NOT NULL,
  	"currency" "enum_seller_requests_currency" DEFAULT 'USD' NOT NULL,
  	"property_size" numeric,
  	"latitude" numeric,
  	"longitude" numeric,
  	"google_maps_url" varchar,
  	"construction_status_id" integer NOT NULL,
  	"residential_bedrooms" numeric,
  	"residential_bathrooms" numeric,
  	"residential_floor" numeric,
  	"residential_floors" numeric,
  	"residential_year_built" numeric,
  	"residential_heating_type" "enum_seller_requests_residential_heating_type",
  	"residential_villa_pools" numeric,
  	"residential_villa_has_garden" boolean,
  	"residential_villa_has_garage" boolean,
  	"residential_villa_has_majlis" boolean,
  	"residential_villa_has_driver_room" boolean,
  	"residential_villa_has_maid_room" boolean,
  	"residential_apartment_has_balcony" boolean,
  	"residential_apartment_has_maid_room" boolean,
  	"residential_chalet_has_pool" boolean,
  	"residential_chalet_has_garden" boolean,
  	"residential_chalet_is_beachfront" boolean,
  	"commercial_floor" numeric,
  	"commercial_parking_spaces" numeric,
  	"commercial_license_type" varchar,
  	"commercial_office_meeting_rooms" numeric,
  	"commercial_office_has_reception" boolean,
  	"commercial_office_internet_type" "enum_seller_requests_commercial_office_internet_type",
  	"commercial_office_security_level" "enum_seller_requests_commercial_office_security_level",
  	"commercial_office_elevators" numeric,
  	"commercial_restaurant_kitchen_count" numeric,
  	"commercial_restaurant_has_exhaust" boolean,
  	"commercial_restaurant_has_gas_connection" boolean,
  	"commercial_restaurant_outdoor_seating_capacity" numeric,
  	"commercial_warehouse_loading_docks" numeric,
  	"commercial_warehouse_ceiling_height" numeric,
  	"commercial_warehouse_has_truck_access" boolean,
  	"commercial_warehouse_fire_system" "enum_seller_requests_commercial_warehouse_fire_system",
  	"commercial_factory_power_capacity_k_w" numeric,
  	"commercial_factory_hazard_zone" "enum_seller_requests_commercial_factory_hazard_zone",
  	"commercial_factory_industrial_license" varchar,
  	"commercial_retail_frontage_width" numeric,
  	"commercial_retail_has_storage_room" boolean,
  	"commercial_retail_ceiling_height" numeric,
  	"commercial_medical_has_waiting_room" boolean,
  	"commercial_medical_medical_license" varchar,
  	"commercial_medical_number_of_exam_rooms" numeric,
  	"hospitality_total_rooms" numeric,
  	"hospitality_floors" numeric,
  	"hospitality_star_rating" "enum_seller_requests_hospitality_star_rating",
  	"hospitality_brand" varchar,
  	"hospitality_last_renovation_year" numeric,
  	"hospitality_has_beach_access" boolean,
  	"hospitality_hotel_suites" numeric,
  	"hospitality_hotel_restaurants" numeric,
  	"hospitality_hotel_conference_rooms" numeric,
  	"hospitality_motel_parking_spaces" numeric,
  	"hospitality_motel_drive_up_rooms" boolean,
  	"hospitality_motel_is_highway_access" boolean,
  	"hospitality_resort_suites" numeric,
  	"hospitality_resort_has_private_beach" boolean,
  	"hospitality_resort_private_beach_area" numeric,
  	"hospitality_resort_has_golf_course" boolean,
  	"hospitality_camp_tent_capacity" numeric,
  	"hospitality_camp_has_showers" boolean,
  	"hospitality_camp_has_electricity" boolean,
  	"land_zoning" "enum_seller_requests_land_zoning",
  	"land_road_width" numeric,
  	"land_frontage_width" numeric,
  	"land_has_utilities" boolean,
  	"land_allowed_floors" numeric,
  	"land_building_ratio" numeric,
  	"land_is_corner" boolean,
  	"land_slope" "enum_seller_requests_land_slope",
  	"land_soil_type" varchar,
  	"full_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"status" "enum_seller_requests_status" DEFAULT 'new' NOT NULL,
  	"reference_number" varchar,
  	"seller_id" integer,
  	"published_property_id" varchar,
  	"admin_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "seller_requests_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"features_id" integer
  );
  
  CREATE TABLE "property_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"category_id" integer NOT NULL,
  	"specification_profile" "enum_property_types_specification_profile" DEFAULT 'none' NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "listing_statuses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"color_theme" "enum_listing_statuses_color_theme" DEFAULT 'gray' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "construction_statuses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"color_theme" "enum_construction_statuses_color_theme" DEFAULT 'gray' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
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
  
  CREATE TABLE "ip_locations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hashed_ip" varchar NOT NULL,
  	"country" varchar,
  	"region" varchar,
  	"city" varchar,
  	"source" varchar,
  	"last_used" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"media_folders_id" integer,
  	"locations_id" integer,
  	"properties_id" varchar,
  	"features_id" integer,
  	"buyers_id" integer,
  	"sellers_id" integer,
  	"verification_codes_id" integer,
  	"property_views_id" integer,
  	"blog_categories_id" integer,
  	"blog_posts_id" integer,
  	"contact_messages_id" integer,
  	"seller_requests_id" integer,
  	"property_types_id" integer,
  	"listing_statuses_id" integer,
  	"construction_statuses_id" integer,
  	"property_categories_id" integer,
  	"ip_locations_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"buyers_id" integer,
  	"sellers_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "company_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"company_name" varchar DEFAULT 'Fimac' NOT NULL,
  	"company_logo_id" integer,
  	"partner_is_active" boolean DEFAULT false,
  	"partner_name" varchar,
  	"partner_website_url" varchar,
  	"partner_logo_id" integer,
  	"partner_badge_text" varchar DEFAULT 'Imagine your home with',
  	"contact_email" varchar DEFAULT 'info@fimacgroup.com' NOT NULL,
  	"contact_phone" varchar DEFAULT '+1 (234) 567-8900' NOT NULL,
  	"contact_office" varchar DEFAULT '123 Investment Plaza
  Knoxville, TN 37902' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "about_page_strengths" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"strength" varchar NOT NULL
  );
  
  CREATE TABLE "about_page_keys_of_success" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar DEFAULT 'Financial Investment Management Advice Consultants' NOT NULL,
  	"hero_description" varchar DEFAULT 'FIMAC (Financial Investment Management Advice Consultants) is a premier global consultancy specializing in the sale and acquisition of hospitality properties.' NOT NULL,
  	"vision_title" varchar DEFAULT 'Built on vision, driven by purpose' NOT NULL,
  	"vision_text" varchar DEFAULT 'To be the world''s most trusted and influential platform for hospitality property transactions, redefining the standards of excellence and becoming the first choice for professionals seeking to buy or list hospitality assets.' NOT NULL,
  	"mission_text" varchar DEFAULT 'Our mission is to empower hospitality business owners, buyers, and brokers by providing a seamless, secure, and expert-led platform that facilitates successful transactions.' NOT NULL,
  	"vision_image_id" integer,
  	"strengths_title" varchar DEFAULT 'Why hospitality leaders partner with FIMAC' NOT NULL,
  	"strengths_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_media_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."media_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parent_id_media_folders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties_custom_specifications" ADD CONSTRAINT "properties_custom_specifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_seller_id_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."sellers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_seller_request_id_seller_requests_id_fk" FOREIGN KEY ("seller_request_id") REFERENCES "public"."seller_requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_property_type_id_property_types_id_fk" FOREIGN KEY ("property_type_id") REFERENCES "public"."property_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_listing_status_id_listing_statuses_id_fk" FOREIGN KEY ("listing_status_id") REFERENCES "public"."listing_statuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_construction_status_id_construction_statuses_id_fk" FOREIGN KEY ("construction_status_id") REFERENCES "public"."construction_statuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_location_legacy_id_locations_id_fk" FOREIGN KEY ("location_legacy_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_project_image_id_media_id_fk" FOREIGN KEY ("project_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_features_fk" FOREIGN KEY ("features_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "features_visible_in_categories" ADD CONSTRAINT "features_visible_in_categories_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "features_rels" ADD CONSTRAINT "features_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "features_rels" ADD CONSTRAINT "features_rels_property_types_fk" FOREIGN KEY ("property_types_id") REFERENCES "public"."property_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "buyers_sessions" ADD CONSTRAINT "buyers_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."buyers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "buyers" ADD CONSTRAINT "buyers_proof_of_funds_id_media_id_fk" FOREIGN KEY ("proof_of_funds_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sellers_sessions" ADD CONSTRAINT "sellers_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sellers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "property_views" ADD CONSTRAINT "property_views_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "property_views_rels" ADD CONSTRAINT "property_views_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."property_views"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "property_views_rels" ADD CONSTRAINT "property_views_rels_buyers_fk" FOREIGN KEY ("buyers_id") REFERENCES "public"."buyers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "property_views_rels" ADD CONSTRAINT "property_views_rels_sellers_fk" FOREIGN KEY ("sellers_id") REFERENCES "public"."sellers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_posts_tags" ADD CONSTRAINT "blog_posts_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seller_requests" ADD CONSTRAINT "seller_requests_property_type_id_property_types_id_fk" FOREIGN KEY ("property_type_id") REFERENCES "public"."property_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seller_requests" ADD CONSTRAINT "seller_requests_construction_status_id_construction_statuses_id_fk" FOREIGN KEY ("construction_status_id") REFERENCES "public"."construction_statuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seller_requests" ADD CONSTRAINT "seller_requests_seller_id_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."sellers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seller_requests" ADD CONSTRAINT "seller_requests_published_property_id_properties_id_fk" FOREIGN KEY ("published_property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seller_requests_rels" ADD CONSTRAINT "seller_requests_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."seller_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seller_requests_rels" ADD CONSTRAINT "seller_requests_rels_features_fk" FOREIGN KEY ("features_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "property_types" ADD CONSTRAINT "property_types_category_id_property_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."property_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_folders_fk" FOREIGN KEY ("media_folders_id") REFERENCES "public"."media_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_features_fk" FOREIGN KEY ("features_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_buyers_fk" FOREIGN KEY ("buyers_id") REFERENCES "public"."buyers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sellers_fk" FOREIGN KEY ("sellers_id") REFERENCES "public"."sellers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_verification_codes_fk" FOREIGN KEY ("verification_codes_id") REFERENCES "public"."verification_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_property_views_fk" FOREIGN KEY ("property_views_id") REFERENCES "public"."property_views"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "public"."contact_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_seller_requests_fk" FOREIGN KEY ("seller_requests_id") REFERENCES "public"."seller_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_property_types_fk" FOREIGN KEY ("property_types_id") REFERENCES "public"."property_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_listing_statuses_fk" FOREIGN KEY ("listing_statuses_id") REFERENCES "public"."listing_statuses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_construction_statuses_fk" FOREIGN KEY ("construction_statuses_id") REFERENCES "public"."construction_statuses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_property_categories_fk" FOREIGN KEY ("property_categories_id") REFERENCES "public"."property_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ip_locations_fk" FOREIGN KEY ("ip_locations_id") REFERENCES "public"."ip_locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_buyers_fk" FOREIGN KEY ("buyers_id") REFERENCES "public"."buyers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_sellers_fk" FOREIGN KEY ("sellers_id") REFERENCES "public"."sellers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_company_logo_id_media_id_fk" FOREIGN KEY ("company_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_partner_logo_id_media_id_fk" FOREIGN KEY ("partner_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page_values" ADD CONSTRAINT "about_page_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_strengths" ADD CONSTRAINT "about_page_strengths_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_keys_of_success" ADD CONSTRAINT "about_page_keys_of_success_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page" ADD CONSTRAINT "about_page_vision_image_id_media_id_fk" FOREIGN KEY ("vision_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page" ADD CONSTRAINT "about_page_strengths_image_id_media_id_fk" FOREIGN KEY ("strengths_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_tags_order_idx" ON "media_tags" USING btree ("_order");
  CREATE INDEX "media_tags_parent_id_idx" ON "media_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "media_storage_key_idx" ON "media" USING btree ("storage_key");
  CREATE INDEX "media_folder_idx" ON "media" USING btree ("folder_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_folders_slug_idx" ON "media_folders" USING btree ("slug");
  CREATE INDEX "media_folders_parent_idx" ON "media_folders" USING btree ("parent_id");
  CREATE INDEX "media_folders_path_idx" ON "media_folders" USING btree ("path");
  CREATE INDEX "media_folders_sort_order_idx" ON "media_folders" USING btree ("sort_order");
  CREATE INDEX "media_folders_updated_at_idx" ON "media_folders" USING btree ("updated_at");
  CREATE INDEX "media_folders_created_at_idx" ON "media_folders" USING btree ("created_at");
  CREATE UNIQUE INDEX "locations_zip_idx" ON "locations" USING btree ("zip");
  CREATE INDEX "locations_updated_at_idx" ON "locations" USING btree ("updated_at");
  CREATE INDEX "locations_created_at_idx" ON "locations" USING btree ("created_at");
  CREATE INDEX "properties_custom_specifications_order_idx" ON "properties_custom_specifications" USING btree ("_order");
  CREATE INDEX "properties_custom_specifications_parent_id_idx" ON "properties_custom_specifications" USING btree ("_parent_id");
  CREATE INDEX "properties_sort_order_idx" ON "properties" USING btree ("sort_order");
  CREATE INDEX "properties_seller_idx" ON "properties" USING btree ("seller_id");
  CREATE INDEX "properties_seller_request_idx" ON "properties" USING btree ("seller_request_id");
  CREATE INDEX "properties_views_idx" ON "properties" USING btree ("views");
  CREATE INDEX "properties_title_idx" ON "properties" USING btree ("title");
  CREATE INDEX "properties_category_idx" ON "properties" USING btree ("category");
  CREATE INDEX "properties_property_type_idx" ON "properties" USING btree ("property_type_id");
  CREATE INDEX "properties_listing_status_idx" ON "properties" USING btree ("listing_status_id");
  CREATE INDEX "properties_construction_status_idx" ON "properties" USING btree ("construction_status_id");
  CREATE INDEX "properties_price_idx" ON "properties" USING btree ("price");
  CREATE INDEX "properties_currency_idx" ON "properties" USING btree ("currency");
  CREATE INDEX "properties_area_idx" ON "properties" USING btree ("area");
  CREATE INDEX "properties_base_price_in_u_s_d_idx" ON "properties" USING btree ("base_price_in_u_s_d");
  CREATE INDEX "properties_location_geo_location_geo_lat_idx" ON "properties" USING btree ("location_geo_lat");
  CREATE INDEX "properties_location_geo_location_geo_lng_idx" ON "properties" USING btree ("location_geo_lng");
  CREATE INDEX "properties_location_address_location_address_city_idx" ON "properties" USING btree ("location_address_city");
  CREATE INDEX "properties_location_address_location_address_state_idx" ON "properties" USING btree ("location_address_state");
  CREATE INDEX "properties_location_address_location_address_country_idx" ON "properties" USING btree ("location_address_country");
  CREATE INDEX "properties_location_address_location_address_zip_idx" ON "properties" USING btree ("location_address_zip");
  CREATE INDEX "properties_location_search_location_search_city_slug_idx" ON "properties" USING btree ("location_search_city_slug");
  CREATE INDEX "properties_location_search_location_search_state_slug_idx" ON "properties" USING btree ("location_search_state_slug");
  CREATE INDEX "properties_location_legacy_idx" ON "properties" USING btree ("location_legacy_id");
  CREATE INDEX "properties_project_image_idx" ON "properties" USING btree ("project_image_id");
  CREATE INDEX "properties_updated_at_idx" ON "properties" USING btree ("updated_at");
  CREATE INDEX "properties_created_at_idx" ON "properties" USING btree ("created_at");
  CREATE INDEX "properties_rels_order_idx" ON "properties_rels" USING btree ("order");
  CREATE INDEX "properties_rels_parent_idx" ON "properties_rels" USING btree ("parent_id");
  CREATE INDEX "properties_rels_path_idx" ON "properties_rels" USING btree ("path");
  CREATE INDEX "properties_rels_features_id_idx" ON "properties_rels" USING btree ("features_id");
  CREATE INDEX "properties_rels_media_id_idx" ON "properties_rels" USING btree ("media_id");
  CREATE INDEX "features_visible_in_categories_order_idx" ON "features_visible_in_categories" USING btree ("order");
  CREATE INDEX "features_visible_in_categories_parent_idx" ON "features_visible_in_categories" USING btree ("parent_id");
  CREATE UNIQUE INDEX "features_name_idx" ON "features" USING btree ("name");
  CREATE UNIQUE INDEX "features_slug_idx" ON "features" USING btree ("slug");
  CREATE INDEX "features_updated_at_idx" ON "features" USING btree ("updated_at");
  CREATE INDEX "features_created_at_idx" ON "features" USING btree ("created_at");
  CREATE INDEX "features_rels_order_idx" ON "features_rels" USING btree ("order");
  CREATE INDEX "features_rels_parent_idx" ON "features_rels" USING btree ("parent_id");
  CREATE INDEX "features_rels_path_idx" ON "features_rels" USING btree ("path");
  CREATE INDEX "features_rels_property_types_id_idx" ON "features_rels" USING btree ("property_types_id");
  CREATE INDEX "buyers_sessions_order_idx" ON "buyers_sessions" USING btree ("_order");
  CREATE INDEX "buyers_sessions_parent_id_idx" ON "buyers_sessions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "buyers_google_id_idx" ON "buyers" USING btree ("google_id");
  CREATE INDEX "buyers_proof_of_funds_idx" ON "buyers" USING btree ("proof_of_funds_id");
  CREATE INDEX "buyers_updated_at_idx" ON "buyers" USING btree ("updated_at");
  CREATE INDEX "buyers_created_at_idx" ON "buyers" USING btree ("created_at");
  CREATE UNIQUE INDEX "buyers_email_idx" ON "buyers" USING btree ("email");
  CREATE INDEX "sellers_sessions_order_idx" ON "sellers_sessions" USING btree ("_order");
  CREATE INDEX "sellers_sessions_parent_id_idx" ON "sellers_sessions" USING btree ("_parent_id");
  CREATE INDEX "sellers_updated_at_idx" ON "sellers" USING btree ("updated_at");
  CREATE INDEX "sellers_created_at_idx" ON "sellers" USING btree ("created_at");
  CREATE UNIQUE INDEX "sellers_email_idx" ON "sellers" USING btree ("email");
  CREATE INDEX "verification_codes_email_idx" ON "verification_codes" USING btree ("email");
  CREATE INDEX "verification_codes_updated_at_idx" ON "verification_codes" USING btree ("updated_at");
  CREATE INDEX "verification_codes_created_at_idx" ON "verification_codes" USING btree ("created_at");
  CREATE INDEX "property_views_property_idx" ON "property_views" USING btree ("property_id");
  CREATE INDEX "property_views_visitor_id_idx" ON "property_views" USING btree ("visitor_id");
  CREATE INDEX "property_views_session_id_idx" ON "property_views" USING btree ("session_id");
  CREATE INDEX "property_views_viewed_at_idx" ON "property_views" USING btree ("viewed_at");
  CREATE INDEX "property_views_ip_address_idx" ON "property_views" USING btree ("ip_address");
  CREATE INDEX "property_views_source_idx" ON "property_views" USING btree ("source");
  CREATE INDEX "property_views_device_idx" ON "property_views" USING btree ("device");
  CREATE INDEX "property_views_location_location_country_idx" ON "property_views" USING btree ("location_country");
  CREATE INDEX "property_views_location_location_city_idx" ON "property_views" USING btree ("location_city");
  CREATE INDEX "property_views_location_location_region_idx" ON "property_views" USING btree ("location_region");
  CREATE INDEX "property_views_updated_at_idx" ON "property_views" USING btree ("updated_at");
  CREATE INDEX "property_views_created_at_idx" ON "property_views" USING btree ("created_at");
  CREATE INDEX "property_views_rels_order_idx" ON "property_views_rels" USING btree ("order");
  CREATE INDEX "property_views_rels_parent_idx" ON "property_views_rels" USING btree ("parent_id");
  CREATE INDEX "property_views_rels_path_idx" ON "property_views_rels" USING btree ("path");
  CREATE INDEX "property_views_rels_buyers_id_idx" ON "property_views_rels" USING btree ("buyers_id");
  CREATE INDEX "property_views_rels_sellers_id_idx" ON "property_views_rels" USING btree ("sellers_id");
  CREATE UNIQUE INDEX "blog_categories_name_idx" ON "blog_categories" USING btree ("name");
  CREATE UNIQUE INDEX "blog_categories_slug_idx" ON "blog_categories" USING btree ("slug");
  CREATE INDEX "blog_categories_updated_at_idx" ON "blog_categories" USING btree ("updated_at");
  CREATE INDEX "blog_categories_created_at_idx" ON "blog_categories" USING btree ("created_at");
  CREATE INDEX "blog_posts_tags_order_idx" ON "blog_posts_tags" USING btree ("_order");
  CREATE INDEX "blog_posts_tags_parent_id_idx" ON "blog_posts_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");
  CREATE INDEX "blog_posts_featured_image_idx" ON "blog_posts" USING btree ("featured_image_id");
  CREATE INDEX "blog_posts_category_idx" ON "blog_posts" USING btree ("category_id");
  CREATE INDEX "blog_posts_status_idx" ON "blog_posts" USING btree ("status");
  CREATE INDEX "blog_posts_published_date_idx" ON "blog_posts" USING btree ("published_date");
  CREATE INDEX "blog_posts_updated_at_idx" ON "blog_posts" USING btree ("updated_at");
  CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts" USING btree ("created_at");
  CREATE INDEX "contact_messages_property_idx" ON "contact_messages" USING btree ("property_id");
  CREATE INDEX "contact_messages_assigned_to_idx" ON "contact_messages" USING btree ("assigned_to_id");
  CREATE INDEX "contact_messages_confirmation_token_idx" ON "contact_messages" USING btree ("confirmation_token");
  CREATE INDEX "contact_messages_updated_at_idx" ON "contact_messages" USING btree ("updated_at");
  CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");
  CREATE INDEX "seller_requests_property_type_idx" ON "seller_requests" USING btree ("property_type_id");
  CREATE INDEX "seller_requests_construction_status_idx" ON "seller_requests" USING btree ("construction_status_id");
  CREATE INDEX "seller_requests_seller_idx" ON "seller_requests" USING btree ("seller_id");
  CREATE INDEX "seller_requests_published_property_idx" ON "seller_requests" USING btree ("published_property_id");
  CREATE INDEX "seller_requests_updated_at_idx" ON "seller_requests" USING btree ("updated_at");
  CREATE INDEX "seller_requests_created_at_idx" ON "seller_requests" USING btree ("created_at");
  CREATE INDEX "seller_requests_rels_order_idx" ON "seller_requests_rels" USING btree ("order");
  CREATE INDEX "seller_requests_rels_parent_idx" ON "seller_requests_rels" USING btree ("parent_id");
  CREATE INDEX "seller_requests_rels_path_idx" ON "seller_requests_rels" USING btree ("path");
  CREATE INDEX "seller_requests_rels_features_id_idx" ON "seller_requests_rels" USING btree ("features_id");
  CREATE UNIQUE INDEX "property_types_name_idx" ON "property_types" USING btree ("name");
  CREATE INDEX "property_types_category_idx" ON "property_types" USING btree ("category_id");
  CREATE UNIQUE INDEX "property_types_slug_idx" ON "property_types" USING btree ("slug");
  CREATE INDEX "property_types_updated_at_idx" ON "property_types" USING btree ("updated_at");
  CREATE INDEX "property_types_created_at_idx" ON "property_types" USING btree ("created_at");
  CREATE UNIQUE INDEX "listing_statuses_name_idx" ON "listing_statuses" USING btree ("name");
  CREATE UNIQUE INDEX "listing_statuses_slug_idx" ON "listing_statuses" USING btree ("slug");
  CREATE INDEX "listing_statuses_updated_at_idx" ON "listing_statuses" USING btree ("updated_at");
  CREATE INDEX "listing_statuses_created_at_idx" ON "listing_statuses" USING btree ("created_at");
  CREATE UNIQUE INDEX "construction_statuses_name_idx" ON "construction_statuses" USING btree ("name");
  CREATE UNIQUE INDEX "construction_statuses_slug_idx" ON "construction_statuses" USING btree ("slug");
  CREATE INDEX "construction_statuses_updated_at_idx" ON "construction_statuses" USING btree ("updated_at");
  CREATE INDEX "construction_statuses_created_at_idx" ON "construction_statuses" USING btree ("created_at");
  CREATE UNIQUE INDEX "property_categories_name_idx" ON "property_categories" USING btree ("name");
  CREATE UNIQUE INDEX "property_categories_slug_idx" ON "property_categories" USING btree ("slug");
  CREATE INDEX "property_categories_updated_at_idx" ON "property_categories" USING btree ("updated_at");
  CREATE INDEX "property_categories_created_at_idx" ON "property_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "ip_locations_hashed_ip_idx" ON "ip_locations" USING btree ("hashed_ip");
  CREATE INDEX "ip_locations_updated_at_idx" ON "ip_locations" USING btree ("updated_at");
  CREATE INDEX "ip_locations_created_at_idx" ON "ip_locations" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_media_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("media_folders_id");
  CREATE INDEX "payload_locked_documents_rels_locations_id_idx" ON "payload_locked_documents_rels" USING btree ("locations_id");
  CREATE INDEX "payload_locked_documents_rels_properties_id_idx" ON "payload_locked_documents_rels" USING btree ("properties_id");
  CREATE INDEX "payload_locked_documents_rels_features_id_idx" ON "payload_locked_documents_rels" USING btree ("features_id");
  CREATE INDEX "payload_locked_documents_rels_buyers_id_idx" ON "payload_locked_documents_rels" USING btree ("buyers_id");
  CREATE INDEX "payload_locked_documents_rels_sellers_id_idx" ON "payload_locked_documents_rels" USING btree ("sellers_id");
  CREATE INDEX "payload_locked_documents_rels_verification_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("verification_codes_id");
  CREATE INDEX "payload_locked_documents_rels_property_views_id_idx" ON "payload_locked_documents_rels" USING btree ("property_views_id");
  CREATE INDEX "payload_locked_documents_rels_blog_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_categories_id");
  CREATE INDEX "payload_locked_documents_rels_blog_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_posts_id");
  CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_messages_id");
  CREATE INDEX "payload_locked_documents_rels_seller_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("seller_requests_id");
  CREATE INDEX "payload_locked_documents_rels_property_types_id_idx" ON "payload_locked_documents_rels" USING btree ("property_types_id");
  CREATE INDEX "payload_locked_documents_rels_listing_statuses_id_idx" ON "payload_locked_documents_rels" USING btree ("listing_statuses_id");
  CREATE INDEX "payload_locked_documents_rels_construction_statuses_id_idx" ON "payload_locked_documents_rels" USING btree ("construction_statuses_id");
  CREATE INDEX "payload_locked_documents_rels_property_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("property_categories_id");
  CREATE INDEX "payload_locked_documents_rels_ip_locations_id_idx" ON "payload_locked_documents_rels" USING btree ("ip_locations_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_rels_buyers_id_idx" ON "payload_preferences_rels" USING btree ("buyers_id");
  CREATE INDEX "payload_preferences_rels_sellers_id_idx" ON "payload_preferences_rels" USING btree ("sellers_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "company_settings_company_logo_idx" ON "company_settings" USING btree ("company_logo_id");
  CREATE INDEX "company_settings_partner_partner_logo_idx" ON "company_settings" USING btree ("partner_logo_id");
  CREATE INDEX "about_page_values_order_idx" ON "about_page_values" USING btree ("_order");
  CREATE INDEX "about_page_values_parent_id_idx" ON "about_page_values" USING btree ("_parent_id");
  CREATE INDEX "about_page_strengths_order_idx" ON "about_page_strengths" USING btree ("_order");
  CREATE INDEX "about_page_strengths_parent_id_idx" ON "about_page_strengths" USING btree ("_parent_id");
  CREATE INDEX "about_page_keys_of_success_order_idx" ON "about_page_keys_of_success" USING btree ("_order");
  CREATE INDEX "about_page_keys_of_success_parent_id_idx" ON "about_page_keys_of_success" USING btree ("_parent_id");
  CREATE INDEX "about_page_vision_image_idx" ON "about_page" USING btree ("vision_image_id");
  CREATE INDEX "about_page_strengths_image_idx" ON "about_page" USING btree ("strengths_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media_tags" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_folders" CASCADE;
  DROP TABLE "locations" CASCADE;
  DROP TABLE "properties_custom_specifications" CASCADE;
  DROP TABLE "properties" CASCADE;
  DROP TABLE "properties_rels" CASCADE;
  DROP TABLE "features_visible_in_categories" CASCADE;
  DROP TABLE "features" CASCADE;
  DROP TABLE "features_rels" CASCADE;
  DROP TABLE "buyers_sessions" CASCADE;
  DROP TABLE "buyers" CASCADE;
  DROP TABLE "sellers_sessions" CASCADE;
  DROP TABLE "sellers" CASCADE;
  DROP TABLE "verification_codes" CASCADE;
  DROP TABLE "property_views" CASCADE;
  DROP TABLE "property_views_rels" CASCADE;
  DROP TABLE "blog_categories" CASCADE;
  DROP TABLE "blog_posts_tags" CASCADE;
  DROP TABLE "blog_posts" CASCADE;
  DROP TABLE "contact_messages" CASCADE;
  DROP TABLE "seller_requests" CASCADE;
  DROP TABLE "seller_requests_rels" CASCADE;
  DROP TABLE "property_types" CASCADE;
  DROP TABLE "listing_statuses" CASCADE;
  DROP TABLE "construction_statuses" CASCADE;
  DROP TABLE "property_categories" CASCADE;
  DROP TABLE "ip_locations" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "company_settings" CASCADE;
  DROP TABLE "about_page_values" CASCADE;
  DROP TABLE "about_page_strengths" CASCADE;
  DROP TABLE "about_page_keys_of_success" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TYPE "public"."enum_media_health_status";
  DROP TYPE "public"."enum_media_folders_color";
  DROP TYPE "public"."enum_properties_custom_specifications_value_type";
  DROP TYPE "public"."enum_properties_category";
  DROP TYPE "public"."enum_properties_currency";
  DROP TYPE "public"."enum_properties_residential_heating_type";
  DROP TYPE "public"."enum_properties_commercial_office_internet_type";
  DROP TYPE "public"."enum_properties_commercial_office_security_level";
  DROP TYPE "public"."enum_properties_commercial_warehouse_fire_system";
  DROP TYPE "public"."enum_properties_commercial_factory_hazard_zone";
  DROP TYPE "public"."enum_properties_hospitality_star_rating";
  DROP TYPE "public"."enum_properties_land_zoning";
  DROP TYPE "public"."enum_properties_land_slope";
  DROP TYPE "public"."enum_properties_location_meta_source";
  DROP TYPE "public"."enum_features_visible_in_categories";
  DROP TYPE "public"."enum_features_feature_group";
  DROP TYPE "public"."enum_buyers_verification_status";
  DROP TYPE "public"."enum_sellers_verification_status";
  DROP TYPE "public"."enum_verification_codes_user_type";
  DROP TYPE "public"."enum_property_views_source";
  DROP TYPE "public"."enum_property_views_device";
  DROP TYPE "public"."enum_blog_categories_color";
  DROP TYPE "public"."enum_blog_posts_status";
  DROP TYPE "public"."enum_contact_messages_inquiry_type";
  DROP TYPE "public"."enum_contact_messages_preferred_contact";
  DROP TYPE "public"."enum_contact_messages_buying_timeline";
  DROP TYPE "public"."enum_contact_messages_status";
  DROP TYPE "public"."enum_contact_messages_priority";
  DROP TYPE "public"."enum_seller_requests_category";
  DROP TYPE "public"."enum_seller_requests_currency";
  DROP TYPE "public"."enum_seller_requests_residential_heating_type";
  DROP TYPE "public"."enum_seller_requests_commercial_office_internet_type";
  DROP TYPE "public"."enum_seller_requests_commercial_office_security_level";
  DROP TYPE "public"."enum_seller_requests_commercial_warehouse_fire_system";
  DROP TYPE "public"."enum_seller_requests_commercial_factory_hazard_zone";
  DROP TYPE "public"."enum_seller_requests_hospitality_star_rating";
  DROP TYPE "public"."enum_seller_requests_land_zoning";
  DROP TYPE "public"."enum_seller_requests_land_slope";
  DROP TYPE "public"."enum_seller_requests_status";
  DROP TYPE "public"."enum_property_types_specification_profile";
  DROP TYPE "public"."enum_listing_statuses_color_theme";
  DROP TYPE "public"."enum_construction_statuses_color_theme";`)
}
