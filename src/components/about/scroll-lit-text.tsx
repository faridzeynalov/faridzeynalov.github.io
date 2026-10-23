"use client";

import { useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import * as m from "motion/react-m";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * About page signature: the paragraph lights up word by word as it scrolls through the
 * viewport, like reading along. Full opacity immediately with reduced motion.
 */
export function ScrollLitText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");

  if (reduceMotion) {
    return (
      <p ref={ref} className={className}>
        {text}
      </p>
    );
  }

  return (
    <p ref={ref} className={cn("flex flex-wrap", className)}>
      {words.map((word, index) => (
        <Word
          key={index}
          progress={scrollYProgress}
          range={[index / words.length, (index + 1) / words.length]}
        >
          {word}
        </Word>
      ))}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <span className="relative mr-[0.27em]">
      {/* Ghost copy keeps the text readable and selectable while the lit copy fades in. */}
      <span className="absolute opacity-[0.18]" aria-hidden>
        {children}
      </span>
      <m.span style={{ opacity }}>{children}</m.span>
    </span>
  );
}
