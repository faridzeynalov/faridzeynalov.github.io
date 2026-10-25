"use client";

import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { GameBar, useBest } from "@/components/games/game-ui";
import {
  GOAL,
  SPOT,
  ballAfter,
  ballAt,
  keeperAt,
  keeperGuess,
  resolve,
  rivalStrike,
  strike,
  type Dive,
  type KeeperPose,
  type Outcome,
  type Shot,
  type Vec,
} from "@/components/games/penalty-physics";
import { cn } from "@/lib/utils";

/** Kicks each in the first round; then sudden death, one each, until someone misses. */
const ROUND = 5;
const MAX_KICKS = 12;
/** The rival's run-up, the pause on the result, and the power meter's swing. */
const RUNUP_MS = 1150;
const RESULT_MS = 1500;
const POWER_SWING_MS = 1100;
/** A human keeper needs a moment between deciding and moving. */
const REACTION_MS = 90;

type Turn = "you" | "rival";
type Phase = "aim" | "power" | "runup" | "flight" | "result" | "done";

interface Kick {
  turn: Turn;
  shot: Shot;
  dive: Dive | null;
  /** performance.now() when the ball was struck. */
  strikeAt: number;
  outcome: Outcome | null;
}

/** Keyboard dives in goal: the arrow keys, with Shift for a high ball. */
const KEY_DIVES: Record<string, Vec> = {
  ArrowLeft: { x: 84, y: 102 },
  ArrowRight: { x: 216, y: 102 },
  ArrowUp: { x: 150, y: 58 },
  ArrowDown: { x: 150, y: 98 },
};

const turnOf = (kicks: number): Turn => (kicks % 2 === 0 ? "you" : "rival");
const scored = (outcomes: Outcome[]) => outcomes.filter((o) => o === "goal").length;

/** Whether the shoot-out is decided: one side can't catch up, or sudden death has a winner. */
function decided(results: Outcome[]) {
  const you = results.filter((_, i) => i % 2 === 0);
  const rival = results.filter((_, i) => i % 2 === 1);
  const [a, b] = [scored(you), scored(rival)];
  if (you.length <= ROUND && rival.length <= ROUND) {
    if (a > b + (ROUND - rival.length) || b > a + (ROUND - you.length)) return true;
    return false;
  }
  if (you.length === rival.length && a !== b) return true;
  return results.length >= MAX_KICKS * 2;
}

/** The power meter: swings up and down until you stop it. */
const swing = (ms: number) => 0.5 - 0.5 * Math.cos((2 * Math.PI * ms) / POWER_SWING_MS);

/**
 * Football style: a penalty shoot-out against Bugs FC, taking turns. Shooting, aim with the
 * mouse (or the arrow keys) and click to lock it, then click again to stop the power meter:
 * more power is faster but less accurate, and too much blazes it over. In goal, watch the run-up
 * and click where to dive (or use the arrows). The keeper has a real reach and reaction time;
 * the ball flies on an arc and comes off the gloves, the woodwork or the net.
 */
export default function PenaltyShootout() {
  const t = useTranslations("Games");
  const sceneRef = useRef<SVGSVGElement>(null);
  const [phase, setPhase] = useState<Phase>("aim");
  const [results, setResults] = useState<Outcome[]>([]);
  const [aim, setAim] = useState<Vec>({ x: 150, y: 74 });
  const [kick, setKick] = useState<Kick | null>(null);
  const [phaseAt, setPhaseAt] = useState(0);
  /** Animation clock: the current frame's performance.now(). */
  const [now, setNow] = useState(0);
  const [best, saveBest] = useBest("penalties", "high");
  const turn = turnOf(results.length);
  // The rival's next kick is chosen when the run-up starts; you may dive before it's struck.
  const rivalShot = useRef<Shot | null>(null);

  const enter = useCallback((next: Phase) => {
    setPhase(next);
    setPhaseAt(performance.now());
  }, []);

  // A frame clock while anything moves.
  useEffect(() => {
    if (phase === "aim" || phase === "done") return;
    let frame = 0;
    const tick = (time: number) => {
      setNow(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // The rival's run-up ends in the strike.
  useEffect(() => {
    if (phase !== "runup") return;
    const timer = window.setTimeout(() => {
      const shot = rivalShot.current ?? rivalStrike();
      setKick((current) => ({
        turn: "rival",
        shot,
        dive: current?.dive ?? null,
        strikeAt: performance.now(),
        outcome: null,
      }));
      enter("flight");
    }, RUNUP_MS);
    return () => window.clearTimeout(timer);
  }, [phase, enter]);

  // The ball reaches the goal: what happened?
  useEffect(() => {
    if (phase !== "flight" || !kick) return;
    const timer = window.setTimeout(
      () => {
        setKick(
          (current) => current && { ...current, outcome: resolve(current.shot, current.dive) },
        );
        enter("result");
      },
      Math.max(0, kick.strikeAt + kick.shot.duration - performance.now()),
    );
    return () => window.clearTimeout(timer);
  }, [phase, kick, enter]);

  // After a moment on the result: the next kick, or the end.
  useEffect(() => {
    if (phase !== "result" || !kick?.outcome) return;
    const outcome = kick.outcome;
    const timer = window.setTimeout(() => {
      const next = [...results, outcome];
      setResults(next);
      setKick(null);
      if (decided(next)) {
        saveBest(scored(next.filter((_, i) => i % 2 === 0)));
        enter("done");
      } else if (turnOf(next.length) === "rival") {
        rivalShot.current = rivalStrike();
        // The keeper's dive, before it's chosen, is held on the kick so the scene can draw it.
        setKick({
          turn: "rival",
          shot: rivalShot.current,
          dive: null,
          strikeAt: performance.now() + RUNUP_MS,
          outcome: null,
        });
        enter("runup");
      } else {
        enter("aim");
      }
    }, RESULT_MS);
    return () => window.clearTimeout(timer);
  }, [phase, kick, results, enter, saveBest]);

  /** A point on the scene from a pointer position. */
  const toScene = (event: ReactPointerEvent): Vec | null => {
    const svg = sceneRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: point.x, y: point.y };
  };

  const clampAim = (point: Vec) => ({
    x: Math.min(268, Math.max(32, point.x)),
    y: Math.min(124, Math.max(22, point.y)),
  });

  const shoot = () => {
    const power = swing(performance.now() - phaseAt);
    const shot = strike(aim, power);
    setKick({
      turn: "you",
      shot,
      dive: keeperGuess(shot),
      strikeAt: performance.now(),
      outcome: null,
    });
    enter("flight");
  };

  /** In goal: dive at a point (once). */
  const dive = (target: Vec) => {
    if (!kick || kick.turn !== "rival" || kick.dive) return;
    if (phase !== "runup" && phase !== "flight") return;
    const start = Math.max(performance.now() - kick.strikeAt, -150) + REACTION_MS;
    setKick({ ...kick, dive: { target, start } });
  };

  const act = (point?: Vec) => {
    if (phase === "aim") {
      if (point) setAim(clampAim(point));
      enter("power");
    } else if (phase === "power") {
      shoot();
    } else if (point) {
      dive(point);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (phase === "aim" && event.key.startsWith("Arrow")) {
      event.preventDefault();
      const step = event.shiftKey ? 4 : 12;
      setAim((current) =>
        clampAim({
          x:
            current.x + (event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0),
          y: current.y + (event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0),
        }),
      );
    } else if ((phase === "runup" || phase === "flight") && KEY_DIVES[event.key]) {
      event.preventDefault();
      const target = KEY_DIVES[event.key];
      dive(event.shiftKey ? { x: target.x, y: 56 } : target);
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      act();
    }
  };

  const restart = () => {
    setResults([]);
    setKick(null);
    setAim({ x: 150, y: 74 });
    enter("aim");
  };

  // --- What's on screen ---------------------------------------------------------------------

  const sinceStrike = kick ? now - kick.strikeAt : 0;
  const flying = kick && (phase === "flight" || phase === "result");
  const arrived = kick && phase === "result" && kick.outcome;
  const ball = !flying
    ? { x: SPOT.x, y: SPOT.y, ground: SPOT.y, scale: 1, spin: 0, opacity: 1 }
    : arrived
      ? {
          ...ballAfter(kick.shot, kick.outcome!, sinceStrike - kick.shot.duration),
          ground: GOAL.line,
          spin: 0,
        }
      : { ...ballAt(kick.shot, sinceStrike), opacity: 1 };
  const keeper: KeeperPose = keeperAt(kick?.dive ?? null, kick ? sinceStrike : 0);
  const youInGoal = turn === "rival" && phase !== "done";
  const power = phase === "power" ? swing(now - phaseAt) : null;
  const outcome = kick?.outcome ?? null;
  const cheer =
    outcome &&
    ((kick?.turn === "you" && outcome === "goal") ||
      (kick?.turn === "rival" && outcome !== "goal"));
  // The rival's run-up: from the edge of the box to the ball.
  const runup = phase === "runup" ? Math.min(1, Math.max(0, (now - phaseAt) / RUNUP_MS)) : 1;

  const you = results.filter((_, i) => i % 2 === 0);
  const rival = results.filter((_, i) => i % 2 === 1);
  const [ourGoals, theirGoals] = [scored(you), scored(rival)];
  const suddenDeath = you.length >= ROUND && rival.length >= ROUND && phase !== "done";

  const verdict = outcome
    ? kick?.turn === "you"
      ? t(`penalty.${outcome}`)
      : outcome === "goal"
        ? t("penalty.conceded")
        : outcome === "saved"
          ? t("penalty.youSaved")
          : t("penalty.rivalMissed")
    : null;

  const status =
    phase === "done"
      ? ourGoals > theirGoals
        ? t("penalty.won", { a: ourGoals, b: theirGoals })
        : t("penalty.lost", { a: ourGoals, b: theirGoals })
      : verdict
        ? verdict
        : phase === "power"
          ? t("penalty.power")
          : youInGoal
            ? t("penalty.keep")
            : t("penalty.aim");

  return (
    <div>
      <div
        className="penalty relative overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        tabIndex={0}
        role="group"
        aria-label={t("football.hint")}
        onKeyDown={onKeyDown}
      >
        <svg
          ref={sceneRef}
          viewBox="0 0 300 200"
          className={cn(
            "block w-full touch-none select-none",
            phase === "aim" || youInGoal ? "cursor-crosshair" : "cursor-pointer",
          )}
          onPointerMove={(event) => {
            if (phase !== "aim") return;
            const point = toScene(event);
            if (point) setAim(clampAim(point));
          }}
          onPointerDown={(event) => {
            event.preventDefault();
            act(toScene(event) ?? undefined);
          }}
          aria-hidden
        >
          <defs>
            <pattern id="penalty-net" width={6} height={6} patternUnits="userSpaceOnUse">
              <path d="M0 0l6 6M6 0L0 6" stroke="rgb(255 255 255 / 0.35)" strokeWidth={0.5} />
            </pattern>
            <linearGradient id="penalty-sky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#06110b" />
              <stop offset="1" stopColor="#123222" />
            </linearGradient>
            <radialGradient id="penalty-light" cx="0.5" cy="0" r="0.9">
              <stop offset="0" stopColor="rgb(235 255 220 / 0.18)" />
              <stop offset="1" stopColor="rgb(235 255 220 / 0)" />
            </radialGradient>
          </defs>

          {/* Night sky, the crowd and two floodlights */}
          <rect width={300} height={200} fill="url(#penalty-sky)" />
          <g className={cn("penalty-crowd", cheer && "is-cheering")}>
            {Array.from({ length: 110 }, (_, i) => (
              <circle
                key={i}
                cx={3 + ((i * 37) % 296)}
                cy={6 + ((i * 13) % 28)}
                r={1.25}
                fill={
                  i % 7 === 0 ? "var(--accent)" : i % 5 === 0 ? "#fff" : "rgb(255 255 255 / 0.32)"
                }
              />
            ))}
          </g>
          <rect width={300} height={200} fill="url(#penalty-light)" />
          <circle cx={18} cy={4} r={9} fill="rgb(240 255 220 / 0.35)" />
          <circle cx={282} cy={4} r={9} fill="rgb(240 255 220 / 0.35)" />

          {/* The pitch, its stripes in perspective, the box and the spot */}
          {Array.from({ length: 8 }, (_, i) => (
            <polygon
              key={i}
              points={`${i * 37.5},120 ${(i + 1) * 37.5},120 ${(i + 1) * 47 - 38},200 ${i * 47 - 38},200`}
              fill={i % 2 ? "var(--pitch-a)" : "var(--pitch-b)"}
            />
          ))}
          <g stroke="rgb(255 255 255 / 0.8)" strokeWidth={1.2} fill="none">
            <line x1={0} y1={120} x2={300} y2={120} />
            <path d="M40 120 18 150h264l-22-30" />
          </g>
          <ellipse cx={SPOT.x} cy={SPOT.y + 2} rx={3.5} ry={1.4} fill="#fff" />

          {/* The goal: the net (rippling where the ball went in), posts and bar */}
          <g className={cn("penalty-net", arrived && outcome === "goal" && "is-hit")}>
            <rect x={60} y={40} width={180} height={80} fill="url(#penalty-net)" />
          </g>
          {arrived && outcome === "goal" && (
            <circle
              className="penalty-ripple"
              cx={kick!.shot.target.x}
              cy={kick!.shot.target.y}
              r={14}
              fill="none"
              stroke="rgb(255 255 255 / 0.7)"
              strokeWidth={1.2}
            />
          )}
          <path
            d="M60 120V40h180v80"
            fill="none"
            stroke="#fff"
            strokeWidth={4}
            strokeLinejoin="round"
          />

          {/* Shadows on the grass: the keeper's and the ball's */}
          <ellipse
            cx={keeper.feet.x}
            cy={GOAL.line + 1.5}
            rx={13}
            ry={2.2}
            fill="rgb(0 0 0 / 0.28)"
          />
          <ellipse
            cx={ball.x}
            cy={ball.ground + 4 * ball.scale}
            rx={6 * ball.scale}
            ry={2 * ball.scale}
            fill="rgb(0 0 0 / 0.3)"
            opacity={ball.opacity}
          />

          <Keeper pose={keeper} you={youInGoal} />

          {/* The rival's penalty taker, running up and striking */}
          {kick?.turn === "rival" && (phase === "runup" || phase === "flight") && (
            <Striker progress={runup} lean={(kick.shot.target.x - SPOT.x) / 90} />
          )}

          {/* The ball */}
          <g
            transform={`translate(${ball.x} ${ball.y}) scale(${ball.scale}) rotate(${ball.spin})`}
            opacity={ball.opacity}
            className={cn(!flying && phase === "aim" && "penalty-ball-ready")}
          >
            <circle r={6} fill="#fff" stroke="#111" strokeWidth={0.8} />
            <path d="m0-2.7 2.6 1.9-1 3h-3.2l-1-3z" fill="#111" />
            <path
              d="M0-2.7V-6M2.6-.8l3.1-1M1.6 2.2l1.9 2.6M-1.6 2.2l-1.9 2.6M-2.6-.8l-3.1-1"
              stroke="#111"
              strokeWidth={0.6}
            />
          </g>

          {/* Aiming: the crosshair, and the power meter once it's locked */}
          {(phase === "aim" || phase === "power") && (
            <g
              className={cn("penalty-reticle", phase === "power" && "is-locked")}
              transform={`translate(${aim.x} ${aim.y})`}
            >
              <circle r={8} fill="none" stroke="var(--accent)" strokeWidth={1.4} />
              <path d="M-13 0h-4M13 0h4M0-13v-4M0 13v4" stroke="var(--accent)" strokeWidth={1.4} />
              <circle r={1.4} fill="var(--accent)" />
            </g>
          )}
          {power !== null && (
            <g transform="translate(274 50)">
              <rect
                width={10}
                height={110}
                rx={3}
                fill="rgb(0 0 0 / 0.55)"
                stroke="rgb(255 255 255 / 0.5)"
              />
              {/* The sweet spot: fast enough, still on target. */}
              <rect
                x={1}
                y={110 - 0.8 * 108 - 1}
                width={8}
                height={0.22 * 108}
                fill="rgb(200 240 49 / 0.35)"
              />
              <rect
                x={1}
                y={110 - power * 108 - 1}
                width={8}
                height={power * 108}
                rx={2}
                fill={power > 0.86 ? "var(--card-red)" : "var(--accent)"}
              />
            </g>
          )}
        </svg>

        {verdict && (
          <p
            key={results.length}
            className={cn(
              // A dark band behind it, so it reads over the crowd.
              "penalty-verdict pointer-events-none absolute inset-x-0 top-[4%] mx-auto w-fit rounded-md bg-black/45 px-3 py-0.5 text-center font-[family-name:var(--font-display)] text-3xl font-bold tracking-wide uppercase backdrop-blur-[2px]",
              cheer ? "text-[var(--accent)]" : "text-white",
            )}
          >
            {verdict}
          </p>
        )}
        {suddenDeath && (
          <p className="pointer-events-none absolute bottom-[4%] left-[4%] rounded bg-[var(--card-red)] px-2 py-0.5 font-[family-name:var(--font-display)] text-xs tracking-wide text-white uppercase">
            {t("penalty.sudden")}
          </p>
        )}
      </div>

      {/* The scoreboard: one dot per kick for each side */}
      <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1.5 font-[family-name:var(--font-display)] text-sm tracking-wide uppercase">
        {(
          [
            ["you", t("penalty.you"), you, ourGoals],
            ["rival", "Bugs FC", rival, theirGoals],
          ] as const
        ).map(([side, label, kicks, goals]) => (
          <div key={side} className="contents">
            <span className={cn(turn === side && phase !== "done" ? "text-fg" : "text-fg-subtle")}>
              {label}
            </span>
            <ol className="flex gap-1.5" aria-label={label}>
              {Array.from({ length: Math.max(ROUND, kicks.length) }, (_, i) => (
                <li
                  key={i}
                  className={cn(
                    "size-3 rounded-full border-2",
                    kicks[i] === undefined && "border-border-strong",
                    kicks[i] === "goal" && "border-[var(--accent)] bg-[var(--accent)]",
                    kicks[i] !== undefined && kicks[i] !== "goal" && "border-[var(--card-red)]",
                  )}
                  aria-label={
                    kicks[i] === undefined
                      ? "–"
                      : kicks[i] === "goal"
                        ? t("penalty.goal")
                        : t("penalty.saved")
                  }
                />
              ))}
            </ol>
            <span className="text-lg text-fg tabular-nums">{goals}</span>
          </div>
        ))}
      </div>

      <GameBar
        status={status}
        best={best === null ? null : t("best", { n: best })}
        onRestart={restart}
      />
    </div>
  );
}

/** The keeper: drawn standing on his feet, leaning and stretching as the pose says. */
function Keeper({ pose, you }: { pose: KeeperPose; you: boolean }) {
  const length = pose.length;
  // Ready stance: gloves out at the sides; diving, the arms go up over the head.
  const spread = 11 * (1 - pose.progress);
  const glove = -length + 3 + 5 * (1 - pose.progress);
  const shirt = you ? "var(--accent)" : "#f5c400";
  return (
    <g transform={`translate(${pose.feet.x} ${pose.feet.y}) rotate(${pose.angle})`}>
      {/* Legs and shorts */}
      <path
        d={`M-4 0 L-3 ${-length * 0.4} M4 0 L3 ${-length * 0.4}`}
        stroke="#151515"
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* Arms */}
      <path
        d={`M-6 ${-length * 0.74} L${-spread - 3} ${glove} M6 ${-length * 0.74} L${spread + 3} ${glove}`}
        stroke={shirt}
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      <circle cx={-spread - 3} cy={glove} r={3.4} fill="#fff" stroke="#111" strokeWidth={0.6} />
      <circle cx={spread + 3} cy={glove} r={3.4} fill="#fff" stroke="#111" strokeWidth={0.6} />
      {/* Shirt with his number, and his head */}
      <rect x={-9} y={-length * 0.82} width={18} height={length * 0.44} rx={5} fill={shirt} />
      <text
        y={-length * 0.56}
        textAnchor="middle"
        fontSize={8}
        fontWeight={700}
        fill="#111"
        style={{ fontFamily: "var(--font-display)" }}
      >
        1
      </text>
      <circle cy={-length * 0.92} r={5.5} fill="#d9a77a" />
      {you && (
        <text
          y={-length - 9}
          textAnchor="middle"
          fontSize={7}
          fontWeight={700}
          fill="var(--accent)"
          transform={`rotate(${-pose.angle} 0 ${-length - 9})`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          ▼
        </text>
      )}
    </g>
  );
}

/** The rival's taker, from behind: running up to the ball, then striking, leaning a little
 * the way he's going to shoot (mostly honestly). */
function Striker({ progress, lean }: { progress: number; lean: number }) {
  const x = 116 + (SPOT.x - 12 - 116) * progress;
  const y = 214 + (SPOT.y + 10 - 214) * progress;
  const stride = Math.sin(progress * Math.PI * 6) * 5;
  const angle = progress >= 1 ? lean * 10 : stride * 0.6;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path
        d={`M-3 0 L${-3 - stride} 14 M3 0 L${3 + stride} 14`}
        stroke="#151515"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <rect x={-8} y={-20} width={16} height={22} rx={5} fill="var(--kit-away)" />
      <text
        y={-6}
        textAnchor="middle"
        fontSize={8}
        fontWeight={700}
        fill="#fff"
        style={{ fontFamily: "var(--font-display)" }}
      >
        9
      </text>
      <circle cy={-25} r={5.5} fill="#6b4a32" />
    </g>
  );
}
