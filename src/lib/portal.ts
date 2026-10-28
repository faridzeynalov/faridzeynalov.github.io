import config from "@payload-config";
import { headers } from "next/headers";
import { getPayload } from "payload";
import type { Client } from "@/payload-types";

/** The Payload API, for the portal's pages and actions (they run on the server only). */
export function portalPayload() {
  return getPayload({ config });
}

/** The client signed in to the portal, from the session cookie; null for anyone else. */
export async function getPortalClient(): Promise<Client | null> {
  const payload = await portalPayload();
  const { user } = await payload.auth({ headers: await headers() });
  return user?.collection === "clients" ? (user as Client) : null;
}

/** How far along a project is: the share of its stages that are done. */
export function progressOf(stages: { status?: string | null }[] | null | undefined) {
  if (!stages?.length) return 0;
  return Math.round(
    (stages.filter((stage) => stage.status === "done").length / stages.length) * 100,
  );
}
