import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "project_screens" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"project_id" integer NOT NULL,
  	"title" varchar NOT NULL,
  	"note" varchar,
  	"_objectkey" varchar,
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
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar
  );
  
  ALTER TABLE "project_comments" ADD COLUMN "screen_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "project_screens_id" integer;
  ALTER TABLE "project_screens" ADD CONSTRAINT "project_screens_project_id_client_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."client_projects"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "project_screens_project_idx" ON "project_screens" USING btree ("project_id");
  CREATE INDEX "project_screens_updated_at_idx" ON "project_screens" USING btree ("updated_at");
  CREATE INDEX "project_screens_created_at_idx" ON "project_screens" USING btree ("created_at");
  CREATE UNIQUE INDEX "project_screens_filename_idx" ON "project_screens" USING btree ("filename");
  CREATE INDEX "project_screens_sizes_thumb_sizes_thumb_filename_idx" ON "project_screens" USING btree ("sizes_thumb_filename");
  ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_screen_id_project_screens_id_fk" FOREIGN KEY ("screen_id") REFERENCES "public"."project_screens"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_project_screens_fk" FOREIGN KEY ("project_screens_id") REFERENCES "public"."project_screens"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "project_comments_screen_idx" ON "project_comments" USING btree ("screen_id");
  CREATE INDEX "payload_locked_documents_rels_project_screens_id_idx" ON "payload_locked_documents_rels" USING btree ("project_screens_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "project_screens" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "project_screens" CASCADE;
  ALTER TABLE "project_comments" DROP CONSTRAINT "project_comments_screen_id_project_screens_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_project_screens_fk";
  
  DROP INDEX "project_comments_screen_idx";
  DROP INDEX "payload_locked_documents_rels_project_screens_id_idx";
  ALTER TABLE "project_comments" DROP COLUMN "screen_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "project_screens_id";`)
}
