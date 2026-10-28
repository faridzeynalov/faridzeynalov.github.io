/**
 * Puts the files of Media documents that never reached Vercel Blob (an early seed-assets run
 * shared one request context between uploads, so the storage plugin skipped all but the first)
 * into Blob under the names their documents expect. Files already in Blob are left alone.
 * Usage: npm run build (for the share image), then
 *   node --env-file=.env.local --import ./scripts/payload-loader.mjs scripts/repair-blob-files.ts
 */
import fs from "node:fs";
import path from "node:path";
import { head, put } from "@vercel/blob";
import { getPayload } from "payload";
import config from "../src/payload.config";

const root = process.cwd();
const payload = await getPayload({ config });

/** Where each Media document's file came from. */
const sources = new Map<number, string>();
const { docs: projects } = await payload.find({
  collection: "projects",
  pagination: false,
  depth: 0,
});
for (const project of projects) {
  for (const kind of ["cover", "thumb", "mobile", "section"] as const) {
    const id = project.images?.[kind];
    if (typeof id === "number") {
      sources.set(id, path.join(root, "src/assets/projects", project.slug, `${kind}.webp`));
    }
  }
}
const settings = await payload.findGlobal({ slug: "site-settings", depth: 0 });
if (typeof settings.support?.qr === "number") {
  sources.set(settings.support.qr, path.join(root, "src/assets/kofe-qr.png"));
}
if (typeof settings.cv === "number") {
  sources.set(settings.cv, path.join(root, "public/farid-zeynalov-cv.pdf"));
}
const seo = await payload.findGlobal({ slug: "seo", depth: 0 });
if (typeof seo.ogImage === "number") {
  sources.set(seo.ogImage, path.join(root, ".next/server/app/og.png.body"));
}

let restored = 0;
for (const [id, file] of sources) {
  const media = await payload.findByID({ collection: "media", id, depth: 0 });
  if (!media.filename || !media.url) continue;
  const exists = await head(media.url).then(
    () => true,
    () => false,
  );
  if (exists || !fs.existsSync(file)) continue;
  await put(media.filename, fs.readFileSync(file), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: media.mimeType ?? undefined,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
  restored++;
}
payload.logger.info(`Blob: ${restored} files restored`);
process.exit(0);
