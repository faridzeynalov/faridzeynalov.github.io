// Converts raw Playwright captures into optimized WebP assets under src/assets/projects/<slug>/.
// Usage: node scripts/optimize-captures.mjs <capturesDir> <sectionsDir> [slug ...]   (defaults to every slug)
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const [capturesDir, sectionsDir, ...onlySlugs] = process.argv.slice(2);
const OUT = "src/assets/projects";

// slug -> [domain, cover source, include section shot]
const MAP = {
  "24k": ["24k.az", "desktop", true],
  yenee: ["yenee.az", "desktop", true],
  lassa: ["lassa.az", "desktop", true],
  "tabia-group": ["tabia.az", "hero", true],
  "vien-group": ["viengroup.com", "hero", false],
  "eleven-park": ["elevenpark.az", "desktop", true],
  kaan: ["kaan.az", "hero", true],
  "ups-construction": ["upsconstruction.az", "hero", true],
  panorama: ["panorama.az", "desktop", true],
  "sky-breeze": ["skybreeze.az", "desktop", true],
  yashamal: ["yashamal.az", "desktop", true],
  "merkezi-klinika": ["merkeziklinika.az", "hero", true],
  "pasha-property": ["corp.pashaproperty.az", "desktop", false],
  granit: ["granit.az", "desktop", true],
  plastcon: ["plastcon.az", "hero", true],
  safenet: ["safenet.az", "hero", true],
  "arsenal-fire": ["arsenalfire.az", "desktop", true],
  "garabagh-resort": ["garabaghotel.az", "desktop", false],
  badamdar: ["badamdarhotelandresidences.az", "desktop", true],
  galaalti: ["galaalti.az", "section", true],
  excelsior: ["excelsior.az", "desktop", false],
  gashalti: ["gashalti.az", "desktop", true],
  quk: ["quk.edu.az", "desktop", true],
};

for (const [slug, [domain, cover, withSection]] of Object.entries(MAP)) {
  if (onlySlugs.length && !onlySlugs.includes(slug)) continue;
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  const src = {
    desktop: path.join(capturesDir, `${domain}.desktop.png`),
    hero: path.join(sectionsDir, `${domain}.hero.png`),
    section: path.join(sectionsDir, `${domain}.section1.png`),
  };
  const coverSrc = src[cover];
  await sharp(coverSrc)
    .resize(1440, 900, { fit: "cover", position: "top" })
    .webp({ quality: 74 })
    .toFile(path.join(dir, "cover.webp"));
  await sharp(coverSrc)
    .resize(800, 500, { fit: "cover", position: "top" })
    .webp({ quality: 72 })
    .toFile(path.join(dir, "thumb.webp"));
  await sharp(path.join(capturesDir, `${domain}.mobile.png`))
    .resize(468, 1013, { fit: "cover", position: "top" })
    .webp({ quality: 74 })
    .toFile(path.join(dir, "mobile.webp"));
  if (withSection && cover !== "section") {
    await sharp(src.section)
      .resize(1440, 900, { fit: "cover", position: "top" })
      .webp({ quality: 72 })
      .toFile(path.join(dir, "section.webp"));
  }
  console.log(
    slug,
    fs
      .readdirSync(dir)
      .map((f) => `${f}:${Math.round(fs.statSync(path.join(dir, f)).size / 1024)}k`)
      .join(" "),
  );
}
