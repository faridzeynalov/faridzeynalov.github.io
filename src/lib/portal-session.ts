/**
 * A readable sign of a portal session for the site header, next to the real (httpOnly) session
 * cookie: only the client's first name, set and cleared with the session. It decides nothing about
 * access; the portal checks the real session on every page.
 */
export const PORTAL_USER_COOKIE = "fz-portal-user";

/** Fired on window when the cookie is set from the page, so the header updates at once. */
export const PORTAL_USER_EVENT = "fz-portal-user";

/** The signed-in client's first name from the cookie, or null (also on the server). */
export function readPortalUser(): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${PORTAL_USER_COOKIE}=`));
  if (!entry) return null;
  try {
    return decodeURIComponent(entry.slice(PORTAL_USER_COOKIE.length + 1)) || null;
  } catch {
    return null;
  }
}

/** Sets the cookie from the page, for sessions started before it existed. */
export function writePortalUser(name: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  // As long as a session lasts (clients.ts: 14 days).
  document.cookie = `${PORTAL_USER_COOKIE}=${encodeURIComponent(name)}; Path=/; Max-Age=${14 * 24 * 3600}; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(PORTAL_USER_EVENT));
}
