"use client";

import { useLayoutEffect } from "react";
import { applySkin, applyTheme, resolveSkin, resolveTheme } from "@/lib/theme";

/**
 * Re-applies the theme class and site style when the document is re-created on the client.
 * Switching language swaps the root layout, so React renders a fresh <html> without what the
 * inline <head> script set on the first load (that script doesn't run again). Without this, the
 * page fell back to the default styles and the toggle showed the wrong icon.
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    applyTheme(resolveTheme(), false);
    applySkin(resolveSkin(), false);
  }, []);
  return null;
}
