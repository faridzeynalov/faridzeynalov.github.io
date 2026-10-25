"use client";

import { RotateCcw, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState, type ReactNode } from "react";

/**
 * Best score per game, kept in this browser. `high`: bigger is better (points); `low`: smaller
 * is better (moves).
 */
export function useBest(game: string, better: "high" | "low") {
  const key = `game-best:${game}`;
  const [best, setBest] = useState<number | null>(() => {
    try {
      const value = Number(localStorage.getItem(key));
      return value > 0 ? value : null;
    } catch {
      return null;
    }
  });
  const save = useCallback(
    (score: number) => {
      setBest((current) => {
        const improved =
          current === null || (better === "high" ? score > current : score < current);
        if (!improved || score <= 0) return current;
        try {
          localStorage.setItem(key, String(score));
        } catch {
          // Storage blocked: the best score still shows for this visit.
        }
        return score;
      });
    },
    [key, better],
  );
  return [best, save] as const;
}

/** Status line under a game: the current state, the best score and a restart button. */
export function GameBar({
  status,
  best,
  onRestart,
  children,
}: {
  status: ReactNode;
  best?: ReactNode;
  onRestart: () => void;
  children?: ReactNode;
}) {
  const t = useTranslations("Games");
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm">
      <div className="min-w-0">
        {/* Always two lines tall, so the panel doesn't grow and shrink as the status changes
            (e.g. a chess move's comment wrapping on a phone). */}
        <p className="line-clamp-2 min-h-[2lh] font-medium text-pretty text-fg" aria-live="polite">
          {status}
        </p>
        {best && (
          <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs whitespace-nowrap text-fg-subtle">
            <Trophy className="size-3" aria-hidden />
            {best}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {children}
        <button
          type="button"
          onClick={onRestart}
          aria-label={t("restart")}
          className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-border-strong px-3 text-[13px] text-fg-muted transition-colors hover:border-fg/30 hover:text-fg sm:px-3.5"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          {/* Icon only on phones, so the status keeps its room next to the buttons. */}
          <span className="max-sm:hidden">{t("restart")}</span>
        </button>
      </div>
    </div>
  );
}
