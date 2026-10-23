"use client";

import { ArrowRight } from "lucide-react";
import { useInView, useScroll, useSpring } from "motion/react";
import * as m from "motion/react-m";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { useScrollReveal } from "@/components/motion/scroll-reveal";
import {
  Accent,
  HeadingMark,
  SectionEyebrow,
  sectionTitleClass,
} from "@/components/sections/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { serviceIcons } from "@/components/services/service-icons";
import type { Service } from "@/types/content";

const ease = [0.16, 1, 0.3, 1] as const;
/** How far (px) the card numbers drift up/down across a scroll through the viewport. */
const PARALLAX_RANGE = 44;

/**
 * Parallax for the big card numbers ([data-parallax]): they move down → up as their card
 * crosses the viewport. One passive scroll listener, batched to an animation frame, and only
 * the cards currently on screen are measured — works in every browser (CSS scroll-driven
 * animations don't yet), and stays cheap on phones. Off with reduced motion.
 */
function useNumberParallax(listRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const list = listRef.current;
    if (!list || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const numbers = Array.from(list.querySelectorAll<HTMLElement>("[data-parallax]"));
    const onScreen = new Set<HTMLElement>();

    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      for (const number of onScreen) {
        const card = number.parentElement!.getBoundingClientRect();
        // -1 when the card's centre is at the viewport bottom, +1 at the top.
        const center = card.top + card.height / 2;
        const t = Math.max(-1, Math.min(1, 1 - (2 * center) / viewport));
        number.style.transform = `translate3d(0, ${(-t * PARALLAX_RANGE).toFixed(1)}px, 0)`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const number = entry.target.querySelector<HTMLElement>("[data-parallax]");
        if (!number) continue;
        if (entry.isIntersecting) onScreen.add(number);
        else onScreen.delete(number);
      }
      schedule();
    });
    numbers.forEach((number) => observer.observe(number.parentElement!));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [listRef]);
}

/**
 * Services: a sticky index on the left tracks the card in view, a progress line fills
 * as the list scrolls past, and each card reveals with its deliverables staggering in.
 */
export function Services({ services }: { services: Service[] }) {
  const t = useTranslations("ServicesSection");
  const tc = useTranslations("Common");
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 65%", "end 55%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  useNumberParallax(listRef);

  return (
    <section id="services" aria-labelledby="services-title" className="relative py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] bg-grid mask-radial opacity-60"
        aria-hidden
      />
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-16">
        {/* Sticky intro + index */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <SectionEyebrow index="02" className="mb-4">
                {t("eyebrow")}
              </SectionEyebrow>
              <h2 id="services-title" className={sectionTitleClass}>
                <HeadingMark />
                {t("title")} <Accent>{t("accent")}</Accent>
              </h2>
              <p className="mt-4 max-w-md text-base text-pretty text-fg-muted md:text-lg">
                {t("description")}
              </p>
            </Reveal>

            <nav aria-label={t("eyebrow")} className="mt-10 hidden lg:block">
              <ol className="space-y-1">
                {services.map((service, index) => (
                  <li key={service.id}>
                    <a
                      href={`#service-${service.id}`}
                      className={cn(
                        "group relative flex items-baseline gap-4 rounded-lg py-2 pr-3 pl-4 transition-colors duration-300",
                        active === index ? "text-fg" : "text-fg-subtle hover:text-fg-muted",
                      )}
                      aria-current={active === index ? "true" : undefined}
                    >
                      {active === index && (
                        <m.span
                          layoutId="service-index"
                          className="absolute inset-0 rounded-lg bg-bg-subtle"
                          transition={{ type: "spring", stiffness: 380, damping: 34 }}
                          aria-hidden
                        />
                      )}
                      <span
                        className={cn(
                          "relative font-mono text-xs tabular-nums transition-colors",
                          active === index && "text-accent",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="relative font-medium">{service.title}</span>
                      <span className="relative ml-auto hidden text-xs text-fg-subtle xl:inline">
                        {service.tagline}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <Reveal className="mt-10" y={12} delay={0.2}>
              <Link href="/contact" className={buttonVariants({ size: "lg" })}>
                {tc("startProject")}
                <ArrowRight aria-hidden />
              </Link>
              <Link
                href="/services"
                className={buttonVariants({ variant: "ghost", size: "lg", className: "ml-2" })}
              >
                {t("allServices")}
              </Link>
            </Reveal>
          </div>
        </div>

        {/* Cards + scroll progress rail */}
        <div className="relative lg:col-span-7">
          <div
            className="absolute top-2 bottom-2 left-[19px] hidden w-px bg-border sm:block"
            aria-hidden
          >
            <m.div
              className="h-full w-full origin-top bg-gradient-to-b from-accent via-accent to-accent/30"
              style={{ scaleY: progress }}
            />
          </div>

          <ol ref={listRef} className="space-y-6 sm:space-y-8">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                active={active === index}
                onActive={setActive}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  index,
  active,
  onActive,
}: {
  service: Service;
  index: number;
  active: boolean;
  onActive: (index: number) => void;
}) {
  const t = useTranslations("ServicesSection");
  const ref = useRef<HTMLLIElement>(null);
  // "Active" when the card crosses the middle band of the viewport.
  const inBand = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inBand) onActive(index);
  }, [inBand, onActive, index]);

  // Plays as the card scrolls in; the icon and deliverables follow through variants.
  const shown = useScrollReveal(ref, { amount: 0.3 });

  const Icon = serviceIcons[service.icon];

  return (
    <m.li
      ref={ref}
      id={`service-${service.id}`}
      className="relative scroll-mt-28 sm:pl-14"
      initial="hidden"
      animate={shown ? "show" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 56, scale: 0.97, transition: { duration: 0.3 } },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease } },
      }}
    >
      {/* Rail node */}
      <span
        className={cn(
          "absolute top-8 left-[13px] hidden size-[13px] rounded-full border-2 transition-colors duration-500 sm:block",
          active ? "border-accent bg-accent" : "border-border-strong bg-bg",
        )}
        aria-hidden
      >
        {active && (
          <span className="absolute -inset-1.5 animate-ping rounded-full bg-accent/30 motion-reduce:hidden" />
        )}
      </span>

      <article
        data-file={`${service.id}.tsx`}
        className={cn(
          "group relative overflow-hidden rounded-2xl border bg-bg-elevated p-6 transition-[border-color,box-shadow] duration-500 md:p-8 dev:pt-14 dev:md:pt-16",
          active ? "border-border-strong shadow-float" : "border-border",
        )}
      >
        {/* Accent wash when active */}
        <div
          className={cn(
            "pointer-events-none absolute -top-44 -right-44 size-[26rem] transition-opacity duration-700 [--glow-strength:15%] glow",
            active ? "opacity-100" : "opacity-0",
          )}
          aria-hidden
        />
        {/* Large outlined number (accent on the active card) that drifts as the page scrolls;
            moved by useNumberParallax. Below the Developer style's title bar. */}
        <span
          data-parallax
          className={cn(
            "pointer-events-none absolute top-3 right-5 font-mono text-[7rem] leading-none font-semibold text-transparent transition-[-webkit-text-stroke-color] duration-500 will-change-transform select-none [-webkit-text-stroke:1.5px_color-mix(in_oklab,var(--fg)_18%,transparent)] md:text-[9rem] dev:top-11",
            active &&
              "[-webkit-text-stroke-color:color-mix(in_oklab,var(--accent)_70%,transparent)]",
          )}
          aria-hidden
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="relative flex items-start gap-4">
          <m.span
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-subtle text-accent"
            variants={{
              hidden: { rotate: -25, scale: 0.6, opacity: 0 },
              show: {
                rotate: 0,
                scale: 1,
                opacity: 1,
                transition: { type: "spring", stiffness: 260, damping: 18, delay: 0.15 },
              },
            }}
          >
            <Icon className="size-5" aria-hidden />
          </m.span>
          <div>
            <p className="font-mono text-[11px] text-fg-subtle uppercase">{service.tagline}</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
              {service.title}
            </h3>
          </div>
        </div>

        <p className="relative mt-5 text-[15px] leading-relaxed text-pretty text-fg-muted md:text-base">
          {service.description}
        </p>

        <m.ul
          className="relative mt-6 grid gap-2.5 sm:grid-cols-2"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
          }}
          aria-label={t("deliverables", { title: service.title })}
        >
          {service.deliverables.map((item) => (
            <m.li
              key={item}
              className="flex gap-2.5 rounded-lg border border-border bg-bg-subtle/50 px-3 py-2.5 text-sm text-pretty"
              variants={{
                hidden: { opacity: 0, x: -12 },
                show: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
              }}
            >
              <span className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              {item}
            </m.li>
          ))}
        </m.ul>
      </article>
    </m.li>
  );
}
