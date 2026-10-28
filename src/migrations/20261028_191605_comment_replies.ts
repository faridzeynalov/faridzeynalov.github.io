import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "project_comments" ADD COLUMN "parent_id" integer;
  ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_parent_id_project_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."project_comments"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "project_comments_parent_idx" ON "project_comments" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "project_comments" DROP CONSTRAINT "project_comments_parent_id_project_comments_id_fk";
  
  DROP INDEX "project_comments_parent_idx";
  ALTER TABLE "project_comments" DROP COLUMN "parent_id";`)
}
