// Captures below-the-fold section screenshots and detects client-side frameworks.
// Usage: node scripts/capture-sections.mjs <outDir> [domain ...]   (defaults to every project domain)
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { PROJECT_DOMAINS } from "./project-domains.mjs";

const [outDir = ".captures/sections", ...rest] = process.argv.slice(2);
const domains = rest.length ? rest : PROJECT_DOMAINS;
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const results = {};

for (const domain of domains) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  try {
    await page.goto(`https://${domain}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(7000);
    await page.screenshot({ path: path.join(outDir, `${domain}.hero.png`) });
    results[domain] = await page.evaluate(() => ({
      next:
        !!document.querySelector("script[src*='/_next/']") ||
        !!window.__NEXT_DATA__ ||
        !!window.next,
      nextAppRouter:
        !!document.querySelector("script[src*='/_next/static/chunks/app/']") ||
        typeof window.__next_f !== "undefined",
      nuxt: !!window.__NUXT__ || !!window.$nuxt,
      vue:
        !!document.querySelector("[data-v-app]") ||
        [...document.querySelectorAll("*")].some((el) =>
          [...el.attributes].some((a) => a.name.startsWith("data-v-")),
        ),
      jquery: !!window.jQuery,
      wordpress: !!document.querySelector("link[href*='wp-content'],script[src*='wp-content']"),
      langs: [...document.querySelectorAll("a,button")]
        .map((e) => e.textContent.trim().toLowerCase())
        .filter((t) => ["az", "en", "ru"].includes(t)),
      height: document.documentElement.scrollHeight,
    }));
    const h = results[domain].height;
    for (const [i, frac] of [0.22, 0.45].entries()) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round(h * frac));
      await page.waitForTimeout(2500);
      await page.screenshot({ path: path.join(outDir, `${domain}.section${i + 1}.png`) });
    }
  } catch (e) {
    results[domain] = { error: e.message.split("\n")[0] };
  }
  console.log(domain, JSON.stringify(results[domain]));
  await ctx.close();
}
fs.writeFileSync(path.join(outDir, "tech.json"), JSON.stringify(results, null, 2));
await browser.close();
