import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_icon" AS ENUM('code', 'palette', 'gauge', 'sparkles', 'plug', 'wrench');
  CREATE TYPE "public"."enum_ai_capabilities_icon" AS ENUM('bot', 'plug', 'messages', 'braces');
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"key" varchar NOT NULL,
  	"icon" "enum_services_icon" DEFAULT 'code' NOT NULL,
  	"active" boolean DEFAULT true,
  	"show_on_home" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services_locales" (
  	"title" varchar NOT NULL,
  	"tagline" varchar,
  	"description" varchar,
  	"deliverables" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "process_steps" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "process_steps_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faq" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faq_locales" (
  	"question" varchar NOT NULL,
  	"answer" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "translations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"section" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "translations_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "profile_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"active" boolean DEFAULT true
  );
  
  CREATE TABLE "profile_about_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_principles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"active" boolean DEFAULT true
  );
  
  CREATE TABLE "profile_principles_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"active" boolean DEFAULT true
  );
  
  CREATE TABLE "profile_skills_locales" (
  	"title" varchar,
  	"description" varchar,
  	"items" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_experience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"company" varchar,
  	"company_url" varchar,
  	"start" varchar,
  	"end" varchar,
  	"active" boolean DEFAULT true
  );
  
  CREATE TABLE "profile_experience_locales" (
  	"role" varchar,
  	"location" varchar,
  	"highlights" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_education" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"start" varchar,
  	"end" varchar,
  	"active" boolean DEFAULT true
  );
  
  CREATE TABLE "profile_education_locales" (
  	"degree" varchar,
  	"field" varchar,
  	"institution" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"active" boolean DEFAULT true
  );
  
  CREATE TABLE "profile_languages_locales" (
  	"name" varchar,
  	"level" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_certificates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"active" boolean DEFAULT true
  );
  
  CREATE TABLE "profile_certificates_locales" (
  	"name" varchar,
  	"period" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "profile_locales" (
  	"summary" varchar,
  	"cv_title" varchar,
  	"present" varchar,
  	"cv_summary" varchar,
  	"industries" varchar,
  	"industry_names_hospitality" varchar,
  	"industry_names_real_estate" varchar,
  	"industry_names_healthcare" varchar,
  	"industry_names_e_commerce" varchar,
  	"industry_names_corporate" varchar,
  	"industry_names_education" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ai_capabilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_ai_capabilities_icon" DEFAULT 'bot',
  	"active" boolean DEFAULT true
  );
  
  CREATE TABLE "ai_capabilities_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "ai" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tools" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "ai_locales" (
  	"intro" varchar,
  	"skills" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"pages_portfolio" boolean DEFAULT true,
  	"pages_services" boolean DEFAULT true,
  	"pages_about" boolean DEFAULT true,
  	"pages_contact" boolean DEFAULT true,
  	"pages_cv" boolean DEFAULT true,
  	"home_marquee" boolean DEFAULT true,
  	"home_selected_work" boolean DEFAULT true,
  	"home_services" boolean DEFAULT true,
  	"home_skills" boolean DEFAULT true,
  	"home_ai" boolean DEFAULT true,
  	"home_experience" boolean DEFAULT true,
  	"home_about" boolean DEFAULT true,
  	"home_contact" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "projects" ADD COLUMN "active" boolean DEFAULT true;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "process_steps_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "faq_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "translations_id" integer;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "process_steps_locales" ADD CONSTRAINT "process_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_locales" ADD CONSTRAINT "faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "translations_locales" ADD CONSTRAINT "translations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."translations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_about" ADD CONSTRAINT "profile_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_about_locales" ADD CONSTRAINT "profile_about_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_principles" ADD CONSTRAINT "profile_principles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_principles_locales" ADD CONSTRAINT "profile_principles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_principles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_skills_locales" ADD CONSTRAINT "profile_skills_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_experience" ADD CONSTRAINT "profile_experience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_experience_locales" ADD CONSTRAINT "profile_experience_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_education" ADD CONSTRAINT "profile_education_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_education_locales" ADD CONSTRAINT "profile_education_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_education"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_languages" ADD CONSTRAINT "profile_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_languages_locales" ADD CONSTRAINT "profile_languages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_languages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_certificates" ADD CONSTRAINT "profile_certificates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_certificates_locales" ADD CONSTRAINT "profile_certificates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_locales" ADD CONSTRAINT "profile_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_capabilities" ADD CONSTRAINT "ai_capabilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_capabilities_locales" ADD CONSTRAINT "ai_capabilities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai_capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_locales" ADD CONSTRAINT "ai_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services__order_idx" ON "services" USING btree ("_order");
  CREATE UNIQUE INDEX "services_key_idx" ON "services" USING btree ("key");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_locales_parent_id_idx" ON "services_locales" USING btree ("_parent_id");
  CREATE INDEX "process_steps__order_idx" ON "process_steps" USING btree ("_order");
  CREATE INDEX "process_steps_updated_at_idx" ON "process_steps" USING btree ("updated_at");
  CREATE INDEX "process_steps_created_at_idx" ON "process_steps" USING btree ("created_at");
  CREATE UNIQUE INDEX "process_steps_locales_locale_parent_id_unique" ON "process_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "process_steps_locales_parent_id_idx" ON "process_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "faq__order_idx" ON "faq" USING btree ("_order");
  CREATE INDEX "faq_updated_at_idx" ON "faq" USING btree ("updated_at");
  CREATE INDEX "faq_created_at_idx" ON "faq" USING btree ("created_at");
  CREATE UNIQUE INDEX "faq_locales_locale_parent_id_unique" ON "faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faq_locales_parent_id_idx" ON "faq_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "translations_key_idx" ON "translations" USING btree ("key");
  CREATE INDEX "translations_section_idx" ON "translations" USING btree ("section");
  CREATE INDEX "translations_updated_at_idx" ON "translations" USING btree ("updated_at");
  CREATE INDEX "translations_created_at_idx" ON "translations" USING btree ("created_at");
  CREATE UNIQUE INDEX "translations_locales_locale_parent_id_unique" ON "translations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "translations_locales_parent_id_idx" ON "translations_locales" USING btree ("_parent_id");
  CREATE INDEX "profile_about_order_idx" ON "profile_about" USING btree ("_order");
  CREATE INDEX "profile_about_parent_id_idx" ON "profile_about" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_about_locales_locale_parent_id_unique" ON "profile_about_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_about_locales_parent_id_idx" ON "profile_about_locales" USING btree ("_parent_id");
  CREATE INDEX "profile_principles_order_idx" ON "profile_principles" USING btree ("_order");
  CREATE INDEX "profile_principles_parent_id_idx" ON "profile_principles" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_principles_locales_locale_parent_id_unique" ON "profile_principles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_principles_locales_parent_id_idx" ON "profile_principles_locales" USING btree ("_parent_id");
  CREATE INDEX "profile_skills_order_idx" ON "profile_skills" USING btree ("_order");
  CREATE INDEX "profile_skills_parent_id_idx" ON "profile_skills" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_skills_locales_locale_parent_id_unique" ON "profile_skills_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_skills_locales_parent_id_idx" ON "profile_skills_locales" USING btree ("_parent_id");
  CREATE INDEX "profile_experience_order_idx" ON "profile_experience" USING btree ("_order");
  CREATE INDEX "profile_experience_parent_id_idx" ON "profile_experience" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_experience_locales_locale_parent_id_unique" ON "profile_experience_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_experience_locales_parent_id_idx" ON "profile_experience_locales" USING btree ("_parent_id");
  CREATE INDEX "profile_education_order_idx" ON "profile_education" USING btree ("_order");
  CREATE INDEX "profile_education_parent_id_idx" ON "profile_education" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_education_locales_locale_parent_id_unique" ON "profile_education_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_education_locales_parent_id_idx" ON "profile_education_locales" USING btree ("_parent_id");
  CREATE INDEX "profile_languages_order_idx" ON "profile_languages" USING btree ("_order");
  CREATE INDEX "profile_languages_parent_id_idx" ON "profile_languages" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_languages_locales_locale_parent_id_unique" ON "profile_languages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_languages_locales_parent_id_idx" ON "profile_languages_locales" USING btree ("_parent_id");
  CREATE INDEX "profile_certificates_order_idx" ON "profile_certificates" USING btree ("_order");
  CREATE INDEX "profile_certificates_parent_id_idx" ON "profile_certificates" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_certificates_locales_locale_parent_id_unique" ON "profile_certificates_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_certificates_locales_parent_id_idx" ON "profile_certificates_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_locales_locale_parent_id_unique" ON "profile_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_locales_parent_id_idx" ON "profile_locales" USING btree ("_parent_id");
  CREATE INDEX "ai_capabilities_order_idx" ON "ai_capabilities" USING btree ("_order");
  CREATE INDEX "ai_capabilities_parent_id_idx" ON "ai_capabilities" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "ai_capabilities_locales_locale_parent_id_unique" ON "ai_capabilities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "ai_capabilities_locales_parent_id_idx" ON "ai_capabilities_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "ai_locales_locale_parent_id_unique" ON "ai_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "ai_locales_parent_id_idx" ON "ai_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_process_steps_fk" FOREIGN KEY ("process_steps_id") REFERENCES "public"."process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faq_fk" FOREIGN KEY ("faq_id") REFERENCES "public"."faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_translations_fk" FOREIGN KEY ("translations_id") REFERENCES "public"."translations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_process_steps_id_idx" ON "payload_locked_documents_rels" USING btree ("process_steps_id");
  CREATE INDEX "payload_locked_documents_rels_faq_id_idx" ON "payload_locked_documents_rels" USING btree ("faq_id");
  CREATE INDEX "payload_locked_documents_rels_translations_id_idx" ON "payload_locked_documents_rels" USING btree ("translations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "process_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "translations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "translations_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_about" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_about_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_principles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_principles_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_skills" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_skills_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_experience" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_experience_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_education" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_education_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_languages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_languages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_certificates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_certificates_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ai_capabilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ai_capabilities_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ai" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ai_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP TABLE "process_steps" CASCADE;
  DROP TABLE "process_steps_locales" CASCADE;
  DROP TABLE "faq" CASCADE;
  DROP TABLE "faq_locales" CASCADE;
  DROP TABLE "translations" CASCADE;
  DROP TABLE "translations_locales" CASCADE;
  DROP TABLE "profile_about" CASCADE;
  DROP TABLE "profile_about_locales" CASCADE;
  DROP TABLE "profile_principles" CASCADE;
  DROP TABLE "profile_principles_locales" CASCADE;
  DROP TABLE "profile_skills" CASCADE;
  DROP TABLE "profile_skills_locales" CASCADE;
  DROP TABLE "profile_experience" CASCADE;
  DROP TABLE "profile_experience_locales" CASCADE;
  DROP TABLE "profile_education" CASCADE;
  DROP TABLE "profile_education_locales" CASCADE;
  DROP TABLE "profile_languages" CASCADE;
  DROP TABLE "profile_languages_locales" CASCADE;
  DROP TABLE "profile_certificates" CASCADE;
  DROP TABLE "profile_certificates_locales" CASCADE;
  DROP TABLE "profile" CASCADE;
  DROP TABLE "profile_locales" CASCADE;
  DROP TABLE "ai_capabilities" CASCADE;
  DROP TABLE "ai_capabilities_locales" CASCADE;
  DROP TABLE "ai" CASCADE;
  DROP TABLE "ai_locales" CASCADE;
  DROP TABLE "pages" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_process_steps_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_faq_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_translations_fk";
  
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  DROP INDEX "payload_locked_documents_rels_process_steps_id_idx";
  DROP INDEX "payload_locked_documents_rels_faq_id_idx";
  DROP INDEX "payload_locked_documents_rels_translations_id_idx";
  ALTER TABLE "projects" DROP COLUMN "active";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "process_steps_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "faq_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "translations_id";
  DROP TYPE "public"."enum_services_icon";
  DROP TYPE "public"."enum_ai_capabilities_icon";`)
}
