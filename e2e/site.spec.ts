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
    await page.goto("portfolio");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("main article")).toHaveCount(29);

    await page.getByRole("button", { name: /^E-commerce/ }).click();
    await expect(page).toHaveURL(/industry=e-commerce/);
    await expect(page.locator("main article")).toHaveCount(3);
  });

  test("every project detail page is generated and navigable", async ({ page }) => {
    await page.goto("portfolio");
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
    await expect(page).toHaveURL(/\/portfolio\/panorama$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Panorama by ELIE SAAB");
    await page.getByRole("link", { name: /Next project/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Garabagh Resort & SPA");
    await page.getByRole("link", { name: "All projects" }).click();
    await expect(page).toHaveURL(/\/portfolio$/);
  });
});

test.describe("dedicated pages", () => {
  const pages = [
    { label: "Services", path: "services", heading: /Services/ },
    { label: "About", path: "about", heading: /About me/ },
    { label: "Contact", path: "contact", heading: /Say hello/ },
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
    await expect(page).toHaveURL(/\/services$/);
    await nav.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await nav.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test("services page lists every service and the process", async ({ page }) => {
    await page.goto("services");
    for (const name of ["Front-end development", "AI integration", "Maintenance & optimisation"]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeAttached();
    }
    await expect(page.getByRole("heading", { level: 3, name: "Launch & care" })).toBeAttached();
  });

  test("contact composer is labelled and explains it uses the mail app", async ({ page }) => {
    await page.goto("contact");
    await expect(page.getByRole("radio", { name: "Freelance project" })).toBeChecked();
    // A click that lands before hydration is lost (React then restores the default), so retry.
    const fullTime = page.getByRole("radio", { name: "Full-time role" });
    await expect(async () => {
      await fullTime.check({ force: true });
      await expect(fullTime).toBeChecked({ timeout: 500 });
    }).toPass();
    await page.getByLabel("Message").fill("Hello!");
    await expect(page.getByText("Nothing is sent from this site.")).toBeVisible();
  });
});

test("new pages start at the top; Back restores the previous position", async ({ page }) => {
  await page.goto("./");
  await page.evaluate(() => window.scrollTo({ top: 2000, behavior: "instant" }));
  // Click via the DOM so the test runner doesn't scroll the link into view first.
  await page
    .locator('a[href$="/portfolio"]')
    .first()
    .evaluate((el: HTMLElement) => el.click());
  await expect(page).toHaveURL(/\/portfolio$/);
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(0);

  await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
  const atClick = await page.evaluate(() => Math.round(window.scrollY));
  await page
    .locator("main article h2 a")
    .nth(4)
    .evaluate((el: HTMLElement) => el.click());
  await expect(page).toHaveURL(/\/portfolio\/[a-z0-9-]+$/);
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/portfolio$/);
  await expect
    .poll(() => page.evaluate(() => Math.round(window.scrollY)))
    .toBeGreaterThan(atClick - 5);
});

test("portfolio list view shows every project", async ({ page }) => {
  await page.goto("portfolio");
  await page.getByRole("button", { name: "List view" }).click();
  await expect(page).toHaveURL(/view=list/);
  await expect(page.locator("main ul h2")).toHaveCount(29);
  await page.getByRole("button", { name: "Grid view" }).click();
  await expect(page.locator("main article")).toHaveCount(29);
});

test("CV page shows the CV content and links to the PDF", async ({ page }) => {
  await page.goto("cv");

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
  await expect(page).toHaveURL(/\/portfolio\/quk$/);
});

test("unknown routes show the custom 404 page", async ({ page }) => {
  const response = await page.goto("this-page-does-not-exist");
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

    await page.getByRole("button", { name: /^Appearance/ }).click();
    await page.getByRole("button", { name: "Light" }).click();
    await expect(page.locator("html")).toHaveClass(/\blight\b/);

    // The class must be present in the very first paint after reload — before hydration.
    await page.reload({ waitUntil: "commit" });
    await page.waitForSelector("html.light", { timeout: 2000 });
    await context.close();
  });

  test("keeps the theme and the matching icon when switching language", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop header switcher");
    await page.goto("az");
    const html = page.locator("html");
    // The appearance button's label is localized ("Görünüş: …", "Оформление: …").
    const appearance = page
      .locator("header button")
      .filter({ has: page.locator("svg.lucide-moon") });
    const moon = appearance.locator("svg.lucide-moon");
    const switchTo = async (name: RegExp) => {
      await page.getByRole("button", { name: /: / }).first().click();
      await page.getByRole("link", { name }).click();
    };

    // Switching language re-creates <html> on the client; the theme class must come back.
    await expect(html).toHaveClass(/\b(dark|light)\b/);
    const start = (await html.getAttribute("class"))!.match(/\b(dark|light)\b/)![1];
    await switchTo(/Русский/);
    await expect(page).toHaveURL(/\/ru$/);
    await expect(html).toHaveClass(new RegExp(`\\b${start}\\b`));

    await appearance.click();
    // On /ru the mode options read "Светлый" / "Тёмный".
    await page.getByRole("button", { name: start === "dark" ? "Светлый" : "Тёмный" }).click();
    const chosen = start === "dark" ? "light" : "dark";
    await expect(html).toHaveClass(new RegExp(`\\b${chosen}\\b`));
    await switchTo(/English/);
    await expect(page).toHaveURL(/:\d+\/$/);
    await expect(html).toHaveClass(new RegExp(`\\b${chosen}\\b`));
    // The button shows the current mode: Moon in dark mode, Sun in light mode.
    await expect(moon).toHaveCSS("opacity", chosen === "dark" ? "1" : "0");
  });

  for (const [skin, heading] of [
    ["pixel", "Press Start 2P"],
    ["paper", "Lora"],
    ["chess", "Playfair"],
  ] as const) {
    test(`the ${skin} style applies before paint with its own fonts, in light and dark`, async ({
      page,
    }) => {
      for (const theme of ["dark", "light"]) {
        await page.addInitScript(
          ([s, t]) => {
            localStorage.setItem("skin", s);
            localStorage.setItem("theme", t);
          },
          [skin, theme],
        );
        await page.goto("./", { waitUntil: "commit" });
        // Attached, not visible: the head script sets these before paint; waiting for
        // visibility only measures how busy the machine is.
        await page.waitForSelector(`html[data-skin="${skin}"].${theme}`, {
          state: "attached",
          timeout: 2000,
        });
        await expect(page.locator("h1")).toHaveCSS("font-family", new RegExp(heading));
      }
    });
  }

  test("starts in the Classic style; Developer is remembered, before paint and across languages", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop header menus");
    const html = page.locator("html");
    await page.goto("./");
    await expect(html).toHaveAttribute("data-skin", "classic");

    await page.getByRole("button", { name: /^Appearance/ }).click();
    await page.getByRole("button", { name: /^Developer/ }).click();
    await expect(html).toHaveAttribute("data-skin", "dev");
    await expect(page.getByRole("button", { name: /^Appearance: Developer/ })).toBeVisible();

    // Set by the head script on the very first paint after reload.
    await page.reload({ waitUntil: "commit" });
    await page.waitForSelector('html[data-skin="dev"]', { timeout: 2000 });

    // Switching language re-creates <html>; the style comes back with it.
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /: English/ }).click();
    await page.getByRole("link", { name: /Azərbaycanca/ }).click();
    await expect(page).toHaveURL(/\/az$/);
    await expect(html).toHaveAttribute("data-skin", "dev");
  });

  test("respects a light system preference when nothing is stored", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "light" });
    const page = await context.newPage();
    await page.goto(`${test.info().project.use.baseURL}`);
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
  // Classic (default) style: a plain list of pages.
  await expect(menu.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  await expect(menu.getByRole("link", { name: "home.tsx" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test("mobile explorer folders expand and their files navigate", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile navigation only");
  // The VS Code explorer is the Developer style's mobile menu.
  await page.addInitScript(() => localStorage.setItem("skin", "dev"));
  await page.goto("./");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });

  const services = menu.getByRole("button", { name: /^services/ });
  await expect(services).toHaveAttribute("aria-expanded", "false");
  await services.click();
  await expect(services).toHaveAttribute("aria-expanded", "true");
  await menu.getByRole("link", { name: "ai.tsx" }).click();
  await expect(page).toHaveURL(/\/services#ai$/);
  await expect(menu).toBeHidden();

  // On a page inside a folder, that folder opens by itself with the page selected.
  await page.goto("portfolio/panorama");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(menu.getByRole("button", { name: /^portfolio/ })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(menu.getByRole("link", { name: "panorama.tsx" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("content is visible with reduced motion", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${test.info().project.use.baseURL}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: /about me/ })).toBeAttached();
  await context.close();
});

test.describe("languages", () => {
  test("English is served at unprefixed URLs", async ({ page }) => {
    await page.goto("about");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("About me");
  });

  test("English pages remember the last chosen language", async ({ page }) => {
    await page.goto("./");
    await page.evaluate(() => localStorage.setItem("locale", "ru"));
    await page.goto("cv");
    await expect(page).toHaveURL(/\/ru\/cv$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  });

  test("older link styles redirect to the clean URL", async ({ page }) => {
    await page.goto("portfolio/panorama/");
    await expect(page).toHaveURL(/\/portfolio\/panorama$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Panorama by ELIE SAAB");
    await page.goto("en/about");
    await expect(page).toHaveURL(/\/about$/);
    await page.goto("az/");
    await expect(page).toHaveURL(/\/az$/);
  });

  test("Azerbaijani and Russian pages are translated", async ({ page }) => {
    await page.goto("az/contact");
    await expect(page.locator("html")).toHaveAttribute("lang", "az");
    await expect(page.getByRole("heading", { level: 1 })).not.toContainText("Say hello");
    await expect(page.getByRole("link", { name: "zeynalovf7@gmail.com" }).first()).toBeVisible();

    await page.goto("ru/cv");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.getByRole("heading", { level: 2, name: "Опыт работы" })).toBeVisible();
  });

  test("pages declare their translations for search engines", async ({ page }) => {
    await page.goto("about");
    const expected = { en: /(?<!\/(az|ru))\/about$/, az: /\/az\/about$/, ru: /\/ru\/about$/ };
    for (const [locale, href] of Object.entries(expected)) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${locale}"]`)).toHaveAttribute(
        "href",
        href,
      );
    }
  });

  test("the switcher keeps the current page", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop header switcher");
    await page.goto("services");
    await page.getByRole("button", { name: /language/i }).click();
    await page.getByRole("link", { name: /Azərbaycanca/ }).click();
    await expect(page).toHaveURL(/\/az\/services$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "az");
    expect(await page.evaluate(() => localStorage.getItem("locale"))).toBe("az");

    await page.getByRole("button", { name: /:/ }).first().click();
    await page.getByRole("link", { name: /English/ }).click();
    await expect(page).toHaveURL(/localhost:\d+\/services$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("the mobile explorer switches language", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile navigation only");
    await page.addInitScript(() => localStorage.setItem("skin", "dev"));
    await page.goto("about");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await menu.getByRole("button", { name: /^locales/ }).click();
    await menu.getByRole("link", { name: /ru\.json/ }).click();
    await expect(page).toHaveURL(/\/ru\/about$/);
  });
});

test.describe("journal", () => {
  test("the Paper style's portfolio opens as a journal whose pages turn", async ({
    page,
    isMobile,
  }) => {
    await page.addInitScript(() => localStorage.setItem("skin", "paper"));
    await page.goto("./portfolio");
    await page.getByRole("button", { name: "Journal view" }).click();
    await expect(page).toHaveURL(/view=journal/);
    await page.getByRole("button", { name: /Open the journal/ }).click();

    const journal = page.getByRole("dialog", { name: "Portfolio" });
    const counter = journal.locator("[aria-live]");
    await expect(counter).toHaveText("Portfolio");
    // Forward from the cover: by button on a desk, by tapping the right edge on a phone.
    if (isMobile) {
      const box = (await journal.locator(".journal-pages").boundingBox())!;
      await page.mouse.click(box.x + box.width * 0.9, box.y + box.height * 0.9);
      await expect(counter).toHaveText("1 / 29");
    } else {
      await journal.getByRole("button", { name: "Next page" }).click();
      await expect(counter).toHaveText("1 / 29");
      await journal.getByRole("button", { name: "Next page" }).click();
      await expect(counter).toHaveText("2–3 / 29");
      await page.keyboard.press("ArrowLeft");
      await expect(counter).toHaveText("1 / 29");
    }
    await page.keyboard.press("Escape");
    await expect(journal).toBeHidden();
  });

  test("other styles don't offer the journal", async ({ page }) => {
    await page.goto("./portfolio?view=journal");
    await expect(page.getByRole("button", { name: "Journal view" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Grid view" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

test.describe("portfolio style views", () => {
  for (const [skin, name, keys] of [
    ["classic", "Showcase view", ["ArrowRight"]],
    ["dev", "Terminal view", ["ArrowDown"]],
    ["pixel", "Level select", ["ArrowRight"]],
    ["chess", "Board view", ["ArrowRight"]],
  ] as const) {
    test(`the ${skin} style has its own third view, driven by the keyboard`, async ({ page }) => {
      await page.addInitScript((s) => localStorage.setItem("skin", s), skin);
      await page.goto("./portfolio");
      const toggle = page.getByRole("button", { name });
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
      await expect(page).toHaveURL(/view=/);

      const widget = page.locator("[aria-roledescription=carousel], [role=listbox]").first();
      await widget.focus();
      if (skin === "classic") {
        await expect(widget.getByText("01")).toBeVisible();
        for (const key of keys) await page.keyboard.press(key);
        await expect(widget.getByText("02")).toBeVisible();
      } else {
        const selected = widget.locator("[aria-selected=true]");
        const before = await selected.getAttribute("id");
        for (const key of keys) await page.keyboard.press(key);
        await expect(selected).not.toHaveAttribute("id", before!);
      }
    });
  }
});

test.describe("games", () => {
  const button = (page: Page) => page.getByRole("button", { name: "Play a game" });

  for (const [skin, title] of [
    ["classic", "Memory"],
    ["dev", "Snake"],
    ["pixel", "Bug Runner"],
    ["paper", "Noughts and crosses"],
    ["chess", "Mate in three"],
  ] as const) {
    test(`the ${skin} style opens its own game`, async ({ page }) => {
      await page.addInitScript((s) => localStorage.setItem("skin", s), skin);
      await page.goto("./");
      await button(page).click();
      const dialog = page.getByRole("dialog", { name: title });
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(button(page)).toBeFocused();
    });
  }

  test("the button can be dragged to the other side, and stays there", async ({ page }) => {
    await page.goto("./");
    const box = await button(page).boundingBox();
    expect(box && box.x).toBeGreaterThan(200);
    await page.mouse.move(box!.x + 26, box!.y + 26);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) {
      await page.mouse.move(box!.x + 26 - ((box!.x - 40) * i) / 8, box!.y + 26 - 200 * (i / 8));
    }
    await page.mouse.up();
    // Dragging doesn't open the game; the button snaps to the left edge, where it was dropped.
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect.poll(async () => (await button(page).boundingBox())?.x).toBeLessThan(30);
    const y = (await button(page).boundingBox())!.y;
    expect(Math.abs(y - (box!.y - 200))).toBeLessThan(40);

    await page.reload();
    await expect.poll(async () => (await button(page).boundingBox())?.x).toBeLessThan(30);
  });

  test("the chess puzzle shows legal moves, rejects a weak one and plays to mate", async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem("skin", "chess"));
    await page.goto("./");
    await button(page).click();
    const dialog = page.getByRole("dialog", { name: "Mate in three" });
    const square = (name: string) =>
      dialog.getByRole("button", { name: new RegExp(`^${name}(,|$)`) });

    // Anastasia's mate. Picking the knight marks where it can go.
    await square("d5").click();
    await expect(square("e7")).toHaveAccessibleName("e7, possible move");
    await expect(square("e6")).toHaveAccessibleName("e6");

    // Grabbing the pawn at once isn't the key move.
    await square("h4").click();
    await square("h7").click();
    await expect(dialog.getByText("Not the strongest move — try again")).toBeVisible();

    // Then the solution, waiting for Black's answer before each move.
    for (const [n, from, to] of [
      [1, "d5", "e7"],
      [2, "h4", "h7"],
      [3, "e5", "h5"],
    ] as const) {
      if (n > 1) await expect(dialog.getByText(`your move ${n} of 3`)).toBeVisible();
      await square(from).click();
      await square(to).click();
      // 2.Qxh7+ is a queen sacrifice: a brilliant move, with its badge.
      if (n === 2) {
        await expect(dialog.getByText("Brilliant move!!")).toBeVisible();
        await expect(dialog.locator(".brilliant-badge")).toBeVisible();
      }
    }
    await expect(dialog.getByText("Checkmate! Anastasia’s mate")).toBeVisible();
    // Only one puzzle solved: nothing else happens.
    await page.waitForTimeout(1200);
    await expect(dialog.locator(".chess-gift")).toHaveCount(0);
  });

  test("solving the last chess puzzle reveals the surprise", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("skin", "chess");
      const others = ["backRank", "philidor", "damiano", "corridor", "openFile"];
      others.push("quietQueen", "hFile", "quietKnight", "reti");
      localStorage.setItem("chess-puzzles-solved", JSON.stringify(others));
    });
    await page.goto("./");
    await button(page).click();
    const dialog = page.getByRole("dialog", { name: "Mate in three" });
    const square = (name: string) =>
      dialog.getByRole("button", { name: new RegExp(`^${name}(,|$)`) });
    for (const [n, from, to] of [
      [1, "d5", "e7"],
      [2, "h4", "h7"],
      [3, "e5", "h5"],
    ] as const) {
      if (n > 1) await expect(dialog.getByText(`your move ${n} of 3`)).toBeVisible();
      await square(from).click();
      await square(to).click();
    }
    const gift = dialog.locator(".chess-gift");
    await expect(gift).toBeVisible();
    // It can be closed, and brought back from the crown.
    await gift.getByRole("button", { name: "Close" }).click();
    await expect(gift).toHaveCount(0);
    await dialog.getByRole("button", { name: "All puzzles solved" }).click();
    await expect(dialog.locator(".chess-gift")).toBeVisible();

    // Restarting puts the board back in front of it, ready to play again.
    await dialog.getByRole("button", { name: "Restart" }).click();
    await expect(dialog.locator(".chess-gift")).toHaveCount(0);
    await expect(dialog.getByText("your move 1 of 3")).toBeVisible();
    await square("d5").click();
    await expect(square("e7")).toHaveAccessibleName("e7, possible move");
  });

  test("noughts and crosses answers a move", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("skin", "paper"));
    await page.goto("./");
    await button(page).click();
    const dialog = page.getByRole("dialog", { name: "Noughts and crosses" });
    await dialog.getByRole("button", { name: "Square 5: –" }).click();
    await expect(dialog.getByRole("button", { name: "Square 5: x" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /: o$/ })).toHaveCount(1);
  });
});
