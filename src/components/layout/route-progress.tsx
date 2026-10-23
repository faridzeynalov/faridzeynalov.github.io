"use client";

import { animate, useMotionValue, type AnimationPlaybackControls } from "motion/react";
import * as m from "motion/react-m";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Minimum time the bar stays up, so instant (prefetched) navigations still read as feedback. */
const MIN_VISIBLE_MS = 320;

/**
 * Gradient progress bar for page-to-page navigation, plus scroll reset:
 * - starts when an internal link to another page is clicked (or on back/forward),
 * - creeps toward ~85% while the next page loads,
 * - completes and fades out once the new pathname renders.
 * Forward navigations always land at the top; back/forward keep the browser's restored position.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const progress = useMotionValue(0);
  const opacity = useMotionValue(0);
  const running = useRef(false);
  const startedAt = useRef(0);
  const fromHistory = useRef(false);
  const controls = useRef<AnimationPlaybackControls[]>([]);
  const firstRender = useRef(true);
  /** Scroll position per URL, saved when leaving a page, restored on back/forward. */
  const positions = useRef(new Map<string, number>());

  const urlKey = () => `${window.location.pathname}${window.location.search}`;
  /** Key of the page currently on screen (on popstate the URL has already changed). */
  const shownKey = useRef("");

  const stopAll = () => {
    controls.current.forEach((c) => c.stop());
    controls.current = [];
  };

  useEffect(() => {
    // We restore positions ourselves: the browser's own restoration runs before the next
    // page has laid out, so it lands short on long pages.
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    shownKey.current = urlKey();

    const start = (leavingKey: string) => {
      positions.current.set(leavingKey, window.scrollY);
      if (running.current) return;
      running.current = true;
      startedAt.current = performance.now();
      stopAll();
      progress.set(0);
      opacity.set(1);
      controls.current.push(
        animate(progress, [0, 0.35, 0.85], {
          duration: 4,
          times: [0, 0.08, 1],
          ease: ["easeOut", [0.1, 0.6, 0.2, 1]],
        }),
      );
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page (only the hash or query changes): no page transition.
      if (url.pathname === window.location.pathname) return;
      fromHistory.current = false;
      start(urlKey());
    };

    const onPopState = () => {
      fromHistory.current = true;
      start(shownKey.current);
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.history.scrollRestoration = previousRestoration;
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [progress, opacity]);

  // The new page has rendered: finish the bar and land at the top.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    shownKey.current = urlKey();
    let restoreFrame = 0;
    if (fromHistory.current) {
      // Back/forward: return to where the visitor was, retrying until the page is tall enough.
      const target = positions.current.get(urlKey()) ?? 0;
      const deadline = performance.now() + 1500;
      const restore = () => {
        window.scrollTo({ top: target, left: 0, behavior: "instant" });
        if (Math.abs(window.scrollY - target) > 2 && performance.now() < deadline) {
          restoreFrame = requestAnimationFrame(restore);
        }
      };
      restore();
    } else if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    fromHistory.current = false;

    if (!running.current) return () => cancelAnimationFrame(restoreFrame);
    const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - startedAt.current));
    const timeout = window.setTimeout(() => {
      stopAll();
      controls.current.push(
        animate(progress, 1, { duration: 0.25, ease: "easeOut" }),
        animate(opacity, 0, {
          duration: 0.35,
          delay: 0.2,
          onComplete: () => {
            running.current = false;
            progress.set(0);
          },
        }),
      );
    }, wait);
    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(restoreFrame);
    };
  }, [pathname, progress, opacity]);

  return (
    <m.div
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] print:hidden dev:h-1"
      style={{ opacity }}
      aria-hidden
    >
      <m.div
        className="route-bar h-full origin-left bg-[linear-gradient(90deg,var(--accent),#f472b6_50%,#8b5cf6)] shadow-[0_0_12px_var(--accent)]"
        style={{ scaleX: progress }}
      />
    </m.div>
  );
}
