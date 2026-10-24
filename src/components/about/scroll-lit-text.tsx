"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useLayoutEffect, useRef } from "react";
import { useSkin } from "@/components/layout/use-appearance";
import { cn } from "@/lib/utils";

/** How many letters are mid-transition at once: a wider window gives a softer wave. */
const WINDOW = 28;
const BLUR_PX = 10;
const RISE_EM = 0.45;

/**
 * About page signature: as the paragraph scrolls through the viewport, it appears letter by
 * letter — each one rising from below while it fades in and comes into focus. In the Developer
 * style it types itself out instead: letters simply appear, with a blinking caret after the
 * last one.
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
  const caretRef = useRef<HTMLSpanElement | null>(null);
  const typedRef = useRef(false);
  const skin = useSkin();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });

  const render = (progress: number) => {
    const chars = charsRef.current;
    const typed = typedRef.current;
    const head = progress * (chars.length + WINDOW);
    let last = -1;
    for (let i = 0; i < chars.length; i++) {
      const raw = Math.min(1, Math.max(0, (head - i) / WINDOW));
      // Typing: a letter is either there or not. Otherwise rounded so tiny scrolls don't
      // rewrite styles.
      const t = typed ? (raw >= 0.5 ? 1 : 0) : Math.round(raw * 50) / 50;
      if (t === 1) last = i;
      if (stateRef.current[i] === t) continue;
      stateRef.current[i] = t;
      const style = chars[i].style;
      style.opacity = String(t);
      if (typed) {
        style.filter = "none";
        style.translate = "none";
      } else {
        style.filter = t > 0 && t < 1 ? `blur(${(1 - t) * BLUR_PX}px)` : t === 0 ? "" : "none";
        style.translate = t < 1 ? `0 ${(1 - t) * RISE_EM}em` : "none";
      }
    }
    // The caret follows the last typed letter (Developer style), hidden once everything is in.
    const caretOn = typed && last >= 0 && last < chars.length - 1 ? chars[last] : null;
    if (caretRef.current !== caretOn) {
      caretRef.current?.classList.remove("lit-caret");
      caretOn?.classList.add("lit-caret");
      caretRef.current = caretOn;
    }
  };

  // (Re)start on mount and whenever the style changes, since each style draws letters differently.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    charsRef.current = Array.from(
      ref.current?.querySelectorAll<HTMLSpanElement>(".lit-char") ?? [],
    );
    // Developer and 8-bit type the story out; the others use the blurred fade.
    typedRef.current = ["dev", "pixel"].includes(document.documentElement.dataset.skin ?? "");
    stateRef.current = [];
    render(scrollYProgress.get());
    // `render` only reads refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, skin]);

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
