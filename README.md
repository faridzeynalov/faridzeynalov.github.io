# Farid Zeynalov — Portfolio

Personal portfolio for **Farid Zeynalov**, Front-End Developer (React / Next.js) in Baku.
Three pages — Home, Portfolio and a project detail template — built as a fully static
Next.js export for GitHub Pages.

- **Home** `/` — hero with a live project showcase, selected work, skills, experience, about, contact
- **Portfolio** `/portfolio/` — 24 projects from the CV, filterable by industry (`?industry=hospitality`)
- **Project detail** `/portfolio/[slug]/` — one statically generated page per project

## Tech stack

| Library                                            | Purpose                                                  |
| -------------------------------------------------- | -------------------------------------------------------- |
| Next.js 16 (App Router, `output: "export"`)        | Routing, static generation, metadata, fonts              |
| TypeScript (strict)                                | Types for content and components                         |
| Tailwind CSS 4                                     | Styling with design tokens in `src/app/globals.css`      |
| shadcn/ui conventions + `class-variance-authority` | `Button`/`Badge` primitives (`src/components/ui`)        |
| Motion for React (`motion`)                        | Scroll reveals, layout animations, mobile menu, showcase |
| Lucide React                                       | Icons                                                    |
| Vitest + Testing Library                           | Unit and component tests                                 |
| Playwright                                         | End-to-end tests against the exported site               |
| ESLint + Prettier                                  | Linting and formatting                                   |

No state library, data-fetching library or backend — content lives in typed local files.

## Run locally

Requires Node.js 20.9+ (CI uses Node 22).

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build and preview of the exact files GitHub Pages will serve:

```bash
npm run build        # writes the static site to out/
npm start            # serves out/ at http://localhost:4173
```

### Checks

```bash
npm run lint
npm run typecheck
npm test             # Vitest
npm run test:e2e     # Playwright — run `npm run build` first; `npx playwright install chromium` once
npm run check        # lint + typecheck + unit tests + build
```

## Editing content

Everything is data-driven — no page needs editing to change copy.

| File                           | What it holds                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| `src/data/profile.ts`          | Name, summary, about text, contact links, skills, experience, education, languages       |
| `src/data/projects.ts`         | All projects: summary, overview, live-site features, stack, accent colour, featured flag |
| `src/data/industries.ts`       | Industry labels used by the filters                                                      |
| `src/data/project-images.ts`   | Generated map of screenshot imports (don't edit by hand)                                 |
| `public/farid-zeynalov-cv.pdf` | The downloadable CV                                                                      |

**Adding your own notes to a project:** each project has an optional `contribution` field. It's
empty because the CV doesn't document per-project responsibilities. Fill it in and a
"My role" section appears on that project's page.

**Featured projects:** set `featured: true` (the home page shows them in list order).

**Theme default:** `FOLLOW_SYSTEM_THEME` in `src/lib/theme.ts`. With `true`, first-time
visitors whose OS is set to light mode get the light theme; set it to `false` to always
start dark until the visitor picks a theme.

### Project screenshots

Previews are real screenshots of the live websites, captured with Playwright in
October 2026 and stored as optimized WebP in `src/assets/projects/<slug>/`
(`cover`, `thumb`, `mobile`, optional `section`). To refresh them:

```bash
npm run capture:projects   # screenshots every site into .captures/ (git-ignored)
npm run capture:images     # converts to WebP and regenerates src/data/project-images.ts
```

Which capture is used as each project's cover is set in `scripts/optimize-captures.mjs`.
`palid.az` (SSL error) was unreachable at capture time and shows a
clearly labelled "Preview unavailable" placeholder instead. `chinarhotel.az` was removed from the portfolio because its live site was not loading content.

## Deploying to GitHub Pages

The workflow in `.github/workflows/deploy.yml` lints, type-checks, runs the unit tests, builds,
runs the Playwright suite against the export, and deploys `out/` on every push to `main`.

1. Push this project to a GitHub repository with `main` as the default branch.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).

The base path is detected automatically from the Pages configuration:

| Where it's hosted                                           | Base path | What to do                                                |
| ----------------------------------------------------------- | --------- | --------------------------------------------------------- |
| `https://<user>.github.io/<repo>/` (project repo)           | `/<repo>` | Nothing                                                   |
| `https://<user>.github.io/` (repo named `<user>.github.io`) | none      | Nothing                                                   |
| Custom domain (e.g. `https://www.example.com/`)             | none      | Add the domain under **Settings → Pages → Custom domain** |

To override detection, add repository variables under **Settings → Secrets and variables →
Actions → Variables**:

- `NEXT_PUBLIC_BASE_PATH` — e.g. `/portfolio` (leave empty for root)
- `NEXT_PUBLIC_SITE_URL` — the full public URL including the base path, e.g.
  `https://<user>.github.io/portfolio`. Used for canonical URLs, Open Graph and the sitemap.

To test a sub-path build locally (in Git Bash on Windows, prefix with `MSYS_NO_PATHCONV=1`
so the path isn't rewritten into a Windows path):

```bash
NEXT_PUBLIC_BASE_PATH=/portfolio NEXT_PUBLIC_SITE_URL=https://example.github.io/portfolio npm run build
NEXT_PUBLIC_BASE_PATH=/portfolio npm start   # http://localhost:4173/portfolio/
```

### How the static setup works

- `output: "export"` and `trailingSlash: true` — every route becomes `route/index.html`,
  which GitHub Pages serves without rewrites.
- `basePath` / `assetPrefix` come from `NEXT_PUBLIC_BASE_PATH` (`next.config.ts`). Links use
  `next/link` and images use static imports, so both pick up the base path automatically.
  Plain files from `public/` go through `withBasePath()` in `src/lib/site.ts`.
- `images.unoptimized` — there's no image server, so screenshots are pre-optimized to WebP.
- `generateStaticParams` + `dynamicParams = false` generate every project page at build time.
- `og.png`, `sitemap.xml` and `robots.txt` are generated at build time.
- `out/404.html` is the custom not-found page; GitHub Pages serves it for unknown URLs.
- `public/.nojekyll` stops GitHub Pages from ignoring the `_next/` folder.
- The theme is applied by a tiny inline script in `<head>` before first paint (no flash) and
  saved in `localStorage`.
- `scripts/fix-export-segments.mjs` runs after `next build`. It fixes a Windows-only issue in
  Next.js 16's exporter (prefetch files written as nested folders) and does nothing on
  Linux/macOS, including CI.

### Contact

The site has no backend: contact goes through `mailto:`, `tel:` and LinkedIn links. A contact
form would need a form service or a serverless function; nothing in the UI pretends to send
messages.

## Project structure

```
.github/workflows/deploy.yml    CI + GitHub Pages deployment
e2e/                            Playwright tests (run against out/)
public/                         CV PDF, .nojekyll
scripts/                        Screenshot capture/optimisation, static server, export fix
src/
  app/
    layout.tsx                  Fonts, metadata, theme script, header/footer
    page.tsx                    Home
    portfolio/page.tsx          Portfolio listing
    portfolio/[slug]/page.tsx   Project detail template
    not-found.tsx               Custom 404
    og.png/route.tsx            Open Graph image (static)
    sitemap.ts, robots.ts, icon.svg, globals.css
  assets/projects/<slug>/       WebP screenshots
  components/
    layout/                     Header, mobile nav, footer, theme toggle, logo
    motion/                     Motion provider, scroll reveals, CSS entrance helpers
    projects/                   Device frames, cards, featured rows, filterable grid, pager
    sections/                   Home page sections
    ui/                         Button, Badge, CopyButton
  data/                         profile.ts, projects.ts, industries.ts, project-images.ts
  lib/                          Queries, theme, site/base-path helpers, utils
  types/                        Project and profile types
```
