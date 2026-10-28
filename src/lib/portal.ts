import config from "@payload-config";
import { cookies } from "next/headers";
import { getPayload } from "payload";
import type { Client } from "@/payload-types";

/** The Payload API, for the portal's pages and actions (they run on the server only). */
export function portalPayload() {
  return getPayload({ config });
}

/**
 * The portal's session cookie. It's not Payload's own `payload-token`, which the admin uses: with
 * one shared cookie, signing in to the portal would sign the admin out (and the other way round).
 */
export const PORTAL_COOKIE = "fz-portal-token";

/** The client signed in to the portal, from the session cookie; null for anyone else. */
export async function getPortalClient(): Promise<Client | null> {
  const token = (await cookies()).get(PORTAL_COOKIE)?.value;
  if (!token) return null;
  const payload = await portalPayload();
  const { user } = await payload
    .auth({ headers: new Headers({ Authorization: `JWT ${token}` }) })
    .catch(() => ({ user: null }));
  return user?.collection === "clients" ? (user as Client) : null;
}

/** How far along a project is: the share of its stages that are done. */
export function progressOf(stages: { status?: string | null }[] | null | undefined) {
  if (!stages?.length) return 0;
  return Math.round(
    (stages.filter((stage) => stage.status === "done").length / stages.length) * 100,
  );
}
