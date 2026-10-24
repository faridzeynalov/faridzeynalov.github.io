// Builds the pen strokes for the Paper style's handwritten About story.
//
// A normal font (Caveat here) describes each letter as a filled outline, which can't be "drawn"
// with a pen. This derives a single-line version of the letters the About texts use: each glyph
// is rasterized, thinned to its 1-pixel centre line (Zhang–Suen), traced into lines, pruned of
// thinning spurs and chained into pen strokes in a handwriting-like order — main shapes left to
// right (straightest continuation at crossings), then small marks (dots, diacritics). It also
// measures how thick the letter's strokes are, so the pen reveals the full ink width.
//
// The page draws each stroke from 0 as a mask over the real Caveat outline (ScrollLitText), so
// the result looks exactly like Caveat, but appears stroke by stroke, with the pen following.
//
// Output: src/components/about/handwriting/{en,az,ru}.json, only the letters each text uses.
// Usage: node scripts/build-handwriting.mjs [path/to/Caveat-Medium.ttf]
//   (downloads Caveat Medium from Google Fonts when no path is given)
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import opentype from "opentype.js";

const LOCALES = ["en", "az", "ru"];
const SCALE = 0.3; // raster pixels per font unit
const PAD = 4; // raster pixels around each glyph
const OUT_DIR = "src/components/about/handwriting";

async function loadFont() {
  let path = process.argv[2];
  if (!path) {
    path = join(tmpdir(), "Caveat-Medium.ttf");
    if (!existsSync(path)) {
      const css = await (
        await fetch("https://fonts.googleapis.com/css2?family=Caveat:wght@500")
      ).text();
      const url = css.match(/https:\/\/[^)]+\.ttf/)[0];
      writeFileSync(path, Buffer.from(await (await fetch(url)).arrayBuffer()));
    }
  }
  return opentype.loadSync(path);
}

// ---------------------------------------------------------------- outline → bitmap

/** Flattens a glyph path (font units, y up) into line segments in raster space. */
function flatten(commands, toRaster) {
  const edges = [];
  let start = null;
  let prev = null;
  const line = (p) => {
    edges.push([prev, p]);
    prev = p;
  };
  for (const c of commands) {
    if (c.type === "M") {
      start = prev = toRaster(c.x, c.y);
    } else if (c.type === "L") {
      line(toRaster(c.x, c.y));
    } else if (c.type === "Q" || c.type === "C") {
      const p0 = prev;
      const p3 = toRaster(c.x, c.y);
      const p1 = toRaster(c.x1, c.y1);
      const p2 = c.type === "C" ? toRaster(c.x2, c.y2) : null;
      for (let i = 1; i <= 12; i++) {
        const t = i / 12;
        const u = 1 - t;
        const p =
          c.type === "Q"
            ? [
                u * u * p0[0] + 2 * u * t * p1[0] + t * t * p3[0],
                u * u * p0[1] + 2 * u * t * p1[1] + t * t * p3[1],
              ]
            : [
                u * u * u * p0[0] +
                  3 * u * u * t * p1[0] +
                  3 * u * t * t * p2[0] +
                  t * t * t * p3[0],
                u * u * u * p0[1] +
                  3 * u * u * t * p1[1] +
                  3 * u * t * t * p2[1] +
                  t * t * t * p3[1],
              ];
        line(p);
      }
    } else if (c.type === "Z" && start && prev) {
      if (prev[0] !== start[0] || prev[1] !== start[1]) line(start);
      prev = start;
    }
  }
  return edges;
}

/** Non-zero winding scanline fill. */
function rasterize(edges, width, height) {
  const bitmap = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const cy = y + 0.5;
    const hits = [];
    for (const [[x0, y0], [x1, y1]] of edges) {
      if (y0 === y1) continue;
      if ((cy >= y0 && cy < y1) || (cy >= y1 && cy < y0)) {
        hits.push([x0 + ((cy - y0) / (y1 - y0)) * (x1 - x0), y1 > y0 ? 1 : -1]);
      }
    }
    hits.sort((a, b) => a[0] - b[0]);
    let winding = 0;
    for (let i = 0; i < hits.length - 1; i++) {
      winding += hits[i][1];
      if (winding === 0) continue;
      const from = Math.max(0, Math.ceil(hits[i][0] - 0.5));
      const to = Math.min(width - 1, Math.floor(hits[i + 1][0] - 0.5));
      for (let x = from; x <= to; x++) bitmap[y * width + x] = 1;
    }
  }
  return bitmap;
}

// ---------------------------------------------------------------- bitmap → centre line

function thin(bitmap, width, height) {
  const img = bitmap.slice();
  const at = (x, y) => (x < 0 || y < 0 || x >= width || y >= height ? 0 : img[y * width + x]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const step of [0, 1]) {
      const remove = [];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (!img[y * width + x]) continue;
          const p = [
            at(x, y - 1),
            at(x + 1, y - 1),
            at(x + 1, y),
            at(x + 1, y + 1),
            at(x, y + 1),
            at(x - 1, y + 1),
            at(x - 1, y),
            at(x - 1, y - 1),
          ];
          const b = p.reduce((s, v) => s + v, 0);
          if (b < 2 || b > 6) continue;
          let a = 0;
          for (let i = 0; i < 8; i++) if (!p[i] && p[(i + 1) % 8]) a++;
          if (a !== 1) continue;
          if (step === 0 && (p[0] * p[2] * p[4] || p[2] * p[4] * p[6])) continue;
          if (step === 1 && (p[0] * p[2] * p[6] || p[0] * p[4] * p[6])) continue;
          remove.push(y * width + x);
        }
      }
      for (const i of remove) img[i] = 0;
      if (remove.length) changed = true;
    }
  }
  return img;
}

/** Chamfer distance to the background, for the stroke thickness. */
function distanceTransform(bitmap, width, height) {
  const d = new Float32Array(width * height).map((_, i) => (bitmap[i] ? 1e9 : 0));
  const pass = (xs, ys, offsets) => {
    for (const y of ys) {
      for (const x of xs) {
        const i = y * width + x;
        if (!d[i]) continue;
        for (const [dx, dy, w] of offsets) {
          const nx = x + dx;
          const ny = y + dy;
          const v = nx < 0 || ny < 0 || nx >= width || ny >= height ? 0 : d[ny * width + nx];
          if (v + w < d[i]) d[i] = v + w;
        }
      }
    }
  };
  const range = (n) => Array.from({ length: n }, (_, i) => i);
  pass(range(width), range(height), [
    [-1, 0, 1],
    [0, -1, 1],
    [-1, -1, 1.414],
    [1, -1, 1.414],
  ]);
  pass(range(width).reverse(), range(height).reverse(), [
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1.414],
    [-1, 1, 1.414],
  ]);
  return d;
}

/** 8-connected neighbours, but a diagonal only when no shared 4-neighbour links them already. */
function neighbours(skeleton, width, height, x, y) {
  const on = (cx, cy) =>
    cx >= 0 && cy >= 0 && cx < width && cy < height && skeleton[cy * width + cx];
  const out = [];
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ])
    if (on(x + dx, y + dy)) out.push([x + dx, y + dy]);
  for (const [dx, dy] of [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]) {
    if (on(x + dx, y + dy) && !on(x + dx, y) && !on(x, y + dy)) out.push([x + dx, y + dy]);
  }
  return out;
}

/** Splits the skeleton into chains between nodes (end points and junctions), plus loops. */
function traceChains(skeleton, width, height) {
  const key = (x, y) => y * width + x;
  const degree = new Map();
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (skeleton[key(x, y)])
        degree.set(key(x, y), neighbours(skeleton, width, height, x, y).length);
  const isNode = (k) => degree.get(k) !== 2;
  const used = new Set(); // "a>b" steps already walked
  const visited = new Set();
  const chains = [];
  const walk = (start, next) => {
    const chain = [start, next];
    used.add(`${key(...start)}>${key(...next)}`);
    let [prev, cur] = [start, next];
    while (!isNode(key(...cur))) {
      visited.add(key(...cur));
      const step = neighbours(skeleton, width, height, ...cur).find(
        (n) => !(n[0] === prev[0] && n[1] === prev[1]),
      );
      if (!step) break;
      chain.push(step);
      [prev, cur] = [cur, step];
      if (key(...cur) === key(...chain[0])) break; // closed back on itself
    }
    used.add(`${key(...cur)}>${key(...prev)}`);
    return chain;
  };
  for (const [k, deg] of degree) {
    if (deg === 2) continue;
    const p = [k % width, Math.floor(k / width)];
    visited.add(k);
    for (const n of neighbours(skeleton, width, height, ...p)) {
      if (used.has(`${k}>${key(...n)}`)) continue;
      chains.push(walk(p, n));
    }
  }
  // Loops with no nodes at all (e.g. "o"): start at the top-left pixel.
  for (const [k] of degree) {
    if (visited.has(k)) continue;
    const loopStart = [k % width, Math.floor(k / width)];
    const first = neighbours(skeleton, width, height, ...loopStart)[0];
    if (!first) continue;
    const chain = [loopStart];
    let [prev, cur] = [loopStart, first];
    visited.add(k);
    while (!visited.has(key(...cur))) {
      visited.add(key(...cur));
      chain.push(cur);
      const step = neighbours(skeleton, width, height, ...cur).find(
        (n) => !(n[0] === prev[0] && n[1] === prev[1]),
      );
      if (!step) break;
      [prev, cur] = [cur, step];
    }
    chain.push(loopStart);
    chains.push(chain);
  }
  return chains;
}

const length = (chain) =>
  chain.reduce(
    (s, p, i) => (i ? s + Math.hypot(p[0] - chain[i - 1][0], p[1] - chain[i - 1][1]) : 0),
    0,
  );

// ---------------------------------------------------------------- chains → pen strokes

/** Joins chains into strokes: start at the leftmost free end, keep the straightest way on. */
function orderStrokes(chains) {
  const k = (p) => `${p[0]},${p[1]}`;
  const remaining = new Set(chains.map((_, i) => i));
  const ends = new Map(); // point → chain indexes touching it
  chains.forEach((c, i) => {
    for (const p of [c[0], c[c.length - 1]]) {
      if (!ends.has(k(p))) ends.set(k(p), []);
      ends.get(k(p)).push(i);
    }
  });
  const direction = (chain, fromStart) => {
    const pts = fromStart ? chain : [...chain].reverse();
    const a = pts[0];
    const b = pts[Math.min(pts.length - 1, 6)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  };
  const strokes = [];
  while (remaining.size) {
    // Start: prefer a free end (touching one chain), leftmost then topmost.
    let best = null;
    for (const i of remaining) {
      const c = chains[i];
      for (const [p, fromStart] of [
        [c[0], true],
        [c[c.length - 1], false],
      ]) {
        const free = ends.get(k(p)).filter((j) => remaining.has(j)).length === 1;
        const score = (free ? 0 : 1e6) + p[0] * 1000 + p[1];
        if (!best || score < best.score) best = { score, i, fromStart };
      }
    }
    let stroke = [];
    let { i, fromStart } = best;
    for (;;) {
      remaining.delete(i);
      const pts = fromStart ? chains[i] : [...chains[i]].reverse();
      stroke = stroke.concat(stroke.length ? pts.slice(1) : pts);
      const end = pts[pts.length - 1];
      const heading = direction(pts.slice(-7), true);
      let next = null;
      for (const j of ends.get(k(end)) ?? []) {
        if (!remaining.has(j)) continue;
        const startsHere = k(chains[j][0]) === k(end);
        const d = direction(chains[j], startsHere);
        const dot = heading[0] * d[0] + heading[1] * d[1];
        if (!next || dot > next.dot) next = { j, startsHere, dot };
      }
      if (!next || next.dot < -0.35) break; // too sharp a turn: lift the pen
      i = next.j;
      fromStart = next.startsHere;
    }
    strokes.push(stroke);
  }
  return strokes;
}

/** Ramer–Douglas–Peucker. */
function simplify(points, epsilon) {
  if (points.length < 3) return points;
  const [a, b] = [points[0], points[points.length - 1]];
  let index = 0;
  let max = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const d = len
      ? Math.abs((b[1] - a[1]) * p[0] - (b[0] - a[0]) * p[1] + b[0] * a[1] - b[1] * a[0]) / len
      : Math.hypot(p[0] - a[0], p[1] - a[1]);
    if (d > max) [index, max] = [i, d];
  }
  if (max <= epsilon) return [a, b];
  return simplify(points.slice(0, index + 1), epsilon)
    .slice(0, -1)
    .concat(simplify(points.slice(index), epsilon));
}

// ---------------------------------------------------------------- glyph → data

function buildGlyph(font, glyph) {
  const box = glyph.getBoundingBox();
  const asc = font.ascender;
  const width = Math.ceil((box.x2 - box.x1) * SCALE) + PAD * 2;
  const height = Math.ceil((box.y2 - box.y1) * SCALE) + PAD * 2;
  const toRaster = (x, y) => [(x - box.x1) * SCALE + PAD, (box.y2 - y) * SCALE + PAD];
  // Raster → glyph space with y pointing down from the ascender (the SVG's coordinates).
  const toFont = ([rx, ry]) => [
    Math.round((rx + 0.5 - PAD) / SCALE + box.x1),
    Math.round(asc - (box.y2 - (ry + 0.5 - PAD) / SCALE)),
  ];

  const bitmap = rasterize(flatten(glyph.path.commands, toRaster), width, height);
  const skeleton = thin(bitmap, width, height);
  const dist = distanceTransform(bitmap, width, height);
  let thickness = 0;
  for (let i = 0; i < skeleton.length; i++)
    if (skeleton[i]) thickness = Math.max(thickness, dist[i]);

  // Prune spurs: short chains ending in a free end next to a junction (thinning artefacts).
  let chains = traceChains(skeleton, width, height);
  const spur = Math.max(3, thickness * 1.2);
  for (let pass = 0; pass < 2; pass++) {
    const counts = new Map();
    for (const c of chains)
      for (const p of [c[0], c[c.length - 1]]) counts.set(`${p}`, (counts.get(`${p}`) ?? 0) + 1);
    const kept = chains.filter((c) => {
      const freeEnds = [c[0], c[c.length - 1]].filter((p) => counts.get(`${p}`) === 1).length;
      return !(freeEnds === 1 && length(c) < spur);
    });
    if (kept.length === chains.length) break;
    for (const c of chains.filter((x) => !kept.includes(x)))
      for (const [x, y] of c) skeleton[y * width + x] = 0;
    chains = traceChains(skeleton, width, height);
  }

  // Components: main shapes first (left to right), then small marks (dots, diacritics).
  const groups = [];
  const strokes = orderStrokes(chains.filter((c) => c.length > 1)).map((s) => {
    // People start an open stroke at its top-left end ("a", "e", "s" start at the top, not at
    // the tail), so orient each one that way. Closed loops keep their traced start.
    const [first, last] = [s[0], s[s.length - 1]];
    if (first[0] === last[0] && first[1] === last[1]) return s;
    const score = (p) => p[0] * 0.6 + p[1];
    return score(last) < score(first) ? [...s].reverse() : s;
  });
  for (const s of strokes) {
    const minX = Math.min(...s.map((p) => p[0]));
    groups.push({ s, minX, len: length(s) });
  }
  const longest = Math.max(1, ...groups.map((g) => g.len));
  const isMark = (g) => g.len < longest * 0.22;
  groups.sort((a, b) => Number(isMark(a)) - Number(isMark(b)) || a.minX - b.minX);

  const d = groups
    .map(({ s }) => simplify(s, 0.9).map(toFont))
    .map((pts) => (pts.length === 1 ? [pts[0], pts[0]] : pts))
    .map((pts) => `M${pts.map((p) => p.join(" ")).join("L")}`)
    .join("");

  // Outline in the same y-down space.
  const outline = glyph.getPath(0, asc, font.unitsPerEm).toPathData(0);
  return {
    a: glyph.advanceWidth,
    o: outline,
    s: d,
    // Mask stroke width: the thickest part of the letter, plus a margin for anti-aliasing.
    w: Math.round(((thickness * 2 + 2) / SCALE) * 1.15),
  };
}

const font = await loadFont();
mkdirSync(OUT_DIR, { recursive: true });
for (const locale of LOCALES) {
  const content = await import(`../src/content/${locale}.ts`);
  const text = content[locale].profile.about.join(" ");
  const glyphs = {};
  for (const ch of [...new Set([...text.replace(/\s/g, "")])].sort()) {
    const glyph = font.charToGlyph(ch);
    if (!glyph.index) continue;
    glyphs[ch] = buildGlyph(font, glyph);
  }
  const data = { ascender: font.ascender, descender: font.descender, glyphs };
  writeFileSync(join(OUT_DIR, `${locale}.json`), JSON.stringify(data));
  console.log(
    `${locale}: ${Object.keys(glyphs).length} glyphs, ${JSON.stringify(data).length} bytes`,
  );
}
