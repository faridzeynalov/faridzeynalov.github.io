import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Deployment base path. Leave NEXT_PUBLIC_BASE_PATH unset for faridzeynalov.com (served from the
 * domain root on Vercel); set it only to serve the site from a sub-folder.
 */
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const basePath =
  rawBasePath && rawBasePath !== "/" ? `/${rawBasePath.replace(/^\/+|\/+$/g, "")}` : "";

const nextConfig: NextConfig = {
  // The public pages are still prerendered to static HTML at build time; the server only runs
  // the admin panel (/admin) and its API. Redirects and headers live in vercel.json.
  trailingSlash: false,
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    // Assets are pre-optimized to WebP (see scripts/optimize-captures.mjs).
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withPayload(withNextIntl(nextConfig));
