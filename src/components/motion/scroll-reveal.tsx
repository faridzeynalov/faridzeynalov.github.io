"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

const ReplayContext = createContext(false);

/**
 * Inside this provider (the home page), scroll reveals replay: they play as content scrolls into
 * view and reverse when you scroll back up past it, so scrolling down again plays them again.
 * Elsewhere they play once.
 */
export function RevealReplay({ children }: { children: ReactNode }) {
  return <ReplayContext.Provider value={true}>{children}</ReplayContext.Provider>;
}

interface ScrollRevealOptions {
  /** Like IntersectionObserver's rootMargin, e.g. "0px 0px -12% 0px". */
  margin?: string;
  /** Fraction of the element that must be visible (0–1). */
  amount?: number;
}

/**
 * Whether an element has been revealed. Shown once it enters the viewport; in replay mode it is
 * hidden again only when it drops back below the viewport (scrolling up), not when it leaves
 * through the top, so content you have scrolled past stays as it was.
 */
export function useScrollReveal(
  ref: RefObject<Element | null>,
  { margin = "0px", amount = 0 }: ScrollRevealOptions = {},
) {
  const replay = useContext(ReplayContext);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Two observers, because a fast flick or a jump to the top can move an element from above
    // the viewport to below it in one frame, and a single observer reports nothing then (it was
    // "not intersecting" before and after). `inView`: the reveal zone. `below`: everything under
    // that zone's bottom edge, so moving from above to below is a change it does report.
    let inView: boolean | undefined;
    let below: boolean | undefined;
    const update = () => {
      if (inView === undefined || below === undefined) return; // wait for both first reports
      if (inView || !below) {
        setShown(true); // in view, or already scrolled past
      } else if (replay) {
        setShown(false); // back below the viewport: play again on the way down
      }
    };

    const view = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        update();
        if (inView && !replay) {
          view.disconnect();
          rest.disconnect();
        }
      },
      { rootMargin: margin, threshold: amount },
    );
    const rest = new IntersectionObserver(
      ([entry]) => {
        below = entry.isIntersecting && entry.boundingClientRect.top > 0;
        update();
      },
      { rootMargin: belowMargin(margin) },
    );
    view.observe(element);
    rest.observe(element);
    return () => {
      view.disconnect();
      rest.disconnect();
    };
  }, [ref, margin, amount, replay]);

  return shown;
}

/**
 * rootMargin for the region below the reveal zone: it starts where the zone's bottom edge is
 * (e.g. 12% above the viewport bottom for "0px 0px -12% 0px") and extends far down.
 */
function belowMargin(margin: string) {
  const parts = margin.trim().split(/\s+/);
  const bottom = parts[2] ?? parts[0];
  const inset = bottom.endsWith("%") ? -Number.parseFloat(bottom) : 0;
  return `${-(100 - inset)}% 0px 10000% 0px`;
}
