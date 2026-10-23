"use client";

import * as m from "motion/react-m";
import { useRef, type ReactNode } from "react";
import { useScrollReveal } from "@/components/motion/scroll-reveal";

const ease = [0.16, 1, 0.3, 1] as const;
/** Hiding again (replay mode) happens below the viewport, so it can be quick. */
const hide = { duration: 0.3 };

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

/** Fades and lifts content into view when it scrolls into the viewport. */
export function Reveal({ children, className, delay = 0, y = 20, as = "div", file }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useScrollReveal(ref, { margin: "0px 0px -12% 0px" });
  const Component = m[as] as typeof m.div;
  return (
    <Component
      ref={ref}
      className={className}
      data-file={file}
      initial="hidden"
      animate={shown ? "show" : "hidden"}
      variants={{
        hidden: { opacity: 0, y, transition: hide },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease } },
      }}
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

export const staggerItem = {
  hidden: { opacity: 0, y: 18, transition: hide },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

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
  const Component = m[as] as typeof m.div;
  return (
    <Component className={className} data-file={file} variants={staggerItem}>
      {children}
    </Component>
  );
}
