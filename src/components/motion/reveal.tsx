"use client";

import type { Variants } from "motion/react";
import * as m from "motion/react-m";
import { useRef, type ReactNode } from "react";
import { useSkin } from "@/components/layout/use-appearance";
import { useScrollReveal } from "@/components/motion/scroll-reveal";
import type { Skin } from "@/lib/theme";

const ease = [0.16, 1, 0.3, 1] as const;
/** Hiding again (replay mode) happens below the viewport, so it can be quick. */
const hide = { duration: 0.3 };

/** Easing that moves in a few hard steps, like a sprite (8-bit style). */
const steps = (count: number) => (t: number) => Math.min(1, Math.ceil(t * count) / count);

/**
 * Classic: fade up. Developer: slides in from the left like a line of code being inserted —
 * shorter and snappier. 8-bit: rises in four hard steps. Paper: settles in with a slight tilt,
 * like a sheet being laid down. Chess: moves like a knight, in an L: two squares up, then one
 * across. Football: runs in from the left, like a winger. `data-shown` lets CSS start
 * style-specific effects (typed eyebrows).
 */
function revealVariants(skin: Skin | null, y: number, delay: number): Variants {
  if (skin === "football") {
    // Runs in from the left, like a winger onto a pass: one smooth move, no bounce.
    return {
      hidden: { opacity: 0, x: -40, y: 0, rotate: 0, transition: hide },
      show: { opacity: 1, x: 0, y: 0, rotate: 0, transition: { duration: 0.6, delay, ease } },
    };
  }
  if (skin === "chess") {
    const x = -Math.round(y * 0.6);
    return {
      hidden: { opacity: 0, x, y, rotate: 0, transition: hide },
      show: {
        opacity: [0, 1, 1],
        x: [x, x, 0],
        y: [y, 0, 0],
        rotate: 0,
        transition: { duration: 0.8, delay, times: [0, 0.55, 1], ease: ["circOut", "circOut"] },
      },
    };
  }
  if (skin === "pixel") {
    return {
      hidden: { opacity: 0, x: 0, y: y + 8, rotate: 0, transition: hide },
      show: {
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
        transition: { duration: 0.4, delay, ease: steps(4) },
      },
    };
  }
  if (skin === "paper") {
    return {
      hidden: { opacity: 0, x: 0, y: y * 0.6, rotate: -1.5, transition: hide },
      show: { opacity: 1, x: 0, y: 0, rotate: 0, transition: { duration: 0.75, delay, ease } },
    };
  }
  if (skin === "dev") {
    return {
      hidden: { opacity: 0, x: -16, y: 0, rotate: 0, transition: hide },
      show: { opacity: 1, x: 0, y: 0, rotate: 0, transition: { duration: 0.45, delay, ease } },
    };
  }
  return {
    hidden: { opacity: 0, x: 0, y, rotate: 0, transition: hide },
    show: { opacity: 1, x: 0, y: 0, rotate: 0, transition: { duration: 0.8, delay, ease } },
  };
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Vertical offset in px to travel from. */
  y?: number;
  as?: "div" | "section" | "li" | "article" | "header";
  /** File name for the Developer style's card title bar (see `[data-file]` in globals.css). */
  file?: string;
}

/** Brings content into view when it scrolls into the viewport. */
export function Reveal({ children, className, delay = 0, y = 20, as = "div", file }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useScrollReveal(ref, { margin: "0px 0px -12% 0px" });
  const skin = useSkin();
  const Component = m[as] as typeof m.div;
  return (
    <Component
      ref={ref}
      className={className}
      data-file={file}
      data-shown={shown}
      initial="hidden"
      animate={shown ? "show" : "hidden"}
      variants={revealVariants(skin, y, delay)}
    >
      {children}
    </Component>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: "div" | "ul" | "ol";
}

/** Parent that reveals `StaggerItem` children one after another. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  as = "div",
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useScrollReveal(ref, { margin: "0px 0px -10% 0px" });
  const Component = m[as] as typeof m.div;
  return (
    <Component
      ref={ref}
      className={className}
      data-shown={shown}
      initial="hidden"
      animate={shown ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
  file,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
  /** File name for the Developer style's card title bar. */
  file?: string;
}) {
  const skin = useSkin();
  const Component = m[as] as typeof m.div;
  return (
    <Component className={className} data-file={file} variants={revealVariants(skin, 18, 0)}>
      {children}
    </Component>
  );
}
