"use client";

import { useLayoutEffect } from "react";
import { applyTheme, resolveTheme } from "@/lib/theme";

/**
 * Re-applies the theme class when the document is re-created on the client. Switching language
 * swaps the root layout, so React renders a fresh <html> without the class that the inline
 * <head> script added on the first load (that script doesn't run again). Without this, the page
 * fell back to the default dark styles and the toggle showed the wrong icon.
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    applyTheme(resolveTheme(), false);
  }, []);
  return null;
}
