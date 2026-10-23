"use client";

import { useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import * as m from "motion/react-m";
import { useRef } from "react";
import { process } from "@/data/services";
import type { ProcessStep } from "@/types/content";

/**
 * "How I work": a wavy path draws itself across the steps as the section scrolls past,
 * and each step lights up when the line reaches it.
 */
export function ProcessPath() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  return (
    <div ref={ref} className="relative">
      {/* Desktop: horizontal wave behind the step markers */}
      <svg
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute top-0 left-0 hidden h-[120px] w-full lg:block"
        aria-hidden
      >
        <path
          d="M 0 60 C 41.67 15, 83.33 15, 125 60 S 208.33 105, 250 60 S 333.33 15, 375 60 S 458.33 105, 500 60 S 583.33 15, 625 60 S 708.33 105, 750 60 S 833.33 15, 875 60 S 958.33 105, 1000 60"
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <m.path
          d="M 0 60 C 41.67 15, 83.33 15, 125 60 S 208.33 105, 250 60 S 333.33 15, 375 60 S 458.33 105, 500 60 S 583.33 15, 625 60 S 708.33 105, 750 60 S 833.33 15, 875 60 S 958.33 105, 1000 60"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: progress }}
        />
      </svg>

      {/* Mobile: vertical rail */}
      <div className="absolute top-2 bottom-2 left-[19px] w-px bg-border lg:hidden" aria-hidden>
        <m.div className="h-full w-full origin-top bg-accent" style={{ scaleY: progress }} />
      </div>

      <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-0">
        {process.map((step, index) => (
          <Step
            key={step.title}
            step={step}
            index={index}
            total={process.length}
            progress={progress}
          />
        ))}
      </ol>
    </div>
  );
}

function Step({
  step,
  index,
  total,
  progress,
}: {
  step: ProcessStep;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  // Each step activates as the line reaches its marker at the centre of its column.
  const start = (index + 0.5) / total - 0.06;
  const reached = useTransform(progress, [start, start + 0.08], [0, 1]);
  const textOpacity = useTransform(reached, [0, 1], [0.45, 1]);
  const lift = useTransform(reached, [0, 1], [12, 0]);
  const markerScale = useTransform(reached, [0, 1], [0.85, 1]);
  const markerBorder = useTransform(reached, (v) =>
    v > 0.5 ? "var(--accent)" : "var(--border-strong)",
  );

  return (
    <li className="relative pl-14 lg:px-4 lg:pt-[120px] lg:text-center">
      {/* Marker sits on the wave (desktop; the wave crosses y=60 at each column's centre) or
          on the rail (mobile). */}
      <m.span
        className="absolute top-0 left-0 inline-flex size-10 items-center justify-center rounded-full border-2 bg-bg font-mono text-xs font-semibold lg:top-[40px] lg:left-[calc(50%-20px)]"
        style={{ borderColor: markerBorder, scale: markerScale }}
        aria-hidden
      >
        {String(index + 1).padStart(2, "0")}
      </m.span>
      <m.div style={{ opacity: textOpacity, y: lift }} className="lg:pt-8">
        <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-pretty text-fg-muted">
          {step.description}
        </p>
      </m.div>
    </li>
  );
}
