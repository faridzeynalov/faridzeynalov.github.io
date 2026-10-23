import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EnterProps {
  children: ReactNode;
  className?: string;
  /** Delay in milliseconds. */
  delay?: number;
  as?: "div" | "p" | "span";
  /** File name for the Developer style's card title bar (see `[data-file]` in globals.css). */
  file?: string;
}

/** CSS-only fade-up for above-the-fold content — no JavaScript needed. */
export function Enter({ children, className, delay = 0, as: Component = "div", file }: EnterProps) {
  return (
    <Component
      className={cn("animate-enter", className)}
      data-file={file}
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Component>
  );
}

/** Masked line reveal: the text rises from behind an invisible edge. */
export function RiseLine({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <span
        className={cn("block animate-rise", className)}
        style={{ "--delay": `${delay}ms` } as CSSProperties}
      >
        {children}
      </span>
    </span>
  );
}
