/** Base path the site is served under. Empty on faridzeynalov.com; only needed to serve the
 * export from a sub-folder (set NEXT_PUBLIC_BASE_PATH at build time). */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** The site's public home. */
export const PRODUCTION_URL = "https://faridzeynalov.com";

/**
 * Absolute public URL of the site, used for canonical URLs, Open Graph, the sitemap and
 * robots.txt. Every build points at the production domain (so preview deployments don't
 * compete with it in search); NEXT_PUBLIC_SITE_URL overrides it.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_URL).replace(/\/+$/, "");

/** Strips the base path from a URL that already contains it (e.g. a static image import). */
export function withoutBasePath(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

/** Prefixes a root-relative path to a file in `public/` with the deployment base path. */
export function withBasePath(path: string) {
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Main menu. Labels come from the "Nav" messages (key = label key). */
export const navItems = [
  { key: "home", href: "/" },
  { key: "portfolio", href: "/portfolio" },
  { key: "services", href: "/services" },
  { key: "cv", href: "/cv" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;
