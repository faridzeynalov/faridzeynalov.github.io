import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "blur_data_u_r_l" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "cv_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "support_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "support_qr_id" integer;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_cv_id_media_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_support_qr_id_media_id_fk" FOREIGN KEY ("support_qr_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_cv_idx" ON "site_settings" USING btree ("cv_id");
  CREATE INDEX "site_settings_support_support_qr_idx" ON "site_settings" USING btree ("support_qr_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_cv_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_support_qr_id_media_id_fk";
  
  DROP INDEX "site_settings_cv_idx";
  DROP INDEX "site_settings_support_support_qr_idx";
  ALTER TABLE "media" DROP COLUMN "blur_data_u_r_l";
  ALTER TABLE "site_settings" DROP COLUMN "cv_id";
  ALTER TABLE "site_settings" DROP COLUMN "support_url";
  ALTER TABLE "site_settings" DROP COLUMN "support_qr_id";`)
}
