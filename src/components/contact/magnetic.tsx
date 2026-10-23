"use client";

import { useMotionValue, useReducedMotion, useSpring } from "motion/react";
import * as m from "motion/react-m";
import type { PointerEvent, ReactNode } from "react";

/**
 * Pulls its child gently toward the mouse pointer while hovered (mouse only, off with
 * reduced motion). The hit area stays where it is, so it never moves away from a click.
 */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });

  function onMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className={className} onPointerMove={onMove} onPointerLeave={reset}>
      <m.div style={{ x, y }}>{children}</m.div>
    </div>
  );
}
