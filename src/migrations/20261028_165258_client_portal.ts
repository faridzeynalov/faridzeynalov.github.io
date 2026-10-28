import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_client_projects_stages_status" AS ENUM('todo', 'in_progress', 'review', 'done');
  CREATE TYPE "public"."enum_client_projects_status" AS ENUM('planned', 'active', 'paused', 'done');
  CREATE TYPE "public"."enum_clients_language" AS ENUM('az', 'en', 'ru');
  CREATE TABLE "client_projects_stages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"status" "enum_client_projects_stages_status" DEFAULT 'todo' NOT NULL,
  	"due_date" timestamp(3) with time zone,
  	"note" varchar
  );
  
  CREATE TABLE "client_projects_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "client_projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"client_id" integer NOT NULL,
  	"status" "enum_client_projects_status" DEFAULT 'active' NOT NULL,
  	"start_date" timestamp(3) with time zone,
  	"due_date" timestamp(3) with time zone,
  	"summary" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "project_comments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"project_id" integer NOT NULL,
  	"body" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "project_comments_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"clients_id" integer
  );
  
  CREATE TABLE "clients_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "clients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"company" varchar,
  	"language" "enum_clients_language" DEFAULT 'az' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "client_projects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "project_comments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "clients_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "clients_id" integer;
  ALTER TABLE "client_projects_stages" ADD CONSTRAINT "client_projects_stages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."client_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "client_projects_links" ADD CONSTRAINT "client_projects_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."client_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "client_projects" ADD CONSTRAINT "client_projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_project_id_client_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."client_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_comments_rels" ADD CONSTRAINT "project_comments_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."project_comments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "project_comments_rels" ADD CONSTRAINT "project_comments_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "project_comments_rels" ADD CONSTRAINT "project_comments_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "clients_sessions" ADD CONSTRAINT "clients_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "client_projects_stages_order_idx" ON "client_projects_stages" USING btree ("_order");
  CREATE INDEX "client_projects_stages_parent_id_idx" ON "client_projects_stages" USING btree ("_parent_id");
  CREATE INDEX "client_projects_links_order_idx" ON "client_projects_links" USING btree ("_order");
  CREATE INDEX "client_projects_links_parent_id_idx" ON "client_projects_links" USING btree ("_parent_id");
  CREATE INDEX "client_projects_client_idx" ON "client_projects" USING btree ("client_id");
  CREATE INDEX "client_projects_updated_at_idx" ON "client_projects" USING btree ("updated_at");
  CREATE INDEX "client_projects_created_at_idx" ON "client_projects" USING btree ("created_at");
  CREATE INDEX "project_comments_project_idx" ON "project_comments" USING btree ("project_id");
  CREATE INDEX "project_comments_updated_at_idx" ON "project_comments" USING btree ("updated_at");
  CREATE INDEX "project_comments_created_at_idx" ON "project_comments" USING btree ("created_at");
  CREATE INDEX "project_comments_rels_order_idx" ON "project_comments_rels" USING btree ("order");
  CREATE INDEX "project_comments_rels_parent_idx" ON "project_comments_rels" USING btree ("parent_id");
  CREATE INDEX "project_comments_rels_path_idx" ON "project_comments_rels" USING btree ("path");
  CREATE INDEX "project_comments_rels_users_id_idx" ON "project_comments_rels" USING btree ("users_id");
  CREATE INDEX "project_comments_rels_clients_id_idx" ON "project_comments_rels" USING btree ("clients_id");
  CREATE INDEX "clients_sessions_order_idx" ON "clients_sessions" USING btree ("_order");
  CREATE INDEX "clients_sessions_parent_id_idx" ON "clients_sessions" USING btree ("_parent_id");
  CREATE INDEX "clients_updated_at_idx" ON "clients" USING btree ("updated_at");
  CREATE INDEX "clients_created_at_idx" ON "clients" USING btree ("created_at");
  CREATE UNIQUE INDEX "clients_email_idx" ON "clients" USING btree ("email");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_client_projects_fk" FOREIGN KEY ("client_projects_id") REFERENCES "public"."client_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_project_comments_fk" FOREIGN KEY ("project_comments_id") REFERENCES "public"."project_comments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_client_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("client_projects_id");
  CREATE INDEX "payload_locked_documents_rels_project_comments_id_idx" ON "payload_locked_documents_rels" USING btree ("project_comments_id");
  CREATE INDEX "payload_locked_documents_rels_clients_id_idx" ON "payload_locked_documents_rels" USING btree ("clients_id");
  CREATE INDEX "payload_preferences_rels_clients_id_idx" ON "payload_preferences_rels" USING btree ("clients_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "client_projects_stages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "client_projects_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "client_projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "project_comments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "project_comments_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "clients_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "clients" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "client_projects_stages" CASCADE;
  DROP TABLE "client_projects_links" CASCADE;
  DROP TABLE "client_projects" CASCADE;
  DROP TABLE "project_comments" CASCADE;
  DROP TABLE "project_comments_rels" CASCADE;
  DROP TABLE "clients_sessions" CASCADE;
  DROP TABLE "clients" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_client_projects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_project_comments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_clients_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_clients_fk";
  
  DROP INDEX "payload_locked_documents_rels_client_projects_id_idx";
  DROP INDEX "payload_locked_documents_rels_project_comments_id_idx";
  DROP INDEX "payload_locked_documents_rels_clients_id_idx";
  DROP INDEX "payload_preferences_rels_clients_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "client_projects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "project_comments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "clients_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "clients_id";
  DROP TYPE "public"."enum_client_projects_stages_status";
  DROP TYPE "public"."enum_client_projects_status";
  DROP TYPE "public"."enum_clients_language";`)
}
