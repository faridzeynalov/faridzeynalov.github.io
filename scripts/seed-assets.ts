/**
 * Moves what was still built into the site into the admin panel: the project screenshots, the
 * CV, the "buy me a coffee" QR code and the share image go to Media; the site settings and every
 * page's SEO title and description are filled in, in all three languages, with what the site
 * shows now. Anything already set in the admin is left alone.
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

const locales: Locale[] = ["az", "en", "ru"];
const messages = { en, az, ru };
const root = process.cwd();
// Seeding writes outside a Next.js request: nothing to revalidate. Every call gets its own copy:
// the storage plugin marks the context after an upload, and a shared one would skip the rest.
const context = () => ({ disableRevalidate: true });
const payload = await getPayload({ config });

type I18n = Partial<Record<Locale, string | null>> | null | undefined;

/** Keeps what the admin already has in each language, else the given text. */
function fill(current: I18n, next: (locale: Locale) => string | undefined) {
  return Object.fromEntries(
    locales.map((locale) => [locale, current?.[locale]?.trim() || next(locale) || null]),
  );
}

/** Uploads a file to Media and returns its id. */
async function upload(file: string, alt: string) {
  const doc = await payload.create({
    collection: "media",
    context: context(),
    filePath: file,
    data: { alt },
  });
  return doc.id;
}

const shotNames = {
  cover: "kompüter görünüşü",
  thumb: "ekran görüntüsü",
  mobile: "mobil görünüş",
  section: "bölmənin görüntüsü",
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
      images[kind] = await upload(file, `${project.name}: ${shotNames[kind]}`);
      uploaded++;
    }
    if (Object.keys(images).length) {
      await payload.update({
        collection: "projects",
        id: project.id,
        context: context(),
        data: { images: { ...project.images, ...images } } as never,
      });
    }
  }
  payload.logger.info(`Screenshots: ${uploaded} uploaded`);
}

async function seedSiteSettings() {
  const current = await payload.findGlobal({ slug: "site-settings", depth: 0 });
  const profile = Object.fromEntries(
    locales.map((locale) => [locale, getProfile(locale)]),
  ) as Record<Locale, ReturnType<typeof getProfile>>;
  const linkedIn = profile.en.social.find((link) => link.label === "LinkedIn")?.href;
  const keep = (value: string | null | undefined, next: string | undefined) =>
    value?.trim() ? value : next;
  await payload.updateGlobal({
    slug: "site-settings",
    context: context(),
    data: {
      ...(current.cv
        ? {}
        : {
            cv: await upload(
              path.join(root, "public/farid-zeynalov-cv.pdf"),
              "Farid Zeynalovun CV-si",
            ),
          }),
      ...(current.support?.qr
        ? {}
        : {
            support: {
              url: current.support?.url || "https://kofe.al/@faridzeynalov",
              qr: await upload(
                path.join(root, "src/assets/kofe-qr.png"),
                "kofe.al/@faridzeynalov üçün QR kod",
              ),
            },
          }),
      name: keep(current.name, profile.en.name),
      role: fill(current.role, (locale) => profile[locale].role),
      location: fill(current.location, (locale) => profile[locale].location),
      email: keep(current.email, profile.en.email),
      phone: keep(current.phone, profile.en.phone),
      yearsOfExperience: keep(current.yearsOfExperience, profile.en.yearsOfExperience),
      sitesShipped: keep(current.sitesShipped, profile.en.sitesShipped),
      links: { ...current.links, linkedIn: keep(current.links?.linkedIn, linkedIn) },
    } as never,
  });
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
  const current = (await payload.findGlobal({ slug: "seo", depth: 0 })) as unknown as Record<
    string,
    unknown
  >;
  let ogImage = current.ogImage;
  if (!ogImage) {
    const file = path.join(root, ".next/og-image.png");
    fs.copyFileSync(path.join(root, ".next/server/app/og.png.body"), file);
    ogImage = await upload(file, "Farid Zeynalov — Front-End Developer");
    fs.rmSync(file);
  }
  const data: Record<string, unknown> = {
    ogImage,
    keywords: fill(current.keywords as I18n, (locale) => messages[locale].Metadata.keywords),
  };
  for (const page of pages) {
    const before = (current[page] ?? {}) as { title?: I18n; description?: I18n };
    data[page] = {
      title: fill(before.title, (locale) => builtMeta(locale, page).title),
      description: fill(before.description, (locale) => builtMeta(locale, page).description),
    };
  }
  await payload.updateGlobal({ slug: "seo", context: context(), data: data as never });
  payload.logger.info("SEO: filled in");
}

await seedSiteSettings();
await seedSeo();
await seedProjectScreenshots();
process.exit(0);
