"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import * as m from "motion/react-m";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useState, type PointerEvent } from "react";
import { BrowserFrame, PhoneFrame } from "@/components/projects/device-frames";
import { cn } from "@/lib/utils";

export interface ShowcaseItem {
  slug: string;
  name: string;
  domain: string;
  industry: string;
  stack: string[];
  cover: StaticImageData;
  mobile: StaticImageData;
}

const SLIDE_SECONDS = 5;

/**
 * Hero visual: real screenshots of shipped projects cycling in a browser + phone,
 * with a code card describing the current project (data comes from src/data/projects.ts).
 */
export function HeroShowcase({ items }: { items: ShowcaseItem[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const current = items[active];
  const autoplay = !paused && !reduceMotion;

  // Pointer-driven tilt (fine pointers only).
  const rotateX = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 6);
    rotateX.set(py * -6);
  }

  function onPointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  // Pause the carousel while the tab is hidden.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const next = () => setActive((index) => (index + 1) % items.length);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="relative [perspective:1600px]"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <m.div
          className="relative aspect-[10/9] w-full sm:aspect-[5/4]"
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        >
          {/* Browser */}
          <BrowserFrame
            domain={
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  key={current.domain}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="block"
                >
                  {current.domain}
                </m.span>
              </AnimatePresence>
            }
            className="absolute top-0 right-0 w-[92%]"
          >
            <div className="relative aspect-[16/10]">
              {items.map((item, index) => (
                <Image
                  key={item.slug}
                  src={item.cover}
                  alt={index === active ? `Homepage of ${item.domain}` : ""}
                  aria-hidden={index !== active}
                  priority={index === 0}
                  sizes="(min-width: 1024px) 560px, 92vw"
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover object-top transition-[opacity,transform] duration-700 ease-out-expo",
                    index === active ? "scale-100 opacity-100" : "scale-[1.03] opacity-0",
                  )}
                />
              ))}
            </div>
          </BrowserFrame>

          {/* Code card */}
          <div
            className="absolute bottom-[3%] left-0 w-[66%] overflow-hidden rounded-xl border border-border-strong bg-code/95 shadow-float backdrop-blur-md sm:w-[58%]"
            style={{ transform: "translateZ(40px)" }}
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2 font-mono text-[10.5px] text-fg-subtle">
              <span className="rounded bg-bg-inset px-1.5 py-0.5 text-fg-muted">projects.ts</span>
              <span className="truncate">src/data</span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <m.pre
                key={current.slug}
                className="overflow-hidden px-3 py-3 font-mono text-[10px] leading-[1.7] sm:text-[11.5px]"
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                aria-hidden
              >
                <CodeLine>
                  <K>export const</K> <span className="text-fg">project</span> <P>=</P> <P>{"{"}</P>
                </CodeLine>
                <CodeLine indent>
                  <Prop>name</Prop>
                  <P>:</P> <S>&quot;{current.name}&quot;</S>
                  <P>,</P>
                </CodeLine>
                <CodeLine indent>
                  <Prop>industry</Prop>
                  <P>:</P> <S>&quot;{current.industry}&quot;</S>
                  <P>,</P>
                </CodeLine>
                <CodeLine indent>
                  <Prop>stack</Prop>
                  <P>: [</P>
                  {current.stack.slice(0, 2).map((item, index) => (
                    <span key={item}>
                      {index > 0 && <P>, </P>}
                      <S>&quot;{item}&quot;</S>
                    </span>
                  ))}
                  <P>],</P>
                </CodeLine>
                <CodeLine indent>
                  <Prop>live</Prop>
                  <P>:</P> <K>true</K>
                  <P>,</P>
                </CodeLine>
                <CodeLine>
                  <P>{"};"}</P>
                </CodeLine>
              </m.pre>
            </AnimatePresence>
          </div>

          {/* Phone */}
          <PhoneFrame className="absolute right-[3%] bottom-0 w-[24%] sm:w-[21%]">
            <div className="relative aspect-[390/844]">
              {items.map((item, index) => (
                <Image
                  key={item.slug}
                  src={item.mobile}
                  alt=""
                  aria-hidden
                  sizes="140px"
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover object-top transition-opacity delay-100 duration-700",
                    index === active ? "opacity-100" : "opacity-0",
                  )}
                />
              ))}
            </div>
          </PhoneFrame>
        </m.div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex flex-1 gap-1.5" role="group" aria-label="Choose a featured project">
          {items.map((item, index) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show ${item.name}`}
              aria-pressed={index === active}
              className="group relative h-6 flex-1"
            >
              <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 overflow-hidden rounded-full bg-border-strong transition-[height] group-hover:h-1">
                {index === active && (
                  <m.span
                    key={`${item.slug}-${autoplay}`}
                    className="absolute inset-y-0 left-0 rounded-full bg-fg"
                    initial={{ width: autoplay ? "0%" : "100%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: autoplay ? SLIDE_SECONDS : 0, ease: "linear" }}
                    onAnimationComplete={() => autoplay && next()}
                  />
                )}
                {index < active && <span className="absolute inset-0 bg-fg/40" />}
              </span>
            </button>
          ))}
        </div>
        <Link
          href={`/portfolio/${current.slug}/`}
          className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-fg-muted transition-colors hover:text-fg"
        >
          <span className="hidden sm:inline">View</span>
          <span className="max-w-[9rem] truncate sm:max-w-[12rem]">{current.domain}</span>
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function CodeLine({ children, indent = false }: { children: React.ReactNode; indent?: boolean }) {
  return (
    <m.span
      className={cn("block truncate", indent && "pl-4")}
      variants={{ hidden: { opacity: 0, x: -6 }, show: { opacity: 1, x: 0 } }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </m.span>
  );
}

const K = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: "var(--code-keyword)" }}>{children}</span>
);
const S = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: "var(--code-string)" }}>{children}</span>
);
const Prop = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: "var(--code-prop)" }}>{children}</span>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: "var(--code-punct)" }}>{children}</span>
);
