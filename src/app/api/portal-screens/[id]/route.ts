import { cookies } from "next/headers";
import { getPortalClient, PORTAL_COOKIE, portalPayload } from "@/lib/portal";

/**
 * A project screen's image for the portal (?size=thumb for the smaller copy). Screens aren't
 * public: this checks the signed-in client owns the project, then fetches the file from Payload
 * with the client's own token, so Payload checks it again.
 */
export async function GET(request: Request, { params }: RouteContext<"/api/portal-screens/[id]">) {
  const client = await getPortalClient();
  if (!client) return new Response(null, { status: 404 });
  const payload = await portalPayload();
  const screen = await payload
    .findByID({
      collection: "project-screens",
      id: (await params).id,
      user: client,
      overrideAccess: false,
      depth: 0,
    })
    .catch(() => null);
  if (!screen?.filename) return new Response(null, { status: 404 });

  const url = new URL(request.url);
  const thumb = url.searchParams.get("size") === "thumb" ? screen.sizes?.thumb?.filename : null;
  const filename = thumb || screen.filename;
  const token = (await cookies()).get(PORTAL_COOKIE)?.value;
  const file = await fetch(
    `${url.origin}${payload.config.routes.api}/project-screens/file/${encodeURIComponent(filename)}`,
    { headers: { Authorization: `JWT ${token}` } },
  );
  if (!file.ok || !file.body) return new Response(null, { status: 404 });
  return new Response(file.body, {
    headers: {
      "Content-Type": file.headers.get("Content-Type") ?? screen.mimeType ?? "image/png",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
