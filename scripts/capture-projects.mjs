// Captures reference screenshots + basic metadata of the live project websites.
// Usage: node scripts/capture-projects.mjs <outDir> [domain ...]
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { PROJECT_DOMAINS } from "./project-domains.mjs";

const [outDir = "captures", ...rest] = process.argv.slice(2);
const domains = rest.length ? rest : PROJECT_DOMAINS;
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const domain of domains) {
  const url = `https://${domain}/`;
  const entry = { domain, url };
  for (const [name, viewport] of [
    ["desktop", { width: 1440, height: 900 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const ctx = await browser.newContext({
      viewport,
      deviceScaleFactor: name === "mobile" ? 2 : 1,
      locale: "en-US",
    });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(3500);
      if (name === "desktop") {
        entry.finalUrl = page.url();
        Object.assign(
          entry,
          await page.evaluate(() => {
            const meta = (n) =>
              document
                .querySelector(`meta[name="${n}"],meta[property="${n}"]`)
                ?.getAttribute("content") ?? null;
            const body = getComputedStyle(document.body);
            const h = document.querySelector("h1,h2");
            return {
              title: document.title,
              description: meta("description") ?? meta("og:description"),
              themeColor: meta("theme-color"),
              lang: document.documentElement.lang,
              bodyFont: body.fontFamily,
              headingFont: h ? getComputedStyle(h).fontFamily : null,
              headingText: h?.textContent?.trim().slice(0, 120) ?? null,
              bodyBg: body.backgroundColor,
              nav: [...document.querySelectorAll("header a, nav a")]
                .map((a) => a.textContent.trim())
                .filter(Boolean)
                .slice(0, 14),
              nextjs:
                !!document.getElementById("__next") ||
                !!document.querySelector("script[src*='/_next/']"),
            };
          }),
        );
      }
      await page.screenshot({ path: path.join(outDir, `${domain}.${name}.png`) });
      entry[name] = "ok";
    } catch (e) {
      entry[name] = `error: ${e.message.split("\n")[0]}`;
    }
    await ctx.close();
  }
  results.push(entry);
  console.log(JSON.stringify(entry));
}

fs.writeFileSync(path.join(outDir, "meta.json"), JSON.stringify(results, null, 2));
await browser.close();
