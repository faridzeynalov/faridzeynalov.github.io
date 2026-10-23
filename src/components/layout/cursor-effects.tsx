"use client";

import { useMotionValue, useSpring } from "motion/react";
import * as m from "motion/react-m";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { CODE_SNIPPETS, createSnippetPicker } from "@/lib/code-snippets";
import { cn } from "@/lib/utils";

const SNIPPET_MIN_GAP = 30; // a term reappears only after at least this many others
const SPAWN_DISTANCE = 64; // px of mouse travel between snippets
const TOUCH_SPAWN_DISTANCE = 48; // px of finger travel between snippets
const TAP_BURST = 3;
const INTERACTIVE = "a, button, [role='button'], summary, label, select";

type Mode = "mouse" | "touch" | null;

/**
 * Code snippets that drift up behind the page as you move, plus (for mice) a theme-aware
 * custom cursor. Touch screens get the snippet trail only where the finger touches and slides,
 * never from the page scrolling by itself. Everything is off with reduced motion.
 */
export function CursorEffects() {
  const [mode, setMode] = useState<Mode>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMode(reduced.matches ? null : fine.matches ? "mouse" : "touch");
    update();
    fine.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  if (mode === "mouse") return <CursorLayers />;
  if (mode === "touch") return <TouchTrail />;
  return null;
}

/** Layer behind the page content (negative z-index: under in-flow content and cards). */
function TrailLayer({ layerRef }: { layerRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={layerRef}
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden"
      aria-hidden
    />
  );
}

/** Returns a stable `spawn(x, y, spread)` that drops one snippet near a viewport point. */
function useSnippetSpawner(layerRef: RefObject<HTMLDivElement | null>, maxSnippets: number) {
  const pickerRef = useRef<(() => string) | null>(null);

  return useCallback(
    (px: number, py: number, spread = 1) => {
      const layer = layerRef.current;
      if (!layer) return;
      pickerRef.current ??= createSnippetPicker(CODE_SNIPPETS, SNIPPET_MIN_GAP);
      while (layer.childElementCount >= maxSnippets) layer.firstElementChild?.remove();

      const el = document.createElement("span");
      el.className = "code-trail-snippet";
      el.textContent = pickerRef.current();
      el.style.left = `${px + (Math.random() - 0.5) * 140 * spread}px`;
      el.style.top = `${py + (Math.random() - 0.5) * 90 * spread}px`;
      el.style.setProperty("--r", `${(Math.random() - 0.5) * 16}deg`);
      el.style.setProperty("--drift", `${-18 - Math.random() * 26}px`);
      el.style.setProperty("--o", `${0.45 + Math.random() * 0.4}`);
      el.style.animationDuration = `${1.6 + Math.random() * 1.2}s`;
      if (Math.random() < 0.25) el.dataset.accent = "";
      el.addEventListener("animationend", () => el.remove(), { once: true });
      layer.appendChild(el);
    },
    [layerRef, maxSnippets],
  );
}

/**
 * Touch: a small burst where the finger lands and a trail along the finger while it slides.
 * Nothing spawns from scrolling itself (e.g. momentum after the finger lifts).
 */
function TouchTrail() {
  const layerRef = useRef<HTMLDivElement>(null);
  const spawn = useSnippetSpawner(layerRef, 22);

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let travelled = 0;

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      lastX = touch.clientX;
      lastY = touch.clientY;
      travelled = 0;
      for (let i = 0; i < TAP_BURST; i++) spawn(lastX, lastY, 0.9);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      travelled += Math.hypot(touch.clientX - lastX, touch.clientY - lastY);
      lastX = touch.clientX;
      lastY = touch.clientY;
      if (travelled >= TOUCH_SPAWN_DISTANCE) {
        travelled = 0;
        spawn(lastX, lastY);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [spawn]);

  return <TrailLayer layerRef={layerRef} />;
}

/** Mouse: theme-aware dot + trailing ring, and the snippet trail. */
function CursorLayers() {
  const trailRef = useRef<HTMLDivElement>(null);
  const spawn = useSnippetSpawner(trailRef, 28);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    let lastX: number | null = null;
    let lastY: number | null = null;
    let travelled = 0;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      const target = event.target as Element | null;
      setHovering(!!target?.closest?.(INTERACTIVE));

      if (lastX !== null && lastY !== null) {
        travelled += Math.hypot(event.clientX - lastX, event.clientY - lastY);
        if (travelled >= SPAWN_DISTANCE) {
          travelled = 0;
          spawn(event.clientX, event.clientY);
        }
      }
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y, spawn]);

  return (
    <>
      <TrailLayer layerRef={trailRef} />

      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-[100] transition-opacity duration-300 print:hidden",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      >
        {/* Trailing ring */}
        <m.div className="absolute top-0 left-0" style={{ x: ringX, y: ringY }}>
          <div
            className={cn(
              "-translate-x-1/2 -translate-y-1/2 rounded-full border transition-[width,height,background-color,border-color] duration-300 ease-out-expo",
              hovering
                ? "size-12 border-accent/60 bg-accent-soft"
                : "size-8 border-fg/30 bg-transparent",
              pressed && "size-6",
            )}
          />
        </m.div>
        {/* Dot */}
        <m.div className="absolute top-0 left-0" style={{ x, y }}>
          <div
            className={cn(
              "size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent transition-transform duration-200",
              hovering && "scale-0",
            )}
          />
        </m.div>
      </div>
    </>
  );
}
