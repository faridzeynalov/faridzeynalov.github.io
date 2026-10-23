export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

/**
 * When true, first-time visitors whose OS is set to light mode get the light theme.
 * Set to false to always start in dark until the visitor picks a theme.
 */
export const FOLLOW_SYSTEM_THEME = true;

/**
 * Runs inline in <head> before first paint so the correct theme class is present
 * immediately (no flash). Order: saved choice → OS preference (if enabled) → dark.
 */
export const themeInitScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var t=s==="light"||s==="dark"?s:(${FOLLOW_SYSTEM_THEME}&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");var d=document.documentElement;d.classList.add(t);d.style.colorScheme=t;}catch(e){document.documentElement.classList.add("dark");}})();`;

export function readStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

/** The theme to show: saved choice → OS preference (if enabled) → dark. Same order as the script. */
export function resolveTheme(): Theme {
  const stored = readStoredTheme();
  if (stored) return stored;
  return FOLLOW_SYSTEM_THEME && window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function getDocumentTheme(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export function applyTheme(theme: Theme, persist = true) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
  if (!persist) return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage may be blocked (private mode) — the theme still applies for this visit.
  }
}
