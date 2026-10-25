"use client";

import { Brain, ChessKing, Hash, Joystick, SquareTerminal, X, type LucideIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useTranslations } from "next-intl";
import { Suspense, lazy, useCallback, useEffect, useId, useRef, useState } from "react";
import { FootballIcon } from "@/components/football/football-icon";
import { useSkin } from "@/components/layout/use-appearance";
import { DEFAULT_SKIN, type Skin } from "@/lib/theme";

/** A small game per style, each loaded only when it's opened. */
const GAMES: Record<
  Skin,
  {
    icon: LucideIcon | React.ComponentType<{ className?: string }>;
    Game: React.LazyExoticComponent<() => React.JSX.Element>;
  }
> = {
  classic: { icon: Brain, Game: lazy(() => import("./memory-game")) },
  dev: { icon: SquareTerminal, Game: lazy(() => import("./snake-game")) },
  pixel: { icon: Joystick, Game: lazy(() => import("./runner-game")) },
  paper: { icon: Hash, Game: lazy(() => import("./tic-tac-toe")) },
  chess: { icon: ChessKing, Game: lazy(() => import("./mate-in-three")) },
  football: { icon: FootballIcon, Game: lazy(() => import("./penalty-shootout")) },
};

/**
 * Floating "play" button, fixed to the bottom-right corner (level with the coffee button on the
 * left), with a small game that fits the current style.
 */
export function GameLauncher() {
  const t = useTranslations("Games");
  // Null until the page is interactive (see useSkin): the button only appears once a press on
  // it can open the game.
  const currentSkin = useSkin();
  const skin = currentSkin ?? DEFAULT_SKIN;
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

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

  if (!currentSkin) return null;
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
        onClick={() => setOpen(true)}
        className="game-button fixed right-4 bottom-6 z-[45] flex size-[52px] items-center justify-center rounded-pill border border-border-strong bg-bg-elevated text-accent shadow-float transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 sm:right-6 print:hidden"
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
