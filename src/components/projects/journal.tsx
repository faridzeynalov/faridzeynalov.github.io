"use client";

import { ArrowRight, ArrowUpRight, BookOpen, ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { owner } from "@/data/owner";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Industry, Project } from "@/types/project";

/** Share of a page's width a drag must cover to complete a turn. */
const TURN_THRESHOLD = 0.32;
/** Pointer travel before a press on the page becomes a drag rather than a tap. */
const DRAG_START = 6;

type Page =
  | { kind: "cover" }
  | { kind: "contents" }
  | { kind: "project"; project: Project; number: number }
  | { kind: "end" }
  | { kind: "blank" }
  | { kind: "back" };

interface Leaf {
  front: Page;
  back: Page;
}

/**
 * The journal's leaves. Open on a desk (two pages per view) a leaf's back is the left page
 * after it's turned, so pages pair up: cover | contents, then projects two by two, the closing
 * page and the back cover. On a phone (one page per view) every page is a leaf of its own.
 */
function buildLeaves(projects: Project[], spread: boolean): Leaf[] {
  const projectPages: Page[] = projects.map((project, i) => ({
    kind: "project",
    project,
    number: i + 1,
  }));
  if (!spread) {
    return [{ kind: "cover" } as Page, ...projectPages, { kind: "end" } as Page].map((page) => ({
      front: page,
      back: { kind: "blank" },
    }));
  }
  const pages: Page[] = [{ kind: "cover" }, { kind: "contents" }, ...projectPages, { kind: "end" }];
  // The back cover is the back of the last leaf.
  if (pages.length % 2 === 0) pages.push({ kind: "blank" });
  pages.push({ kind: "back" });
  const leaves: Leaf[] = [];
  for (let i = 0; i < pages.length; i += 2) leaves.push({ front: pages[i], back: pages[i + 1] });
  return leaves;
}

/**
 * A leaf's transition delays. On a phone a second transition hides a turned page once it's
 * out of sight (see .journal-book--single), so it waits for the turn to finish; a page coming
 * back shows at once.
 */
function leafDelay(ms: number, spread: boolean, turned: boolean) {
  if (spread) return `${ms}ms`;
  return `${ms}ms, ${turned ? ms + 600 : 0}ms`;
}

function useSpread() {
  const [spread, setSpread] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setSpread(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return spread;
}

/**
 * Paper style: the portfolio as a journal. The page shows its closed cover; it opens as a
 * modal where the pages turn like a real book's, one project per page. Swipe or drag a page
 * to turn it (it follows the finger), tap a page's edge, use the arrow buttons (desktop) or
 * the ← → keys.
 */
export function Journal({
  projects,
  industryLabels,
}: {
  projects: Project[];
  industryLabels: Record<Industry, string>;
}) {
  const t = useTranslations("Portfolio");
  const [open, setOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="mt-10 flex flex-col items-center">
      <button
        ref={openerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="journal-closed group relative block w-[min(78vw,20rem)] [perspective:1200px]"
        aria-haspopup="dialog"
      >
        <span className="block transition-transform duration-700 ease-out-expo group-hover:[transform:rotateY(-14deg)_rotateZ(-1deg)]">
          <Cover count={projects.length} />
        </span>
        <span className="mt-6 inline-flex items-center gap-2 font-serif text-2xl text-accent">
          <BookOpen className="size-5" aria-hidden />
          {t("journalOpen")}
        </span>
        <span className="mt-1 block text-sm text-fg-subtle">{t("journalOpenHint")}</span>
      </button>
      <AnimatePresence>
        {open && (
          <JournalModal
            projects={projects}
            industryLabels={industryLabels}
            onClose={() => {
              setOpen(false);
              openerRef.current?.focus();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function JournalModal({
  projects,
  industryLabels,
  onClose,
}: {
  projects: Project[];
  industryLabels: Record<Industry, string>;
  onClose: () => void;
}) {
  const t = useTranslations("Portfolio");
  const spread = useSpread();
  const leaves = buildLeaves(projects, spread);
  /** How many leaves have been turned over to the left, and how many were before the last turn. */
  const [{ turned, from }, setPage] = useState({ turned: 0, from: 0 });
  /** A leaf following the pointer: its index and how far it's turned (0–1). */
  const [drag, setDrag] = useState<{ leaf: number; turn: number } | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pressRef = useRef<{ x: number; y: number; moved: boolean; width: number } | null>(null);
  const titleId = useId();
  const max = leaves.length;
  const turnBy = useCallback(
    (change: (current: number) => number) =>
      setPage((page) => ({
        from: page.turned,
        turned: Math.max(0, Math.min(max, change(page.turned))),
      })),
    [max],
  );

  // Switching between one and two pages per view rebuilds the leaves: start from the cover.
  const [lastSpread, setLastSpread] = useState(spread);
  if (spread !== lastSpread) {
    setLastSpread(spread);
    setPage({ turned: 0, from: 0 });
  }

  const turnTo = (next: number) => turnBy(() => next);

  useEffect(() => {
    dialogRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") turnBy((value) => value + 1);
      if (event.key === "ArrowLeft") turnBy((value) => value - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, turnBy]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as Element).closest("a, button")) return;
    const width = (bookRef.current?.offsetWidth ?? 0) / (spread ? 2 : 1);
    pressRef.current = { x: event.clientX, y: event.clientY, moved: false, width };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    if (!press) return;
    const dx = event.clientX - press.x;
    if (!press.moved && Math.abs(dx) < DRAG_START) return;
    press.moved = true;
    const share = Math.min(1, Math.abs(dx) / press.width);
    if (dx < 0 && turned < max) setDrag({ leaf: turned, turn: share });
    else if (dx > 0 && turned > 0) setDrag({ leaf: turned - 1, turn: 1 - share });
    else setDrag(null);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    pressRef.current = null;
    if (!press) return;
    if (!press.moved) {
      // A tap: the right half turns forward, the left half back.
      const rect = event.currentTarget.getBoundingClientRect();
      turnTo(turned + (event.clientX - rect.left > rect.width / 2 ? 1 : -1));
      return;
    }
    if (drag) {
      const forward = drag.leaf === turned;
      const done = forward ? drag.turn > TURN_THRESHOLD : drag.turn < 1 - TURN_THRESHOLD;
      if (done) turnTo(forward ? turned + 1 : turned - 1);
    }
    setDrag(null);
  };

  // Closed (only the cover, or only the back cover, showing), a two-page book sits centred.
  const shift = spread ? (turned === 0 ? -25 : turned === max ? 25 : 0) : 0;
  // The project pages in view, for the counter ("4–5 / 29").
  const inView = [spread && turned > 0 ? leaves[turned - 1].back : null, leaves[turned]?.front];
  const numbers = inView.flatMap((page) => (page?.kind === "project" ? [page.number] : []));

  return (
    <m.div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-5 px-3 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={t("journalClose")}
        onClick={onClose}
        className="absolute inset-0 bg-[rgb(20_16_12/0.62)] backdrop-blur-[3px]"
      />
      <m.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex flex-col items-center outline-none"
        initial={{ y: 40, scale: 0.94, rotate: -2 }}
        animate={{ y: 0, scale: 1, rotate: 0 }}
        exit={{ y: 30, scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 id={titleId} className="sr-only">
          {t("journalTitle")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("journalClose")}
          className="absolute -top-2 right-0 z-10 inline-flex size-10 -translate-y-full items-center justify-center rounded-full bg-bg-elevated text-fg shadow-float"
        >
          <X className="size-5" aria-hidden />
        </button>

        <div
          className={cn("journal-book", spread ? "journal-book--spread" : "journal-book--single")}
          style={{ translate: `${shift}% 0` }}
        >
          <div
            ref={bookRef}
            className="journal-pages"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              pressRef.current = null;
              setDrag(null);
            }}
          >
            {leaves.map((leaf, i) => {
              const isDragged = drag?.leaf === i;
              const turn = isDragged ? drag.turn : i < turned ? 1 : 0;

              return (
                <div
                  key={i}
                  className={cn("journal-leaf", isDragged && "is-dragged")}
                  data-turned={i < turned || undefined}
                  style={
                    {
                      "--turn": turn,
                      // Depth in each stack: the next page on top on the right, the last
                      // turned on top on the left (see .journal-leaf).
                      "--d0": `${(max - i) * 0.6}px`,
                      "--d1": `${(i + 1) * 0.6}px`,
                      // Several leaves turning at once (a jump) riffle one after another, the
                      // top one of the stack first.
                      transitionDelay: leafDelay(
                        isDragged
                          ? 0
                          : Math.min(Math.abs(i - (turned > from ? from : from - 1)), 8) * 40,
                        spread,
                        i < turned,
                      ),
                    } as CSSProperties
                  }
                  aria-hidden={!(i === turned || (spread && i === turned - 1))}
                >
                  <div className="journal-face journal-face--front">
                    <PageView
                      page={leaf.front}
                      projects={projects}
                      industryLabels={industryLabels}
                      onJump={(n) => turnTo(spread ? Math.ceil((n + 1) / 2) : n)}
                      side="right"
                    />
                  </div>
                  <div className="journal-face journal-face--back">
                    <PageView
                      page={leaf.back}
                      projects={projects}
                      industryLabels={industryLabels}
                      onJump={(n) => turnTo(spread ? Math.ceil((n + 1) / 2) : n)}
                      side="left"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 text-bg-elevated">
          <button
            type="button"
            onClick={() => turnTo(turned - 1)}
            disabled={turned === 0}
            aria-label={t("journalPrev")}
            className="journal-nav"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <p
            className="min-w-[10rem] text-center font-serif text-lg text-[#f6efe2]"
            aria-live="polite"
          >
            {numbers.length > 0
              ? t("journalPage", { n: numbers.join("–"), total: projects.length })
              : t("journalTitle")}
          </p>
          <button
            type="button"
            onClick={() => turnTo(turned + 1)}
            disabled={turned === max}
            aria-label={t("journalNext")}
            className="journal-nav"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
        <p className="mt-1 text-xs text-[#f6efe2]/70 md:hidden">{t("journalHint")}</p>
      </m.div>
    </m.div>
  );
}

function PageView({
  page,
  projects,
  industryLabels,
  onJump,
  side,
}: {
  page: Page;
  projects: Project[];
  industryLabels: Record<Industry, string>;
  /** Turn to the page of the n-th project (1-based). */
  onJump: (n: number) => void;
  side: "left" | "right";
}) {
  switch (page.kind) {
    case "cover":
      return <Cover count={projects.length} />;
    case "back":
      return <div className="journal-cover journal-cover--back" />;
    case "blank":
      return <Paper side={side} />;
    case "contents":
      return <Contents projects={projects} onJump={onJump} side={side} />;
    case "end":
      return <EndPage side={side} />;
    case "project":
      return (
        <ProjectPage
          project={page.project}
          number={page.number}
          industry={industryLabels[page.project.industry]}
          side={side}
        />
      );
  }
}

/** A sheet of the journal: ruled paper with a margin, and a page number. */
function Paper({
  side,
  number,
  children,
}: {
  side: "left" | "right";
  number?: number;
  children?: ReactNode;
}) {
  return (
    <div className={cn("journal-paper", side === "left" && "journal-paper--left")}>
      {children}
      {number !== undefined && (
        <span
          className={cn(
            "absolute bottom-[3.5%] font-serif text-base text-fg-subtle",
            side === "left" ? "left-[7%]" : "right-[7%]",
          )}
        >
          {number}
        </span>
      )}
    </div>
  );
}

function Cover({ count }: { count: number }) {
  const t = useTranslations("Portfolio");
  return (
    <div className="journal-cover">
      <div className="journal-label">
        <p className="font-serif text-[clamp(1.9rem,6vw,2.6rem)] leading-none text-[#1f2a44]">
          {t("journalTitle")}
        </p>
        <p className="mt-2 text-[10px] tracking-[0.22em] text-[#4b4135] uppercase">{owner.name}</p>
        <p className="mt-3 font-serif text-lg leading-none text-[#2f5aa8]">
          {t("journalSubtitle")} · {count}
        </p>
      </div>
      <span className="journal-strap" aria-hidden />
    </div>
  );
}

function Contents({
  projects,
  onJump,
  side,
}: {
  projects: Project[];
  onJump: (n: number) => void;
  side: "left" | "right";
}) {
  const t = useTranslations("Portfolio");
  return (
    <Paper side={side}>
      <div className="absolute inset-[7%_8%_9%_12%] flex flex-col">
        <p className="font-serif text-3xl text-accent">{t("journalContents")}</p>
        <ol className="mt-3 min-h-0 flex-1 columns-2 gap-5 overflow-hidden text-[12.5px] leading-[1.75]">
          {projects.map((project, i) => (
            <li key={project.slug} className="break-inside-avoid">
              <button
                type="button"
                onClick={() => onJump(i + 1)}
                className="flex w-full items-baseline gap-1 text-left text-fg-muted hover:text-accent"
              >
                <span className="truncate">{project.name}</span>
                <span className="min-w-3 flex-1 translate-y-[-3px] border-b border-dotted border-fg-subtle/60" />
                <span className="font-serif text-sm">{i + 1}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </Paper>
  );
}

function ProjectPage({
  project,
  number,
  industry,
  side,
}: {
  project: Project;
  number: number;
  industry: string;
  side: "left" | "right";
}) {
  const t = useTranslations("Portfolio");
  // A slightly different tilt for each photo, like prints taped in by hand.
  const tilt = ((number * 37) % 7) - 3;
  return (
    <Paper side={side} number={number}>
      <div className="absolute inset-[6%_7%_10%_11%] flex flex-col">
        <p className="text-[10px] tracking-[0.18em] text-fg-subtle uppercase">
          {industry}
          {project.group ? ` · ${project.group}` : ""}
        </p>
        <h3 className="mt-1 font-serif text-[clamp(1.6rem,4.2vw,2.3rem)] leading-[1.05] text-fg">
          {project.name}
        </h3>
        <p className="font-mono text-[11px] text-fg-subtle">{project.domain}</p>

        {project.images && (
          <div
            className="journal-photo relative mx-auto mt-[5%] w-[92%]"
            style={{ rotate: `${tilt * 0.6}deg` }}
          >
            <Image
              src={project.images.thumb}
              alt=""
              sizes="(min-width: 768px) 420px, 80vw"
              className="h-auto w-full"
              draggable={false}
            />
          </div>
        )}

        <p className="mt-[5%] line-clamp-4 text-[13px] leading-[1.6] text-pretty text-fg-muted">
          {project.summary}
        </p>

        {project.stack.length > 0 && (
          <p className="mt-2 font-serif text-[15px] leading-snug text-accent">
            {t("journalBuiltWith")}: {project.stack.slice(0, 4).join(", ")}
          </p>
        )}

        <Link
          href={`/portfolio/${project.slug}`}
          className="mt-auto inline-flex w-fit items-center gap-1 pt-2 font-serif text-lg text-fg underline decoration-accent/50 underline-offset-4 hover:text-accent"
        >
          {t("journalOpenProject")}
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </Paper>
  );
}

function EndPage({ side }: { side: "left" | "right" }) {
  const t = useTranslations("Portfolio");
  return (
    <Paper side={side}>
      <div className="absolute inset-[10%_10%_12%_13%] flex flex-col justify-center gap-4">
        <p className="font-serif text-[clamp(1.6rem,4vw,2.2rem)] leading-tight text-fg">
          {t("journalEndTitle")}
        </p>
        <p className="text-sm text-pretty text-fg-muted">{t("journalEndText")}</p>
        <Link
          href="/contact"
          className="inline-flex w-fit items-center gap-1.5 font-serif text-xl text-accent underline decoration-accent/50 underline-offset-4"
        >
          {t("journalContact")}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </Paper>
  );
}
