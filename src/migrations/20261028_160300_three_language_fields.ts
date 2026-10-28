import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The AZ titles are required in the admin form, not in the table: existing rows get theirs when
// the content is restored (scripts/restore-content.ts).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP TABLE "process_steps_locales" CASCADE;
  DROP TABLE "faq_locales" CASCADE;
  DROP TABLE "translations_locales" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "profile_about_locales" CASCADE;
  DROP TABLE "profile_principles_locales" CASCADE;
  DROP TABLE "profile_skills_locales" CASCADE;
  DROP TABLE "profile_experience_locales" CASCADE;
  DROP TABLE "profile_education_locales" CASCADE;
  DROP TABLE "profile_languages_locales" CASCADE;
  DROP TABLE "profile_certificates_locales" CASCADE;
  DROP TABLE "profile_locales" CASCADE;
  DROP TABLE "ai_capabilities_locales" CASCADE;
  DROP TABLE "ai_locales" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "seo_locales" CASCADE;
  ALTER TABLE "projects" ADD COLUMN "summary_az" varchar;
  ALTER TABLE "projects" ADD COLUMN "summary_en" varchar;
  ALTER TABLE "projects" ADD COLUMN "summary_ru" varchar;
  ALTER TABLE "projects" ADD COLUMN "overview_az" varchar;
  ALTER TABLE "projects" ADD COLUMN "overview_en" varchar;
  ALTER TABLE "projects" ADD COLUMN "overview_ru" varchar;
  ALTER TABLE "projects" ADD COLUMN "live_features_az" varchar;
  ALTER TABLE "projects" ADD COLUMN "live_features_en" varchar;
  ALTER TABLE "projects" ADD COLUMN "live_features_ru" varchar;
  ALTER TABLE "projects" ADD COLUMN "note_az" varchar;
  ALTER TABLE "projects" ADD COLUMN "note_en" varchar;
  ALTER TABLE "projects" ADD COLUMN "note_ru" varchar;
  ALTER TABLE "projects" ADD COLUMN "unavailable_reason_az" varchar;
  ALTER TABLE "projects" ADD COLUMN "unavailable_reason_en" varchar;
  ALTER TABLE "projects" ADD COLUMN "unavailable_reason_ru" varchar;
  ALTER TABLE "services" ADD COLUMN "title_az" varchar;
  ALTER TABLE "services" ADD COLUMN "title_en" varchar;
  ALTER TABLE "services" ADD COLUMN "title_ru" varchar;
  ALTER TABLE "services" ADD COLUMN "tagline_az" varchar;
  ALTER TABLE "services" ADD COLUMN "tagline_en" varchar;
  ALTER TABLE "services" ADD COLUMN "tagline_ru" varchar;
  ALTER TABLE "services" ADD COLUMN "description_az" varchar;
  ALTER TABLE "services" ADD COLUMN "description_en" varchar;
  ALTER TABLE "services" ADD COLUMN "description_ru" varchar;
  ALTER TABLE "services" ADD COLUMN "deliverables_az" varchar;
  ALTER TABLE "services" ADD COLUMN "deliverables_en" varchar;
  ALTER TABLE "services" ADD COLUMN "deliverables_ru" varchar;
  ALTER TABLE "services" ADD COLUMN "admin_title" varchar;
  ALTER TABLE "process_steps" ADD COLUMN "title_az" varchar;
  ALTER TABLE "process_steps" ADD COLUMN "title_en" varchar;
  ALTER TABLE "process_steps" ADD COLUMN "title_ru" varchar;
  ALTER TABLE "process_steps" ADD COLUMN "description_az" varchar;
  ALTER TABLE "process_steps" ADD COLUMN "description_en" varchar;
  ALTER TABLE "process_steps" ADD COLUMN "description_ru" varchar;
  ALTER TABLE "process_steps" ADD COLUMN "admin_title" varchar;
  ALTER TABLE "faq" ADD COLUMN "question_az" varchar;
  ALTER TABLE "faq" ADD COLUMN "question_en" varchar;
  ALTER TABLE "faq" ADD COLUMN "question_ru" varchar;
  ALTER TABLE "faq" ADD COLUMN "answer_az" varchar;
  ALTER TABLE "faq" ADD COLUMN "answer_en" varchar;
  ALTER TABLE "faq" ADD COLUMN "answer_ru" varchar;
  ALTER TABLE "faq" ADD COLUMN "admin_title" varchar;
  ALTER TABLE "translations" ADD COLUMN "az" varchar;
  ALTER TABLE "translations" ADD COLUMN "en" varchar;
  ALTER TABLE "translations" ADD COLUMN "ru" varchar;
  ALTER TABLE "media" ADD COLUMN "alt" varchar;
  ALTER TABLE "profile_about" ADD COLUMN "text_az" varchar;
  ALTER TABLE "profile_about" ADD COLUMN "text_en" varchar;
  ALTER TABLE "profile_about" ADD COLUMN "text_ru" varchar;
  ALTER TABLE "profile_principles" ADD COLUMN "title_az" varchar;
  ALTER TABLE "profile_principles" ADD COLUMN "title_en" varchar;
  ALTER TABLE "profile_principles" ADD COLUMN "title_ru" varchar;
  ALTER TABLE "profile_principles" ADD COLUMN "text_az" varchar;
  ALTER TABLE "profile_principles" ADD COLUMN "text_en" varchar;
  ALTER TABLE "profile_principles" ADD COLUMN "text_ru" varchar;
  ALTER TABLE "profile_skills" ADD COLUMN "title_az" varchar;
  ALTER TABLE "profile_skills" ADD COLUMN "title_en" varchar;
  ALTER TABLE "profile_skills" ADD COLUMN "title_ru" varchar;
  ALTER TABLE "profile_skills" ADD COLUMN "description_az" varchar;
  ALTER TABLE "profile_skills" ADD COLUMN "description_en" varchar;
  ALTER TABLE "profile_skills" ADD COLUMN "description_ru" varchar;
  ALTER TABLE "profile_skills" ADD COLUMN "items_az" varchar;
  ALTER TABLE "profile_skills" ADD COLUMN "items_en" varchar;
  ALTER TABLE "profile_skills" ADD COLUMN "items_ru" varchar;
  ALTER TABLE "profile_experience" ADD COLUMN "role_az" varchar;
  ALTER TABLE "profile_experience" ADD COLUMN "role_en" varchar;
  ALTER TABLE "profile_experience" ADD COLUMN "role_ru" varchar;
  ALTER TABLE "profile_experience" ADD COLUMN "location_az" varchar;
  ALTER TABLE "profile_experience" ADD COLUMN "location_en" varchar;
  ALTER TABLE "profile_experience" ADD COLUMN "location_ru" varchar;
  ALTER TABLE "profile_experience" ADD COLUMN "highlights_az" varchar;
  ALTER TABLE "profile_experience" ADD COLUMN "highlights_en" varchar;
  ALTER TABLE "profile_experience" ADD COLUMN "highlights_ru" varchar;
  ALTER TABLE "profile_education" ADD COLUMN "degree_az" varchar;
  ALTER TABLE "profile_education" ADD COLUMN "degree_en" varchar;
  ALTER TABLE "profile_education" ADD COLUMN "degree_ru" varchar;
  ALTER TABLE "profile_education" ADD COLUMN "field_az" varchar;
  ALTER TABLE "profile_education" ADD COLUMN "field_en" varchar;
  ALTER TABLE "profile_education" ADD COLUMN "field_ru" varchar;
  ALTER TABLE "profile_education" ADD COLUMN "institution_az" varchar;
  ALTER TABLE "profile_education" ADD COLUMN "institution_en" varchar;
  ALTER TABLE "profile_education" ADD COLUMN "institution_ru" varchar;
  ALTER TABLE "profile_languages" ADD COLUMN "name_az" varchar;
  ALTER TABLE "profile_languages" ADD COLUMN "name_en" varchar;
  ALTER TABLE "profile_languages" ADD COLUMN "name_ru" varchar;
  ALTER TABLE "profile_languages" ADD COLUMN "level_az" varchar;
  ALTER TABLE "profile_languages" ADD COLUMN "level_en" varchar;
  ALTER TABLE "profile_languages" ADD COLUMN "level_ru" varchar;
  ALTER TABLE "profile_certificates" ADD COLUMN "name_az" varchar;
  ALTER TABLE "profile_certificates" ADD COLUMN "name_en" varchar;
  ALTER TABLE "profile_certificates" ADD COLUMN "name_ru" varchar;
  ALTER TABLE "profile_certificates" ADD COLUMN "period_az" varchar;
  ALTER TABLE "profile_certificates" ADD COLUMN "period_en" varchar;
  ALTER TABLE "profile_certificates" ADD COLUMN "period_ru" varchar;
  ALTER TABLE "profile" ADD COLUMN "summary_az" varchar;
  ALTER TABLE "profile" ADD COLUMN "summary_en" varchar;
  ALTER TABLE "profile" ADD COLUMN "summary_ru" varchar;
  ALTER TABLE "profile" ADD COLUMN "cv_title_az" varchar;
  ALTER TABLE "profile" ADD COLUMN "cv_title_en" varchar;
  ALTER TABLE "profile" ADD COLUMN "cv_title_ru" varchar;
  ALTER TABLE "profile" ADD COLUMN "cv_summary_az" varchar;
  ALTER TABLE "profile" ADD COLUMN "cv_summary_en" varchar;
  ALTER TABLE "profile" ADD COLUMN "cv_summary_ru" varchar;
  ALTER TABLE "profile" ADD COLUMN "present_az" varchar;
  ALTER TABLE "profile" ADD COLUMN "present_en" varchar;
  ALTER TABLE "profile" ADD COLUMN "present_ru" varchar;
  ALTER TABLE "profile" ADD COLUMN "industries_az" varchar;
  ALTER TABLE "profile" ADD COLUMN "industries_en" varchar;
  ALTER TABLE "profile" ADD COLUMN "industries_ru" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_hospitality_az" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_hospitality_en" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_hospitality_ru" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_real_estate_az" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_real_estate_en" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_real_estate_ru" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_healthcare_az" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_healthcare_en" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_healthcare_ru" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_e_commerce_az" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_e_commerce_en" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_e_commerce_ru" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_corporate_az" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_corporate_en" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_corporate_ru" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_education_az" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_education_en" varchar;
  ALTER TABLE "profile" ADD COLUMN "industry_names_education_ru" varchar;
  ALTER TABLE "ai_capabilities" ADD COLUMN "title_az" varchar;
  ALTER TABLE "ai_capabilities" ADD COLUMN "title_en" varchar;
  ALTER TABLE "ai_capabilities" ADD COLUMN "title_ru" varchar;
  ALTER TABLE "ai_capabilities" ADD COLUMN "description_az" varchar;
  ALTER TABLE "ai_capabilities" ADD COLUMN "description_en" varchar;
  ALTER TABLE "ai_capabilities" ADD COLUMN "description_ru" varchar;
  ALTER TABLE "ai" ADD COLUMN "intro_az" varchar;
  ALTER TABLE "ai" ADD COLUMN "intro_en" varchar;
  ALTER TABLE "ai" ADD COLUMN "intro_ru" varchar;
  ALTER TABLE "ai" ADD COLUMN "skills_az" varchar;
  ALTER TABLE "ai" ADD COLUMN "skills_en" varchar;
  ALTER TABLE "ai" ADD COLUMN "skills_ru" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "role_az" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "role_en" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "role_ru" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "location_az" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "location_en" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "location_ru" varchar;
  ALTER TABLE "seo" ADD COLUMN "keywords_az" varchar;
  ALTER TABLE "seo" ADD COLUMN "keywords_en" varchar;
  ALTER TABLE "seo" ADD COLUMN "keywords_ru" varchar;
  ALTER TABLE "seo" ADD COLUMN "home_title_az" varchar;
  ALTER TABLE "seo" ADD COLUMN "home_title_en" varchar;
  ALTER TABLE "seo" ADD COLUMN "home_title_ru" varchar;
  ALTER TABLE "seo" ADD COLUMN "home_description_az" varchar;
  ALTER TABLE "seo" ADD COLUMN "home_description_en" varchar;
  ALTER TABLE "seo" ADD COLUMN "home_description_ru" varchar;
  ALTER TABLE "seo" ADD COLUMN "portfolio_title_az" varchar;
  ALTER TABLE "seo" ADD COLUMN "portfolio_title_en" varchar;
  ALTER TABLE "seo" ADD COLUMN "portfolio_title_ru" varchar;
  ALTER TABLE "seo" ADD COLUMN "portfolio_description_az" varchar;
  ALTER TABLE "seo" ADD COLUMN "portfolio_description_en" varchar;
  ALTER TABLE "seo" ADD COLUMN "portfolio_description_ru" varchar;
  ALTER TABLE "seo" ADD COLUMN "services_title_az" varchar;
  ALTER TABLE "seo" ADD COLUMN "services_title_en" varchar;
  ALTER TABLE "seo" ADD COLUMN "services_title_ru" varchar;
  ALTER TABLE "seo" ADD COLUMN "services_description_az" varchar;
  ALTER TABLE "seo" ADD COLUMN "services_description_en" varchar;
  ALTER TABLE "seo" ADD COLUMN "services_description_ru" varchar;
  ALTER TABLE "seo" ADD COLUMN "about_title_az" varchar;
  ALTER TABLE "seo" ADD COLUMN "about_title_en" varchar;
  ALTER TABLE "seo" ADD COLUMN "about_title_ru" varchar;
  ALTER TABLE "seo" ADD COLUMN "about_description_az" varchar;
  ALTER TABLE "seo" ADD COLUMN "about_description_en" varchar;
  ALTER TABLE "seo" ADD COLUMN "about_description_ru" varchar;
  ALTER TABLE "seo" ADD COLUMN "contact_title_az" varchar;
  ALTER TABLE "seo" ADD COLUMN "contact_title_en" varchar;
  ALTER TABLE "seo" ADD COLUMN "contact_title_ru" varchar;
  ALTER TABLE "seo" ADD COLUMN "contact_description_az" varchar;
  ALTER TABLE "seo" ADD COLUMN "contact_description_en" varchar;
  ALTER TABLE "seo" ADD COLUMN "contact_description_ru" varchar;
  ALTER TABLE "seo" ADD COLUMN "cv_title_az" varchar;
  ALTER TABLE "seo" ADD COLUMN "cv_title_en" varchar;
  ALTER TABLE "seo" ADD COLUMN "cv_title_ru" varchar;
  ALTER TABLE "seo" ADD COLUMN "cv_description_az" varchar;
  ALTER TABLE "seo" ADD COLUMN "cv_description_en" varchar;
  ALTER TABLE "seo" ADD COLUMN "cv_description_ru" varchar;
  DROP TYPE "public"."_locales";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('az', 'en', 'ru');
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
  
  CREATE TABLE "services_locales" (
  	"title" varchar NOT NULL,
  	"tagline" varchar,
  	"description" varchar,
  	"deliverables" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "process_steps_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faq_locales" (
  	"question" varchar NOT NULL,
  	"answer" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "translations_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "profile_about_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_principles_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_skills_locales" (
  	"title" varchar,
  	"description" varchar,
  	"items" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_experience_locales" (
  	"role" varchar,
  	"location" varchar,
  	"highlights" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_education_locales" (
  	"degree" varchar,
  	"field" varchar,
  	"institution" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_languages_locales" (
  	"name" varchar,
  	"level" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_certificates_locales" (
  	"name" varchar,
  	"period" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
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
  
  CREATE TABLE "ai_capabilities_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "ai_locales" (
  	"intro" varchar,
  	"skills" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_locales" (
  	"role" varchar,
  	"location" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "seo_locales" (
  	"keywords" varchar,
  	"home_title" varchar,
  	"home_description" varchar,
  	"portfolio_title" varchar,
  	"portfolio_description" varchar,
  	"services_title" varchar,
  	"services_description" varchar,
  	"about_title" varchar,
  	"about_description" varchar,
  	"contact_title" varchar,
  	"contact_description" varchar,
  	"cv_title" varchar,
  	"cv_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "process_steps_locales" ADD CONSTRAINT "process_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_locales" ADD CONSTRAINT "faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "translations_locales" ADD CONSTRAINT "translations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."translations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_about_locales" ADD CONSTRAINT "profile_about_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_principles_locales" ADD CONSTRAINT "profile_principles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_principles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_skills_locales" ADD CONSTRAINT "profile_skills_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_experience_locales" ADD CONSTRAINT "profile_experience_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_education_locales" ADD CONSTRAINT "profile_education_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_education"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_languages_locales" ADD CONSTRAINT "profile_languages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_languages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_certificates_locales" ADD CONSTRAINT "profile_certificates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_locales" ADD CONSTRAINT "profile_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_capabilities_locales" ADD CONSTRAINT "ai_capabilities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai_capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_locales" ADD CONSTRAINT "ai_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seo_locales" ADD CONSTRAINT "seo_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seo"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_locales_parent_id_idx" ON "projects_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_locales_parent_id_idx" ON "services_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "process_steps_locales_locale_parent_id_unique" ON "process_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "process_steps_locales_parent_id_idx" ON "process_steps_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "faq_locales_locale_parent_id_unique" ON "faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faq_locales_parent_id_idx" ON "faq_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "translations_locales_locale_parent_id_unique" ON "translations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "translations_locales_parent_id_idx" ON "translations_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_about_locales_locale_parent_id_unique" ON "profile_about_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_about_locales_parent_id_idx" ON "profile_about_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_principles_locales_locale_parent_id_unique" ON "profile_principles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_principles_locales_parent_id_idx" ON "profile_principles_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_skills_locales_locale_parent_id_unique" ON "profile_skills_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_skills_locales_parent_id_idx" ON "profile_skills_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_experience_locales_locale_parent_id_unique" ON "profile_experience_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_experience_locales_parent_id_idx" ON "profile_experience_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_education_locales_locale_parent_id_unique" ON "profile_education_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_education_locales_parent_id_idx" ON "profile_education_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_languages_locales_locale_parent_id_unique" ON "profile_languages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_languages_locales_parent_id_idx" ON "profile_languages_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_certificates_locales_locale_parent_id_unique" ON "profile_certificates_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_certificates_locales_parent_id_idx" ON "profile_certificates_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_locales_locale_parent_id_unique" ON "profile_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_locales_parent_id_idx" ON "profile_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "ai_capabilities_locales_locale_parent_id_unique" ON "ai_capabilities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "ai_capabilities_locales_parent_id_idx" ON "ai_capabilities_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "ai_locales_locale_parent_id_unique" ON "ai_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "ai_locales_parent_id_idx" ON "ai_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "seo_locales_locale_parent_id_unique" ON "seo_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "seo_locales_parent_id_idx" ON "seo_locales" USING btree ("_parent_id");
  ALTER TABLE "projects" DROP COLUMN "summary_az";
  ALTER TABLE "projects" DROP COLUMN "summary_en";
  ALTER TABLE "projects" DROP COLUMN "summary_ru";
  ALTER TABLE "projects" DROP COLUMN "overview_az";
  ALTER TABLE "projects" DROP COLUMN "overview_en";
  ALTER TABLE "projects" DROP COLUMN "overview_ru";
  ALTER TABLE "projects" DROP COLUMN "live_features_az";
  ALTER TABLE "projects" DROP COLUMN "live_features_en";
  ALTER TABLE "projects" DROP COLUMN "live_features_ru";
  ALTER TABLE "projects" DROP COLUMN "note_az";
  ALTER TABLE "projects" DROP COLUMN "note_en";
  ALTER TABLE "projects" DROP COLUMN "note_ru";
  ALTER TABLE "projects" DROP COLUMN "unavailable_reason_az";
  ALTER TABLE "projects" DROP COLUMN "unavailable_reason_en";
  ALTER TABLE "projects" DROP COLUMN "unavailable_reason_ru";
  ALTER TABLE "services" DROP COLUMN "title_az";
  ALTER TABLE "services" DROP COLUMN "title_en";
  ALTER TABLE "services" DROP COLUMN "title_ru";
  ALTER TABLE "services" DROP COLUMN "tagline_az";
  ALTER TABLE "services" DROP COLUMN "tagline_en";
  ALTER TABLE "services" DROP COLUMN "tagline_ru";
  ALTER TABLE "services" DROP COLUMN "description_az";
  ALTER TABLE "services" DROP COLUMN "description_en";
  ALTER TABLE "services" DROP COLUMN "description_ru";
  ALTER TABLE "services" DROP COLUMN "deliverables_az";
  ALTER TABLE "services" DROP COLUMN "deliverables_en";
  ALTER TABLE "services" DROP COLUMN "deliverables_ru";
  ALTER TABLE "services" DROP COLUMN "admin_title";
  ALTER TABLE "process_steps" DROP COLUMN "title_az";
  ALTER TABLE "process_steps" DROP COLUMN "title_en";
  ALTER TABLE "process_steps" DROP COLUMN "title_ru";
  ALTER TABLE "process_steps" DROP COLUMN "description_az";
  ALTER TABLE "process_steps" DROP COLUMN "description_en";
  ALTER TABLE "process_steps" DROP COLUMN "description_ru";
  ALTER TABLE "process_steps" DROP COLUMN "admin_title";
  ALTER TABLE "faq" DROP COLUMN "question_az";
  ALTER TABLE "faq" DROP COLUMN "question_en";
  ALTER TABLE "faq" DROP COLUMN "question_ru";
  ALTER TABLE "faq" DROP COLUMN "answer_az";
  ALTER TABLE "faq" DROP COLUMN "answer_en";
  ALTER TABLE "faq" DROP COLUMN "answer_ru";
  ALTER TABLE "faq" DROP COLUMN "admin_title";
  ALTER TABLE "translations" DROP COLUMN "az";
  ALTER TABLE "translations" DROP COLUMN "en";
  ALTER TABLE "translations" DROP COLUMN "ru";
  ALTER TABLE "media" DROP COLUMN "alt";
  ALTER TABLE "profile_about" DROP COLUMN "text_az";
  ALTER TABLE "profile_about" DROP COLUMN "text_en";
  ALTER TABLE "profile_about" DROP COLUMN "text_ru";
  ALTER TABLE "profile_principles" DROP COLUMN "title_az";
  ALTER TABLE "profile_principles" DROP COLUMN "title_en";
  ALTER TABLE "profile_principles" DROP COLUMN "title_ru";
  ALTER TABLE "profile_principles" DROP COLUMN "text_az";
  ALTER TABLE "profile_principles" DROP COLUMN "text_en";
  ALTER TABLE "profile_principles" DROP COLUMN "text_ru";
  ALTER TABLE "profile_skills" DROP COLUMN "title_az";
  ALTER TABLE "profile_skills" DROP COLUMN "title_en";
  ALTER TABLE "profile_skills" DROP COLUMN "title_ru";
  ALTER TABLE "profile_skills" DROP COLUMN "description_az";
  ALTER TABLE "profile_skills" DROP COLUMN "description_en";
  ALTER TABLE "profile_skills" DROP COLUMN "description_ru";
  ALTER TABLE "profile_skills" DROP COLUMN "items_az";
  ALTER TABLE "profile_skills" DROP COLUMN "items_en";
  ALTER TABLE "profile_skills" DROP COLUMN "items_ru";
  ALTER TABLE "profile_experience" DROP COLUMN "role_az";
  ALTER TABLE "profile_experience" DROP COLUMN "role_en";
  ALTER TABLE "profile_experience" DROP COLUMN "role_ru";
  ALTER TABLE "profile_experience" DROP COLUMN "location_az";
  ALTER TABLE "profile_experience" DROP COLUMN "location_en";
  ALTER TABLE "profile_experience" DROP COLUMN "location_ru";
  ALTER TABLE "profile_experience" DROP COLUMN "highlights_az";
  ALTER TABLE "profile_experience" DROP COLUMN "highlights_en";
  ALTER TABLE "profile_experience" DROP COLUMN "highlights_ru";
  ALTER TABLE "profile_education" DROP COLUMN "degree_az";
  ALTER TABLE "profile_education" DROP COLUMN "degree_en";
  ALTER TABLE "profile_education" DROP COLUMN "degree_ru";
  ALTER TABLE "profile_education" DROP COLUMN "field_az";
  ALTER TABLE "profile_education" DROP COLUMN "field_en";
  ALTER TABLE "profile_education" DROP COLUMN "field_ru";
  ALTER TABLE "profile_education" DROP COLUMN "institution_az";
  ALTER TABLE "profile_education" DROP COLUMN "institution_en";
  ALTER TABLE "profile_education" DROP COLUMN "institution_ru";
  ALTER TABLE "profile_languages" DROP COLUMN "name_az";
  ALTER TABLE "profile_languages" DROP COLUMN "name_en";
  ALTER TABLE "profile_languages" DROP COLUMN "name_ru";
  ALTER TABLE "profile_languages" DROP COLUMN "level_az";
  ALTER TABLE "profile_languages" DROP COLUMN "level_en";
  ALTER TABLE "profile_languages" DROP COLUMN "level_ru";
  ALTER TABLE "profile_certificates" DROP COLUMN "name_az";
  ALTER TABLE "profile_certificates" DROP COLUMN "name_en";
  ALTER TABLE "profile_certificates" DROP COLUMN "name_ru";
  ALTER TABLE "profile_certificates" DROP COLUMN "period_az";
  ALTER TABLE "profile_certificates" DROP COLUMN "period_en";
  ALTER TABLE "profile_certificates" DROP COLUMN "period_ru";
  ALTER TABLE "profile" DROP COLUMN "summary_az";
  ALTER TABLE "profile" DROP COLUMN "summary_en";
  ALTER TABLE "profile" DROP COLUMN "summary_ru";
  ALTER TABLE "profile" DROP COLUMN "cv_title_az";
  ALTER TABLE "profile" DROP COLUMN "cv_title_en";
  ALTER TABLE "profile" DROP COLUMN "cv_title_ru";
  ALTER TABLE "profile" DROP COLUMN "cv_summary_az";
  ALTER TABLE "profile" DROP COLUMN "cv_summary_en";
  ALTER TABLE "profile" DROP COLUMN "cv_summary_ru";
  ALTER TABLE "profile" DROP COLUMN "present_az";
  ALTER TABLE "profile" DROP COLUMN "present_en";
  ALTER TABLE "profile" DROP COLUMN "present_ru";
  ALTER TABLE "profile" DROP COLUMN "industries_az";
  ALTER TABLE "profile" DROP COLUMN "industries_en";
  ALTER TABLE "profile" DROP COLUMN "industries_ru";
  ALTER TABLE "profile" DROP COLUMN "industry_names_hospitality_az";
  ALTER TABLE "profile" DROP COLUMN "industry_names_hospitality_en";
  ALTER TABLE "profile" DROP COLUMN "industry_names_hospitality_ru";
  ALTER TABLE "profile" DROP COLUMN "industry_names_real_estate_az";
  ALTER TABLE "profile" DROP COLUMN "industry_names_real_estate_en";
  ALTER TABLE "profile" DROP COLUMN "industry_names_real_estate_ru";
  ALTER TABLE "profile" DROP COLUMN "industry_names_healthcare_az";
  ALTER TABLE "profile" DROP COLUMN "industry_names_healthcare_en";
  ALTER TABLE "profile" DROP COLUMN "industry_names_healthcare_ru";
  ALTER TABLE "profile" DROP COLUMN "industry_names_e_commerce_az";
  ALTER TABLE "profile" DROP COLUMN "industry_names_e_commerce_en";
  ALTER TABLE "profile" DROP COLUMN "industry_names_e_commerce_ru";
  ALTER TABLE "profile" DROP COLUMN "industry_names_corporate_az";
  ALTER TABLE "profile" DROP COLUMN "industry_names_corporate_en";
  ALTER TABLE "profile" DROP COLUMN "industry_names_corporate_ru";
  ALTER TABLE "profile" DROP COLUMN "industry_names_education_az";
  ALTER TABLE "profile" DROP COLUMN "industry_names_education_en";
  ALTER TABLE "profile" DROP COLUMN "industry_names_education_ru";
  ALTER TABLE "ai_capabilities" DROP COLUMN "title_az";
  ALTER TABLE "ai_capabilities" DROP COLUMN "title_en";
  ALTER TABLE "ai_capabilities" DROP COLUMN "title_ru";
  ALTER TABLE "ai_capabilities" DROP COLUMN "description_az";
  ALTER TABLE "ai_capabilities" DROP COLUMN "description_en";
  ALTER TABLE "ai_capabilities" DROP COLUMN "description_ru";
  ALTER TABLE "ai" DROP COLUMN "intro_az";
  ALTER TABLE "ai" DROP COLUMN "intro_en";
  ALTER TABLE "ai" DROP COLUMN "intro_ru";
  ALTER TABLE "ai" DROP COLUMN "skills_az";
  ALTER TABLE "ai" DROP COLUMN "skills_en";
  ALTER TABLE "ai" DROP COLUMN "skills_ru";
  ALTER TABLE "site_settings" DROP COLUMN "role_az";
  ALTER TABLE "site_settings" DROP COLUMN "role_en";
  ALTER TABLE "site_settings" DROP COLUMN "role_ru";
  ALTER TABLE "site_settings" DROP COLUMN "location_az";
  ALTER TABLE "site_settings" DROP COLUMN "location_en";
  ALTER TABLE "site_settings" DROP COLUMN "location_ru";
  ALTER TABLE "seo" DROP COLUMN "keywords_az";
  ALTER TABLE "seo" DROP COLUMN "keywords_en";
  ALTER TABLE "seo" DROP COLUMN "keywords_ru";
  ALTER TABLE "seo" DROP COLUMN "home_title_az";
  ALTER TABLE "seo" DROP COLUMN "home_title_en";
  ALTER TABLE "seo" DROP COLUMN "home_title_ru";
  ALTER TABLE "seo" DROP COLUMN "home_description_az";
  ALTER TABLE "seo" DROP COLUMN "home_description_en";
  ALTER TABLE "seo" DROP COLUMN "home_description_ru";
  ALTER TABLE "seo" DROP COLUMN "portfolio_title_az";
  ALTER TABLE "seo" DROP COLUMN "portfolio_title_en";
  ALTER TABLE "seo" DROP COLUMN "portfolio_title_ru";
  ALTER TABLE "seo" DROP COLUMN "portfolio_description_az";
  ALTER TABLE "seo" DROP COLUMN "portfolio_description_en";
  ALTER TABLE "seo" DROP COLUMN "portfolio_description_ru";
  ALTER TABLE "seo" DROP COLUMN "services_title_az";
  ALTER TABLE "seo" DROP COLUMN "services_title_en";
  ALTER TABLE "seo" DROP COLUMN "services_title_ru";
  ALTER TABLE "seo" DROP COLUMN "services_description_az";
  ALTER TABLE "seo" DROP COLUMN "services_description_en";
  ALTER TABLE "seo" DROP COLUMN "services_description_ru";
  ALTER TABLE "seo" DROP COLUMN "about_title_az";
  ALTER TABLE "seo" DROP COLUMN "about_title_en";
  ALTER TABLE "seo" DROP COLUMN "about_title_ru";
  ALTER TABLE "seo" DROP COLUMN "about_description_az";
  ALTER TABLE "seo" DROP COLUMN "about_description_en";
  ALTER TABLE "seo" DROP COLUMN "about_description_ru";
  ALTER TABLE "seo" DROP COLUMN "contact_title_az";
  ALTER TABLE "seo" DROP COLUMN "contact_title_en";
  ALTER TABLE "seo" DROP COLUMN "contact_title_ru";
  ALTER TABLE "seo" DROP COLUMN "contact_description_az";
  ALTER TABLE "seo" DROP COLUMN "contact_description_en";
  ALTER TABLE "seo" DROP COLUMN "contact_description_ru";
  ALTER TABLE "seo" DROP COLUMN "cv_title_az";
  ALTER TABLE "seo" DROP COLUMN "cv_title_en";
  ALTER TABLE "seo" DROP COLUMN "cv_title_ru";
  ALTER TABLE "seo" DROP COLUMN "cv_description_az";
  ALTER TABLE "seo" DROP COLUMN "cv_description_en";
  ALTER TABLE "seo" DROP COLUMN "cv_description_ru";`)
}
