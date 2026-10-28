/**
 * The admin's panel styles (picked at the bottom of the sidebar, as in the HR panel of
 * ai-interview). The choice lives in a cookie so the server can render it with the page: no
 * script, no flash of the default style.
 */
export const PANEL_STYLES = ["classic", "developer", "vscode", "plain"] as const;
export type PanelStyle = (typeof PANEL_STYLES)[number];

export const PANEL_STYLE_COOKIE = "fz-admin-style";

export function toPanelStyle(value: string | undefined): PanelStyle {
  return PANEL_STYLES.includes(value as PanelStyle) ? (value as PanelStyle) : "classic";
}
