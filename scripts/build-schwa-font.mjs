// Several display fonts used on the site have no "ə"/"Ə" (U+0259 / U+018F), so Azerbaijani
// words fell back to another font for that one letter. The schwa is an upside-down "e", so this
// builds a tiny supplementary font with both glyphs drawn from the source font's own "e":
// rotated 180°, and for the capital also stretched to the height of its "E". The supplement is
// loaded before the source font in the font stack and only contains these two characters.
//
// Usage: node scripts/build-schwa-font.mjs <source.ttf> <out.otf> "<Family Name>" [--pixel]
//   --pixel  keep glyph widths unscaled so pixel fonts stay on their pixel grid
//
// Built so far (sources are the Google Fonts TTFs, all SIL Open Font License 1.1):
//   Instrument Serif Italic → src/fonts/instrument-serif-schwa-italic.otf
//   Press Start 2P          → src/fonts/press-start-schwa.otf (--pixel)
//   Pixelify Sans           → src/fonts/pixelify-schwa.otf (--pixel)
import { writeFileSync } from "node:fs";
import opentype from "opentype.js";

const [sourcePath, outPath, familyName, flag] = process.argv.slice(2);
if (!sourcePath || !outPath || !familyName) {
  console.error(
    'Usage: node scripts/build-schwa-font.mjs <source.ttf> <out.otf> "<Family>" [--pixel]',
  );
  process.exit(1);
}
const pixel = flag === "--pixel";

const source = opentype.loadSync(sourcePath);
const e = source.charToGlyph("e");
const E = source.charToGlyph("E");
const box = e.getBoundingBox();
const capBox = E.getBoundingBox();
const xHeight = source.tables.os2.sxHeight;

/** "e" rotated 180° around its own centre, then stretched vertically to [bottom, top]. */
function schwa(name, unicode, bottom, top, widthScale) {
  const cx = (box.x1 + box.x2) / 2;
  const cy = (box.y1 + box.y2) / 2;
  const sy = (top - bottom) / (box.y2 - box.y1);
  const map = (x, y) => [(2 * cx - x) * widthScale, bottom + (2 * cy - y - box.y1) * sy];
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
    advanceWidth: Math.round(e.advanceWidth * widthScale),
    path,
  });
}

// Capital: from the bottom of "e" to the top of "E", plus the same overshoot "e" has above the
// x-height (round letters overshoot flat ones).
const capTop = capBox.y2 + Math.max(0, box.y2 - xHeight);
const capStretch = (capTop - box.y1) / (box.y2 - box.y1);
const glyphs = [
  new opentype.Glyph({ name: ".notdef", advanceWidth: 500, path: new opentype.Path() }),
  schwa("uni0259", 0x0259, box.y1, box.y2, 1),
  // Pixel fonts keep their width (pixel grid); others get slightly narrower than a uniform
  // scale so the strokes don't look heavier than the font's capitals.
  schwa("uni018F", 0x018f, box.y1, capTop, pixel ? 1 : capStretch * 0.92),
];

const font = new opentype.Font({
  familyName,
  styleName: "Regular",
  unitsPerEm: source.unitsPerEm,
  ascender: source.ascender,
  descender: source.descender,
  copyright: source.names.copyright?.en ?? "SIL Open Font License 1.1",
  glyphs,
});
writeFileSync(outPath, Buffer.from(font.toArrayBuffer()));
console.log(`wrote ${outPath}`);
