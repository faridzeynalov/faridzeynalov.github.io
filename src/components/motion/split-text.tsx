import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface SplitTextProps {
  text: string;
  className?: string;
  /** Delay before the first character, in ms. */
  delay?: number;
  /** Delay between characters, in ms. */
  stagger?: number;
}

/**
 * Character-by-character masked rise, in CSS so it plays before hydration.
 * Screen readers get the plain text; the split characters are hidden from them.
 */
export function SplitText({ text, className, delay = 0, stagger = 22 }: SplitTextProps) {
  let index = 0;
  const words = text.split(" ");
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, w) => (
        <span key={w} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          {[...word].map((char, c) => (
            <span
              key={c}
              className="inline-block animate-rise"
              style={{ "--delay": `${delay + index++ * stagger}ms` } as CSSProperties}
            >
              {char}
            </span>
          ))}
          {w < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

/** Large page title: split-character reveal with an optional serif accent line. */
export function KineticTitle({
  text,
  accent,
  className,
}: {
  text: string;
  accent?: string;
  className?: string;
}) {
  const accentDelay = 80 + text.length * 22;
  return (
    <h1
      className={cn(
        "text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] font-semibold tracking-[-0.05em]",
        className,
      )}
    >
      <SplitText text={text} delay={80} className="block" />
      {accent && (
        <SplitText
          text={accent}
          delay={accentDelay}
          stagger={16}
          className="block font-serif font-normal tracking-[-0.02em] text-fg-muted italic"
        />
      )}
    </h1>
  );
}
