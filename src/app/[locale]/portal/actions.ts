"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { localizedPath } from "@/lib/i18n-metadata";
import { getPortalClient, portalPayload } from "@/lib/portal";

/**
 * The portal's form actions. Each returns a status the form shows ("error", "sent", …) or
 * redirects. The session is Payload's own login token, kept in its usual httpOnly cookie.
 */
export type ActionState = { status: "idle" | "error" | "invalid" | "sent" | "locked" };

const COOKIE = "payload-token";

function localeOf(form: FormData): Locale {
  const locale = String(form.get("locale") ?? "");
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}

const portal = (locale: Locale, path = "") => localizedPath(locale, `/portal${path}`);

async function startSession(token: string, exp?: number) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: exp ? new Date(exp * 1000) : undefined,
  });
}

export async function login(_: ActionState, form: FormData): Promise<ActionState> {
  const locale = localeOf(form);
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { status: "invalid" };
  const payload = await portalPayload();
  try {
    const result = await payload.login({ collection: "clients", data: { email, password } });
    if (!result.token) return { status: "error" };
    await startSession(result.token, result.exp);
  } catch (error) {
    const locked = error instanceof Error && error.name === "LockedAuth";
    return { status: locked ? "locked" : "error" };
  }
  redirect(portal(locale));
}

export async function logout(form: FormData) {
  (await cookies()).delete(COOKIE);
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
    if (result.token) await startSession(result.token);
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

/** Adds the signed-in client's comment to one of their projects. */
export async function addComment(_: ActionState, form: FormData): Promise<ActionState> {
  const locale = localeOf(form);
  const client = await getPortalClient();
  if (!client) redirect(portal(locale, "/login"));
  const project = Number(form.get("project"));
  const body = String(form.get("body") ?? "").trim();
  if (!project || !body || body.length > 5000) return { status: "invalid" };
  const payload = await portalPayload();
  try {
    await payload.create({
      collection: "project-comments",
      data: { project, body },
      user: client,
      overrideAccess: false,
    });
  } catch {
    return { status: "error" };
  }
  redirect(`${portal(locale, `/projects/${project}`)}#comments`);
}
