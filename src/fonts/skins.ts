import { Caveat, Lora, Pixelify_Sans, Press_Start_2P } from "next/font/google";
import localFont from "next/font/local";

// Fonts for the 8-bit and Paper styles. `preload: false`: they're only downloaded when a page
// actually uses them (i.e. in that style), so Classic and Developer visitors never fetch them.
// Latin-ext covers Azerbaijani and Cyrillic covers Russian.

/** 8-bit headings. */
export const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: "400",
  preload: false,
});

/** 8-bit body text: a pixel font that stays readable at paragraph sizes. */
export const pixelify = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin", "latin-ext", "cyrillic"],
  preload: false,
});

/** Paper style text. */
export const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext", "cyrillic"],
  style: ["normal", "italic"],
  preload: false,
});

/** Paper style handwritten accents. */
export const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "latin-ext", "cyrillic"],
  preload: false,
});

// Pixelify Sans has no "ə"/"Ə" and its "2"/"5" read as "Z"/"S": these glyphs are redrawn on
// its pixel grid (scripts/build-pixel-glyphs.mjs). The supplement sits before Pixelify in the
// stack and, by unicode-range, only loads on pages that use those characters.
export const pixelifyFixes = localFont({
  src: [
    { path: "./pixelify-fixes.otf", weight: "400" },
    { path: "./pixelify-fixes-bold.otf", weight: "700" },
  ],
  variable: "--font-pixelify-fixes",
  adjustFontFallback: false,
  preload: false,
  declarations: [{ prop: "unicode-range", value: "U+0259, U+018F, U+0032, U+0035" }],
});

/** All the class names that define the style fonts' CSS variables, for <html>. */
export const skinFontVariables = [pressStart, pixelify, lora, caveat, pixelifyFixes]
  .map((font) => font.variable)
  .join(" ");
