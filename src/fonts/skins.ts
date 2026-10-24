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

// Neither pixel font has "ə"/"Ə": these supply them, drawn from each font's own "e"
// (scripts/build-schwa-font.mjs). They sit before the font in the stack and only load on pages
// with a schwa.
export const pressStartSchwa = localFont({
  src: "./press-start-schwa.otf",
  variable: "--font-press-start-schwa",
  adjustFontFallback: false,
  preload: false,
  declarations: [{ prop: "unicode-range", value: "U+0259, U+018F" }],
});

export const pixelifySchwa = localFont({
  src: "./pixelify-schwa.otf",
  variable: "--font-pixelify-schwa",
  adjustFontFallback: false,
  preload: false,
  declarations: [{ prop: "unicode-range", value: "U+0259, U+018F" }],
});

/** All the class names that define the style fonts' CSS variables, for <html>. */
export const skinFontVariables = [
  pressStart,
  pixelify,
  lora,
  caveat,
  pressStartSchwa,
  pixelifySchwa,
]
  .map((font) => font.variable)
  .join(" ");
