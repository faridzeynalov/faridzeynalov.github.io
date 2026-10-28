import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { az } from "@payloadcms/translations/languages/az";
import { en } from "@payloadcms/translations/languages/en";
import { ru } from "@payloadcms/translations/languages/ru";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import sharp from "sharp";
import { migrations } from "./migrations";
import { Media } from "@/payload/collections/media";
import { Users } from "@/payload/collections/users";
import { Seo } from "@/payload/globals/seo";
import { SiteSettings } from "@/payload/globals/site-settings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The admin panel at /admin (Payload CMS): content lives in Neon Postgres, uploads in Vercel
 * Blob. Every text field can be filled in per language, and a field left empty in a language
 * keeps the text built into the site for that language (so there is no cross-language fallback).
 */
export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
    meta: { titleSuffix: " · Admin" },
  },
  i18n: { supportedLanguages: { az, en, ru }, fallbackLanguage: "az" },
  localization: {
    locales: [
      { code: "az", label: "Azərbaycanca" },
      { code: "en", label: "English" },
      { code: "ru", label: "Русский" },
    ],
    defaultLocale: "az",
    fallback: false,
  },
  collections: [Users, Media],
  globals: [SiteSettings, Seo],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  // Local development uses the same database as the live site, so the schema is never pushed
  // automatically: changes go through migrations (npm run payload -- migrate:create <name>).
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL ?? "" },
    push: false,
    migrationDir: path.resolve(dirname, "migrations"),
    // Deployed builds apply pending migrations when the server first starts.
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
});
