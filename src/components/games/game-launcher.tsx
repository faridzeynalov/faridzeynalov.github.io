"use client";

import { Brain, ChessKing, Hash, Joystick, SquareTerminal, X, type LucideIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useTranslations } from "next-intl";
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useSkin } from "@/components/layout/use-appearance";
import { DEFAULT_SKIN, type Skin } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** A small game per style, each loaded only when it's opened. */
const GAMES: Record<
  Skin,
  { icon: LucideIcon; Game: React.LazyExoticComponent<() => React.JSX.Element> }
> = {
  classic: { icon: Brain, Game: lazy(() => import("./memory-game")) },
  dev: { icon: SquareTerminal, Game: lazy(() => import("./snake-game")) },
  pixel: { icon: Joystick, Game: lazy(() => import("./runner-game")) },
  paper: { icon: Hash, Game: lazy(() => import("./tic-tac-toe")) },
  chess: { icon: ChessKing, Game: lazy(() => import("./mate-in-three")) },
};

const SIZE = 52;
const EDGE = 16;
/** Pointer travel (px) before a press becomes a drag rather than a click. */
const DRAG_THRESHOLD = 6;
const STORAGE_KEY = "game-button";

interface Spot {
  side: "left" | "right";
  /** Top of the button as a share of the free viewport height, so it survives resizes. */
  y: number;
}

function readSpot(): Spot {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Spot | null;
    if (
      saved &&
      (saved.side === "left" || saved.side === "right") &&
      saved.y >= 0 &&
      saved.y <= 1
    ) {
      return saved;
    }
  } catch {
    // Missing or blocked storage: start at the default spot.
  }
  return { side: "right", y: 1 };
}

/** Room kept at the bottom-left for the coffee button (SupportCoffee). */
const COFFEE_CLEARANCE = 68;

/** The band the button can sit in on a side: below the header, above the bottom edge (and,
 * on the left, above the coffee button). */
function band(side: Spot["side"]) {
  const top = 80;
  const bottom = window.innerHeight - SIZE - 24 - (side === "left" ? COFFEE_CLEARANCE : 0);
  return { top, range: Math.max(0, bottom - top) };
}

/** Where the button's corner is while dragged: under the pointer, kept on screen. */
function dragPosition(
  press: { dx: number; dy: number },
  event: { clientX: number; clientY: number },
) {
  return {
    x: Math.min(Math.max(event.clientX - press.dx, 4), window.innerWidth - SIZE - 4),
    y: Math.min(Math.max(event.clientY - press.dy, 4), window.innerHeight - SIZE - 4),
  };
}

/**
 * Floating "play" button with a small game that fits the current style. It can be dragged
 * anywhere up and down either side of the screen: on release it snaps to the nearer side, and
 * the spot is remembered. A press without movement opens the game.
 */
export function GameLauncher() {
  const t = useTranslations("Games");
  const skin = useSkin() ?? DEFAULT_SKIN;
  const [spot, setSpot] = useState<Spot | null>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [, setViewport] = useState(0);
  const pressRef = useRef<{ x: number; y: number; dx: number; dy: number; moved: boolean } | null>(
    null,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Position needs the viewport and storage, so the button appears after mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser-only state once
    setSpot(readSpot());
    const onResize = () => setViewport(window.innerWidth + window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  if (!spot) return null;

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pressRef.current = {
      x: event.clientX,
      y: event.clientY,
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const press = pressRef.current;
    if (!press) return;
    if (
      !press.moved &&
      Math.hypot(event.clientX - press.x, event.clientY - press.y) < DRAG_THRESHOLD
    ) {
      return;
    }
    press.moved = true;
    setDrag(dragPosition(press, event));
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const press = pressRef.current;
    pressRef.current = null;
    if (!press) return;
    // Judged from the release point too, so even a drag fast enough to skip move events counts.
    const moved =
      press.moved || Math.hypot(event.clientX - press.x, event.clientY - press.y) >= DRAG_THRESHOLD;
    if (!moved) {
      setOpen(true);
      return;
    }
    // Snap to the nearer side, at the height it was dropped.
    const dropped = dragPosition(press, event);
    const side = dropped.x + SIZE / 2 < window.innerWidth / 2 ? "left" : "right";
    const { top, range } = band(side);
    const next: Spot = {
      side,
      y: range ? Math.min(Math.max((dropped.y - top) / range, 0), 1) : 1,
    };
    setSpot(next);
    setDrag(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage blocked: the spot still applies for this visit.
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const { top, range } = band(spot.side);
  const left = drag ? drag.x : spot.side === "left" ? EDGE : window.innerWidth - SIZE - EDGE;
  const y = drag ? drag.y : top + spot.y * range;
  const { icon: Icon, Game } = GAMES[skin];

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={t("open")}
        title={t("open")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pressRef.current = null;
          setDrag(null);
        }}
        // Keyboard: Enter/Space fire a click with no pointer press behind it.
        onClick={(event) => {
          if (event.detail === 0) setOpen(true);
        }}
        className={cn(
          "game-button fixed top-0 left-0 z-[45] flex size-[52px] cursor-grab touch-none items-center justify-center rounded-pill border border-border-strong bg-bg-elevated text-accent shadow-float select-none print:hidden",
          drag
            ? "scale-110 cursor-grabbing"
            : "transition-[translate,scale,box-shadow] duration-500 ease-out-expo hover:scale-105",
        )}
        // `translate`, not `transform`: the hover/drag `scale` composes inside `translate`, so the
        // button grows around its own centre instead of being pushed off by the scale.
        style={{ translate: `${left}px ${y}px` }}
      >
        <Icon className="size-[22px]" aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              tabIndex={-1}
              aria-label={t("close")}
              className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
              onClick={close}
            />
            <m.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className="game-panel relative w-full max-w-[26rem] overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-float outline-none"
              initial={{ y: 40, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 30, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Icon className="size-4 shrink-0 text-accent" aria-hidden />
                  <h2 id={titleId} className="truncate text-base font-semibold">
                    {t(`${skin}.title`)}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label={t("close")}
                  className="inline-flex size-8 items-center justify-center rounded-pill text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              <div className="p-5">
                <p className="mb-4 text-sm text-pretty text-fg-muted">{t(`${skin}.hint`)}</p>
                <Suspense
                  fallback={
                    <div className="aspect-square w-full animate-pulse rounded-xl bg-bg-subtle" />
                  }
                >
                  <Game />
                </Suspense>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
