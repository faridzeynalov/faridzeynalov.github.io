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

/** Milliseconds per character for the Developer style's typing effect. */
export const TYPE_SPEED = 38;

/**
 * Text that types itself out in the Developer style (each character appears at its own delay;
 * see `.type-char` in globals.css). In Classic the characters are simply shown, so the parent's
 * own animation (e.g. RiseLine) applies. Screen readers get the plain text.
 */
export function TypedText({ text, delay = 0 }: { text: string; delay?: number }) {
  let index = 0;
  const words = text.split(" ");
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, w) => (
          <span key={w}>
            <span className="inline-block whitespace-nowrap">
              {[...word].map((char, c) => (
                <span
                  key={c}
                  className="type-char"
                  style={{ "--type-delay": `${delay + index++ * TYPE_SPEED}ms` } as CSSProperties}
                >
                  {char}
                </span>
              ))}
            </span>
            {/* A plain space (not typed) so lines can wrap between words without a leading
                space; the pause it gets keeps the typing rhythm. */}
            {w < words.length - 1 && (index++, " ")}
          </span>
        ))}
      </span>
    </>
  );
}

/** Blinking block caret shown after typed text (Developer style only), appearing at `delay`. */
export function TypeCaret({ delay = 0 }: { delay?: number }) {
  return (
    <span
      aria-hidden
      className="type-caret-wrap"
      style={{ "--type-delay": `${delay}ms` } as CSSProperties}
    >
      <span className="type-caret" />
    </span>
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
