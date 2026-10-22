// Works around a Windows-only issue in Next.js 16's static export: segment prefetch files
// (`__next.portfolio.$d$slug.__PAGE__.txt`) are written as nested folders
// (`__next.portfolio/$d$slug/__PAGE__.txt`) because the exporter joins Windows paths with `\`.
// The client router requests the flat, dot-separated filename, so prefetches 404.
//
// This flattens any such folders back into the expected filenames. On Linux/macOS (including
// the GitHub Actions deploy) the export is already correct and this script does nothing.
import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve(process.argv[2] ?? "out");
let fixed = 0;

function collectFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? collectFiles(full) : [full];
  });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("__next.")) {
      for (const file of collectFiles(full)) {
        const relative = path.relative(dir, file).split(path.sep).join(".");
        fs.renameSync(file, path.join(dir, relative));
        fixed++;
      }
      fs.rmSync(full, { recursive: true, force: true });
    } else {
      walk(full);
    }
  }
}

if (fs.existsSync(outDir)) walk(outDir);
if (fixed > 0) console.log(`fix-export-segments: flattened ${fixed} segment prefetch files`);
