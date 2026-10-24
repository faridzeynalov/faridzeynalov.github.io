// Pixelify Sans (the 8-bit style's text font) needs a few glyphs it lacks or draws ambiguously:
//   ə Ə  — missing; an upside-down "e" lands on exactly the pixels of Russian "э"/"Э", so these
//          are drawn with what tells them apart: a closed bottom bowl and a full-width bar.
//   2 5  — read as "Z" and "S" at text sizes, so they get clearer shapes.
// They're drawn as bitmaps on Pixelify's own pixel grid (5 columns; 5 rows for x-height letters,
// 7 for capitals and digits), for the Regular and Bold weights, into small supplement fonts that
// sit before Pixelify Sans in the font stack (see src/fonts/skins.ts).
//
// Usage: node scripts/build-pixel-glyphs.mjs
import { writeFileSync } from "node:fs";
import opentype from "opentype.js";

// Rows are drawn top to bottom on the x-height grid (5 rows = x-height) for "x" glyphs and on
// the cap grid (7 rows = cap height) for "cap" glyphs; extra rows rise above that height.
const GLYPHS = {
  // At 5×5 pixels "ə", "a" and "э" can't be told apart, so the schwa's back rises one row above
  // the x-height (as in many pixel fonts): taller than "a", and closed at the bottom unlike "э".
  ə: {
    code: 0x0259,
    name: "uni0259",
    grid: "x",
    rows: [".###.", "....#", "....#", "#####", "#...#", ".###."],
  },
  Ə: {
    grid: "cap",
    code: 0x018f,
    name: "uni018F",
    rows: [".###.", "#...#", "....#", "#####", "#...#", "#...#", ".###."],
  },
  2: {
    grid: "cap",
    code: 0x32,
    name: "two",
    rows: [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  },
  5: {
    grid: "cap",
    code: 0x35,
    name: "five",
    rows: ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  },
};

// Grid of each weight, measured from Pixelify's own glyphs ("o", "0", "e"): column edges,
// the baseline overshoot, x-height and cap height (font units, 1000 per em).
const WEIGHTS = [
  {
    file: "src/fonts/pixelify-fixes.otf",
    style: "Regular",
    advance: 586,
    columns: [60, 153, 246, 339, 432, 525],
    bottom: -12,
    xHeight: 450,
    capHeight: 631,
  },
  {
    file: "src/fonts/pixelify-fixes-bold.otf",
    style: "Bold",
    advance: 603,
    // Bold has thicker outer stems and narrower inner columns.
    columns: [61, 188, 263, 339, 414, 542],
    bottom: -11,
    xHeight: 467,
    capHeight: 638,
  },
];

/** Row edges, top row first, for `count` rows of height `step` standing on `bottom`. */
function rowEdges(bottom, step, count) {
  return Array.from({ length: count + 1 }, (_, i) => bottom + (count - i) * step);
}

/** One rectangle per horizontal run of filled pixels. */
function bitmapPath(rows, columns, edges) {
  const path = new opentype.Path();
  rows.forEach((row, r) => {
    const top = edges[r];
    const bottom = edges[r + 1];
    let start = -1;
    for (let c = 0; c <= row.length; c++) {
      const filled = row[c] === "#";
      if (filled && start < 0) start = c;
      if (!filled && start >= 0) {
        const [x0, x1] = [columns[start], columns[c]];
        path.moveTo(x0, bottom);
        path.lineTo(x0, top);
        path.lineTo(x1, top);
        path.lineTo(x1, bottom);
        path.close();
        start = -1;
      }
    }
  });
  return path;
}

for (const weight of WEIGHTS) {
  const glyphs = [
    new opentype.Glyph({ name: ".notdef", advanceWidth: 500, path: new opentype.Path() }),
  ];
  for (const { code, name, rows, grid } of Object.values(GLYPHS)) {
    const step =
      grid === "x" ? (weight.xHeight - weight.bottom) / 5 : (weight.capHeight - weight.bottom) / 7;
    const edges = rowEdges(weight.bottom, step, rows.length);
    glyphs.push(
      new opentype.Glyph({
        name,
        unicode: code,
        advanceWidth: weight.advance,
        path: bitmapPath(rows, weight.columns, edges),
      }),
    );
  }
  const font = new opentype.Font({
    familyName: "Pixelify Fixes",
    styleName: weight.style,
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    glyphs,
  });
  writeFileSync(weight.file, Buffer.from(font.toArrayBuffer()));
  console.log(`wrote ${weight.file}`);
}
