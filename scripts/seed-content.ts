/**
 * Copies the built-in content (src/content, src/data, messages/*.json) into the admin panel, so
 * it starts out filled in rather than empty: every text in all three languages ({ az, en, ru }).
 * Anything that already has content in the admin is left alone. Usage: npm run seed
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

const locales: Locale[] = ["az", "en", "ru"];
const messages: Record<Locale, Record<string, unknown>> = { en, az, ru };
// Seeding writes outside a Next.js request: nothing to revalidate. Every call gets its own copy:
// the storage plugin marks the context after an upload, and a shared one would skip the rest.
const context = () => ({ disableRevalidate: true });
const payload = await getPayload({ config });
const lines = (items: string[]) => items.join("\n");

/** { az, en, ru } from a function of the language. */
function i18n(text: (locale: Locale) => string | undefined) {
  return Object.fromEntries(locales.map((locale) => [locale, text(locale) ?? null]));
}

async function isEmpty(collection: CollectionSlug) {
  return (await payload.count({ collection })).totalDocs === 0;
}

/** Creates one document per built-in item, its texts in every language. */
async function seedCollection<T>(
  collection: CollectionSlug,
  items: (locale: Locale) => T[],
  data: (item: (locale: Locale) => T) => Record<string, unknown>,
) {
  if (!(await isEmpty(collection))) {
    payload.logger.info(`${collection}: already filled in, skipped`);
    return;
  }
  const byLocale = Object.fromEntries(locales.map((locale) => [locale, items(locale)])) as Record<
    Locale,
    T[]
  >;
  for (const index of byLocale.az.keys()) {
    await payload.create({
      collection,
      context: context(),
      data: data((locale) => byLocale[locale][index]) as never,
    });
  }
  payload.logger.info(`${collection}: ${byLocale.az.length} copied`);
}

async function seedProjects() {
  await seedCollection("projects", getProjectList, (project) => ({
    name: project("en").name,
    slug: project("en").slug,
    domain: project("en").domain,
    url: project("en").url,
    industry: project("en").industry,
    group: project("en").group,
    languages: project("en").languages,
    accent: project("en").accent,
    stack: lines(project("en").stack),
    featured: project("en").featured ?? false,
    active: true,
    summary: i18n((locale) => project(locale).summary),
    overview: i18n((locale) => project(locale).overview),
    liveFeatures: i18n((locale) => lines(project(locale).liveFeatures)),
    note: i18n((locale) => project(locale).note),
    unavailableReason: i18n((locale) => project(locale).unavailableReason),
  }));
}

async function seedServices() {
  await seedCollection("services", getServices, (service) => ({
    key: service("en").id,
    icon: service("en").icon,
    active: true,
    showOnHome: true,
    title: i18n((locale) => service(locale).title),
    tagline: i18n((locale) => service(locale).tagline),
    description: i18n((locale) => service(locale).description),
    deliverables: i18n((locale) => lines(service(locale).deliverables)),
  }));
  await seedCollection("process-steps", getProcess, (step) => ({
    active: true,
    title: i18n((locale) => step(locale).title),
    description: i18n((locale) => step(locale).description),
  }));
  await seedCollection("faq", getFaq, (item) => ({
    active: true,
    question: i18n((locale) => item(locale).question),
    answer: i18n((locale) => item(locale).answer),
  }));
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
  ) as Record<Locale, Record<string, string>>;
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
    await payload.create({
      collection: "translations",
      context: context(),
      data: {
        key,
        section: key.split(".")[0],
        az: texts.az[key] ?? null,
        en: texts.en[key] ?? null,
        ru: texts.ru[key] ?? null,
      },
    });
  }
  payload.logger.info(`translations: ${missing.length} added`);
}

async function seedProfile() {
  const current = await payload.findGlobal({ slug: "profile" });
  if (current.about?.length || current.skills?.length) {
    payload.logger.info("profile: already filled in, skipped");
    return;
  }
  const profile = Object.fromEntries(
    locales.map((locale) => [locale, getProfile(locale)]),
  ) as Record<Locale, ReturnType<typeof getProfile>>;
  const rows = <T>(list: (locale: Locale) => T[], row: (item: (locale: Locale) => T) => object) =>
    list("az").map((_, index) => ({ ...row((locale) => list(locale)[index]), active: true }));
  await payload.updateGlobal({
    slug: "profile",
    context: context(),
    data: {
      summary: i18n((locale) => profile[locale].summary),
      cvTitle: i18n((locale) => profile[locale].cv.title),
      cvSummary: i18n((locale) => profile[locale].cv.summary),
      present: i18n((locale) => content[locale].profile.present),
      industries: i18n((locale) => lines(profile[locale].industries)),
      about: rows(
        (locale) => profile[locale].about,
        (text) => ({ text: i18n(text) }),
      ),
      principles: rows(
        (locale) => content[locale].principles,
        (item) => ({ title: i18n((l) => item(l).title), text: i18n((l) => item(l).text) }),
      ),
      skills: rows(
        (locale) => profile[locale].skills,
        (group) => ({
          title: i18n((l) => group(l).title),
          description: i18n((l) => group(l).description),
          items: i18n((l) => lines(group(l).items)),
        }),
      ),
      experience: rows(
        (locale) => profile[locale].experience,
        (job) => ({
          role: i18n((l) => job(l).role),
          company: job("en").company,
          companyUrl: job("en").companyUrl,
          location: i18n((l) => job(l).location),
          start: job("en").start,
          // The current job keeps an empty end, shown as "present" in each language.
          end: job("en").end === content.en.profile.present ? "" : job("en").end,
          highlights: i18n((l) => lines(job(l).highlights)),
        }),
      ),
      education: rows(
        (locale) => profile[locale].education,
        (entry) => ({
          degree: i18n((l) => entry(l).degree),
          field: i18n((l) => entry(l).field),
          institution: i18n((l) => entry(l).institution),
          start: entry("en").start,
          end: entry("en").end,
        }),
      ),
      languages: rows(
        (locale) => profile[locale].languages,
        (entry) => ({ name: i18n((l) => entry(l).name), level: i18n((l) => entry(l).level) }),
      ),
      certificates: rows(
        (locale) => profile[locale].certificates,
        (entry) => ({ name: i18n((l) => entry(l).name), period: i18n((l) => entry(l).period) }),
      ),
      industryNames: {
        hospitality: i18n((l) => content[l].industries.hospitality),
        realEstate: i18n((l) => content[l].industries["real-estate"]),
        healthcare: i18n((l) => content[l].industries.healthcare),
        eCommerce: i18n((l) => content[l].industries["e-commerce"]),
        corporate: i18n((l) => content[l].industries.corporate),
        education: i18n((l) => content[l].industries.education),
      },
    } as never,
  });
  payload.logger.info("profile: copied");
}

async function seedAi() {
  const current = await payload.findGlobal({ slug: "ai" });
  if (current.capabilities?.length) {
    payload.logger.info("ai: already filled in, skipped");
    return;
  }
  const ai = Object.fromEntries(locales.map((locale) => [locale, getAi(locale)])) as Record<
    Locale,
    ReturnType<typeof getAi>
  >;
  await payload.updateGlobal({
    slug: "ai",
    context: context(),
    data: {
      intro: i18n((l) => ai[l].intro),
      capabilities: ai.az.capabilities.map((capability, index) => ({
        icon: capability.icon,
        title: i18n((l) => ai[l].capabilities[index].title),
        description: i18n((l) => ai[l].capabilities[index].description),
        active: true,
      })),
      tools: lines(ai.en.tools),
      skills: i18n((l) => lines(ai[l].skills)),
    } as never,
  });
  payload.logger.info("ai: copied");
}

await seedProjects();
await seedServices();
await seedProfile();
await seedAi();
await seedTranslations();
process.exit(0);
