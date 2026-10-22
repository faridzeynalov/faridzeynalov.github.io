"use client";

import { useMotionValue, useSpring } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";
import { CODE_SNIPPETS, createSnippetPicker } from "@/lib/code-snippets";
import { cn } from "@/lib/utils";

const SNIPPET_MIN_GAP = 30; // a term reappears only after at least this many others
const SPAWN_DISTANCE = 64; // px of pointer travel between snippets
const MAX_SNIPPETS = 28;
const INTERACTIVE = "a, button, [role='button'], summary, label, select";

/**
 * Theme-aware custom cursor (dot + trailing ring) and a trail of code snippets that
 * drift up behind the page. Mouse users only; off for touch and reduced motion.
 */
export function CursorEffects() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(fine.matches && !reduced.matches);
    update();
    fine.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  if (!enabled) return null;
  return <CursorLayers />;
}

function CursorLayers() {
  const trailRef = useRef<HTMLDivElement>(null);
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
    const nextSnippet = createSnippetPicker(CODE_SNIPPETS, SNIPPET_MIN_GAP);

    const spawn = (px: number, py: number) => {
      const layer = trailRef.current;
      if (!layer) return;
      while (layer.childElementCount >= MAX_SNIPPETS) layer.firstElementChild?.remove();

      const el = document.createElement("span");
      el.className = "code-trail-snippet";
      el.textContent = nextSnippet();
      el.style.left = `${px + (Math.random() - 0.5) * 140}px`;
      el.style.top = `${py + (Math.random() - 0.5) * 90}px`;
      el.style.setProperty("--r", `${(Math.random() - 0.5) * 16}deg`);
      el.style.setProperty("--drift", `${-18 - Math.random() * 26}px`);
      el.style.setProperty("--o", `${0.45 + Math.random() * 0.4}`);
      el.style.animationDuration = `${1.6 + Math.random() * 1.2}s`;
      if (Math.random() < 0.25) el.dataset.accent = "";
      el.addEventListener("animationend", () => el.remove(), { once: true });
      layer.appendChild(el);
    };

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
  }, [x, y]);

  return (
    <>
      {/* Behind the page content: negative z-index under in-flow content and cards. */}
      <div
        ref={trailRef}
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden"
        aria-hidden
      />

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
