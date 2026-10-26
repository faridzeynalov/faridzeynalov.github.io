import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Deployment base path. Leave NEXT_PUBLIC_BASE_PATH unset for faridzeynalov.com (served from the
 * domain root on Vercel); set it only to serve the export from a sub-folder.
 */
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const basePath =
  rawBasePath && rawBasePath !== "/" ? `/${rawBasePath.replace(/^\/+|\/+$/g, "")}` : "";

const nextConfig: NextConfig = {
  // Fully static output (`out/`), served from Vercel's CDN: nothing to run. Redirects and
  // headers live in vercel.json.
  output: "export",
  // Clean URLs without a trailing slash: `/az/about` -> `az/about.html`, which Vercel serves for
  // the extensionless path (and redirects `/az/about/` to).
  trailingSlash: false,
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    // The default image optimizer needs a server. Assets are pre-optimized to WebP instead
    // (see scripts/optimize-captures.mjs).
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

export default withNextIntl(nextConfig);
