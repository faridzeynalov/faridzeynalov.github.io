"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useLocale } from "next-intl";
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useSkin } from "@/components/layout/use-appearance";
import { cn } from "@/lib/utils";

/** How many letters are mid-transition at once: a wider window gives a softer wave. */
const WINDOW = 28;
const BLUR_PX = 10;
const RISE_EM = 0.45;

/**
 * Pen strokes for the handwritten story (scripts/build-handwriting.mjs): per letter, its advance
 * width, Caveat outline, centre-line strokes in writing order, and the ink width.
 */
interface Handwriting {
  ascender: number;
  descender: number;
  glyphs: Record<string, { a: number; o: string; s: string; w: number }>;
}

/**
 * How the story appears, per style:
 * - lit (Classic): letters rise from below while fading in and coming into focus;
 * - typed (Developer, 8-bit): letters simply appear, with a blinking caret after the last one;
 * - written (Paper): each letter is drawn stroke by stroke from nothing, as with a pen, and a
 *   fountain pen follows the exact point being drawn.
 */
type Mode = "lit" | "typed" | "written";

function currentMode(): Mode {
  const skin = document.documentElement.dataset.skin;
  if (skin === "dev" || skin === "pixel") return "typed";
  if (skin === "paper") return "written";
  return "lit";
}

/**
 * About page signature: as the paragraph scrolls through the viewport it appears letter by
 * letter, in a way that fits the site style (see Mode).
 *
 * Performance: progress is computed for every letter on scroll, but styles are written only for
 * letters whose state changed. Blurs exist only inside the moving window; when writing, only
 * the letter being drawn carries a mask (finished letters drop it), and the pen is one element
 * moved with a transform.
 *
 * The letters start hidden in CSS (`.lit-char`), so there is no flash before hydration;
 * <noscript> and reduced-motion styles show the text as is. Screen readers get the plain text.
 */
export function ScrollLitText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const penRef = useRef<HTMLSpanElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const stateRef = useRef<number[]>([]);
  const caretRef = useRef<HTMLSpanElement | null>(null);
  const modeRef = useRef<Mode>("lit");
  const lengthsRef = useRef(new Map<SVGPathElement, number>());
  const skin = useSkin();
  const locale = useLocale();
  const [hand, setHand] = useState<Handwriting | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });

  // The pen strokes are only needed (and only downloaded) in the Paper style.
  useEffect(() => {
    if (skin !== "paper" || hand) return;
    let cancelled = false;
    import(`./handwriting/${locale}.json`)
      .then((module: { default: Handwriting }) => {
        if (!cancelled) setHand(module.default);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [skin, locale, hand]);

  const render = (progress: number) => {
    const chars = charsRef.current;
    const mode = modeRef.current;
    const written = mode === "written";
    // Writing draws one letter at a time; the other modes blend over a window of letters.
    const head = written ? progress * chars.length : progress * (chars.length + WINDOW);
    let last = -1;
    let drawing = -1;
    for (let i = 0; i < chars.length; i++) {
      const raw = written
        ? Math.min(1, Math.max(0, head - i))
        : Math.min(1, Math.max(0, (head - i) / WINDOW));
      // Typing: a letter is either there or not. Otherwise rounded so tiny scrolls don't
      // rewrite styles.
      const t = mode === "typed" ? (raw >= 0.5 ? 1 : 0) : Math.round(raw * 100) / 100;
      if (t === 1) last = i;
      if (t > 0 && t < 1) drawing = i;
      if (stateRef.current[i] === t) continue;
      stateRef.current[i] = t;
      const char = chars[i];
      const style = char.style;
      const stroke = written ? char.querySelector<SVGPathElement>(".hand-stroke") : null;
      if (stroke) {
        // Handwriting: the letter is visible through a mask of its pen strokes, drawn from 0.
        // Only the letter being written carries the mask; the others are either hidden (not
        // painted at all) or plain ink, so hundreds of letters don't each become a compositing
        // effect. Visibility rather than opacity, for the same reason.
        style.opacity = "1";
        style.visibility = t > 0 ? "visible" : "hidden";
        stroke.style.strokeDashoffset = String(1 - t);
        const ink = char.querySelector(".hand-ink");
        if (t > 0 && t < 1) ink?.setAttribute("mask", `url(#${char.dataset.mask})`);
        else ink?.removeAttribute("mask");
      } else {
        style.opacity = String(t);
      }
      if (mode === "lit") {
        style.filter = t > 0 && t < 1 ? `blur(${(1 - t) * BLUR_PX}px)` : t === 0 ? "" : "none";
        style.translate = t < 1 ? `0 ${(1 - t) * RISE_EM}em` : "none";
      } else {
        style.filter = "none";
        style.translate = "none";
      }
    }

    // The caret follows the last typed letter (Developer, 8-bit), hidden once everything is in.
    const caretOn = mode === "typed" && last >= 0 && last < chars.length - 1 ? chars[last] : null;
    if (caretRef.current !== caretOn) {
      caretRef.current?.classList.remove("lit-caret");
      caretOn?.classList.add("lit-caret");
      caretRef.current = caretOn;
    }

    // The pen (Paper) rests its nib on the point being drawn.
    const pen = penRef.current;
    if (pen) {
      const at = drawing >= 0 ? drawing : last;
      if (!written || at < 0 || last === chars.length - 1) {
        pen.style.opacity = "0";
        return;
      }
      const char = chars[at];
      const stroke = char.querySelector<SVGPathElement>(".hand-stroke");
      let x = char.offsetLeft + char.offsetWidth;
      let y = char.offsetTop + char.offsetHeight * 0.78;
      if (stroke) {
        let total = lengthsRef.current.get(stroke);
        if (total === undefined) {
          total = stroke.getTotalLength();
          lengthsRef.current.set(stroke, total);
        }
        const point = stroke.getPointAtLength(total * (stateRef.current[at] ?? 1));
        const scale = char.offsetWidth / Number(char.dataset.advance);
        x = char.offsetLeft + point.x * scale;
        y = char.offsetTop + point.y * scale;
      }
      // A slight wobble as it writes, driven by the writing itself: a CSS animation here would
      // keep the pen on its own animated layer over the letters and make every scroll frame
      // re-layer the whole paragraph.
      const wobble = Math.sin(head * Math.PI * 1.5) * 5 - 1;
      pen.style.opacity = "1";
      pen.style.transform = `translate(${x}px, ${y}px) rotate(${wobble.toFixed(1)}deg)`;
    }
  };

  // (Re)start on mount, when the style changes, and when the handwriting arrives, since each
  // draws letters differently.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    charsRef.current = Array.from(
      ref.current?.querySelectorAll<HTMLSpanElement>(".lit-char") ?? [],
    );
    modeRef.current = currentMode();
    stateRef.current = [];
    lengthsRef.current = new Map();
    render(scrollYProgress.get());
    // `render` only reads refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, skin, hand]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (charsRef.current.length) render(progress);
  });

  const handwriting = skin === "paper" ? hand : null;
  const words = text.split(" ");
  let index = 0;
  return (
    <p ref={ref} className={cn("lit-text relative", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, w) => (
          <span key={w}>
            {/* Words don't break mid-letter-span: each is a no-wrap inline block. */}
            <span className="inline-block whitespace-nowrap">
              {[...word].map((char, c) => {
                const glyph = handwriting?.glyphs[char];
                const i = index++;
                return glyph && handwriting ? (
                  <HandLetter key={c} index={i} glyph={glyph} hand={handwriting} />
                ) : (
                  <span key={c} className="lit-char inline-block">
                    {char}
                  </span>
                );
              })}
            </span>
            {w < words.length - 1 && " "}
          </span>
        ))}
      </span>
      {/* Paper style: the fountain pen writing the story; its nib is the bottom-left corner. */}
      <span ref={penRef} className="lit-pen" aria-hidden>
        <svg viewBox="0 0 64 64" fill="none">
          {/* Barrel */}
          <path
            d="M2 62 L14 56 L50 20 L44 14 L8 50 Z"
            fill="currentColor"
            stroke="var(--fg)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Nib slit and breather hole */}
          <path d="M2 62 L18 46" stroke="var(--bg-elevated)" strokeWidth="1.5" />
          <circle cx="12" cy="52" r="2.2" fill="var(--bg-elevated)" />
          {/* Cap end */}
          <path
            d="M46 24 L58 12 Q62 8 58 4 Q54 0 50 4 L38 16 Z"
            fill="var(--fg)"
            stroke="var(--fg)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <noscript>
        <style>{`.lit-char{opacity:1!important;filter:none!important;translate:none!important}.lit-pen{display:none!important}`}</style>
      </noscript>
    </p>
  );
}

/**
 * One handwritten letter: Caveat's outline, shown through a mask made of the letter's own pen
 * strokes. Drawing the strokes from 0 (stroke-dashoffset 1 → 0) inks the letter in writing
 * order. Same advance width as the text letter, so lines wrap exactly as before.
 */
function HandLetter({
  index,
  glyph,
  hand,
}: {
  index: number;
  glyph: Handwriting["glyphs"][string];
  hand: Handwriting;
}) {
  const id = `${useId().replace(/:/g, "")}-${index}`;
  const height = hand.ascender - hand.descender;
  return (
    <span
      className="lit-char hand-letter"
      data-mask={id}
      data-advance={glyph.a}
      style={
        {
          "--advance": glyph.a / 1000,
          "--height": height / 1000,
          "--descent": hand.descender / 1000,
        } as CSSProperties
      }
    >
      <svg viewBox={`0 0 ${glyph.a} ${height}`} overflow="visible">
        <mask
          id={id}
          maskUnits="userSpaceOnUse"
          x={-600}
          y={-600}
          width={glyph.a + 1200}
          height={height + 1200}
        >
          <path
            className="hand-stroke"
            d={glyph.s}
            pathLength={1}
            fill="none"
            stroke="#fff"
            strokeWidth={glyph.w}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 2"
            strokeDashoffset={1}
          />
        </mask>
        <path className="hand-ink" d={glyph.o} fill="currentColor" />
      </svg>
    </span>
  );
}
