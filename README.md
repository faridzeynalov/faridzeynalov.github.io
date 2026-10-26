# Farid Zeynalov — Portfolio

Personal portfolio for **Farid Zeynalov**, Front-End Developer (React / Next.js) in Baku.
Live at **https://faridzeynalov.com**: a fully static Next.js export, hosted on Vercel. Every page in the menu has its own
signature animation; all of them respect `prefers-reduced-motion` and fall back gracefully on touch.

- **Home** `/` — hero with a live project showcase, selected work, services, skills, AI, experience,
  about, contact
- **Portfolio** `/portfolio/` — 29 production websites, filterable by industry
  (`?industry=hospitality`), with a list view (`?view=list`) where the hovered project's screenshot
  follows the cursor
- **Project detail** `/portfolio/[slug]/` — one statically generated page per project
- **Services** `/services/` — services travel horizontally as you scroll (sticky stage, native
  scroll), plus a "how I work" path that draws itself
- **CV** `/cv/` — the CV as a page, with a reading-progress bar, print styles and the PDF download
- **About** `/about/` — the story lights up word by word as you read; numbers count up on view
- **Contact** `/contact/` — oversized marquee, a message composer that opens the visitor's mail app
  (nothing is sent from the site) and a magnetic send button

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

Production build and preview of the exact files Vercel will serve:

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

## Deploying

The site is live at **https://faridzeynalov.com**, hosted on **Vercel**. Vercel builds and
deploys every push to `main` (and a preview for every other branch). It detects the Next.js
static export by itself: don't set an Output Directory (in `vercel.json` or the project
settings), or the build fails looking for `out/routes-manifest.json`.

`.github/workflows/ci.yml` runs on every push and pull request: lint, type-check, unit tests,
build and the Playwright suite against the export. On `main` it also keeps the old address,
`faridzeynalov.github.io`, redirecting page for page to the new domain
(`scripts/pages-redirect/index.html`, deployed as the GitHub Pages site).

### Domain and URLs

- Canonical URLs, Open Graph, `sitemap.xml` and `robots.txt` use `https://faridzeynalov.com`
  (`PRODUCTION_URL` in `src/lib/site.ts`), on preview deployments too, so previews don't
  compete with the live site. Set `NEXT_PUBLIC_SITE_URL` in Vercel to override it.
- `www.faridzeynalov.com` redirects to the apex domain (set in Vercel → Domains).
- `vercel.json` redirects older link styles (`/en`, `/en/about` → `/`, `/about`) with a 301,
  and sets security headers (Vercel already caches `/_next/static` for good). Trailing slashes are
  dropped (`/about/` → `/about`).

### How the static setup works

- `output: "export"` with `trailingSlash: false`: every route becomes `route.html`, which
  Vercel serves at the clean, extensionless URL. No server functions, nothing to run.
- `basePath` / `assetPrefix` come from `NEXT_PUBLIC_BASE_PATH` (`next.config.ts`), empty on
  faridzeynalov.com. It's only needed to serve the export from a sub-folder. Links use
  `next/link` and images use static imports, so both pick it up; plain files from `public/` go
  through `withBasePath()` in `src/lib/site.ts`.
- `images.unoptimized`: screenshots are pre-optimized to WebP at build time.
- `generateStaticParams` + `dynamicParams = false` generate every project page at build time.
- `og.png`, `sitemap.xml` and `robots.txt` are generated at build time.
- `out/404.html` is the custom not-found page, served for unknown URLs.
- The theme is applied by a tiny inline script in `<head>` before first paint (no flash) and
  saved in `localStorage`.
- `scripts/fix-export-segments.mjs` runs after `next build`. It fixes a Windows-only issue in
  Next.js 16's exporter (prefetch files written as nested folders) and does nothing on
  Linux/macOS, including Vercel and CI.

### Contact

The site has no backend: contact goes through `mailto:`, `tel:` and LinkedIn links. A contact
form would need a form service or a serverless function; nothing in the UI pretends to send
messages.

## Project structure

```
.github/workflows/ci.yml        Checks + the github.io → faridzeynalov.com redirect
scripts/pages-redirect/         That redirect page
vercel.json                     Vercel build, redirects and headers
e2e/                            Playwright tests (run against out/)
public/                         CV PDF
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
