import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "services_page_services" CASCADE;
  DROP TABLE "services_page_services_locales" CASCADE;
  DROP TABLE "services_page_process" CASCADE;
  DROP TABLE "services_page_process_locales" CASCADE;
  DROP TABLE "services_page_faq" CASCADE;
  DROP TABLE "services_page_faq_locales" CASCADE;
  DROP TABLE "services_page" CASCADE;
  DROP TYPE "public"."enum_services_page_services_icon";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_page_services_icon" AS ENUM('code', 'palette', 'gauge', 'sparkles', 'plug', 'wrench');
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
  
  ALTER TABLE "services_page_services" ADD CONSTRAINT "services_page_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_page_services_locales" ADD CONSTRAINT "services_page_services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_page_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_page_process" ADD CONSTRAINT "services_page_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_page_process_locales" ADD CONSTRAINT "services_page_process_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_page_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_page_faq" ADD CONSTRAINT "services_page_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_page_faq_locales" ADD CONSTRAINT "services_page_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_page_faq"("id") ON DELETE cascade ON UPDATE no action;
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
  CREATE INDEX "services_page_faq_locales_parent_id_idx" ON "services_page_faq_locales" USING btree ("_parent_id");`)
}
