import { expect, test, type Page } from "@playwright/test";

/** Collects same-origin requests that failed, so broken assets/prefetches are caught. */
function trackFailedRequests(page: Page) {
  const failed: string[] = [];
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.host === new URL(page.url() || "http://localhost").host && response.status() >= 400) {
      failed.push(`${response.status()} ${url.pathname}`);
    }
  });
  return failed;
}

test.describe("home", () => {
  test("renders the hero and key sections", async ({ page }) => {
    const failed = trackFailedRequests(page);
    await page.goto("./");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Farid Zeynalov");
    await expect(page.getByRole("link", { name: "View my work" })).toBeVisible();
    for (const name of [
      /Real sites/,
      /build for you/,
      /toolkit/,
      /how I work/,
      /been building/,
      /about me/,
      /Let.s talk/,
    ]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeAttached();
    }
    await expect(page.getByRole("link", { name: "zeynalovf7@gmail.com" }).first()).toHaveAttribute(
      "href",
      "mailto:zeynalovf7@gmail.com",
    );

    await page.waitForLoadState("networkidle");
    expect(failed).toEqual([]);
  });

  test("hero showcase lets visitors pick a project", async ({ page }) => {
    await page.goto("./");
    const picker = page.getByRole("group", { name: "Choose a featured project" });
    await picker.getByRole("button", { name: "Show 24K.az" }).click();
    await expect(picker.getByRole("button", { name: "Show 24K.az" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByAltText("Homepage of 24k.az").first()).toBeVisible();
  });
});

test.describe("portfolio", () => {
  test("filters projects by industry", async ({ page }) => {
    await page.goto("portfolio/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("main article")).toHaveCount(29);

    await page.getByRole("button", { name: /^E-commerce/ }).click();
    await expect(page).toHaveURL(/industry=e-commerce/);
    await expect(page.locator("main article")).toHaveCount(3);
  });

  test("every project detail page is generated and navigable", async ({ page }) => {
    await page.goto("portfolio/");
    const hrefs = await page
      .locator("main article h2 a")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")!));
    expect(hrefs).toHaveLength(29);

    for (const href of hrefs) {
      const response = await page.request.get(href);
      expect(response.status(), href).toBe(200);
    }

    // Client-side navigation into a detail page and on to the next project.
    await page.locator("main article h2 a").first().click();
    await expect(page).toHaveURL(/\/portfolio\/panorama\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Panorama by ELIE SAAB");
    await page.getByRole("link", { name: /Next project/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Garabagh Resort & SPA");
    await page.getByRole("link", { name: "All projects" }).click();
    await expect(page).toHaveURL(/\/portfolio\/$/);
  });
});

test.describe("dedicated pages", () => {
  const pages = [
    { label: "Services", path: "services/", heading: /Services/ },
    { label: "About", path: "about/", heading: /About me/ },
    { label: "Contact", path: "contact/", heading: /Say hello/ },
  ];

  for (const { label, path, heading } of pages) {
    test(`${label} page renders and is the active menu item`, async ({ page, isMobile }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
      if (!isMobile) {
        await expect(
          page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: label }),
        ).toHaveAttribute("aria-current", "page");
      }
    });
  }

  test("menu links open the dedicated pages", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop menu");
    await page.goto("./");
    const nav = page.getByRole("navigation", { name: "Main" });
    await nav.getByRole("link", { name: "Services" }).click();
    await expect(page).toHaveURL(/\/services\/$/);
    await nav.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about\/$/);
    await nav.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/\/contact\/$/);
  });

  test("services page lists every service and the process", async ({ page }) => {
    await page.goto("services/");
    for (const name of ["Front-end development", "AI integration", "Maintenance & optimisation"]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeAttached();
    }
    await expect(page.getByRole("heading", { level: 3, name: "Launch & care" })).toBeAttached();
  });

  test("contact composer is labelled and explains it uses the mail app", async ({ page }) => {
    await page.goto("contact/");
    await expect(page.getByRole("radio", { name: "Freelance project" })).toBeChecked();
    await page.getByRole("radio", { name: "Full-time role" }).check({ force: true });
    await expect(page.getByRole("radio", { name: "Full-time role" })).toBeChecked();
    await page.getByLabel("Message").fill("Hello!");
    await expect(page.getByText("Nothing is sent from this site.")).toBeVisible();
  });
});

test("portfolio list view shows every project", async ({ page }) => {
  await page.goto("portfolio/");
  await page.getByRole("button", { name: "List view" }).click();
  await expect(page).toHaveURL(/view=list/);
  await expect(page.locator("main ul h2")).toHaveCount(29);
  await page.getByRole("button", { name: "Grid view" }).click();
  await expect(page.locator("main article")).toHaveCount(29);
});

test("CV page shows the CV content and links to the PDF", async ({ page }) => {
  await page.goto("cv/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Farid Zeynalov");
  for (const name of [
    "Summary",
    "Experience",
    "Education",
    "Skills",
    "Languages",
    "Certificates",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  await expect(page.getByText("Azerbaijan Technical University").first()).toBeVisible();
  await expect(page.getByText("IELTS 7.0")).toBeVisible();

  const pdf = page.getByRole("link", { name: "Download PDF" });
  const response = await page.request.get((await pdf.getAttribute("href"))!);
  expect(response.headers()["content-type"]).toContain("application/pdf");

  await page
    .getByRole("list", { name: "Projects" })
    .getByRole("link", { name: "quk.edu.az" })
    .click();
  await expect(page).toHaveURL(/\/portfolio\/quk\/$/);
});

test("unknown routes show the custom 404 page", async ({ page }) => {
  const response = await page.goto("this-page-does-not-exist/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nothing");
});

test.describe("theme", () => {
  test("starts dark and persists the chosen theme without a flash", async ({ browser }) => {
    const context = await browser.newContext({
      colorScheme: "dark",
      baseURL: test.info().project.use.baseURL,
    });
    const page = await context.newPage();
    await page.goto("./");
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect(page.locator("html")).toHaveClass(/\blight\b/);

    // The class must be present in the very first paint after reload — before hydration.
    await page.reload({ waitUntil: "commit" });
    await page.waitForSelector("html.light", { timeout: 2000 });
    await context.close();
  });

  test("respects a light system preference when nothing is stored", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "light" });
    const page = await context.newPage();
    await page.goto(test.info().project.use.baseURL!);
    await expect(page.locator("html")).toHaveClass(/\blight\b/);
    await context.close();
  });
});

test("mobile menu opens, traps focus and closes with Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile navigation only");
  await page.goto("./");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: "Portfolio" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test("content is visible with reduced motion", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(test.info().project.use.baseURL!);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: /about me/ })).toBeAttached();
  await context.close();
});
