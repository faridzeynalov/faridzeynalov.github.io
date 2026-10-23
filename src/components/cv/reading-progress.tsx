"use client";

import { useScroll, useSpring } from "motion/react";
import * as m from "motion/react-m";

/** CV page signature: a thin accent bar under the header that fills as you read. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 34, restDelta: 0.001 });
  return (
    <m.div
      className="fixed inset-x-0 top-16 z-40 h-0.5 origin-left bg-accent print:hidden"
      style={{ scaleX }}
      aria-hidden
    />
  );
}

/** A rule that draws itself left-to-right when it scrolls into view. */
export function DrawLine({ className }: { className?: string }) {
  return (
    <m.span
      className={className}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      style={{ originX: 0 }}
      aria-hidden
    />
  );
}
