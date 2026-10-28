"use client";

import { useAuth, useConfig } from "@payloadcms/ui";
import { useEffect, useState } from "react";

type Upload = { url?: string | null; sizes?: unknown } | number | null | undefined;

/** The signed-in user's initials, for when there is no photo. */
function initialsOf(user: { name?: string | null; email?: string | null } | null) {
  const source = user?.name?.trim() || user?.email?.split("@")[0] || "";
  return (
    source
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

/**
 * The account button's picture (top right): the profile photo set under Users, or the user's
 * initials on the accent colour. The photo can come back as an upload id, so it is fetched then.
 */
export function Avatar() {
  const { user } = useAuth<{ name?: string | null; email?: string | null; avatar?: Upload }>();
  const { config } = useConfig();
  const avatar = user?.avatar;
  const [url, setUrl] = useState<string | null>(
    typeof avatar === "object" && avatar?.url ? avatar.url : null,
  );

  useEffect(() => {
    if (typeof avatar === "object") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- follows the signed-in user
      setUrl(avatar?.url ?? null);
      return;
    }
    if (typeof avatar !== "number") {
      setUrl(null);
      return;
    }
    let cancelled = false;
    fetch(`${config.routes.api}/media/${avatar}?depth=0`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((media: { url?: string } | null) => {
        if (!cancelled) setUrl(media?.url ?? null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [avatar, config.routes.api]);

  return (
    <span className="fz-avatar" aria-hidden>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- a remote upload at a small fixed size
        <img src={url} alt="" />
      ) : (
        <span>{initialsOf(user ?? null)}</span>
      )}
    </span>
  );
}
