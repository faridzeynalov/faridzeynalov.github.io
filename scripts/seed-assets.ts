/**
 * Moves what was still built into the site into the admin panel: the project screenshots, the
 * CV, the "buy me a coffee" QR code and the share image go to Media; the site settings and every
 * page's SEO title and description are filled in with what the site shows now. Anything already
 * set in the admin is left alone.
 *
 * Usage: npm run build (for the current titles), then npm run seed:assets
 */
import fs from "node:fs";
import path from "node:path";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { getProfile } from "../src/data/profile";
import type { Locale } from "../src/i18n/routing";
import en from "../messages/en.json" with { type: "json" };
import az from "../messages/az.json" with { type: "json" };
import ru from "../messages/ru.json" with { type: "json" };

const locales: Locale[] = ["en", "az", "ru"];
const messages = { en, az, ru };
const root = process.cwd();
// Seeding writes outside a Next.js request: nothing to revalidate. Every call gets its own copy:
// the storage plugin marks the context after an upload, and a shared one would skip the rest.
const context = { disableRevalidate: true };
const payload = await getPayload({ config });

/** Uploads a file to Media with its alt text in every language, and returns its id. */
async function upload(file: string, alt?: Record<Locale, string>) {
  const doc = await payload.create({
    collection: "media",
    locale: "en",
    context: { ...context },
    filePath: file,
    data: { alt: alt?.en },
  });
  if (alt) {
    for (const locale of ["az", "ru"] as const) {
      await payload.update({
        collection: "media",
        id: doc.id,
        locale,
        context: { ...context },
        data: { alt: alt[locale] },
      });
    }
  }
  return doc.id;
}

const shotNames = {
  cover: { en: "desktop screenshot", az: "kompüter görünüşü", ru: "скриншот для компьютера" },
  thumb: { en: "screenshot", az: "ekran görüntüsü", ru: "скриншот" },
  mobile: { en: "mobile screenshot", az: "mobil görünüş", ru: "мобильный скриншот" },
  section: { en: "section screenshot", az: "bölmənin görüntüsü", ru: "скриншот раздела" },
} as const;

async function seedProjectScreenshots() {
  const { docs } = await payload.find({ collection: "projects", pagination: false, depth: 0 });
  let uploaded = 0;
  for (const project of docs) {
    const dir = path.join(root, "src/assets/projects", project.slug);
    if (!fs.existsSync(dir)) continue;
    const images: Record<string, number> = {};
    for (const kind of ["cover", "thumb", "mobile", "section"] as const) {
      const file = path.join(dir, `${kind}.webp`);
      if (project.images?.[kind] || !fs.existsSync(file)) continue;
      images[kind] = await upload(file, {
        en: `${project.name} — ${shotNames[kind].en}`,
        az: `${project.name}: ${shotNames[kind].az}`,
        ru: `${project.name} — ${shotNames[kind].ru}`,
      });
      uploaded++;
    }
    if (Object.keys(images).length) {
      await payload.update({
        collection: "projects",
        id: project.id,
        context: { ...context },
        data: { images: { ...project.images, ...images } } as never,
      });
    }
  }
  payload.logger.info(`Screenshots: ${uploaded} uploaded`);
}

async function seedSiteSettings() {
  const current = await payload.findGlobal({ slug: "site-settings", locale: "en", depth: 0 });
  const data: Record<string, unknown> = {};
  if (!current.cv) {
    data.cv = await upload(path.join(root, "public/farid-zeynalov-cv.pdf"), {
      en: "CV of Farid Zeynalov",
      az: "Farid Zeynalovun CV-si",
      ru: "Резюме Farid Zeynalov",
    });
  }
  if (!current.support?.qr) {
    data.support = {
      url: current.support?.url || "https://kofe.al/@faridzeynalov",
      qr: await upload(path.join(root, "src/assets/kofe-qr.png"), {
        en: "QR code for kofe.al/@faridzeynalov",
        az: "kofe.al/@faridzeynalov üçün QR kod",
        ru: "QR-код для kofe.al/@faridzeynalov",
      }),
    };
  }
  for (const locale of locales) {
    const profile = getProfile(locale);
    const linkedIn = profile.social.find((link) => link.label === "LinkedIn")?.href;
    const existing = await payload.findGlobal({ slug: "site-settings", locale, depth: 0 });
    const fill = (value: string | null | undefined, fallback: string | undefined) =>
      value?.trim() ? value : fallback;
    await payload.updateGlobal({
      slug: "site-settings",
      locale,
      context: { ...context },
      data: {
        ...(locale === "en" ? data : {}),
        name: fill(existing.name, profile.name),
        role: fill(existing.role, profile.role),
        location: fill(existing.location, profile.location),
        email: fill(existing.email, profile.email),
        phone: fill(existing.phone, profile.phone),
        yearsOfExperience: fill(existing.yearsOfExperience, profile.yearsOfExperience),
        sitesShipped: fill(existing.sitesShipped, profile.sitesShipped),
        links: { ...existing.links, linkedIn: fill(existing.links?.linkedIn, linkedIn) },
      } as never,
    });
  }
  payload.logger.info("Site settings: filled in");
}

const decode = (text: string) =>
  text
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

/** The title and description a page is served with now (from the last build). */
function builtMeta(locale: Locale, page: string) {
  const app = path.join(root, ".next/server/app");
  const name = page === "home" ? (locale === "en" ? "index" : locale) : page;
  const file = locale === "en" || page === "home" ? `${name}.html` : `${locale}/${name}.html`;
  const html = fs.readFileSync(path.join(app, file), "utf8");
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  return { title: title && decode(title), description: description && decode(description) };
}

async function seedSeo() {
  const pages = ["home", "portfolio", "services", "about", "contact", "cv"] as const;
  const current = await payload.findGlobal({ slug: "seo", locale: "en", depth: 0 });
  let ogImage = current.ogImage;
  if (!ogImage) {
    const og = path.join(root, ".next/server/app/og.png.body");
    const file = path.join(root, ".next/og-image.png");
    fs.copyFileSync(og, file);
    ogImage = await upload(file, {
      en: "Farid Zeynalov — Front-End Developer",
      az: "Farid Zeynalov — Front-End Developer",
      ru: "Farid Zeynalov — Front-End разработчик",
    });
    fs.rmSync(file);
  }
  for (const locale of locales) {
    const existing = (await payload.findGlobal({
      slug: "seo",
      locale,
      depth: 0,
    })) as unknown as Record<
      string,
      { title?: string | null; description?: string | null } | string | null | undefined
    >;
    const data: Record<string, unknown> = {
      keywords:
        (typeof existing.keywords === "string" && existing.keywords.trim()) ||
        messages[locale].Metadata.keywords,
    };
    for (const page of pages) {
      const before = existing[page];
      const now = builtMeta(locale, page);
      const fields = typeof before === "object" && before ? before : {};
      data[page] = {
        title: fields.title?.trim() || now.title,
        description: fields.description?.trim() || now.description,
      };
    }
    if (locale === "en") data.ogImage = ogImage;
    await payload.updateGlobal({
      slug: "seo",
      locale,
      context: { ...context },
      data: data as never,
    });
  }
  payload.logger.info("SEO: filled in");
}

/** Interface texts changed in messages/*.json since they were copied, where still untouched. */
async function updateChangedTexts() {
  const changed: Record<string, Record<Locale, { from: string; to: string }>> = {
    "Footer.builtWith": {
      en: {
        from: "Built with Next.js & Tailwind CSS · statically exported",
        to: en.Footer.builtWith,
      },
      az: { from: "Next.js və Tailwind CSS ilə hazırlanıb · statik sayt", to: az.Footer.builtWith },
      ru: {
        from: "Сделано на Next.js и Tailwind CSS · статический экспорт",
        to: ru.Footer.builtWith,
      },
    },
  };
  for (const [key, perLocale] of Object.entries(changed)) {
    const { docs } = await payload.find({
      collection: "translations",
      where: { key: { equals: key } },
      depth: 0,
    });
    if (!docs[0]) continue;
    for (const locale of locales) {
      const row = await payload.findByID({ collection: "translations", id: docs[0].id, locale });
      if (row.value === perLocale[locale].from) {
        await payload.update({
          collection: "translations",
          id: docs[0].id,
          locale,
          context: { ...context },
          data: { value: perLocale[locale].to },
        });
      }
    }
  }
  payload.logger.info("Translations: updated");
}

await seedSiteSettings();
await seedSeo();
await updateChangedTexts();
await seedProjectScreenshots();
process.exit(0);
