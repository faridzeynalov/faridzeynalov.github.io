import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getProfile } from "@/data/profile";
import type { Locale } from "@/i18n/routing";
import type { SiteOverrides } from "@/lib/site-overrides";
import type { Media, Seo, SiteSetting } from "@/payload-types";
import type { SeoPage } from "@/payload/globals/seo";
import { CMS_TAG } from "@/payload/hooks/revalidate-site";

/**
 * The admin panel's globals in one language. Cached across requests and builds until something
 * is saved in the admin (see revalidateSite). Without a database (CI, a fresh checkout) or when
 * it can't be reached, this is null and the site uses its built-in text.
 */
const loadCms = unstable_cache(
  async (locale: Locale) => {
    if (!process.env.DATABASE_URL) return null;
    try {
      const [{ getPayload }, { default: config }] = await Promise.all([
        import("payload"),
        import("@payload-config"),
      ]);
      const payload = await getPayload({ config });
      const [settings, seo] = await Promise.all([
        payload.findGlobal({ slug: "site-settings", locale, depth: 0 }),
        payload.findGlobal({ slug: "seo", locale, depth: 1 }),
      ]);
      return { settings, seo };
    } catch (error) {
      console.error("Admin content unavailable, using the built-in text:", error);
      return null;
    }
  },
  ["cms"],
  { tags: [CMS_TAG] },
);

export const getCms = cache(loadCms);

/** Only the settings that were filled in. */
export function toSiteOverrides(settings: SiteSetting | null | undefined): SiteOverrides {
  if (!settings) return {};
  const values: Record<keyof SiteOverrides, string | null | undefined> = {
    name: settings.name,
    role: settings.role,
    location: settings.location,
    email: settings.email,
    phone: settings.phone,
    yearsOfExperience: settings.yearsOfExperience,
    sitesShipped: settings.sitesShipped,
    linkedIn: settings.links?.linkedIn,
    github: settings.links?.github,
    instagram: settings.links?.instagram,
  };
  return Object.fromEntries(
    Object.entries(values).flatMap(([key, value]) => (value?.trim() ? [[key, value.trim()]] : [])),
  );
}

export async function getSiteOverrides(locale: Locale) {
  return toSiteOverrides((await getCms(locale))?.settings);
}

/** The profile with the admin's site settings applied, for async code (metadata, pages). */
export async function getSiteProfile(locale: Locale) {
  return getProfile(locale, await getSiteOverrides(locale));
}

export interface SeoOverrides {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: { url: string; width?: number; height?: number };
}

/** A page's title, description, keywords and share image as set in the admin's SEO tab. */
export async function getSeo(locale: Locale, page: SeoPage): Promise<SeoOverrides> {
  const seo: Seo | undefined = (await getCms(locale))?.seo;
  if (!seo) return {};
  const fields = seo[page];
  const image = typeof seo.ogImage === "object" ? (seo.ogImage as Media | null) : null;
  const keywords = seo.keywords
    ?.split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  return {
    title: fields?.title?.trim() || undefined,
    description: fields?.description?.trim() || undefined,
    keywords: keywords?.length ? keywords : undefined,
    ogImage: image?.url
      ? { url: image.url, width: image.width ?? undefined, height: image.height ?? undefined }
      : undefined,
  };
}
