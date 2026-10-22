"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";

/** Wipes its content into view from the bottom with a slight scale settle. */
export function ImageReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <m.div
      className={className}
      initial={{ clipPath: "inset(18% 6% 0% 6% round 24px)", opacity: 0, scale: 0.98 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 24px)", opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </m.div>
  );
}
