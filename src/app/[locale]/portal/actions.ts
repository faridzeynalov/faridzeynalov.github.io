"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { localizedPath } from "@/lib/i18n-metadata";
import { getPortalClient, PORTAL_COOKIE, portalPayload } from "@/lib/portal";
import { PORTAL_USER_COOKIE } from "@/lib/portal-session";

/**
 * The portal's form actions. Each returns a status the form shows ("error", "sent", …) or
 * redirects. The session is the client's Payload login token, in the portal's own httpOnly cookie.
 */
export type ActionState = { status: "idle" | "error" | "invalid" | "sent" | "locked" };

function localeOf(form: FormData): Locale {
  const locale = String(form.get("locale") ?? "");
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}

const portal = (locale: Locale, path = "") => localizedPath(locale, `/portal${path}`);

/** The session cookie, and beside it the client's first name for the site header to show. */
async function startSession(token: string, name: string, exp?: number) {
  const jar = await cookies();
  const options = {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: exp ? new Date(exp * 1000) : undefined,
  };
  jar.set(PORTAL_COOKIE, token, { ...options, httpOnly: true });
  jar.set(PORTAL_USER_COOKIE, encodeURIComponent(name.split(" ")[0] ?? ""), options);
}

export async function login(_: ActionState, form: FormData): Promise<ActionState> {
  const locale = localeOf(form);
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { status: "invalid" };
  const payload = await portalPayload();
  try {
    const result = await payload.login({ collection: "clients", data: { email, password } });
    if (!result.token || !result.user) return { status: "error" };
    await startSession(result.token, result.user.name, result.exp);
  } catch (error) {
    const locked = error instanceof Error && error.name === "LockedAuth";
    return { status: locked ? "locked" : "error" };
  }
  redirect(portal(locale));
}

export async function logout(form: FormData) {
  const jar = await cookies();
  jar.delete(PORTAL_COOKIE);
  jar.delete(PORTAL_USER_COOKIE);
  redirect(portal(localeOf(form), "/login"));
}

/** Sets the password from an invitation or reset link, then signs the client in. */
export async function setPassword(_: ActionState, form: FormData): Promise<ActionState> {
  const locale = localeOf(form);
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (!token || password.length < 8 || password !== confirm) return { status: "invalid" };
  const payload = await portalPayload();
  try {
    const result = await payload.resetPassword({
      collection: "clients",
      data: { token, password },
      overrideAccess: true,
    });
    if (result.token) await startSession(result.token, (result.user as { name: string }).name);
  } catch {
    return { status: "error" };
  }
  redirect(portal(locale));
}

/** Emails a reset link. Always reports "sent", so the form doesn't reveal who has an account. */
export async function requestReset(_: ActionState, form: FormData): Promise<ActionState> {
  const email = String(form.get("email") ?? "").trim();
  if (!email) return { status: "invalid" };
  const payload = await portalPayload();
  await payload.forgotPassword({ collection: "clients", data: { email } }).catch(() => undefined);
  return { status: "sent" };
}

/**
 * Adds the signed-in client's comment (or, with `parent`, reply) to one of their projects or, with
 * `screen`, to one of its screens, and refreshes the page, so it shows up right away.
 */
export async function addComment(_: ActionState, form: FormData): Promise<ActionState> {
  const locale = localeOf(form);
  const client = await getPortalClient();
  if (!client) redirect(portal(locale, "/login"));
  const project = Number(form.get("project"));
  const body = String(form.get("body") ?? "").trim();
  const parent = Number(form.get("parent")) || null;
  const screen = Number(form.get("screen")) || null;
  if (!project || !body || body.length > 5000) return { status: "invalid" };
  const payload = await portalPayload();
  try {
    await payload.create({
      collection: "project-comments",
      data: { project, body, parent, screen },
      user: client,
      overrideAccess: false,
    });
  } catch {
    return { status: "error" };
  }
  revalidatePath(portal(locale, `/projects/${project}${screen ? `/screens/${screen}` : ""}`));
  return { status: "sent" };
}
