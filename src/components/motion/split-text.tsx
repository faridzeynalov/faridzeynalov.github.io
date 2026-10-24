import type { CSSProperties } from "react";
import { TypeCaret } from "@/components/motion/enter";
import { cn } from "@/lib/utils";

interface SplitTextProps {
  text: string;
  className?: string;
  /** Delay before the first character, in ms. */
  delay?: number;
  /** Delay between characters, in ms. */
  stagger?: number;
  /** Blinking caret after the last character (Developer style only). */
  caret?: boolean;
  style?: CSSProperties;
}

/**
 * Character-by-character masked rise, in CSS so it plays before hydration. In the Developer
 * style the same per-character delays make it type out instead (see `.animate-rise`).
 * Screen readers get the plain text; the split characters are hidden from them.
 */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 22,
  caret = false,
  style,
}: SplitTextProps) {
  let index = 0;
  const words = text.split(" ");
  const end = delay + [...text.replaceAll(" ", "")].length * stagger;
  return (
    <span className={className} style={style}>
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
      {caret && <TypeCaret delay={end} />}
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
        "text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] font-semibold tracking-[-0.05em] dev:text-[clamp(2.5rem,7vw,5.75rem)] dev:leading-[1.05] pixel:text-[calc(var(--pixel-scale)*clamp(1.6rem,5vw,3.6rem))] pixel:leading-[1.3]",
        className,
      )}
    >
      <SplitText text={text} delay={80} className="block" caret={!accent} />
      {accent && (
        <SplitText
          text={accent}
          delay={accentDelay}
          stagger={16}
          caret
          className="accent-text block font-serif font-normal tracking-[-0.02em] text-fg-muted italic"
          style={
            {
              "--quote-start": `${accentDelay - 16}ms`,
              "--quote-end": `${accentDelay + [...accent.replaceAll(" ", "")].length * 16}ms`,
            } as CSSProperties
          }
        />
      )}
    </h1>
  );
}
