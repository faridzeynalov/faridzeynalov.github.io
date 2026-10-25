export type Theme = "light" | "dark";
/**
 * Site style, independent of light/dark: the default look, a code editor, a retro 8-bit game,
 * notebook paper and ink, a chessboard, or a floodlit football pitch.
 */
export const SKINS = ["classic", "dev", "pixel", "paper", "chess", "football"] as const;
export type Skin = (typeof SKINS)[number];

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
export const themeInitScript = `(function(){var d=document.documentElement;try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var t=s==="light"||s==="dark"?s:(${FOLLOW_SYSTEM_THEME}&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");d.classList.add(t);d.style.colorScheme=t;var sk=localStorage.getItem(${JSON.stringify(SKIN_STORAGE_KEY)});d.dataset.skin=${JSON.stringify(SKINS)}.indexOf(sk)>-1?sk:${JSON.stringify(DEFAULT_SKIN)};}catch(e){d.classList.add("dark");d.dataset.skin=${JSON.stringify(DEFAULT_SKIN)};}})();`;

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

function isSkin(value: string | null | undefined): value is Skin {
  return (SKINS as readonly string[]).includes(value ?? "");
}

export function resolveSkin(): Skin {
  const value = readStorage(SKIN_STORAGE_KEY);
  return isSkin(value) ? value : DEFAULT_SKIN;
}

export function getDocumentSkin(): Skin {
  const value = document.documentElement.dataset.skin;
  return isSkin(value) ? value : DEFAULT_SKIN;
}

export function applySkin(skin: Skin, persist = true) {
  document.documentElement.dataset.skin = skin;
  if (persist) writeStorage(SKIN_STORAGE_KEY, skin);
}
