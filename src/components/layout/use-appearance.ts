"use client";

import { useSyncExternalStore } from "react";
import { getDocumentSkin, getDocumentTheme, type Skin, type Theme } from "@/lib/theme";

// The theme class and style attribute live on <html> (set before paint by the head script),
// so React reads them from there instead of keeping its own copy.
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-skin"],
  });
  return () => observer.disconnect();
}

/** Current light/dark theme; `null` on the server so the first client render matches the HTML. */
export function useTheme(): Theme | null {
  return useSyncExternalStore(subscribe, getDocumentTheme, () => null);
}

/** Current site style; `null` on the server. */
export function useSkin(): Skin | null {
  return useSyncExternalStore(subscribe, getDocumentSkin, () => null);
}
