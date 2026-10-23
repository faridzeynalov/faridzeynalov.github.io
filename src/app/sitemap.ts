import type { MetadataRoute } from "next";
import { projectSlugs } from "@/data/projects";
import { routing } from "@/i18n/routing";
import { localizedPath } from "@/lib/i18n-metadata";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

const pages = [
  { path: "/", priority: 1 },
  { path: "/portfolio", priority: 0.9 },
  { path: "/services", priority: 0.9 },
  { path: "/about", priority: 0.8 },
  { path: "/contact", priority: 0.8 },
  { path: "/cv", priority: 0.8 },
  ...projectSlugs.map((slug) => ({ path: `/portfolio/${slug}`, priority: 0.7 })),
];

const absolute = (path: string) => (path === "/" ? `${siteUrl}/` : `${siteUrl}${path}`);

/** Every page in every language, each listing its translations as hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  return pages.flatMap(({ path, priority }) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [locale, absolute(localizedPath(locale, path))]),
    );
    return routing.locales.map((locale) => ({
      url: absolute(localizedPath(locale, path)),
      priority: locale === routing.defaultLocale ? priority : priority * 0.9,
      alternates: { languages },
    }));
  });
}
