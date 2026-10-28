/**
 * Copies the built-in content (src/content, src/data, messages/*.json) into the admin panel, so
 * it starts out filled in rather than empty. Anything that already has content in the admin is
 * left alone. Usage: npm run seed
 */
import { getPayload, type CollectionSlug } from "payload";
import config from "../src/payload.config";
import { content } from "../src/content/index";
import { getAi } from "../src/data/ai";
import { getProfile } from "../src/data/profile";
import { getProjectList } from "../src/data/projects";
import { getFaq, getProcess, getServices } from "../src/data/services";
import type { Locale } from "../src/i18n/routing";
import en from "../messages/en.json" with { type: "json" };
import az from "../messages/az.json" with { type: "json" };
import ru from "../messages/ru.json" with { type: "json" };

const locales: Locale[] = ["en", "az", "ru"];
const messages: Record<Locale, Record<string, unknown>> = { en, az, ru };
// Seeding writes outside a Next.js request: nothing to revalidate.
const context = { disableRevalidate: true };
const payload = await getPayload({ config });
const lines = (items: string[]) => items.join("\n");

async function isEmpty(collection: CollectionSlug) {
  return (await payload.count({ collection })).totalDocs === 0;
}

/**
 * Creates one document per item: in the first language, then the other languages' text on the
 * same document.
 */
async function seedCollection<T>(
  collection: CollectionSlug,
  items: (locale: Locale) => T[],
  data: (item: T, locale: Locale) => Record<string, unknown>,
) {
  if (!(await isEmpty(collection))) {
    payload.logger.info(`${collection}: already filled in, skipped`);
    return;
  }
  const [first, ...rest] = locales;
  const byLocale = Object.fromEntries(locales.map((locale) => [locale, items(locale)]));
  for (const [index, item] of byLocale[first].entries()) {
    const doc = await payload.create({
      collection,
      locale: first,
      context,
      data: data(item, first) as never,
    });
    for (const locale of rest) {
      await payload.update({
        collection,
        id: doc.id,
        locale,
        context,
        data: data(byLocale[locale][index], locale) as never,
      });
    }
  }
  payload.logger.info(`${collection}: ${byLocale[first].length} copied`);
}

async function seedProjects() {
  await seedCollection("projects", getProjectList, (project, locale) => ({
    ...(locale === "en"
      ? {
          name: project.name,
          slug: project.slug,
          domain: project.domain,
          url: project.url,
          industry: project.industry,
          group: project.group,
          languages: project.languages,
          accent: project.accent,
          stack: lines(project.stack),
          featured: project.featured ?? false,
          active: true,
        }
      : {}),
    summary: project.summary,
    overview: project.overview,
    liveFeatures: lines(project.liveFeatures),
    note: project.note,
    unavailableReason: project.unavailableReason,
  }));
}

type Row = Record<string, string | null | undefined>;
interface OldServicesPage {
  services?: Row[];
  process?: Row[];
  faq?: Row[];
}

/**
 * The old "services-page" global (edited in the admin before it became three collections), so
 * those edits carry over. Null once it's gone.
 */
async function previousServicesPage(): Promise<Record<Locale, OldServicesPage> | null> {
  const pages = await Promise.all(
    locales.map((locale) =>
      (
        payload.findGlobal({ slug: "services-page" as never, locale }) as Promise<OldServicesPage>
      ).catch(() => null),
    ),
  );
  if (!pages.every((page) => page?.services?.length)) return null;
  return Object.fromEntries(locales.map((locale, index) => [locale, pages[index]!])) as Record<
    Locale,
    OldServicesPage
  >;
}

async function seedServices() {
  const previous = await previousServicesPage();
  const services = (locale: Locale) =>
    previous
      ? previous[locale].services!.map((row) => ({
          id: row.key ?? "",
          icon: row.icon ?? "code",
          title: row.title ?? "",
          tagline: row.tagline ?? "",
          description: row.description ?? "",
          deliverables: (row.deliverables ?? "").split("\n"),
        }))
      : getServices(locale);
  const process = (locale: Locale) =>
    previous
      ? previous[locale].process!.map((row) => ({
          title: row.title ?? "",
          description: row.description ?? "",
        }))
      : getProcess(locale);
  const faq = (locale: Locale) =>
    previous
      ? previous[locale].faq!.map((row) => ({
          question: row.question ?? "",
          answer: row.answer ?? "",
        }))
      : getFaq(locale);

  await seedCollection("services", services, (service, locale) => ({
    ...(locale === "en"
      ? { key: service.id, icon: service.icon, active: true, showOnHome: true }
      : {}),
    title: service.title,
    tagline: service.tagline,
    description: service.description,
    deliverables: lines(service.deliverables),
  }));
  await seedCollection("process-steps", process, (step) => ({ ...step, active: true }));
  await seedCollection("faq", faq, (item) => ({ ...item, active: true }));
}

/** One row per message key ("Nav.home"), with each language's text. */
function flatten(tree: Record<string, unknown>, prefix = ""): [string, string][] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string"
      ? [[`${prefix}${key}`, value] as [string, string]]
      : flatten(value as Record<string, unknown>, `${prefix}${key}.`),
  );
}

async function seedTranslations() {
  const texts = Object.fromEntries(
    locales.map((locale) => [locale, Object.fromEntries(flatten(messages[locale]))]),
  );
  // Keys are unique, so this also completes a run that stopped halfway, and adds keys that
  // appear in messages/*.json later.
  const existing = await payload.find({
    collection: "translations",
    pagination: false,
    depth: 0,
    select: { key: true },
  });
  const have = new Set(existing.docs.map((doc) => doc.key));
  const missing = Object.keys(texts.en).filter((key) => !have.has(key));
  for (const key of missing) {
    const doc = await payload.create({
      collection: "translations",
      locale: "en",
      context,
      data: { key, section: key.split(".")[0], value: texts.en[key] },
    });
    for (const locale of locales.slice(1)) {
      await payload.update({
        collection: "translations",
        id: doc.id,
        locale,
        context,
        data: { value: texts[locale][key] ?? "" },
      });
    }
  }
  payload.logger.info(`translations: ${missing.length} added`);
}

/** Fills a global's arrays in every language, reusing the first language's row ids. */
async function seedGlobal(
  slug: "profile" | "ai",
  build: (locale: Locale) => Record<string, unknown>,
  arrays: string[],
) {
  const current = (await payload.findGlobal({ slug, locale: "en" })) as unknown as Record<
    string,
    unknown
  >;
  if (arrays.some((name) => (current[name] as unknown[] | undefined)?.length)) {
    payload.logger.info(`${slug}: already filled in, skipped`);
    return;
  }
  let ids: Record<string, string[]> | null = null;
  for (const locale of locales) {
    const data = build(locale);
    if (ids) {
      for (const name of arrays) {
        data[name] = (data[name] as Record<string, unknown>[]).map((row, index) => ({
          ...row,
          id: ids![name][index],
        }));
      }
    }
    const doc = (await payload.updateGlobal({
      slug,
      locale,
      context,
      data: data as never,
    })) as unknown as Record<string, { id: string }[]>;
    ids ??= Object.fromEntries(
      arrays.map((name) => [name, (doc[name] ?? []).map((row) => row.id)]),
    );
  }
  payload.logger.info(`${slug}: copied`);
}

async function seedProfile() {
  await seedGlobal(
    "profile",
    (locale) => {
      const profile = getProfile(locale);
      const text = content[locale];
      return {
        summary: profile.summary,
        cvTitle: profile.cv.title,
        cvSummary: profile.cv.summary,
        present: text.profile.present,
        industries: lines(profile.industries),
        about: profile.about.map((paragraph) => ({ text: paragraph, active: true })),
        principles: text.principles.map((item) => ({ ...item, active: true })),
        skills: profile.skills.map((group) => ({
          title: group.title,
          description: group.description,
          items: lines(group.items),
          active: true,
        })),
        experience: profile.experience.map((job, index) => ({
          role: job.role,
          company: job.company,
          companyUrl: job.companyUrl,
          location: job.location,
          start: job.start,
          // The current job keeps an empty end, shown as "present" in each language.
          end: index === 0 && job.end === text.profile.present ? "" : job.end,
          highlights: lines(job.highlights),
          active: true,
        })),
        education: profile.education.map((entry) => ({ ...entry, active: true })),
        languages: profile.languages.map((entry) => ({ ...entry, active: true })),
        certificates: profile.certificates.map((entry) => ({ ...entry, active: true })),
        industryNames: {
          hospitality: text.industries.hospitality,
          realEstate: text.industries["real-estate"],
          healthcare: text.industries.healthcare,
          eCommerce: text.industries["e-commerce"],
          corporate: text.industries.corporate,
          education: text.industries.education,
        },
      };
    },
    ["about", "principles", "skills", "experience", "education", "languages", "certificates"],
  );
}

async function seedAi() {
  await seedGlobal(
    "ai",
    (locale) => {
      const ai = getAi(locale);
      return {
        intro: ai.intro,
        capabilities: ai.capabilities.map((item) => ({ ...item, active: true })),
        tools: lines(ai.tools),
        skills: lines(ai.skills),
      };
    },
    ["capabilities"],
  );
}

await seedProjects();
await seedServices();
await seedProfile();
await seedAi();
await seedTranslations();
process.exit(0);
