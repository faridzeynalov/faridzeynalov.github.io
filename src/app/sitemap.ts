import type { MetadataRoute } from "next";
import { getPageSwitches, getProjects } from "@/lib/cms";
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
];

const absolute = (path: string) => (path === "/" ? `${siteUrl}/` : `${siteUrl}${path}`);

/** Every page in every language, each listing its translations as hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = (await getProjects(routing.defaultLocale)).map(({ slug }) => ({
    path: `/portfolio/${slug}`,
    priority: 0.7,
  }));
  // Pages switched off in the admin panel are left out.
  const { pages: enabled } = await getPageSwitches(routing.defaultLocale);
  const shown = (path: string) => {
    const page = path.split("/")[1] as keyof typeof enabled;
    return !page || enabled[page] !== false;
  };
  return [...pages, ...projects]
    .filter(({ path }) => shown(path))
    .flatMap(({ path, priority }) => {
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
