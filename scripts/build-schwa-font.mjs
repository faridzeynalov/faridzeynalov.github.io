// Instrument Serif has no "ə"/"Ə" (U+0259 / U+018F), so Azerbaijani words in the italic accent
// lines fell back to another font for that one letter. The schwa is an upside-down "e", so this
// builds a tiny supplementary font with both glyphs drawn from Instrument Serif's own "e"
// (rotated 180°; the capital also scaled to cap height). It is loaded before Instrument Serif in
// the font stack and only contains these two characters.
//
// Usage: node scripts/build-schwa-font.mjs <InstrumentSerif-Italic.ttf>
// Output: src/fonts/instrument-serif-schwa-italic.otf
// Instrument Serif is licensed under the SIL Open Font License 1.1, which allows this.
import opentype from "opentype.js";

const source = opentype.loadSync(process.argv[2]);
const e = source.charToGlyph("e");
const box = e.getBoundingBox();
const capHeight = source.tables.os2.sCapHeight;
const overshoot = -box.y1;

/** "e" rotated 180° around its own centre, then scaled (sx, sy) from the baseline. */
function schwa(name, unicode, sx, sy) {
  const cx = (box.x1 + box.x2) / 2;
  const cy = (box.y1 + box.y2) / 2;
  const map = (x, y) => [(2 * cx - x) * sx, (2 * cy - y + overshoot) * sy - overshoot];
  const path = new opentype.Path();
  for (const c of e.path.commands) {
    const out = { type: c.type };
    for (const [kx, ky] of [
      ["x", "y"],
      ["x1", "y1"],
      ["x2", "y2"],
    ]) {
      if (c[kx] !== undefined) [out[kx], out[ky]] = map(c[kx], c[ky]);
    }
    path.commands.push(out);
  }
  return new opentype.Glyph({
    name,
    unicode,
    advanceWidth: Math.round(e.advanceWidth * sx),
    path,
  });
}

const capScale = (capHeight + 2 * overshoot) / (box.y2 - box.y1);
const glyphs = [
  new opentype.Glyph({ name: ".notdef", advanceWidth: 500, path: new opentype.Path() }),
  schwa("uni0259", 0x0259, 1, 1),
  // Slightly narrower than a uniform scale so the strokes don't look heavier than the caps.
  schwa("uni018F", 0x018f, capScale * 0.92, capScale),
];

const font = new opentype.Font({
  familyName: "Instrument Serif Schwa",
  styleName: "Italic",
  unitsPerEm: source.unitsPerEm,
  ascender: source.ascender,
  descender: source.descender,
  copyright: source.names.copyright.en,
  glyphs,
});
const out = new URL("../src/fonts/instrument-serif-schwa-italic.otf", import.meta.url);
const { writeFileSync } = await import("node:fs");
writeFileSync(out, Buffer.from(font.toArrayBuffer()));
console.log(`wrote ${out.pathname}`);
