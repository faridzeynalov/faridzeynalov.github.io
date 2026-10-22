// Generates the favicon (src/app/icon.svg) and Apple touch icon (src/app/apple-icon.png)
// from the logo path in src/components/layout/logo-path.ts.
// Usage: node scripts/generate-icons.mjs
import fs from "node:fs";
import sharp from "sharp";

const source = fs.readFileSync("src/components/layout/logo-path.ts", "utf8");
const path = source.match(/LOGO_PATH =\s*"([^"]+)"/)[1];
const [, , w, h] = source
  .match(/LOGO_VIEWBOX = "([^"]+)"/)[1]
  .split(" ")
  .map(Number);

// Square canvas with the logo centred.
const side = Math.round(Math.max(w, h) * 1.08);
const viewBox = `${-Math.round((side - w) / 2)} ${-Math.round((side - h) / 2)} ${side} ${side}`;

// Navy gradient like the original artwork; light glyph on dark browser chrome.
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <defs>
    <linearGradient id="g" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#16212d"/>
      <stop offset="1" stop-color="#46596c"/>
    </linearGradient>
    <style>@media (prefers-color-scheme: dark) { path { fill: #ededef; } }</style>
  </defs>
  <path fill="url(#g)" d="${path}"/>
</svg>
`;
fs.writeFileSync("src/app/icon.svg", favicon);

// iOS doesn't support transparency in touch icons — use the light page colour.
const pad = Math.round(side * 0.22);
const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-(side - w) / 2 - pad} ${-(side - h) / 2 - pad} ${side + pad * 2} ${side + pad * 2}">
  <defs>
    <linearGradient id="g" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#16212d"/>
      <stop offset="1" stop-color="#46596c"/>
    </linearGradient>
  </defs>
  <rect x="-100000" y="-100000" width="200000" height="200000" fill="#f7f6f3"/>
  <path fill="url(#g)" d="${path}"/>
</svg>`;
await sharp(Buffer.from(appleSvg)).resize(180, 180).png().toFile("src/app/apple-icon.png");

console.log("Wrote src/app/icon.svg and src/app/apple-icon.png");
