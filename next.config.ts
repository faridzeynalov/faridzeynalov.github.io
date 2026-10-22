import type { NextConfig } from "next";

/**
 * Deployment base path.
 *
 * - Local dev / custom domain / `<user>.github.io` root repo: leave NEXT_PUBLIC_BASE_PATH unset.
 * - GitHub Pages project repo (`<user>.github.io/<repo>`): set NEXT_PUBLIC_BASE_PATH=/<repo>.
 *   The GitHub Actions workflow sets this automatically from `actions/configure-pages`.
 */
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const basePath =
  rawBasePath && rawBasePath !== "/" ? `/${rawBasePath.replace(/^\/+|\/+$/g, "")}` : "";

const nextConfig: NextConfig = {
  // Fully static output (`out/`) — GitHub Pages has no Node.js runtime.
  output: "export",
  // `/portfolio` -> `/portfolio/index.html`, which GitHub Pages serves without rewrites.
  trailingSlash: true,
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

export default nextConfig;
