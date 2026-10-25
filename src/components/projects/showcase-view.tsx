"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { BrowserFrame } from "@/components/projects/device-frames";
import { UnavailablePreview } from "@/components/projects/unavailable-preview";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Industry, Project } from "@/types/project";

/** Pointer travel (px) before a press becomes a drag rather than a click. */
const DRAG_START = 6;
/** How far apart neighbouring cards sit, as a share of a card's width. */
const SPACING = 0.64;
/** A quick flick (px per ms) moves on even when it's short. */
const FLICK = 0.45;

/**
 * Classic style: the projects as a showcase. One project at a time takes centre stage, its
 * neighbours waiting at the sides, turned and set back (a cover flow). Drag it with the mouse
 * or a finger (the cards follow, then settle on the nearest), flick it, use the arrows or the
 * ← → keys, or click a neighbour.
 */
export function ShowcaseView({
  projects,
  industryLabels,
}: {
  projects: Project[];
  industryLabels: Record<Industry, string>;
}) {
  const t = useTranslations("Portfolio");
  const [active, setActive] = useState(0);
  const index = Math.min(active, projects.length - 1);
  /** How far the cards are being dragged, in card spacings (positive: towards the next). */
  const [drag, setDrag] = useState<number | null>(null);
  // The latest shift is also kept here: a quick flick can be released before React has
  // rendered the drag, when the state above would still read null.
  const press = useRef<{
    x: number;
    time: number;
    step: number;
    moved: boolean;
    shift: number;
  } | null>(null);
  const draggedAt = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  // The stage is as tall as a card (they're all the same height), measured, so no card is cut
  // off at the bottom on any screen.
  const [stageHeight, setStageHeight] = useState<number | null>(null);

  useEffect(() => {
    // The card in the middle: the others come and go as the carousel moves.
    const card = stageRef.current?.querySelector<HTMLElement>('article[aria-hidden="false"]');
    if (!card) return;
    const observer = new ResizeObserver(() => {
      if (card.offsetHeight > 0) setStageHeight(card.offsetHeight);
    });
    observer.observe(card);
    return () => observer.disconnect();
  }, [projects, index]);

  const go = (next: number) => setActive(Math.max(0, Math.min(projects.length - 1, next)));

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const card = event.currentTarget.querySelector("article");
    press.current = {
      x: event.clientX,
      time: performance.now(),
      step: (card?.offsetWidth ?? 400) * SPACING,
      moved: false,
      shift: 0,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = press.current;
    if (!current) return;
    const dx = event.clientX - current.x;
    if (!current.moved) {
      if (Math.abs(dx) < DRAG_START) return;
      current.moved = true;
      // Keep following the pointer even when it leaves the cards.
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    let shift = -dx / current.step;
    // Past the first or last project the cards resist, like a rubber band.
    if ((index === 0 && shift < 0) || (index === projects.length - 1 && shift > 0)) shift *= 0.3;
    current.shift = shift;
    setDrag(shift);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = press.current;
    press.current = null;
    if (!current?.moved) return;
    const dx = event.clientX - current.x;
    const speed = dx / Math.max(1, performance.now() - current.time);
    let steps = Math.round(current.shift);
    if (steps === 0 && Math.abs(speed) > FLICK) steps = speed < 0 ? 1 : -1;
    go(index + steps);
    setDrag(null);
    draggedAt.current = performance.now();
  };

  return (
    <div
      className="mt-10"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={t("showcaseView")}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(index + 1);
        if (event.key === "ArrowLeft") go(index - 1);
      }}
    >
      {/* The stage: side cards fade out at its edges instead of widening the page. */}
      {/* (Padded top and bottom so the cards' shadow stays inside the fade.) */}
      <div className="-my-10 overflow-x-clip [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)] py-10">
        <div
          ref={stageRef}
          className={cn(
            "relative touch-pan-y select-none [perspective:1600px]",
            stageHeight === null && "h-[clamp(470px,58vw,600px)]",
            drag === null ? "cursor-grab" : "cursor-grabbing",
          )}
          style={stageHeight === null ? undefined : { height: stageHeight }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            press.current = null;
            setDrag(null);
          }}
          // A drag that ends over a card or its link isn't a click.
          onClickCapture={(event) => {
            if (performance.now() - draggedAt.current < 80) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        >
          {projects.map((project, i) => {
            const offset = i - index - (drag ?? 0);
            const distance = Math.abs(offset);
            if (distance > 3.5) return null;
            const current = i === index;
            const turn = Math.max(-2, Math.min(2, offset)) * 16;
            return (
              <article
                key={project.slug}
                aria-hidden={!current}
                onClick={current ? undefined : () => go(i)}
                className={cn(
                  "absolute top-0 left-1/2 w-[min(82vw,560px)] rounded-2xl border border-border bg-bg-elevated p-2",
                  // Following the pointer: no easing, or the cards would lag behind it.
                  drag === null &&
                    "transition-[transform,opacity,box-shadow] duration-700 ease-out-expo",
                  current && "shadow-float",
                )}
                style={{
                  transform: `translateX(calc(-50% + ${offset * SPACING * 100}%)) translateZ(${-distance * 120}px) rotateY(${-turn}deg)`,
                  // Dimmer with distance, gone a little past the second neighbour.
                  opacity: Math.max(0, 1 - distance * 0.3 - Math.max(0, distance - 2) * 0.7),
                  zIndex: Math.round(100 - distance * 10),
                }}
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-bg-subtle">
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      background: `radial-gradient(90% 80% at 30% 0%, ${project.accent}, transparent 70%)`,
                    }}
                    aria-hidden
                  />
                  {project.images ? (
                    <BrowserFrame
                      domain={project.domain}
                      compact
                      className="absolute top-[8%] left-[6%] w-[94%] rounded-r-none border-r-0"
                    >
                      <Image
                        src={project.images.thumb}
                        alt=""
                        sizes="(min-width: 768px) 560px, 82vw"
                        className="h-auto w-full"
                        draggable={false}
                      />
                    </BrowserFrame>
                  ) : (
                    <UnavailablePreview
                      project={project}
                      className="absolute inset-0 aspect-auto"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2 p-4">
                  {/* Every card has the same height: one line for the industry, two each for
                      the name and the summary, one row of technologies. */}
                  <p className="truncate font-mono text-[11px] text-fg-subtle uppercase">
                    {industryLabels[project.industry]}
                    {project.group ? ` · ${project.group}` : ""}
                  </p>
                  <h2 className="line-clamp-2 min-h-[2lh] text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
                    {project.name}
                  </h2>
                  <p className="line-clamp-2 min-h-[2lh] text-sm text-pretty text-fg-muted">
                    {project.summary}
                  </p>
                  <div className="mt-1 flex h-7 items-center justify-between gap-3">
                    <ul className="flex min-w-0 flex-nowrap gap-1.5 overflow-hidden [mask-image:linear-gradient(to_right,#000_80%,transparent)]">
                      {project.stack.slice(0, 3).map((item) => (
                        <li key={item} className="shrink-0">
                          <Badge>{item}</Badge>
                        </li>
                      ))}
                    </ul>
                    {current && (
                      <Link
                        href={`/portfolio/${project.slug}`}
                        className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent hover:underline"
                      >
                        {t("viewProject")}
                        <ArrowUpRight className="size-4" aria-hidden />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label={t("prevProject")}
          className="inline-flex size-11 items-center justify-center rounded-pill border border-border-strong text-fg transition-colors hover:bg-bg-subtle disabled:opacity-35"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </button>
        <div className="flex w-40 flex-col items-center gap-2">
          <p className="font-mono text-sm text-fg-muted tabular-nums" aria-live="polite">
            <span className="text-fg">{String(index + 1).padStart(2, "0")}</span> /{" "}
            {String(projects.length).padStart(2, "0")}
          </p>
          <span className="relative h-px w-full overflow-hidden bg-border">
            <span
              className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-500 ease-out-expo"
              style={{ width: `${((index + 1) / projects.length) * 100}%` }}
            />
          </span>
        </div>
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === projects.length - 1}
          aria-label={t("nextProject")}
          className="inline-flex size-11 items-center justify-center rounded-pill border border-border-strong text-fg transition-colors hover:bg-bg-subtle disabled:opacity-35"
        >
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
