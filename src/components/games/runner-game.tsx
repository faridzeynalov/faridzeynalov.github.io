"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameBar, useBest } from "@/components/games/game-ui";
import { cssToken, useCanvas } from "@/components/games/use-canvas";

/** The world is drawn on a 200×100 grid of big pixels (2:1 canvas), scaled to the canvas. */
const W = 200;
const GROUND = 86;
const PLAYER_X = 22;
const GRAVITY = 900;
const JUMP = -285;

// Sprites, one string per row: "#" body, "o" detail (drawn in the background colour).
const RUN = [
  [
    "..####..",
    "..#o##..",
    "..####..",
    "...##...",
    ".######.",
    "#.####.#",
    "..####..",
    "..#..#..",
    ".##..#..",
    ".....##.",
  ],
  [
    "..####..",
    "..#o##..",
    "..####..",
    "...##...",
    ".######.",
    "#.####.#",
    "..####..",
    "..#..#..",
    "..#..##.",
    ".##.....",
  ],
];
const JUMPING = [
  "..####..",
  "..#o##..",
  "..####..",
  "#..##..#",
  ".######.",
  "..####..",
  "..####..",
  ".##..##.",
  ".#....#.",
  "........",
];
const BUG = ["#.....#", ".#.#.#.", "..###..", "#######", "..#o#..", ".#...#."];
const BLOCK = ["#######", "#o#o#o#", "#######", "#o#o#o#", "#######"];

interface Obstacle {
  x: number;
  /** Sprites stacked from the ground up. */
  parts: string[][];
}

function obstacleHeight(obstacle: Obstacle) {
  return obstacle.parts.reduce((sum, part) => sum + part.length, 0);
}

function freshWorld() {
  return {
    y: GROUND,
    vy: 0,
    speed: 95,
    distance: 0,
    next: 120,
    obstacles: [] as Obstacle[],
    frame: 0,
  };
}

/**
 * 8-bit style: a side-scrolling runner. Jump over the bugs (Space, ↑ or a tap); it gets faster
 * as you go. Drawn on a canvas with hard-edged pixels in the style's palette.
 */
export default function RunnerGame() {
  const t = useTranslations("Games");
  const { canvasRef, size } = useCanvas();
  const world = useRef(freshWorld());
  const [status, setStatus] = useState<"idle" | "running" | "over">("idle");
  const [score, setScore] = useState(0);
  const [best, saveBest] = useBest("runner", "high");
  const overAt = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !size) return;
    const px = size / W;
    const state = world.current;
    const colors = {
      fg: cssToken("--fg"),
      accent: cssToken("--accent"),
      bad: cssToken("--code-keyword"),
      muted: cssToken("--fg-subtle"),
      bg: cssToken("--bg-elevated"),
    };
    ctx.clearRect(0, 0, size, size / 2);

    const sprite = (rows: string[], x: number, bottom: number, color: string) => {
      rows.forEach((row, r) => {
        for (let c = 0; c < row.length; c++) {
          if (row[c] === ".") continue;
          ctx.fillStyle = row[c] === "o" ? colors.bg : color;
          ctx.fillRect(
            Math.round((x + c) * px),
            Math.round((bottom - rows.length + r) * px),
            Math.ceil(px),
            Math.ceil(px),
          );
        }
      });
    };

    // Stars drifting slowly behind, and a dashed ground scrolling with the world.
    ctx.fillStyle = colors.muted;
    for (let i = 0; i < 9; i++) {
      const x = (((i * 47 - state.distance * 0.15) % W) + W) % W;
      ctx.fillRect(
        Math.round(x * px),
        Math.round((12 + ((i * 23) % 40)) * px),
        Math.ceil(px),
        Math.ceil(px),
      );
    }
    ctx.fillRect(0, Math.round(GROUND * px), size, Math.ceil(px));
    for (let x = -(state.distance % 12); x < W; x += 12) {
      ctx.fillRect(
        Math.round(x * px),
        Math.round((GROUND + 4) * px),
        Math.ceil(px * 4),
        Math.ceil(px),
      );
    }

    for (const obstacle of state.obstacles) {
      let bottom = GROUND;
      for (const part of obstacle.parts) {
        sprite(part, obstacle.x, bottom, part === BLOCK ? colors.muted : colors.bad);
        bottom -= part.length;
      }
    }

    const airborne = state.y < GROUND;
    sprite(
      airborne ? JUMPING : RUN[Math.floor(state.frame) % 2],
      PLAYER_X,
      Math.round(state.y),
      colors.accent,
    );

    // Score, in the arcade font.
    ctx.fillStyle = colors.fg;
    ctx.font = `${Math.round(px * 6)}px ${cssToken("--font-display")}, monospace`;
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(String(Math.floor(state.distance / 10)).padStart(5, "0"), size - px * 6, px * 6);
  }, [canvasRef, size]);

  useEffect(draw, [draw]);

  // The game loop.
  useEffect(() => {
    if (status !== "running") return;
    let frame = 0;
    let last = performance.now();
    let shown = 0;
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const state = world.current;
      state.speed = Math.min(210, state.speed + dt * 3.2);
      const move = state.speed * dt;
      state.distance += move;
      state.frame += dt * 10;
      state.vy += GRAVITY * dt;
      state.y = Math.min(GROUND, state.y + state.vy * dt);
      if (state.y === GROUND) state.vy = 0;

      for (const obstacle of state.obstacles) obstacle.x -= move;
      state.obstacles = state.obstacles.filter((obstacle) => obstacle.x > -12);
      state.next -= move;
      if (state.next <= 0) {
        const tall = state.distance > 400 && Math.random() < 0.35;
        state.obstacles.push({
          x: W + 4,
          parts: tall ? [BLOCK, BUG] : [Math.random() < 0.5 ? BUG : BLOCK],
        });
        state.next = 70 + Math.random() * 80 + state.speed * 0.25;
      }

      // Collision: the player's box (slightly forgiving) against each obstacle's.
      const hit = state.obstacles.some(
        (obstacle) =>
          obstacle.x < PLAYER_X + 6 &&
          obstacle.x + 7 > PLAYER_X + 2 &&
          state.y > GROUND - obstacleHeight(obstacle) + 1,
      );
      draw();
      const points = Math.floor(state.distance / 10);
      if (points !== shown) {
        shown = points;
        setScore(points);
      }
      if (hit) {
        overAt.current = now;
        setStatus("over");
        saveBest(points);
        return;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [status, draw, saveBest]);

  const jump = useCallback(() => {
    if (status === "over") {
      // A short pause, so a hurried tap doesn't restart straight away.
      if (performance.now() - overAt.current < 450) return;
      world.current = freshWorld();
      setScore(0);
      setStatus("running");
      return;
    }
    if (status === "idle") setStatus("running");
    const state = world.current;
    if (state.y >= GROUND - 0.5) state.vy = JUMP;
  }, [status]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== " " && event.key !== "ArrowUp" && event.key.toLowerCase() !== "w") return;
      event.preventDefault();
      jump();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [jump]);

  const restart = () => {
    world.current = freshWorld();
    setScore(0);
    setStatus("idle");
    draw();
  };

  const message =
    status === "over"
      ? t("runner.over", { n: score })
      : status === "idle"
        ? t("runner.start")
        : t("score", { n: score });

  return (
    <div>
      <canvas
        ref={canvasRef}
        onPointerDown={(event) => {
          event.preventDefault();
          jump();
        }}
        className="block aspect-[2/1] w-full cursor-pointer touch-none border-[3px] border-[var(--pixel-edge)] bg-bg-elevated [image-rendering:pixelated]"
      />
      <GameBar
        status={message}
        best={best === null ? null : t("best", { n: best })}
        onRestart={restart}
      />
    </div>
  );
}
