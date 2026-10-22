import { afterEach, describe, expect, it } from "vitest";
import { applyTheme, getDocumentTheme, readStoredTheme, themeInitScript } from "@/lib/theme";

function runInitScript() {
  new Function(themeInitScript)();
}

afterEach(() => {
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
  localStorage.clear();
});

describe("theme", () => {
  it("defaults to dark when nothing is stored and the OS has no light preference", () => {
    runInitScript();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("restores a stored preference before paint", () => {
    localStorage.setItem("theme", "light");
    runInitScript();
    expect(getDocumentTheme()).toBe("light");
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem("theme", "sepia");
    expect(readStoredTheme()).toBeNull();
  });

  it("applies and persists a theme", () => {
    applyTheme("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(readStoredTheme()).toBe("light");

    applyTheme("dark", false);
    expect(getDocumentTheme()).toBe("dark");
    expect(readStoredTheme()).toBe("light");
  });
});
