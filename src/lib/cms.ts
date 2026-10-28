import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getContent } from "@/content";
import { getAi } from "@/data/ai";
import { getProfile } from "@/data/profile";
import { projectImages } from "@/data/project-images";
import { getProjectList } from "@/data/projects";
import { getFaq, getProcess, getServices } from "@/data/services";
import type { Locale } from "@/i18n/routing";
import { industryLabels, type ContentOverrides } from "@/lib/content-overrides";
import type { SiteOverrides } from "@/lib/site-overrides";
import type {
  Ai as AiDoc,
  Media,
  Page as PagesDoc,
  Profile as ProfileDoc,
  Project as ProjectDoc,
  Seo,
  SiteSetting,
} from "@/payload-types";
import { splitLines } from "@/payload/fields";
import {
  homeSections,
  switchablePages,
  type HomeSection,
  type SwitchablePage,
} from "@/payload/globals/pages";
import type { SeoPage } from "@/payload/globals/seo";
import { CMS_TAG } from "@/payload/hooks/revalidate-site";
import type { AiIcon, Faq, ProcessStep, Service, ServiceIcon } from "@/types/content";
import type { Industry, Project, ProjectImages, SiteLanguage } from "@/types/project";

/**
 * Part of the cache key below. The cache outlives deploys (Vercel keeps it), so bump this when
 * what loadCms returns changes shape or form (new fields, other file URLs), or old entries stay.
 */
const CMS_CACHE_VERSION = "2";

/**
 * Everything edited in the admin panel, in one language. Cached across requests and builds until
 * something is saved there (see revalidate-site.ts). Without a database (CI, a fresh checkout)
 * or when it can't be reached, this is null and the site uses its built-in content.
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
      const all = { locale, depth: 0, pagination: false, sort: "_order" } as const;
      const [settings, seo, profile, ai, pages, projects, services, process, faq, translations] =
        await Promise.all([
          payload.findGlobal({ slug: "site-settings", locale, depth: 1 }),
          payload.findGlobal({ slug: "seo", locale, depth: 1 }),
          payload.findGlobal({ slug: "profile", locale, depth: 0 }),
          payload.findGlobal({ slug: "ai", locale, depth: 0 }),
          payload.findGlobal({ slug: "pages", locale, depth: 0 }),
          payload.find({ collection: "projects", ...all, depth: 1 }),
          payload.find({ collection: "services", ...all }),
          payload.find({ collection: "process-steps", ...all }),
          payload.find({ collection: "faq", ...all }),
          payload.find({
            collection: "translations",
            locale,
            depth: 0,
            pagination: false,
            select: { key: true, value: true },
          }),
        ]);
      return {
        settings,
        seo,
        profile,
        ai,
        pages,
        projects: projects.docs,
        services: services.docs,
        process: process.docs,
        faq: faq.docs,
        translations: translations.docs.map(({ key, value }) => [key, value ?? ""] as const),
      };
    } catch (error) {
      console.error("Admin content unavailable, using the built-in content:", error);
      return null;
    }
  },
  ["cms", CMS_CACHE_VERSION],
  { tags: [CMS_TAG] },
);

export const getCms = cache(loadCms);

/* ------------------------------------------------------------------ Site settings */

/** Only the settings that were filled in. */
export function toSiteOverrides(settings: SiteSetting | null | undefined): SiteOverrides {
  if (!settings) return {};
  const cv = typeof settings.cv === "object" ? settings.cv : null;
  const qr = typeof settings.support?.qr === "object" ? settings.support.qr : null;
  const values: Record<keyof Omit<SiteOverrides, "pages" | "kofeQr">, string | null | undefined> = {
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
    cvUrl: cv?.url,
    kofeUrl: settings.support?.url,
  };
  return {
    ...Object.fromEntries(
      Object.entries(values).flatMap(([key, value]) =>
        value?.trim() ? [[key, value.trim()]] : [],
      ),
    ),
    ...(qr?.url
      ? { kofeQr: { src: qr.url, width: qr.width ?? 512, height: qr.height ?? 512 } }
      : {}),
  };
}

export async function getSiteOverrides(locale: Locale): Promise<SiteOverrides> {
  const cms = await getCms(locale);
  return { ...toSiteOverrides(cms?.settings), pages: toPageSwitches(cms?.pages) };
}

/* ------------------------------------------------------------------ Pages on / off */

export interface PageSwitches {
  pages: Record<SwitchablePage, boolean>;
  home: Record<HomeSection, boolean>;
}

/** Everything is shown unless switched off in the admin's "Səhifələr". */
export function toPageSwitches(doc: PagesDoc | null | undefined): PageSwitches {
  const pages = (doc?.pages ?? {}) as Partial<Record<SwitchablePage, boolean | null>>;
  const home = (doc?.home ?? {}) as Partial<Record<HomeSection, boolean | null>>;
  return {
    pages: Object.fromEntries(
      switchablePages.map((page) => [page, pages[page] !== false]),
    ) as Record<SwitchablePage, boolean>,
    home: Object.fromEntries(
      homeSections.map((section) => [section, home[section] !== false]),
    ) as Record<HomeSection, boolean>,
  };
}

export async function getPageSwitches(locale: Locale) {
  return toPageSwitches((await getCms(locale))?.pages);
}

/* ------------------------------------------------------------------ Profile and AI */

const active = <T extends { active?: boolean | null }>(rows: T[] | null | undefined) =>
  (rows ?? []).filter((row) => row.active !== false);
const filled = <T>(items: T[]) => (items.length ? items : undefined);

/** Profile, AI, principles and industry names from the admin, where filled in. */
export function toContentOverrides(
  locale: Locale,
  profile: ProfileDoc | null | undefined,
  ai: AiDoc | null | undefined,
): ContentOverrides {
  const builtIn = getContent(locale);
  const present = profile?.present?.trim() || builtIn.profile.present;
  const names = profile?.industryNames ?? {};
  const industries: ContentOverrides["industries"] = Object.fromEntries(
    (
      [
        ["hospitality", names.hospitality],
        ["real-estate", names.realEstate],
        ["healthcare", names.healthcare],
        ["e-commerce", names.eCommerce],
        ["corporate", names.corporate],
        ["education", names.education],
      ] as [Industry, string | null | undefined][]
    ).flatMap(([id, name]) => (name?.trim() ? [[id, name.trim()]] : [])),
  );
  const capabilities = active(ai?.capabilities).map((row) => ({
    title: row.title ?? "",
    description: row.description ?? "",
    icon: (row.icon ?? "bot") as AiIcon,
  }));
  const builtInAi = getAi(locale);

  return {
    profile: profile
      ? {
          summary: profile.summary?.trim() || undefined,
          cv:
            profile.cvTitle || profile.cvSummary
              ? {
                  title: profile.cvTitle || builtIn.profile.cv.title,
                  summary: profile.cvSummary || builtIn.profile.cv.summary,
                }
              : undefined,
          industries: filled(splitLines(profile.industries)),
          about: filled(
            active(profile.about)
              .map((row) => row.text ?? "")
              .filter(Boolean),
          ),
          skills: filled(
            active(profile.skills).map((row) => ({
              title: row.title ?? "",
              description: row.description ?? "",
              items: splitLines(row.items),
            })),
          ),
          experience: filled(
            active(profile.experience).map((row) => ({
              role: row.role ?? "",
              company: row.company ?? "",
              companyUrl: row.companyUrl || undefined,
              location: row.location ?? "",
              start: row.start ?? "",
              end: row.end?.trim() || present,
              highlights: splitLines(row.highlights),
            })),
          ),
          education: filled(
            active(profile.education).map((row) => ({
              degree: row.degree ?? "",
              field: row.field ?? "",
              institution: row.institution ?? "",
              start: row.start ?? "",
              end: row.end ?? "",
            })),
          ),
          languages: filled(
            active(profile.languages).map((row) => ({
              name: row.name ?? "",
              level: row.level ?? "",
            })),
          ),
          certificates: filled(
            active(profile.certificates).map((row) => ({
              name: row.name ?? "",
              period: row.period ?? "",
            })),
          ),
        }
      : undefined,
    principles: filled(
      active(profile?.principles).map((row) => ({ title: row.title ?? "", text: row.text ?? "" })),
    ),
    industries,
    ai:
      ai && (capabilities.length || ai.intro)
        ? {
            intro: ai.intro?.trim() || builtInAi.intro,
            capabilities: capabilities.length ? capabilities : builtInAi.capabilities,
            tools: filled(splitLines(ai.tools)) ?? builtInAi.tools,
            skills: filled(splitLines(ai.skills)) ?? builtInAi.skills,
          }
        : undefined,
  };
}

export async function getContentOverrides(locale: Locale): Promise<ContentOverrides> {
  const cms = await getCms(locale);
  return toContentOverrides(locale, cms?.profile, cms?.ai);
}

/** The profile with the admin's site settings and Profil applied, for async code. */
export async function getSiteProfile(locale: Locale) {
  const [site, content] = await Promise.all([
    getSiteOverrides(locale),
    getContentOverrides(locale),
  ]);
  return getProfile(locale, site, content.profile);
}

export async function getSiteAi(locale: Locale) {
  return (await getContentOverrides(locale)).ai ?? getAi(locale);
}

export async function getPrinciples(locale: Locale) {
  return (await getContentOverrides(locale)).principles ?? getContent(locale).principles;
}

export async function getIndustryNames(locale: Locale) {
  return industryLabels(locale, await getContentOverrides(locale));
}

/* ------------------------------------------------------------------ Interface texts */

/** Interface texts edited under "Tərcümələr", as message keys ("Nav.home") and their text. */
export async function getTranslationOverrides(locale: Locale) {
  return ((await getCms(locale))?.translations ?? []).filter(([, value]) => value.trim());
}

/* ------------------------------------------------------------------ SEO */

export interface SeoOverrides {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: { url: string; width?: number; height?: number };
}

/** A page's title, description, keywords and share image as set in the admin's SEO. */
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

/* ------------------------------------------------------------------ Services */

/**
 * Services, process steps and FAQ in one language (only active ones), from the admin. A list
 * with nothing in it there keeps the built-in content. `home` is the services shown on the
 * home page.
 */
export async function getServicesContent(locale: Locale): Promise<{
  services: Service[];
  home: Service[];
  process: ProcessStep[];
  faq: Faq[];
}> {
  const cms = await getCms(locale);
  const docs = active(cms?.services);
  const toService = (doc: (typeof docs)[number]): Service => ({
    id: doc.key,
    icon: doc.icon as ServiceIcon,
    title: doc.title ?? "",
    tagline: doc.tagline ?? "",
    description: doc.description ?? "",
    deliverables: splitLines(doc.deliverables),
  });
  const process = active(cms?.process).map((doc) => ({
    title: doc.title ?? "",
    description: doc.description ?? "",
  }));
  const faq = active(cms?.faq).map((doc) => ({
    question: doc.question ?? "",
    answer: doc.answer ?? "",
  }));
  const services = cms?.services?.length ? docs.map(toService) : getServices(locale);
  return {
    services,
    home: cms?.services?.length
      ? docs.filter((doc) => doc.showOnHome !== false).map(toService)
      : services,
    process: cms?.process?.length ? process : getProcess(locale),
    faq: cms?.faq?.length ? faq : getFaq(locale),
  };
}

/* ------------------------------------------------------------------ Projects */

/** For uploads saved before blur placeholders were made (see collections/media.ts). */
const BLUR = "data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";

function toImage(media: number | Media | null | undefined) {
  if (!media || typeof media !== "object" || !media.url) return undefined;
  return {
    src: media.url,
    width: media.width ?? 1440,
    height: media.height ?? 900,
    blurDataURL: media.blurDataURL || BLUR,
  };
}

/** Screenshots uploaded in the admin, falling back to the built-in captures for the slug. */
function projectImagesOf(doc: ProjectDoc): ProjectImages | undefined {
  const builtIn = projectImages[doc.slug];
  const cover = toImage(doc.images?.cover) ?? builtIn?.cover;
  const thumb = toImage(doc.images?.thumb) ?? builtIn?.thumb ?? cover;
  const mobile = toImage(doc.images?.mobile) ?? builtIn?.mobile;
  const section = toImage(doc.images?.section) ?? builtIn?.section;
  return cover && thumb && mobile ? { cover, thumb, mobile, section } : undefined;
}

/**
 * Every active project in one language, in the order set in the admin's Portfolio. Without
 * projects there, the built-in list.
 */
export async function getProjects(locale: Locale): Promise<Project[]> {
  const docs = (await getCms(locale))?.projects;
  if (!docs?.length) return getProjectList(locale);
  return active(docs).map((doc) => ({
    slug: doc.slug,
    name: doc.name,
    domain: doc.domain,
    url: doc.url,
    industry: doc.industry as Industry,
    group: doc.group || undefined,
    stack: splitLines(doc.stack),
    languages: (doc.languages ?? []) as SiteLanguage[],
    accent: doc.accent || "#888888",
    featured: doc.featured ?? false,
    summary: doc.summary ?? "",
    overview: doc.overview ?? "",
    liveFeatures: splitLines(doc.liveFeatures),
    note: doc.note || undefined,
    unavailableReason: doc.unavailableReason || undefined,
    images: projectImagesOf(doc),
  }));
}
