"use client";

import * as m from "motion/react-m";
import { useRef, type ReactNode } from "react";
import { useScrollReveal } from "@/components/motion/scroll-reveal";

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
  const ref = useRef<HTMLDivElement>(null);
  const shown = useScrollReveal(ref, { margin: "0px 0px -15% 0px" });
  return (
    <m.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={shown ? "show" : "hidden"}
      variants={{
        hidden: {
          clipPath: "inset(18% 6% 0% 6% round 24px)",
          opacity: 0,
          scale: 0.98,
          transition: { duration: 0.3 },
        },
        show: {
          clipPath: "inset(0% 0% 0% 0% round 24px)",
          opacity: 1,
          scale: 1,
          transition: { duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </m.div>
  );
}
