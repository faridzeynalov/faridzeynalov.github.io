"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { useScrollReveal } from "@/components/motion/scroll-reveal";

/**
 * Counts from 0 to `value` when it scrolls into view (again after scrolling back up, on the
 * home page). The static HTML already contains the final number (for no-JS and crawlers).
 */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useScrollReveal(ref, { margin: "0px 0px -10% 0px" });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion) {
      el.textContent = `${value}${suffix}`;
      return;
    }
    // Not yet seen (or reset below the viewport): wait at zero.
    if (!shown) {
      el.textContent = `0${suffix}`;
      return;
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        el.textContent = `${Math.round(latest)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [shown, reduceMotion, value, suffix]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
      {suffix}
    </span>
  );
}
