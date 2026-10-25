// The 8-bit style's pixel fonts need a few glyphs they lack or draw badly for Azerbaijani:
//
// Press Start 2P (headings) has no "ə"/"Ə", and draws "ç ş Ç Ş Ö Ü Ğ İ" squashed (shorter than
// the other letters, "ç"/"ş" even floating above the baseline) to make room for their marks.
// They're redrawn at full height, with the marks above the cap height or below the baseline.
// Its "a" is already an upside-down "e", so no 5-row "ə" reads as anything but "a" ("Xidmatlar");
// "ə" rises one row above the x-height (like "t"), with its hook curling down at the top left.
//
// Pixelify Sans (text) has no "ə"/"Ə" either, and its "2"/"5" read as "Z"/"S". An upside-down
// "e" lands on exactly the pixels of Russian "э", so its "ə" has a full-width bar instead, which
// closes the bottom bowl.
//
// They're drawn as bitmaps on each font's own pixel grid into small supplement fonts that sit
// before the font in the stack and, by unicode-range, only load on pages that use those
// characters (see src/fonts/skins.ts).
//
// Usage: node scripts/build-pixel-glyphs.mjs
import { writeFileSync } from "node:fs";
import opentype from "opentype.js";

/** One rectangle per horizontal run of filled pixels; `edges` are the row edges, top first. */
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

function writeFont({ file, family, style, ascender, descender, glyphs }) {
  const font = new opentype.Font({
    familyName: family,
    styleName: style,
    unitsPerEm: 1000,
    ascender,
    descender,
    glyphs: [
      new opentype.Glyph({ name: ".notdef", advanceWidth: 500, path: new opentype.Path() }),
      ...glyphs,
    ],
  });
  writeFileSync(file, Buffer.from(font.toArrayBuffer()));
  console.log(`wrote ${file}`);
}

// --- Press Start 2P: an 8×8 grid of 125-unit pixels. Letters stand on row 2 (y 125–250);
// x-height is 5 rows, capitals 7. Rows are listed top first, starting at row `top`.

const PRESS_START = {
  ə: {
    code: 0x0259,
    top: 7,
    rows: [".####...", "#...##..", ".....##.", "#######.", "##...##.", ".#####.."],
  },
  Ə: {
    code: 0x018f,
    top: 8,
    rows: [".#####..", "##...##.", ".....##.", "#######.", "##...##.", "##...##.", ".#####.."],
  },
  ç: {
    code: 0x00e7,
    top: 6,
    rows: [".######.", "##......", "##......", "##......", ".######.", "....#...", "..##...."],
  },
  ş: {
    code: 0x015f,
    top: 6,
    rows: [".#####..", "##......", ".#####..", ".....##.", "######..", "....#...", "..##...."],
  },
  Ç: {
    code: 0x00c7,
    top: 8,
    rows: [
      "..####..",
      ".##..##.",
      "##......",
      "##......",
      "##......",
      ".##..##.",
      "..####..",
      "....#...",
      "..##....",
    ],
  },
  Ş: {
    code: 0x015e,
    top: 8,
    rows: [
      ".#####..",
      "##...##.",
      "##......",
      ".#####..",
      ".....##.",
      "##...##.",
      ".#####..",
      "....#...",
      "..##....",
    ],
  },
  Ö: {
    code: 0x00d6,
    top: 10,
    rows: [
      ".##.##..",
      "........",
      ".#####..",
      "##...##.",
      "##...##.",
      "##...##.",
      "##...##.",
      "##...##.",
      ".#####..",
    ],
  },
  Ü: {
    code: 0x00dc,
    top: 10,
    rows: [
      ".##.##..",
      "........",
      "##...##.",
      "##...##.",
      "##...##.",
      "##...##.",
      "##...##.",
      "##...##.",
      ".#####..",
    ],
  },
  Ğ: {
    code: 0x011e,
    top: 10,
    rows: [
      ".#...#..",
      "..###...",
      "..#####.",
      ".##.....",
      "##......",
      "##..###.",
      "##...##.",
      ".##..##.",
      "..#####.",
    ],
  },
  İ: {
    code: 0x0130,
    top: 10,
    rows: [
      "...##...",
      "........",
      ".######.",
      "...##...",
      "...##...",
      "...##...",
      "...##...",
      "...##...",
      ".######.",
    ],
  },
};

const PX = 125;
writeFont({
  file: "src/fonts/press-start-fixes.otf",
  family: "Press Start Fixes",
  style: "Regular",
  // Press Start's own metrics, so these glyphs don't change the line height.
  ascender: 1000,
  descender: 0,
  glyphs: Object.values(PRESS_START).map(
    ({ code, top, rows }) =>
      new opentype.Glyph({
        name: `uni${code.toString(16).toUpperCase().padStart(4, "0")}`,
        unicode: code,
        advanceWidth: 1000,
        path: bitmapPath(
          rows,
          Array.from({ length: 9 }, (_, c) => c * PX),
          Array.from({ length: rows.length + 1 }, (_, i) => (top - i) * PX),
        ),
      }),
  ),
});

// --- Pixelify Sans: 5 columns; 5 rows for x-height letters, 7 for capitals and digits.

const PIXELIFY = {
  ə: { code: 0x0259, grid: "x", rows: [".###.", "....#", "#####", "#...#", ".###."] },
  Ə: {
    code: 0x018f,
    grid: "cap",
    rows: [".###.", "#...#", "....#", "#####", "#...#", "#...#", ".###."],
  },
  2: {
    code: 0x32,
    grid: "cap",
    name: "two",
    rows: [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  },
  5: {
    code: 0x35,
    grid: "cap",
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

for (const weight of WEIGHTS) {
  writeFont({
    file: weight.file,
    family: "Pixelify Fixes",
    style: weight.style,
    ascender: 800,
    descender: -200,
    glyphs: Object.values(PIXELIFY).map(({ code, name, rows, grid }) => {
      const step =
        grid === "x"
          ? (weight.xHeight - weight.bottom) / 5
          : (weight.capHeight - weight.bottom) / 7;
      const edges = Array.from(
        { length: rows.length + 1 },
        (_, i) => weight.bottom + (rows.length - i) * step,
      );
      return new opentype.Glyph({
        name: name ?? `uni${code.toString(16).toUpperCase().padStart(4, "0")}`,
        unicode: code,
        advanceWidth: weight.advance,
        path: bitmapPath(rows, weight.columns, edges),
      });
    }),
  });
}
