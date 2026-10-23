"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** How many letters are mid-transition at once: a wider window gives a softer wave. */
const WINDOW = 28;
const BLUR_PX = 10;
const RISE_EM = 0.45;

/**
 * About page signature: as the paragraph scrolls through the viewport, it appears letter by
 * letter — each one rising from below while it fades in and comes into focus.
 *
 * Performance: progress is computed for every letter on scroll, but styles are written only for
 * letters whose state changed, and only the letters inside the moving window carry a blur, so
 * the filter cost stays small however long the text is.
 *
 * The letters start hidden in CSS (`.lit-char`), so there is no flash before hydration;
 * <noscript> and reduced-motion styles show the text as is. Screen readers get the plain text.
 */
export function ScrollLitText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const stateRef = useRef<number[]>([]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });

  const render = (progress: number) => {
    const chars = charsRef.current;
    const head = progress * (chars.length + WINDOW);
    for (let i = 0; i < chars.length; i++) {
      // 0 = not reached yet, 1 = fully shown; rounded so tiny scrolls don't rewrite styles.
      const t = Math.round(Math.min(1, Math.max(0, (head - i) / WINDOW)) * 50) / 50;
      if (stateRef.current[i] === t) continue;
      stateRef.current[i] = t;
      const style = chars[i].style;
      style.opacity = String(t);
      style.filter = t > 0 && t < 1 ? `blur(${(1 - t) * BLUR_PX}px)` : t === 0 ? "" : "none";
      style.translate = t < 1 ? `0 ${(1 - t) * RISE_EM}em` : "none";
    }
  };

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    charsRef.current = Array.from(
      ref.current?.querySelectorAll<HTMLSpanElement>(".lit-char") ?? [],
    );
    stateRef.current = [];
    render(scrollYProgress.get());
    // Runs once per mount; `render` only reads refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (charsRef.current.length) render(progress);
  });

  const words = text.split(" ");
  return (
    <p ref={ref} className={cn("lit-text", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, w) => (
          <span key={w}>
            {/* Words don't break mid-letter-span: each is a no-wrap inline block. */}
            <span className="inline-block whitespace-nowrap">
              {[...word].map((char, c) => (
                <span key={c} className="lit-char inline-block">
                  {char}
                </span>
              ))}
            </span>
            {w < words.length - 1 && " "}
          </span>
        ))}
      </span>
      <noscript>
        <style>{`.lit-char{opacity:1!important;filter:none!important;translate:none!important}`}</style>
      </noscript>
    </p>
  );
}
