export type Theme = "light" | "dark";
/** Site style: the default look, or the code-editor look. Independent of light/dark. */
export type Skin = "classic" | "dev";

export const THEME_STORAGE_KEY = "theme";
export const SKIN_STORAGE_KEY = "skin";
export const DEFAULT_SKIN: Skin = "classic";

/**
 * When true, first-time visitors whose OS is set to light mode get the light theme.
 * Set to false to always start in dark until the visitor picks a theme.
 */
export const FOLLOW_SYSTEM_THEME = true;

/**
 * Runs inline in <head> before first paint so the correct theme class and style attribute are
 * present immediately (no flash). Theme: saved choice → OS preference (if enabled) → dark.
 * Style: saved choice → classic.
 */
export const themeInitScript = `(function(){var d=document.documentElement;try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var t=s==="light"||s==="dark"?s:(${FOLLOW_SYSTEM_THEME}&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");d.classList.add(t);d.style.colorScheme=t;var sk=localStorage.getItem(${JSON.stringify(SKIN_STORAGE_KEY)});d.dataset.skin=sk==="dev"||sk==="classic"?sk:${JSON.stringify(DEFAULT_SKIN)};}catch(e){d.classList.add("dark");d.dataset.skin=${JSON.stringify(DEFAULT_SKIN)};}})();`;

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage may be blocked (private mode) — the choice still applies for this visit.
  }
}

export function readStoredTheme(): Theme | null {
  const value = readStorage(THEME_STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
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
  if (persist) writeStorage(THEME_STORAGE_KEY, theme);
}

export function resolveSkin(): Skin {
  const value = readStorage(SKIN_STORAGE_KEY);
  return value === "dev" || value === "classic" ? value : DEFAULT_SKIN;
}

export function getDocumentSkin(): Skin {
  return document.documentElement.dataset.skin === "dev" ? "dev" : "classic";
}

export function applySkin(skin: Skin, persist = true) {
  document.documentElement.dataset.skin = skin;
  if (persist) writeStorage(SKIN_STORAGE_KEY, skin);
}
