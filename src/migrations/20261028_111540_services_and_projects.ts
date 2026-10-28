import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_languages" AS ENUM('az', 'en', 'ru');
  CREATE TYPE "public"."enum_projects_industry" AS ENUM('hospitality', 'real-estate', 'healthcare', 'e-commerce', 'corporate', 'education');
  CREATE TYPE "public"."enum_services_page_services_icon" AS ENUM('code', 'palette', 'gauge', 'sparkles', 'plug', 'wrench');
  CREATE TABLE "projects_languages" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_projects_languages",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"domain" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"industry" "enum_projects_industry" NOT NULL,
  	"group" varchar,
  	"accent" varchar DEFAULT '#888888',
  	"stack" varchar,
  	"featured" boolean DEFAULT false,
  	"images_cover_id" integer,
  	"images_thumb_id" integer,
  	"images_mobile_id" integer,
  	"images_section_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects_locales" (
  	"summary" varchar,
  	"overview" varchar,
  	"live_features" varchar,
  	"note" varchar,
  	"unavailable_reason" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "services_page_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"icon" "enum_services_page_services_icon" DEFAULT 'code' NOT NULL
  );
  
  CREATE TABLE "services_page_services_locales" (
  	"title" varchar,
  	"tagline" varchar,
  	"description" varchar,
  	"deliverables" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_page_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "services_page_process_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_page_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "services_page_faq_locales" (
  	"question" varchar,
  	"answer" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "projects_id" integer;
  ALTER TABLE "projects_languages" ADD CONSTRAINT "projects_languages_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_images_cover_id_media_id_fk" FOREIGN KEY ("images_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_images_thumb_id_media_id_fk" FOREIGN KEY ("images_thumb_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_images_mobile_id_media_id_fk" FOREIGN KEY ("images_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_images_section_id_media_id_fk" FOREIGN KEY ("images_section_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_page_services" ADD CONSTRAINT "services_page_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_page_services_locales" ADD CONSTRAINT "services_page_services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_page_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_page_process" ADD CONSTRAINT "services_page_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_page_process_locales" ADD CONSTRAINT "services_page_process_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_page_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_page_faq" ADD CONSTRAINT "services_page_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_page_faq_locales" ADD CONSTRAINT "services_page_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_page_faq"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_languages_order_idx" ON "projects_languages" USING btree ("order");
  CREATE INDEX "projects_languages_parent_idx" ON "projects_languages" USING btree ("parent_id");
  CREATE INDEX "projects__order_idx" ON "projects" USING btree ("_order");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_images_images_cover_idx" ON "projects" USING btree ("images_cover_id");
  CREATE INDEX "projects_images_images_thumb_idx" ON "projects" USING btree ("images_thumb_id");
  CREATE INDEX "projects_images_images_mobile_idx" ON "projects" USING btree ("images_mobile_id");
  CREATE INDEX "projects_images_images_section_idx" ON "projects" USING btree ("images_section_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_locales_parent_id_idx" ON "projects_locales" USING btree ("_parent_id");
  CREATE INDEX "services_page_services_order_idx" ON "services_page_services" USING btree ("_order");
  CREATE INDEX "services_page_services_parent_id_idx" ON "services_page_services" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_page_services_locales_locale_parent_id_unique" ON "services_page_services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_page_services_locales_parent_id_idx" ON "services_page_services_locales" USING btree ("_parent_id");
  CREATE INDEX "services_page_process_order_idx" ON "services_page_process" USING btree ("_order");
  CREATE INDEX "services_page_process_parent_id_idx" ON "services_page_process" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_page_process_locales_locale_parent_id_unique" ON "services_page_process_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_page_process_locales_parent_id_idx" ON "services_page_process_locales" USING btree ("_parent_id");
  CREATE INDEX "services_page_faq_order_idx" ON "services_page_faq" USING btree ("_order");
  CREATE INDEX "services_page_faq_parent_id_idx" ON "services_page_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_page_faq_locales_locale_parent_id_unique" ON "services_page_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_page_faq_locales_parent_id_idx" ON "services_page_faq_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects_languages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_page_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_page_services_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_page_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_page_process_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_page_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_page_faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_page" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "projects_languages" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "services_page_services" CASCADE;
  DROP TABLE "services_page_services_locales" CASCADE;
  DROP TABLE "services_page_process" CASCADE;
  DROP TABLE "services_page_process_locales" CASCADE;
  DROP TABLE "services_page_faq" CASCADE;
  DROP TABLE "services_page_faq_locales" CASCADE;
  DROP TABLE "services_page" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_projects_fk";
  
  DROP INDEX "payload_locked_documents_rels_projects_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "projects_id";
  DROP TYPE "public"."enum_projects_languages";
  DROP TYPE "public"."enum_projects_industry";
  DROP TYPE "public"."enum_services_page_services_icon";`)
}
