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
 *   pencil follows the exact point being drawn. Scrolling back up turns the pencil round and
 *   its eraser rubs the letters out again.
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
  /** Paper: scrolling back up turns the pencil round and rubs the story out. */
  const erasingRef = useRef(false);
  const lastProgressRef = useRef(0);
  const crumbAtRef = useRef(0);
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
    // Which way the reader is scrolling (with a little slack, so the pencil doesn't flicker):
    // down writes, up erases. A turn of direction redraws the letters in the new manner.
    const delta = progress - lastProgressRef.current;
    if (written && Math.abs(delta) > 0.0004) {
      const erasing = delta < 0;
      if (erasing !== erasingRef.current) {
        erasingRef.current = erasing;
        stateRef.current = [];
      }
      lastProgressRef.current = progress;
    }
    const erasing = written && erasingRef.current;
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
        // Erasing instead rubs the whole letter out: it fades under the eraser.
        style.opacity = erasing && t < 1 ? String(t) : "1";
        style.visibility = t > 0 ? "visible" : "hidden";
        stroke.style.strokeDashoffset = erasing ? "0" : String(1 - t);
        const ink = char.querySelector(".hand-ink");
        if (!erasing && t > 0 && t < 1) ink?.setAttribute("mask", `url(#${char.dataset.mask})`);
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

    // The pencil (Paper) rests its point on the point being drawn, or its eraser on the letter
    // being rubbed out.
    const pen = penRef.current;
    if (pen) {
      const at = drawing >= 0 ? drawing : last;
      if (!written || at < 0 || last === chars.length - 1) {
        pen.style.opacity = "0";
        return;
      }
      pen.classList.toggle("is-erasing", erasing);
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
      // A slight wobble as it writes (a quicker, wider rub as it erases), driven by the writing
      // itself: a CSS animation here would keep the pen on its own animated layer over the
      // letters and make every scroll frame re-layer the whole paragraph.
      const wobble = erasing
        ? Math.sin(head * Math.PI * 7) * 9
        : Math.sin(head * Math.PI * 1.5) * 5 - 1;
      pen.style.opacity = "1";
      pen.style.transform = `translate(${x}px, ${y}px) rotate(${wobble.toFixed(1)}deg)`;
      if (erasing && Math.abs(head - crumbAtRef.current) > 0.7) {
        crumbAtRef.current = head;
        dropCrumb(pen.parentElement, x, y);
      }
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
    erasingRef.current = false;
    lastProgressRef.current = scrollYProgress.get();
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
      {/* Paper style: the pencil writing the story; its point is the bottom-left corner. Drawn
          lying along x and turned to the diagonal; turned round (CSS) to erase. */}
      <span ref={penRef} className="lit-pen" aria-hidden>
        <svg viewBox="0 0 64 64" fill="none" strokeLinejoin="round">
          <g transform="translate(2 62) rotate(-45)" stroke="#3b2f22" strokeWidth="0.9">
            {/* Graphite point and sharpened wood */}
            <path d="M6 -1.8 L16 -6 L16 6 L6 1.8 Z" fill="#ecd2a6" />
            <path d="M0 0 L6 -1.8 L6 1.8 Z" fill="#3a3632" />
            {/* Painted body, with its facets */}
            <path d="M16 -6 H56 V6 H16 Z" fill="#f2c230" />
            <path d="M16 -2 H56 M16 2 H56" stroke="#d9a514" strokeWidth="1.2" />
            {/* Metal ferrule */}
            <path d="M56 -6.4 H64 V6.4 H56 Z" fill="#c9c6bf" />
            <path d="M58.5 -6.4 V6.4 M61.5 -6.4 V6.4" stroke="#8f8b83" strokeWidth="0.8" />
            {/* Eraser */}
            <path d="M64 -6 H70 Q74 -6 74 0 Q74 6 70 6 H64 Z" fill="#f08a9c" />
          </g>
        </svg>
      </span>
      <noscript>
        <style>{`.lit-char{opacity:1!important;filter:none!important;translate:none!important}.lit-pen,.eraser-crumb{display:none!important}`}</style>
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

/** A few crumbs of eraser rubbings that fall from the eraser and fade (Paper). */
function dropCrumb(host: HTMLElement | null, x: number, y: number) {
  if (!host || host.querySelectorAll(".eraser-crumb").length > 18) return;
  for (let i = 0; i < 2; i++) {
    const crumb = document.createElement("span");
    crumb.className = "eraser-crumb";
    crumb.style.left = `${x + (Math.random() - 0.5) * 14}px`;
    crumb.style.top = `${y + (Math.random() - 0.3) * 8}px`;
    crumb.style.setProperty("--dx", `${(Math.random() - 0.5) * 26}px`);
    crumb.style.setProperty("--dy", `${10 + Math.random() * 18}px`);
    crumb.style.setProperty("--r", `${Math.random() * 180}deg`);
    crumb.addEventListener("animationend", () => crumb.remove(), { once: true });
    host.appendChild(crumb);
  }
}
