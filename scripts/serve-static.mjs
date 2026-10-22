// Minimal static server for the `out/` export that mimics GitHub Pages:
// serves `<path>/index.html` for directories, `404.html` for misses, and honours a base path.
// Usage: node scripts/serve-static.mjs [port]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const port = Number(process.argv[2] ?? 4173);
const root = path.resolve("out");
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
  ".pdf": "application/pdf",
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (basePath) {
      if (!urlPath.startsWith(basePath)) return send404(res);
      urlPath = urlPath.slice(basePath.length) || "/";
    }
    let file = path.join(root, urlPath);
    if (!file.startsWith(root)) return send404(res);
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!urlPath.endsWith("/")) {
        res.writeHead(301, { Location: `${basePath}${urlPath}/` });
        return res.end();
      }
      file = path.join(file, "index.html");
    }
    if (!fs.existsSync(file)) return send404(res);
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`Serving out/ at http://localhost:${port}${basePath}/`));

function send404(res) {
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  fs.createReadStream(path.join(root, "404.html")).pipe(res);
}
