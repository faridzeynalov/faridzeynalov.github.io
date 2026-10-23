import localFont from "next/font/local";

/**
 * "ə" and "Ə" for the italic accent font, which Instrument Serif lacks (Azerbaijani). Built from
 * Instrument Serif's own "e" by scripts/build-schwa-font.mjs. It sits before Instrument Serif in
 * --font-serif and the unicode-range keeps it from loading on pages without a schwa.
 */
export const instrumentSerifSchwa = localFont({
  src: "./instrument-serif-schwa-italic.otf",
  variable: "--font-instrument-serif-schwa",
  weight: "400",
  style: "italic",
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0259, U+018F" }],
});
