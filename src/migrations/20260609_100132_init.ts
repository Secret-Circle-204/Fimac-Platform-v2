import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_properties_listing_status" AS ENUM('forsale', 'pending', 'contract', 'contingent', 'sold', 'offmarket', 'notforsale');
  CREATE TYPE "public"."enum_properties_construction_status" AS ENUM('ready', 'under_construction', 'brand_new', 'off_plan', 'renovated');
  CREATE TYPE "public"."enum_properties_details_heating_type" AS ENUM('central', 'electric', 'gas', 'oil', 'propane');
  CREATE TYPE "public"."enum_properties_location_meta_source" AS ENUM('manual', 'google_maps', 'imported');
  CREATE TYPE "public"."enum_features_category" AS ENUM('interior', 'exterior', 'community', 'other');
  CREATE TYPE "public"."enum_investors_verification_status" AS ENUM('pending', 'submitted', 'verified', 'rejected');
  CREATE TYPE "public"."enum_sellers_verification_status" AS ENUM('pending', 'verified', 'rejected');
  CREATE TYPE "public"."enum_verification_codes_user_type" AS ENUM('investors', 'sellers');
  CREATE TYPE "public"."enum_property_views_source" AS ENUM('direct', 'search', 'social', 'email', 'referral', 'other');
  CREATE TYPE "public"."enum_property_views_device" AS ENUM('desktop', 'mobile', 'tablet');
  CREATE TYPE "public"."enum_blog_categories_color" AS ENUM('blue', 'green', 'red', 'yellow', 'purple', 'gray');
  CREATE TYPE "public"."enum_blog_posts_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_contact_messages_inquiry_type" AS ENUM('investor', 'property-owner', 'general', 'partnership', 'support', 'other');
  CREATE TYPE "public"."enum_contact_messages_preferred_contact" AS ENUM('email', 'phone', 'whatsapp');
  CREATE TYPE "public"."enum_contact_messages_buying_timeline" AS ENUM('immediate', '1_to_3_months', '3_to_6_months', '6_plus_months', 'browsing');
  CREATE TYPE "public"."enum_contact_messages_status" AS ENUM('new', 'in-progress', 'resolved', 'archived');
  CREATE TYPE "public"."enum_contact_messages_priority" AS ENUM('low', 'normal', 'high', 'urgent');
  CREATE TYPE "public"."enum_newsletters_interests" AS ENUM('investment', 'market-news', 'listings', 'blog', 'trends', 'events');
  CREATE TYPE "public"."enum_newsletters_status" AS ENUM('subscribed', 'unsubscribed', 'bounced', 'complained');
  CREATE TYPE "public"."enum_newsletters_source" AS ENUM('homepage', 'blog', 'contact', 'footer', 'popup', 'manual', 'other');
  CREATE TYPE "public"."enum_newsletters_preferences_frequency" AS ENUM('daily', 'weekly', 'monthly');
  CREATE TYPE "public"."enum_seller_requests_status" AS ENUM('new', 'reviewing', 'approved', 'rejected', 'listed');
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
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
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
  
  CREATE TABLE "properties" (
  	"id" varchar PRIMARY KEY NOT NULL,
  	"seller_id" integer,
  	"seller_request_id" integer,
  	"views" numeric DEFAULT 0,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"property_type_id" integer,
  	"price" numeric,
  	"listing_status" "enum_properties_listing_status" NOT NULL,
  	"construction_status" "enum_properties_construction_status" DEFAULT 'ready' NOT NULL,
  	"details_bedrooms" numeric,
  	"details_bathrooms" numeric,
  	"details_square_meters" numeric,
  	"details_lot_size" numeric,
  	"details_year_built" numeric,
  	"details_heating_type" "enum_properties_details_heating_type",
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
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "properties_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"features_id" integer
  );
  
  CREATE TABLE "features" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"category" "enum_features_category" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "investors_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "investors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"company_name" varchar,
  	"phone" varchar,
  	"google_id" varchar,
  	"profile_image" varchar,
  	"verification_status" "enum_investors_verification_status" DEFAULT 'pending' NOT NULL,
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
  	"properties_count" numeric,
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
  	"investors_id" integer,
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
  	"read_time" numeric DEFAULT 5,
  	"views" numeric DEFAULT 0,
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
  
  CREATE TABLE "newsletters_interests" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_newsletters_interests",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "newsletters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"first_name" varchar,
  	"last_name" varchar,
  	"status" "enum_newsletters_status" DEFAULT 'subscribed' NOT NULL,
  	"subscribe_date" timestamp(3) with time zone NOT NULL,
  	"unsubscribe_date" timestamp(3) with time zone,
  	"source" "enum_newsletters_source",
  	"preferences_frequency" "enum_newsletters_preferences_frequency" DEFAULT 'weekly',
  	"preferences_html_emails" boolean DEFAULT true,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"double_opt_in" boolean DEFAULT false,
  	"confirmation_date" timestamp(3) with time zone,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "seller_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"property_type_id" integer NOT NULL,
  	"property_title" varchar NOT NULL,
  	"property_description" varchar NOT NULL,
  	"property_location" varchar NOT NULL,
  	"asking_price" numeric,
  	"property_size" numeric,
  	"status" "enum_seller_requests_status" DEFAULT 'new' NOT NULL,
  	"seller_id" integer,
  	"admin_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "property_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
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
  	"locations_id" integer,
  	"properties_id" varchar,
  	"features_id" integer,
  	"investors_id" integer,
  	"sellers_id" integer,
  	"verification_codes_id" integer,
  	"property_views_id" integer,
  	"blog_categories_id" integer,
  	"blog_posts_id" integer,
  	"contact_messages_id" integer,
  	"newsletters_id" integer,
  	"seller_requests_id" integer,
  	"property_types_id" integer,
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
  	"investors_id" integer,
  	"sellers_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_seller_id_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."sellers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_seller_request_id_seller_requests_id_fk" FOREIGN KEY ("seller_request_id") REFERENCES "public"."seller_requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_property_type_id_property_types_id_fk" FOREIGN KEY ("property_type_id") REFERENCES "public"."property_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_location_legacy_id_locations_id_fk" FOREIGN KEY ("location_legacy_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_features_fk" FOREIGN KEY ("features_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "investors_sessions" ADD CONSTRAINT "investors_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."investors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "investors" ADD CONSTRAINT "investors_proof_of_funds_id_media_id_fk" FOREIGN KEY ("proof_of_funds_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sellers_sessions" ADD CONSTRAINT "sellers_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sellers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "property_views" ADD CONSTRAINT "property_views_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "property_views_rels" ADD CONSTRAINT "property_views_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."property_views"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "property_views_rels" ADD CONSTRAINT "property_views_rels_investors_fk" FOREIGN KEY ("investors_id") REFERENCES "public"."investors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "property_views_rels" ADD CONSTRAINT "property_views_rels_sellers_fk" FOREIGN KEY ("sellers_id") REFERENCES "public"."sellers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_posts_tags" ADD CONSTRAINT "blog_posts_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters_interests" ADD CONSTRAINT "newsletters_interests_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seller_requests" ADD CONSTRAINT "seller_requests_property_type_id_property_types_id_fk" FOREIGN KEY ("property_type_id") REFERENCES "public"."property_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seller_requests" ADD CONSTRAINT "seller_requests_seller_id_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."sellers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_features_fk" FOREIGN KEY ("features_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_investors_fk" FOREIGN KEY ("investors_id") REFERENCES "public"."investors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sellers_fk" FOREIGN KEY ("sellers_id") REFERENCES "public"."sellers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_verification_codes_fk" FOREIGN KEY ("verification_codes_id") REFERENCES "public"."verification_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_property_views_fk" FOREIGN KEY ("property_views_id") REFERENCES "public"."property_views"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "public"."contact_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletters_fk" FOREIGN KEY ("newsletters_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_seller_requests_fk" FOREIGN KEY ("seller_requests_id") REFERENCES "public"."seller_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_property_types_fk" FOREIGN KEY ("property_types_id") REFERENCES "public"."property_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_investors_fk" FOREIGN KEY ("investors_id") REFERENCES "public"."investors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_sellers_fk" FOREIGN KEY ("sellers_id") REFERENCES "public"."sellers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "locations_zip_idx" ON "locations" USING btree ("zip");
  CREATE INDEX "locations_updated_at_idx" ON "locations" USING btree ("updated_at");
  CREATE INDEX "locations_created_at_idx" ON "locations" USING btree ("created_at");
  CREATE INDEX "properties_seller_idx" ON "properties" USING btree ("seller_id");
  CREATE INDEX "properties_seller_request_idx" ON "properties" USING btree ("seller_request_id");
  CREATE INDEX "properties_property_type_idx" ON "properties" USING btree ("property_type_id");
  CREATE INDEX "properties_price_idx" ON "properties" USING btree ("price");
  CREATE INDEX "properties_listing_status_idx" ON "properties" USING btree ("listing_status");
  CREATE INDEX "properties_construction_status_idx" ON "properties" USING btree ("construction_status");
  CREATE INDEX "properties_location_geo_location_geo_lat_idx" ON "properties" USING btree ("location_geo_lat");
  CREATE INDEX "properties_location_geo_location_geo_lng_idx" ON "properties" USING btree ("location_geo_lng");
  CREATE INDEX "properties_location_search_location_search_city_slug_idx" ON "properties" USING btree ("location_search_city_slug");
  CREATE INDEX "properties_location_search_location_search_state_slug_idx" ON "properties" USING btree ("location_search_state_slug");
  CREATE INDEX "properties_location_legacy_idx" ON "properties" USING btree ("location_legacy_id");
  CREATE INDEX "properties_updated_at_idx" ON "properties" USING btree ("updated_at");
  CREATE INDEX "properties_created_at_idx" ON "properties" USING btree ("created_at");
  CREATE INDEX "properties_rels_order_idx" ON "properties_rels" USING btree ("order");
  CREATE INDEX "properties_rels_parent_idx" ON "properties_rels" USING btree ("parent_id");
  CREATE INDEX "properties_rels_path_idx" ON "properties_rels" USING btree ("path");
  CREATE INDEX "properties_rels_media_id_idx" ON "properties_rels" USING btree ("media_id");
  CREATE INDEX "properties_rels_features_id_idx" ON "properties_rels" USING btree ("features_id");
  CREATE UNIQUE INDEX "features_name_idx" ON "features" USING btree ("name");
  CREATE INDEX "features_updated_at_idx" ON "features" USING btree ("updated_at");
  CREATE INDEX "features_created_at_idx" ON "features" USING btree ("created_at");
  CREATE INDEX "investors_sessions_order_idx" ON "investors_sessions" USING btree ("_order");
  CREATE INDEX "investors_sessions_parent_id_idx" ON "investors_sessions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "investors_google_id_idx" ON "investors" USING btree ("google_id");
  CREATE INDEX "investors_proof_of_funds_idx" ON "investors" USING btree ("proof_of_funds_id");
  CREATE INDEX "investors_updated_at_idx" ON "investors" USING btree ("updated_at");
  CREATE INDEX "investors_created_at_idx" ON "investors" USING btree ("created_at");
  CREATE UNIQUE INDEX "investors_email_idx" ON "investors" USING btree ("email");
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
  CREATE INDEX "property_views_updated_at_idx" ON "property_views" USING btree ("updated_at");
  CREATE INDEX "property_views_created_at_idx" ON "property_views" USING btree ("created_at");
  CREATE INDEX "property_views_rels_order_idx" ON "property_views_rels" USING btree ("order");
  CREATE INDEX "property_views_rels_parent_idx" ON "property_views_rels" USING btree ("parent_id");
  CREATE INDEX "property_views_rels_path_idx" ON "property_views_rels" USING btree ("path");
  CREATE INDEX "property_views_rels_investors_id_idx" ON "property_views_rels" USING btree ("investors_id");
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
  CREATE INDEX "contact_messages_updated_at_idx" ON "contact_messages" USING btree ("updated_at");
  CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");
  CREATE INDEX "newsletters_interests_order_idx" ON "newsletters_interests" USING btree ("order");
  CREATE INDEX "newsletters_interests_parent_idx" ON "newsletters_interests" USING btree ("parent_id");
  CREATE UNIQUE INDEX "newsletters_email_idx" ON "newsletters" USING btree ("email");
  CREATE INDEX "newsletters_updated_at_idx" ON "newsletters" USING btree ("updated_at");
  CREATE INDEX "newsletters_created_at_idx" ON "newsletters" USING btree ("created_at");
  CREATE INDEX "seller_requests_property_type_idx" ON "seller_requests" USING btree ("property_type_id");
  CREATE INDEX "seller_requests_seller_idx" ON "seller_requests" USING btree ("seller_id");
  CREATE INDEX "seller_requests_updated_at_idx" ON "seller_requests" USING btree ("updated_at");
  CREATE INDEX "seller_requests_created_at_idx" ON "seller_requests" USING btree ("created_at");
  CREATE UNIQUE INDEX "property_types_name_idx" ON "property_types" USING btree ("name");
  CREATE UNIQUE INDEX "property_types_slug_idx" ON "property_types" USING btree ("slug");
  CREATE INDEX "property_types_updated_at_idx" ON "property_types" USING btree ("updated_at");
  CREATE INDEX "property_types_created_at_idx" ON "property_types" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_locations_id_idx" ON "payload_locked_documents_rels" USING btree ("locations_id");
  CREATE INDEX "payload_locked_documents_rels_properties_id_idx" ON "payload_locked_documents_rels" USING btree ("properties_id");
  CREATE INDEX "payload_locked_documents_rels_features_id_idx" ON "payload_locked_documents_rels" USING btree ("features_id");
  CREATE INDEX "payload_locked_documents_rels_investors_id_idx" ON "payload_locked_documents_rels" USING btree ("investors_id");
  CREATE INDEX "payload_locked_documents_rels_sellers_id_idx" ON "payload_locked_documents_rels" USING btree ("sellers_id");
  CREATE INDEX "payload_locked_documents_rels_verification_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("verification_codes_id");
  CREATE INDEX "payload_locked_documents_rels_property_views_id_idx" ON "payload_locked_documents_rels" USING btree ("property_views_id");
  CREATE INDEX "payload_locked_documents_rels_blog_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_categories_id");
  CREATE INDEX "payload_locked_documents_rels_blog_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_posts_id");
  CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_messages_id");
  CREATE INDEX "payload_locked_documents_rels_newsletters_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletters_id");
  CREATE INDEX "payload_locked_documents_rels_seller_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("seller_requests_id");
  CREATE INDEX "payload_locked_documents_rels_property_types_id_idx" ON "payload_locked_documents_rels" USING btree ("property_types_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_rels_investors_id_idx" ON "payload_preferences_rels" USING btree ("investors_id");
  CREATE INDEX "payload_preferences_rels_sellers_id_idx" ON "payload_preferences_rels" USING btree ("sellers_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "locations" CASCADE;
  DROP TABLE "properties" CASCADE;
  DROP TABLE "properties_rels" CASCADE;
  DROP TABLE "features" CASCADE;
  DROP TABLE "investors_sessions" CASCADE;
  DROP TABLE "investors" CASCADE;
  DROP TABLE "sellers_sessions" CASCADE;
  DROP TABLE "sellers" CASCADE;
  DROP TABLE "verification_codes" CASCADE;
  DROP TABLE "property_views" CASCADE;
  DROP TABLE "property_views_rels" CASCADE;
  DROP TABLE "blog_categories" CASCADE;
  DROP TABLE "blog_posts_tags" CASCADE;
  DROP TABLE "blog_posts" CASCADE;
  DROP TABLE "contact_messages" CASCADE;
  DROP TABLE "newsletters_interests" CASCADE;
  DROP TABLE "newsletters" CASCADE;
  DROP TABLE "seller_requests" CASCADE;
  DROP TABLE "property_types" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_properties_listing_status";
  DROP TYPE "public"."enum_properties_construction_status";
  DROP TYPE "public"."enum_properties_details_heating_type";
  DROP TYPE "public"."enum_properties_location_meta_source";
  DROP TYPE "public"."enum_features_category";
  DROP TYPE "public"."enum_investors_verification_status";
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
  DROP TYPE "public"."enum_newsletters_interests";
  DROP TYPE "public"."enum_newsletters_status";
  DROP TYPE "public"."enum_newsletters_source";
  DROP TYPE "public"."enum_newsletters_preferences_frequency";
  DROP TYPE "public"."enum_seller_requests_status";`)
}
