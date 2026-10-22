import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 4173);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * E2E tests run against the production static export (`out/`), served locally —
 * the same files GitHub Pages will host.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}${basePath}/`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `node scripts/serve-static.mjs ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
