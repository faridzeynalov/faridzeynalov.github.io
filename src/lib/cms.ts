import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getContent } from "@/content";
import { getAi } from "@/data/ai";
import { getPortalShowcase as builtInShowcase, type PortalShowcase } from "@/data/portal-showcase";
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
  PortalShowcase as PortalShowcaseDoc,
  Profile as ProfileDoc,
  Project as ProjectDoc,
  Seo,
  SiteSetting,
} from "@/payload-types";
import { pick, splitLines, type I18nValue } from "@/payload/fields";
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
const CMS_CACHE_VERSION = "4";

/**
 * Everything edited in the admin panel, every text in all three languages ({ az, en, ru }; the
 * functions below pick one). Cached across requests and builds until
 * something is saved there (see revalidate-site.ts). Without a database (CI, a fresh checkout)
 * or when it can't be reached, this is null and the site uses its built-in content.
 */
const loadCms = unstable_cache(
  async () => {
    if (!process.env.DATABASE_URL) return null;
    try {
      const [{ getPayload }, { default: config }] = await Promise.all([
        import("payload"),
        import("@payload-config"),
      ]);
      const payload = await getPayload({ config });
      const all = { depth: 0, pagination: false, sort: "_order" } as const;
      const [
        settings,
        seo,
        profile,
        ai,
        portalShowcase,
        pages,
        projects,
        services,
        process,
        faq,
        translations,
      ] = await Promise.all([
        payload.findGlobal({ slug: "site-settings", depth: 1 }),
        payload.findGlobal({ slug: "seo", depth: 1 }),
        payload.findGlobal({ slug: "profile", depth: 0 }),
        payload.findGlobal({ slug: "ai", depth: 0 }),
        payload.findGlobal({ slug: "portal-showcase", depth: 0 }),
        payload.findGlobal({ slug: "pages", depth: 0 }),
        payload.find({ collection: "projects", ...all, depth: 1 }),
        payload.find({ collection: "services", ...all }),
        payload.find({ collection: "process-steps", ...all }),
        payload.find({ collection: "faq", ...all }),
        payload.find({
          collection: "translations",
          depth: 0,
          pagination: false,
          select: { key: true, az: true, en: true, ru: true },
        }),
      ]);
      return {
        settings,
        seo,
        profile,
        ai,
        portalShowcase,
        pages,
        projects: projects.docs,
        services: services.docs,
        process: process.docs,
        faq: faq.docs,
        translations: translations.docs,
      };
    } catch (error) {
      console.error("Admin content unavailable, using the built-in content:", error);
      return null;
    }
  },
  ["cms", CMS_CACHE_VERSION],
  { tags: [CMS_TAG] },
);

/** The admin's content (the same for every language: texts hold all three). */
export const getCms = cache((_locale?: Locale) => loadCms());

/* ------------------------------------------------------------------ Site settings */

/** Only the settings that were filled in. */
export function toSiteOverrides(
  settings: SiteSetting | null | undefined,
  locale: Locale,
): SiteOverrides {
  if (!settings) return {};
  const cv = typeof settings.cv === "object" ? settings.cv : null;
  const qr = typeof settings.support?.qr === "object" ? settings.support.qr : null;
  const values: Record<keyof Omit<SiteOverrides, "pages" | "kofeQr">, string | null | undefined> = {
    name: settings.name,
    role: pick(settings.role, locale),
    location: pick(settings.location, locale),
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
  return { ...toSiteOverrides(cms?.settings, locale), pages: toPageSwitches(cms?.pages) };
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
  const t = (value: I18nValue) => pick(value, locale);
  const builtIn = getContent(locale);
  const present = t(profile?.present) || builtIn.profile.present;
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
      ] as [Industry, I18nValue][]
    ).flatMap(([id, name]) => (t(name) ? [[id, t(name)]] : [])),
  );
  const capabilities = active(ai?.capabilities).map((row) => ({
    title: t(row.title),
    description: t(row.description),
    icon: (row.icon ?? "bot") as AiIcon,
  }));
  const builtInAi = getAi(locale);

  return {
    profile: profile
      ? {
          summary: t(profile.summary) || undefined,
          cv:
            t(profile.cvTitle) || t(profile.cvSummary)
              ? {
                  title: t(profile.cvTitle) || builtIn.profile.cv.title,
                  summary: t(profile.cvSummary) || builtIn.profile.cv.summary,
                }
              : undefined,
          industries: filled(splitLines(t(profile.industries))),
          about: filled(
            active(profile.about)
              .map((row) => t(row.text))
              .filter(Boolean),
          ),
          skills: filled(
            active(profile.skills).map((row) => ({
              title: t(row.title),
              description: t(row.description),
              items: splitLines(t(row.items)),
            })),
          ),
          experience: filled(
            active(profile.experience).map((row) => ({
              role: t(row.role),
              company: row.company ?? "",
              companyUrl: row.companyUrl || undefined,
              location: t(row.location),
              start: row.start ?? "",
              end: row.end?.trim() || present,
              highlights: splitLines(t(row.highlights)),
            })),
          ),
          education: filled(
            active(profile.education).map((row) => ({
              degree: t(row.degree),
              field: t(row.field),
              institution: t(row.institution),
              start: row.start ?? "",
              end: row.end ?? "",
            })),
          ),
          languages: filled(
            active(profile.languages).map((row) => ({
              name: t(row.name),
              level: t(row.level),
            })),
          ),
          certificates: filled(
            active(profile.certificates).map((row) => ({
              name: t(row.name),
              period: t(row.period),
            })),
          ),
        }
      : undefined,
    principles: filled(
      active(profile?.principles).map((row) => ({ title: t(row.title), text: t(row.text) })),
    ),
    industries,
    ai:
      ai && (capabilities.length || t(ai.intro))
        ? {
            intro: t(ai.intro) || builtInAi.intro,
            capabilities: capabilities.length ? capabilities : builtInAi.capabilities,
            tools: filled(splitLines(ai.tools)) ?? builtInAi.tools,
            skills: filled(splitLines(t(ai.skills))) ?? builtInAi.skills,
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
  return ((await getCms(locale))?.translations ?? []).flatMap((row) => {
    const value = row[locale]?.trim();
    return value ? [[row.key, value] as const] : [];
  });
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
  const keywords = pick(seo.keywords, locale)
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  return {
    title: pick(fields?.title, locale) || undefined,
    description: pick(fields?.description, locale) || undefined,
    keywords: keywords.length ? keywords : undefined,
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
    title: pick(doc.title, locale),
    tagline: pick(doc.tagline, locale),
    description: pick(doc.description, locale),
    deliverables: splitLines(pick(doc.deliverables, locale)),
  });
  const process = active(cms?.process).map((doc) => ({
    title: pick(doc.title, locale),
    description: pick(doc.description, locale),
  }));
  const faq = active(cms?.faq).map((doc) => ({
    question: pick(doc.question, locale),
    answer: pick(doc.answer, locale),
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
    summary: pick(doc.summary, locale),
    overview: pick(doc.overview, locale),
    liveFeatures: splitLines(pick(doc.liveFeatures, locale)),
    note: pick(doc.note, locale) || undefined,
    unavailableReason: pick(doc.unavailableReason, locale) || undefined,
    images: projectImagesOf(doc),
  }));
}

/* ------------------------------------------------------------------ Client portal section */

/** The home page's client portal section from the admin; empty fields keep the built-in text. */
export function toPortalShowcase(
  locale: Locale,
  doc: PortalShowcaseDoc | null | undefined,
): PortalShowcase {
  const builtIn = builtInShowcase(locale);
  if (!doc) return builtIn;
  const t = (value: I18nValue) => pick(value, locale);
  const demo = doc.demo ?? {};
  const features = active(doc.features)
    .map((row) => ({ icon: row.icon ?? "stages", title: t(row.title), text: t(row.text) }))
    .filter((feature) => feature.title);
  const stages = (demo.stages ?? [])
    .map((row) => ({
      name: t(row.name),
      status: row.status ?? "todo",
      note: t(row.note) || undefined,
    }))
    .filter((stage) => stage.name);
  const comments = (demo.comments ?? [])
    .map((row) => ({ from: row.from ?? "client", author: t(row.author), body: t(row.text) }))
    .filter((comment) => comment.body);
  return {
    eyebrow: t(doc.eyebrow) || builtIn.eyebrow,
    title: t(doc.title) || builtIn.title,
    accent: t(doc.accent) || builtIn.accent,
    description: t(doc.description) || builtIn.description,
    features: features.length ? features : builtIn.features,
    cta: t(doc.cta) || builtIn.cta,
    note: t(doc.note) || builtIn.note,
    demo: {
      badge: t(demo.badge) || builtIn.demo.badge,
      project: t(demo.project) || builtIn.demo.project,
      client: t(demo.client) || builtIn.demo.client,
      status: demo.status ?? builtIn.demo.status,
      due: demo.due ?? builtIn.demo.due,
      stages: stages.length ? stages : builtIn.demo.stages,
      comments: comments.length ? comments : builtIn.demo.comments,
    },
  };
}

export async function getPortalShowcase(locale: Locale) {
  return toPortalShowcase(locale, (await getCms(locale))?.portalShowcase);
}
