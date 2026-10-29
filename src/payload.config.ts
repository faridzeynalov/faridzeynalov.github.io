import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { az } from "@payloadcms/translations/languages/az";
import { en } from "@payloadcms/translations/languages/en";
import { ru } from "@payloadcms/translations/languages/ru";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resendAdapter } from "@payloadcms/email-resend";
import { buildConfig } from "payload";
import sharp from "sharp";
import { migrations } from "./migrations";
import { ClientProjects } from "@/payload/collections/client-projects";
import { Clients } from "@/payload/collections/clients";
import { Faq } from "@/payload/collections/faq";
import { Media } from "@/payload/collections/media";
import { ProcessSteps } from "@/payload/collections/process-steps";
import { ProjectComments } from "@/payload/collections/project-comments";
import { ProjectScreens } from "@/payload/collections/project-screens";
import { Projects } from "@/payload/collections/projects";
import { Services } from "@/payload/collections/services";
import { Translations } from "@/payload/collections/translations";
import { Users } from "@/payload/collections/users";
import { Ai } from "@/payload/globals/ai";
import { PortalShowcase } from "@/payload/globals/portal-showcase";
import { Pages } from "@/payload/globals/pages";
import { Profile } from "@/payload/globals/profile";
import { Seo } from "@/payload/globals/seo";
import { SiteSettings } from "@/payload/globals/site-settings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The admin panel at /admin (Payload CMS): content lives in Neon Postgres, uploads in Vercel
 * Blob. Every text is a group of three inputs (AZ, EN, RU) edited in one form, without Payload's
 * localization; a language left empty keeps the text built into the site for that language.
 */
export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
    meta: {
      titleSuffix: " · Farid Zeynalov Admin",
      icons: [{ rel: "icon", type: "image/svg+xml", url: "/icon.svg" }],
    },
    components: {
      graphics: {
        Logo: "/payload/components/brand#Logo",
        Icon: "/payload/components/brand#Icon",
      },
      beforeDashboard: ["/payload/components/dashboard-intro#DashboardIntro"],
      beforeNavLinks: [
        "/payload/components/nav-extras#NavHeader",
        "/payload/components/nav-stats#NavBadges",
      ],
      afterNavLinks: ["/payload/components/nav-stats#NavFooter"],
    },
    theme: "all",
    avatar: { Component: "/payload/components/avatar#Avatar" },
  },
  i18n: { supportedLanguages: { az, en, ru }, fallbackLanguage: "az" },
  collections: [
    Projects,
    Services,
    ProcessSteps,
    Faq,
    ClientProjects,
    ProjectScreens,
    ProjectComments,
    Clients,
    Translations,
    Media,
    Users,
  ],
  globals: [Profile, Ai, PortalShowcase, SiteSettings, Pages, Seo],
  editor: lexicalEditor(),
  // Invitations, password resets and comment notifications go out through Resend (without a key,
  // e.g. locally, Payload prints them to the console instead).
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.EMAIL_FROM || "noreply@faridzeynalov.com",
        defaultFromName: "Farid Zeynalov",
      })
    : undefined,
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
      // Media is public: files are served straight from Blob's CDN, not through the API. Project
      // screens are private: Payload serves them after checking who's asking.
      collections: { media: { disablePayloadAccessControl: true }, "project-screens": true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
});
