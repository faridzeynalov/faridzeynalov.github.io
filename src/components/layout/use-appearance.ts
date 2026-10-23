"use client";

import { useSyncExternalStore } from "react";
import { getDocumentSkin, getDocumentTheme, type Skin, type Theme } from "@/lib/theme";

// The theme class and style attribute live on <html> (set before paint by the head script),
// so React reads them from there instead of keeping its own copy. Many components read them
// (every scroll reveal), so they share one observer.
const listeners = new Set<() => void>();
let observer: MutationObserver | null = null;

function subscribe(callback: () => void) {
  listeners.add(callback);
  if (!observer) {
    observer = new MutationObserver(() => listeners.forEach((listener) => listener()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-skin"],
    });
  }
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      observer?.disconnect();
      observer = null;
    }
  };
}

/** Current light/dark theme; `null` on the server so the first client render matches the HTML. */
export function useTheme(): Theme | null {
  return useSyncExternalStore(subscribe, getDocumentTheme, () => null);
}

/** Current site style; `null` on the server. */
export function useSkin(): Skin | null {
  return useSyncExternalStore(subscribe, getDocumentSkin, () => null);
}
