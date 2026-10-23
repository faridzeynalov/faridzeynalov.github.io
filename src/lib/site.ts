/** Base path the site is deployed under (e.g. `/portfolio-repo` on GitHub Pages project sites). */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Absolute public URL of the deployed site, used for canonical URLs and Open Graph.
 * Set NEXT_PUBLIC_SITE_URL at build time (the GitHub Actions workflow does this automatically).
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

/** Strips the base path from a URL that already contains it (e.g. a static image import). */
export function withoutBasePath(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

/** Prefixes a root-relative path to a file in `public/` with the deployment base path. */
export function withBasePath(path: string) {
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/portfolio/" },
  { label: "Services", href: "/#services" },
  { label: "CV", href: "/cv/" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;
