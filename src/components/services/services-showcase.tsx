"use client";

import {
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";
import { serviceIcons } from "@/components/services/service-icons";
import { services } from "@/data/services";
import { cn } from "@/lib/utils";

const HORIZONTAL_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

/**
 * Services page signature: on large screens the panels travel horizontally while the page
 * scrolls vertically (sticky stage + native scroll, nothing is hijacked). On small screens
 * or with reduced motion the same panels simply stack.
 */
export function ServicesShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [horizontal, setHorizontal] = useState(false);
  const [distance, setDistance] = useState(0);
  const [current, setCurrent] = useState(0);

  const enabled = useMotionValue(0);
  const travel = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 160, damping: 32, restDelta: 0.0005 });
  const x = useTransform(() => -smooth.get() * travel.get() * enabled.get());

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setCurrent(Math.min(services.length - 1, Math.floor(value * services.length)));
  });

  useEffect(() => {
    const media = window.matchMedia(HORIZONTAL_QUERY);
    const track = trackRef.current;
    const measure = () => {
      const on = media.matches;
      setHorizontal(on);
      enabled.set(on ? 1 : 0);
      if (on && track) {
        const d = Math.max(0, track.scrollWidth - window.innerWidth);
        travel.set(d);
        setDistance(d);
      }
    };
    measure();
    media.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    if (track) observer.observe(track);
    return () => {
      media.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, [enabled, travel]);

  // In horizontal mode a panel's position is horizontal, so "#service" links need translating
  // into the vertical scroll position that brings that panel to the start of the stage.
  useEffect(() => {
    if (!horizontal) return;
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      const id = link?.getAttribute("href")?.slice(1);
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!id || !section || !track) return;
      const panel = track.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      const first = track.firstElementChild as HTMLElement | null;
      if (!panel || !first) return;
      event.preventDefault();
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const offset = Math.min(distance, panel.offsetLeft - first.offsetLeft);
      window.scrollTo({ top: sectionTop + offset, behavior: "smooth" });
      history.replaceState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [horizontal, distance]);

  return (
    <section
      ref={sectionRef}
      aria-label="Services"
      className="relative"
      style={horizontal ? { height: `calc(100dvh + ${distance}px)` } : undefined}
    >
      <div
        className={cn(
          horizontal ? "sticky top-0 flex h-dvh flex-col justify-center overflow-hidden" : "py-8",
        )}
      >
        {horizontal && (
          <div className="container-page mb-8 flex items-center gap-6" aria-hidden>
            <span className="font-mono text-sm text-fg-muted tabular-nums">
              <span className="text-fg">{String(current + 1).padStart(2, "0")}</span> /{" "}
              {String(services.length).padStart(2, "0")}
            </span>
            <span className="relative h-px flex-1 overflow-hidden bg-border">
              <m.span
                className="absolute inset-0 origin-left bg-accent"
                style={{ scaleX: smooth }}
              />
            </span>
            <span className="font-mono text-xs text-fg-subtle uppercase">Scroll</span>
          </div>
        )}

        <m.div
          ref={trackRef}
          style={{ x }}
          className={cn(
            "flex gap-6",
            horizontal
              ? "w-max flex-row pr-[12vw] pl-[max(2rem,calc((100vw-76rem)/2+2rem))]"
              : "container-page flex-col",
          )}
        >
          {services.map((service, index) => {
            const Icon = serviceIcons[service.icon];
            return (
              <m.article
                key={service.id}
                id={service.id}
                className={cn(
                  "group relative flex scroll-mt-24 flex-col overflow-hidden rounded-3xl border border-border bg-bg-elevated p-7 transition-colors duration-500 hover:border-border-strong md:p-10",
                  horizontal && "w-[min(64vw,780px)] shrink-0",
                  horizontal && current === index && "border-border-strong",
                )}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute -top-40 -right-40 size-96 rounded-full bg-accent/15 blur-3xl transition-opacity duration-700",
                    horizontal && current === index ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute right-6 bottom-0 font-mono text-[8rem] leading-[0.8] font-semibold text-fg/[0.05] select-none md:text-[12rem]"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="relative inline-flex size-14 items-center justify-center rounded-2xl border border-border bg-bg-subtle text-accent transition-transform duration-500 group-hover:-rotate-6">
                  <Icon className="size-6" aria-hidden />
                </span>
                <p className="relative mt-8 font-mono text-xs text-fg-subtle uppercase">
                  {service.tagline}
                </p>
                <h2 className="relative mt-2 text-3xl font-semibold tracking-[-0.03em] text-balance md:text-4xl">
                  {service.title}
                </h2>
                <p className="relative mt-5 max-w-xl text-base leading-relaxed text-pretty text-fg-muted md:text-lg">
                  {service.description}
                </p>
                <ul className="relative mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {service.deliverables.map((item) => (
                    <li key={item} className="flex gap-3 text-[15px] text-pretty">
                      <span className="mt-[0.55em] h-px w-4 shrink-0 bg-accent" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </m.article>
            );
          })}
        </m.div>
      </div>
    </section>
  );
}
