// Lets Payload's CLI load src/payload.config.ts with Node's built-in TypeScript support instead
// of tsx (whose loader breaks the CLI on Node 24): resolves the "@/…" alias and extensionless
// imports to .ts/.tsx files. Used by the "payload" npm script.
import { register } from "node:module";

register(
  `data:text/javascript,${encodeURIComponent(`
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const src = ${JSON.stringify(new URL("../src/", import.meta.url).href)};

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) specifier = src + specifier.slice(2);
  // next has no "exports" map, so ESM needs the file name: "next/cache" -> "next/cache.js".
  if (/^next\\/[\\w-]+$/.test(specifier)) specifier += ".js";
  const local = specifier.startsWith("file:") || specifier.startsWith(".");
  if (local && !/\\.[cm]?[jt]sx?$/.test(specifier)) {
    const base = new URL(specifier, context.parentURL);
    for (const ext of [".ts", ".tsx", "/index.ts"]) {
      const candidate = new URL(base.href + ext);
      if (existsSync(fileURLToPath(candidate))) return next(candidate.href, context);
    }
  }
  return next(specifier, context);
}

// Generated migrations import their argument types as values, which type stripping can't drop.
export async function load(url, context, next) {
  // Static image imports (project screenshots) only matter to Next.js.
  if (/\\.(webp|png|jpe?g|svg)$/.test(url)) {
    return { format: "module", source: "export default {};", shortCircuit: true };
  }
  const result = await next(url, context);
  if (!url.includes("/src/migrations/") || !result.source) return result;
  const source = String(result.source).replace(
    "import { MigrateUpArgs, MigrateDownArgs, sql }",
    "import { type MigrateUpArgs, type MigrateDownArgs, sql }",
  );
  return { ...result, source };
}
`)}`,
);
