"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore, type MouseEvent } from "react";
import {
  FOLLOW_SYSTEM_THEME,
  applyTheme,
  getDocumentTheme,
  readStoredTheme,
  type Theme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/** `null` on the server, so the first client render matches the static HTML. */
function useTheme(): Theme | null {
  return useSyncExternalStore(subscribe, getDocumentTheme, () => null);
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();

  // Follow OS theme changes until the visitor makes an explicit choice.
  useEffect(() => {
    if (!FOLLOW_SYSTEM_THEME) return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (!readStoredTheme()) applyTheme(media.matches ? "light" : "dark", false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const next: Theme = getDocumentTheme() === "dark" ? "light" : "dark";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || reduceMotion) {
      applyTheme(next);
      return;
    }

    // Circular reveal from the toggle button.
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = document.startViewTransition(() => applyTheme(next));
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          {
            duration: 600,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});
  }

  const label =
    theme === null
      ? "Toggle color theme"
      : `Switch to ${theme === "dark" ? "light" : "dark"} theme`;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex size-9 items-center justify-center overflow-hidden rounded-full border border-border text-fg-muted transition-colors hover:border-border-strong hover:text-fg",
        className,
      )}
    >
      {/* Both icons render; CSS picks one based on the <html> class, so there's no hydration flash. */}
      <Sun
        aria-hidden
        className="absolute size-4 translate-y-5 rotate-90 opacity-0 transition-all duration-500 ease-out-expo dark:translate-y-0 dark:rotate-0 dark:opacity-100"
      />
      <Moon
        aria-hidden
        className="absolute size-4 transition-all duration-500 ease-out-expo dark:-translate-y-5 dark:-rotate-90 dark:opacity-0"
      />
    </button>
  );
}
