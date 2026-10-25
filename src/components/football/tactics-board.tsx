"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useSkin } from "@/components/layout/use-appearance";
import { cn } from "@/lib/utils";

type Point = readonly [number, number];

/** The home side (attacking left to right), by shirt number, at kick-off. */
const HOME: Record<number, Point> = {
  1: [5, 34],
  2: [22, 58],
  3: [22, 10],
  4: [18, 42],
  5: [18, 26],
  6: [35, 34],
  8: [44, 21],
  10: [46, 46],
  7: [64, 57],
  9: [68, 34],
  11: [64, 11],
};

/** The away defence, defending the right-hand goal. */
const AWAY: Record<string, Point> = {
  gk: [101, 34],
  cb1: [86, 28],
  cb2: [86, 40],
  lb: [84, 14],
  rb: [84, 54],
  dm1: [75, 25],
  dm2: [75, 43],
};

/**
 * The move, one beat at a time: where the ball goes (and how long it takes), who runs where
 * meanwhile, and who carries the ball. Passes are drawn on the pitch in chalk as they happen.
 */
const MOVE: {
  ball: Point;
  ms: number;
  runs?: Record<string, Point>;
  carrier?: number;
  shot?: boolean;
}[] = [
  { ball: [5, 34], ms: 0, carrier: 1 },
  { ball: [18, 42], ms: 700, carrier: 4, runs: { 6: [33, 37] } },
  { ball: [33, 37], ms: 650, carrier: 6, runs: { 10: [50, 48], dm2: [70, 44] } },
  {
    ball: [50, 48],
    ms: 650,
    carrier: 10,
    runs: { 7: [79, 60], 9: [80, 33], 11: [80, 15], rb: [80, 54], cb1: [84, 30] },
  },
  { ball: [79, 60], ms: 750, carrier: 7, runs: { rb: [82, 57], dm2: [72, 48] } },
  {
    ball: [91, 57],
    ms: 900,
    carrier: 7,
    runs: { 7: [91, 57], rb: [88, 57], 9: [92, 39], cb2: [89, 44] },
  },
  { ball: [93, 38], ms: 600, carrier: 9, runs: { 11: [94, 24], cb1: [91, 33] } },
  { ball: [105.6, 31.6], ms: 260, shot: true, runs: { gk: [101.5, 40] } },
];

/** Pause between beats, and how long a goal, half time and full time are held. */
const BEAT_MS = 260;
const CELEBRATE_MS = 3000;
const BREAK_MS = 2600;
const KICKOFF_MS = 1400;
/** Minutes on the clock per beat of a move. */
const MINUTES_PER_BEAT = 2;
/**
 * The match: two moves a half, each starting at its minute, so the clock only ever runs on:
 * goals at 17′ and 38′, half time at 45′, then 64′ and 85′, and the whistle at 90′.
 */
const KICKOFFS = [3, 24, 50, 71];

/**
 * Where the match is: before kick-off (0′), a move being played (its beat), a goal being
 * celebrated, half time or full time.
 */
type Match =
  | { phase: "kickoff" }
  | { phase: "play"; move: number; beat: number }
  | { phase: "goal"; move: number; beat: number }
  | { phase: "half" }
  | { phase: "full" };

function minuteOf(match: Match) {
  if (match.phase === "kickoff") return 0;
  if (match.phase === "half") return 45;
  if (match.phase === "full") return 90;
  return KICKOFFS[match.move] + match.beat * MINUTES_PER_BEAT;
}

function goalsOf(match: Match) {
  if (match.phase === "kickoff") return 0;
  if (match.phase === "half") return 2;
  if (match.phase === "full") return KICKOFFS.length;
  return match.move + (match.phase === "goal" ? 1 : 0);
}

/** What comes after each stage of the match. */
function nextOf(match: Match): Match {
  switch (match.phase) {
    case "kickoff":
      return { phase: "play", move: 0, beat: 0 };
    case "play":
      return match.beat + 1 === MOVE.length - 1
        ? { phase: "goal", move: match.move, beat: match.beat + 1 }
        : { ...match, beat: match.beat + 1 };
    case "goal":
      if (match.move === 1) return { phase: "half" };
      if (match.move === KICKOFFS.length - 1) return { phase: "full" };
      return { phase: "play", move: match.move + 1, beat: 0 };
    case "half":
      return { phase: "play", move: 2, beat: 0 };
    case "full":
      return { phase: "kickoff" };
  }
}

function waitOf(match: Match) {
  switch (match.phase) {
    case "kickoff":
      return KICKOFF_MS;
    case "play":
      return MOVE[match.beat].ms + BEAT_MS + (match.beat === 0 ? 600 : 0);
    case "goal":
      return CELEBRATE_MS;
    case "half":
    case "full":
      return BREAK_MS;
  }
}

/**
 * Football style: a tactics board under the contact buttons. A whole match plays out on a chalked
 * pitch: team moves (six passes from the keeper to the back of the net), the net rippling and
 * "GOAL!" going up, half time at 45′ and the final whistle at 90′, then a fresh 0–0. It plays
 * while on screen; with reduced motion it shows the final score.
 * Rendered only in the Football style.
 */
export function TacticsBoard({ className }: { className?: string }) {
  const skin = useSkin();
  if (skin !== "football") return null;
  return <Board className={className} />;
}

function Board({ className }: { className?: string }) {
  const t = useTranslations("Football");
  const ref = useRef<HTMLElement>(null);
  const [still] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [match, setMatch] = useState<Match>(still ? { phase: "full" } : { phase: "kickoff" });
  const [visible, setVisible] = useState(false);
  const scored = match.phase === "goal";
  // Between moves (kick-off, the breaks) the players line up at their kick-off positions.
  const beat = match.phase === "play" || match.phase === "goal" ? match.beat : 0;

  useEffect(() => {
    const element = ref.current;
    if (still || !element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "0px 0px -10% 0px",
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [still]);

  useEffect(() => {
    if (!visible || still) return;
    const timer = window.setTimeout(() => setMatch(nextOf(match)), waitOf(match));
    return () => window.clearTimeout(timer);
  }, [visible, still, match]);

  // Everyone's position at this beat: kick-off positions, moved by every run so far.
  const positions = useMemo(() => {
    const at: Record<string, Point> = {
      ...Object.fromEntries(Object.entries(HOME)),
      ...AWAY,
    };
    for (const step of MOVE.slice(0, beat + 1)) Object.assign(at, step.runs ?? {});
    return at;
  }, [beat]);

  const step = MOVE[beat];
  const trail = MOVE.slice(0, beat + 1).map((item) => item.ball);
  const minute = minuteOf(match);
  const goals = goalsOf(match);
  const banner =
    match.phase === "goal"
      ? t("goal")
      : match.phase === "half"
        ? t("halfTime")
        : match.phase === "full"
          ? t("fullTime")
          : null;

  return (
    <figure ref={ref} className={cn("tactics mx-auto w-full max-w-[34rem] text-left", className)}>
      {/* Scoreboard */}
      <div className="tactics-score mx-auto mb-4 flex w-fit items-stretch overflow-hidden rounded-lg font-[family-name:var(--font-display)] text-lg tracking-wide uppercase tabular-nums">
        <span className="bg-[var(--kit-home)] px-3 py-1 text-[var(--accent-fg)]">FZ</span>
        <span className={cn("px-3 py-1", scored && "tactics-score-hit")} aria-live="polite">
          {goals} – 0
        </span>
        <span className="bg-[var(--kit-away)] px-3 py-1 text-white">Bugs</span>
        <span className="px-3 py-1 text-[var(--score-fg)]">{minute}′</span>
      </div>

      <div className="relative">
        <svg
          viewBox="-5 -4 115 76"
          className="tactics-pitch block w-full overflow-visible rounded-xl"
          aria-hidden
        >
          <defs>
            <pattern id="tactics-net" width={0.8} height={0.8} patternUnits="userSpaceOnUse">
              <path
                d="M0 0h.8v.8"
                fill="none"
                stroke="var(--chalk)"
                strokeWidth={0.08}
                opacity={0.6}
              />
            </pattern>
          </defs>
          {/* Grass, mown in stripes */}
          <rect x={-5} y={-4} width={115} height={76} rx={3} fill="var(--pitch-a)" />
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={i * 10.5} y={0} width={5.25} height={68} fill="var(--pitch-b)" />
          ))}
          {/* Chalk */}
          <g fill="none" stroke="var(--chalk)" strokeWidth={0.35}>
            <rect x={0} y={0} width={105} height={68} />
            <line x1={52.5} y1={0} x2={52.5} y2={68} />
            <circle cx={52.5} cy={34} r={9.15} />
            <rect x={0} y={13.85} width={16.5} height={40.3} />
            <rect x={88.5} y={13.85} width={16.5} height={40.3} />
            <rect x={0} y={24.85} width={5.5} height={18.3} />
            <rect x={99.5} y={24.85} width={5.5} height={18.3} />
            <path d="M16.5 26.7a9.15 9.15 0 0 1 0 14.6M88.5 26.7a9.15 9.15 0 0 0 0 14.6" />
            <path d="M0 1a1 1 0 0 0 1-1M104 0a1 1 0 0 0 1 1M105 67a1 1 0 0 0-1 1M1 68a1 1 0 0 0-1-1" />
          </g>
          <g fill="var(--chalk)">
            <circle cx={52.5} cy={34} r={0.5} />
            <circle cx={11} cy={34} r={0.45} />
            <circle cx={94} cy={34} r={0.45} />
          </g>
          {/* Goals, with their nets (the right one ripples when it's hit) */}
          <Goal x={-2.4} />
          <g className={cn("tactics-net", scored && "is-hit")}>
            <Goal x={105} />
          </g>

          {/* The passes so far, in chalk */}
          <polyline
            points={trail.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={0.45}
            strokeDasharray="1.2 1"
            strokeLinecap="round"
            opacity={0.85}
          />

          {/* Players */}
          {Object.entries(AWAY).map(([id]) => (
            <Player key={id} at={positions[id]} away label={id === "gk" ? "1" : ""} />
          ))}
          {Object.keys(HOME).map((n) => (
            <Player key={n} at={positions[n]} label={n} active={step.carrier === Number(n)} />
          ))}

          {/* The ball */}
          <g
            className="tactics-ball"
            style={
              {
                transform: `translate(${step.ball[0]}px, ${step.ball[1]}px)`,
                transitionDuration: `${step.ms}ms`,
                transitionTimingFunction: step.shot ? "cubic-bezier(.2,.6,.3,1)" : undefined,
              } as CSSProperties
            }
          >
            <ellipse cx={0.3} cy={0.9} rx={0.9} ry={0.4} fill="rgb(0 0 0 / 0.35)" />
            <circle r={0.95} fill="#fff" stroke="#111" strokeWidth={0.15} />
            <path d="m0-.45.42.3-.16.5h-.52l-.16-.5z" fill="#111" />
          </g>
        </svg>

        {banner && (
          <p
            key={match.phase}
            className="tactics-goal pointer-events-none absolute inset-0 flex items-center justify-center font-[family-name:var(--font-display)] text-[clamp(2.4rem,9vw,4.2rem)] font-bold tracking-wide text-white uppercase italic"
          >
            {banner}
          </p>
        )}
      </div>

      <figcaption className="mt-4 flex items-baseline justify-between gap-4">
        <span>
          <span className="block font-[family-name:var(--font-display)] text-lg tracking-wide text-fg uppercase">
            {t("moveTitle")}
          </span>
          <span className="mt-0.5 block text-xs text-pretty text-fg-subtle">{t("moveText")}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/** A goal on the line at x: posts, crossbar and a chalk-white net. */
function Goal({ x }: { x: number }) {
  const left = x < 0;
  return (
    <g>
      <rect
        x={x}
        y={30.34}
        width={2.4}
        height={7.32}
        fill="url(#tactics-net)"
        stroke="var(--chalk)"
        strokeWidth={0.3}
      />
      <line
        x1={left ? x + 2.4 : x}
        y1={30.34}
        x2={left ? x + 2.4 : x}
        y2={37.66}
        stroke="#fff"
        strokeWidth={0.5}
      />
    </g>
  );
}

function Player({
  at,
  label,
  away,
  active,
}: {
  at: Point;
  label: string;
  away?: boolean;
  active?: boolean;
}) {
  return (
    <g
      className="tactics-player"
      style={{ transform: `translate(${at[0]}px, ${at[1]}px)` } as CSSProperties}
    >
      {active && (
        <circle
          r={2.6}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={0.3}
          className="tactics-ring"
        />
      )}
      <circle
        r={1.7}
        fill={away ? "var(--kit-away)" : "var(--kit-home)"}
        stroke={away ? "#fff" : "var(--score-bg)"}
        strokeWidth={0.3}
      />
      {label && (
        <text
          y={0.75}
          textAnchor="middle"
          fontSize={2}
          fontWeight={700}
          fill={away ? "#fff" : "var(--accent-fg)"}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {label}
        </text>
      )}
    </g>
  );
}
