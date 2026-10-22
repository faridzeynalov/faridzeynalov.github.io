import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EnterProps {
  children: ReactNode;
  className?: string;
  /** Delay in milliseconds. */
  delay?: number;
  as?: "div" | "p" | "span";
}

/** CSS-only fade-up for above-the-fold content — no JavaScript needed. */
export function Enter({ children, className, delay = 0, as: Component = "div" }: EnterProps) {
  return (
    <Component
      className={cn("animate-enter", className)}
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
