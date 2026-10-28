/**
 * A readable sign of a portal session for the site header, next to the real (httpOnly) session
 * cookie: only the client's first name, set and cleared with the session. It decides nothing about
 * access; the portal checks the real session on every page.
 */
export const PORTAL_USER_COOKIE = "fz-portal-user";

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
