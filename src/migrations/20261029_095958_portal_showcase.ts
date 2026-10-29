import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_portal_showcase_features_icon" AS ENUM('stages', 'screens', 'comments', 'notify', 'secure');
  CREATE TYPE "public"."enum_portal_showcase_demo_stages_status" AS ENUM('todo', 'in_progress', 'review', 'done');
  CREATE TYPE "public"."enum_portal_showcase_demo_comments_from" AS ENUM('client', 'me');
  CREATE TYPE "public"."enum_portal_showcase_demo_status" AS ENUM('planned', 'active', 'paused', 'done');
  CREATE TABLE "portal_showcase_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title_az" varchar,
  	"title_en" varchar,
  	"title_ru" varchar,
  	"text_az" varchar,
  	"text_en" varchar,
  	"text_ru" varchar,
  	"icon" "enum_portal_showcase_features_icon" DEFAULT 'stages',
  	"active" boolean DEFAULT true
  );
  
  CREATE TABLE "portal_showcase_demo_stages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name_az" varchar,
  	"name_en" varchar,
  	"name_ru" varchar,
  	"status" "enum_portal_showcase_demo_stages_status" DEFAULT 'todo',
  	"note_az" varchar,
  	"note_en" varchar,
  	"note_ru" varchar
  );
  
  CREATE TABLE "portal_showcase_demo_comments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" "enum_portal_showcase_demo_comments_from" DEFAULT 'client',
  	"author_az" varchar,
  	"author_en" varchar,
  	"author_ru" varchar,
  	"text_az" varchar,
  	"text_en" varchar,
  	"text_ru" varchar
  );
  
  CREATE TABLE "portal_showcase" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow_az" varchar,
  	"eyebrow_en" varchar,
  	"eyebrow_ru" varchar,
  	"title_az" varchar,
  	"title_en" varchar,
  	"title_ru" varchar,
  	"accent_az" varchar,
  	"accent_en" varchar,
  	"accent_ru" varchar,
  	"description_az" varchar,
  	"description_en" varchar,
  	"description_ru" varchar,
  	"cta_az" varchar,
  	"cta_en" varchar,
  	"cta_ru" varchar,
  	"note_az" varchar,
  	"note_en" varchar,
  	"note_ru" varchar,
  	"demo_badge_az" varchar,
  	"demo_badge_en" varchar,
  	"demo_badge_ru" varchar,
  	"demo_project_az" varchar,
  	"demo_project_en" varchar,
  	"demo_project_ru" varchar,
  	"demo_client_az" varchar,
  	"demo_client_en" varchar,
  	"demo_client_ru" varchar,
  	"demo_status" "enum_portal_showcase_demo_status" DEFAULT 'active',
  	"demo_due" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages" ADD COLUMN "home_portal" boolean DEFAULT true;
  ALTER TABLE "portal_showcase_features" ADD CONSTRAINT "portal_showcase_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."portal_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portal_showcase_demo_stages" ADD CONSTRAINT "portal_showcase_demo_stages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."portal_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portal_showcase_demo_comments" ADD CONSTRAINT "portal_showcase_demo_comments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."portal_showcase"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "portal_showcase_features_order_idx" ON "portal_showcase_features" USING btree ("_order");
  CREATE INDEX "portal_showcase_features_parent_id_idx" ON "portal_showcase_features" USING btree ("_parent_id");
  CREATE INDEX "portal_showcase_demo_stages_order_idx" ON "portal_showcase_demo_stages" USING btree ("_order");
  CREATE INDEX "portal_showcase_demo_stages_parent_id_idx" ON "portal_showcase_demo_stages" USING btree ("_parent_id");
  CREATE INDEX "portal_showcase_demo_comments_order_idx" ON "portal_showcase_demo_comments" USING btree ("_order");
  CREATE INDEX "portal_showcase_demo_comments_parent_id_idx" ON "portal_showcase_demo_comments" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "portal_showcase_features" CASCADE;
  DROP TABLE "portal_showcase_demo_stages" CASCADE;
  DROP TABLE "portal_showcase_demo_comments" CASCADE;
  DROP TABLE "portal_showcase" CASCADE;
  ALTER TABLE "pages" DROP COLUMN "home_portal";
  DROP TYPE "public"."enum_portal_showcase_features_icon";
  DROP TYPE "public"."enum_portal_showcase_demo_stages_status";
  DROP TYPE "public"."enum_portal_showcase_demo_comments_from";
  DROP TYPE "public"."enum_portal_showcase_demo_status";`)
}
