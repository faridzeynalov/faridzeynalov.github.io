/**
 * Writes every collection and global of the admin panel (texts in all three languages) to a JSON
 * file, so the content can be put back after a schema change. Usage:
 *   node --env-file=.env.local --import ./scripts/payload-loader.mjs scripts/backup-content.ts <file>
 */
import fs from "node:fs";
import { getPayload } from "payload";
import config from "../src/payload.config";

const out = process.argv[2];
if (!out) throw new Error("Usage: backup-content.ts <file>");
const payload = await getPayload({ config });
const collections = [
  "projects",
  "services",
  "process-steps",
  "faq",
  "translations",
  "media",
  "users",
] as const;
const globals = ["profile", "ai", "site-settings", "pages", "seo"] as const;

const backup: Record<string, unknown> = {};
for (const collection of collections) {
  const { docs } = await payload.find({
    collection,
    depth: 0,
    pagination: false,
    sort: "id",
    showHiddenFields: true,
  });
  backup[collection] = docs;
}
for (const global of globals) {
  backup[global] = await payload.findGlobal({ slug: global, depth: 0 });
}
fs.writeFileSync(out, JSON.stringify(backup, null, 1));
payload.logger.info(`Backed up to ${out}`);
process.exit(0);
