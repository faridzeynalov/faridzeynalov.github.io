import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const projectKeys = {
  planned: "statusPlanned",
  active: "statusActive",
  paused: "statusPaused",
  done: "statusDone",
} as const;

const stageKeys = {
  todo: "stageTodo",
  in_progress: "stageInProgress",
  review: "stageReview",
  done: "stageDone",
} as const;

const tones: Record<string, string> = {
  planned: "bg-bg-subtle text-fg-muted",
  todo: "bg-bg-subtle text-fg-muted",
  active: "bg-accent-soft text-accent",
  in_progress: "bg-accent-soft text-accent",
  review: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  paused: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  done: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
};

/** A project's or a stage's status as a small pill. */
export function StatusPill({ kind, status }: { kind: "project" | "stage"; status: string }) {
  const t = useTranslations("Portal");
  const key =
    kind === "project"
      ? projectKeys[status as keyof typeof projectKeys]
      : stageKeys[status as keyof typeof stageKeys];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-1 font-mono text-[11px] tracking-wide uppercase",
        tones[status] ?? tones.todo,
      )}
    >
      {key ? t(key) : status}
    </span>
  );
}

/** A progress bar with its percentage. */
export function Progress({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-sm">
        <span className="text-fg-muted">{label}</span>
        <span className="font-mono text-fg tabular-nums">{value}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-pill bg-bg-subtle"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full rounded-pill bg-accent" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
