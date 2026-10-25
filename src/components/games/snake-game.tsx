"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameBar, useBest } from "@/components/games/game-ui";
import { useCanvas, cssToken } from "@/components/games/use-canvas";

const CELLS = 17;
const START_MS = 150;
const MIN_MS = 70;

type Point = { x: number; y: number };
type Status = "idle" | "running" | "over";

const DIRECTIONS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function randomFood(snake: Point[]): Point {
  for (;;) {
    const food = { x: Math.floor(Math.random() * CELLS), y: Math.floor(Math.random() * CELLS) };
    if (!snake.some((part) => part.x === food.x && part.y === food.y)) return food;
  }
}

function freshState() {
  const snake = [
    { x: 6, y: 8 },
    { x: 5, y: 8 },
    { x: 4, y: 8 },
  ];
  return { snake, dir: { x: 1, y: 0 }, queue: [] as Point[], food: randomFood(snake) };
}

/**
 * Developer style: Snake in a terminal. The snake eats `{}` and grows; it speeds up as it does.
 * Arrow keys / WASD, a swipe on the board, or the on-screen pad on touch screens.
 */
export default function SnakeGame() {
  const t = useTranslations("Games");
  const { canvasRef, size } = useCanvas();
  const game = useRef(freshState());
  const [status, setStatus] = useState<Status>("idle");
  const [score, setScore] = useState(0);
  const [best, saveBest] = useBest("snake", "high");

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !size) return;
    const cell = size / CELLS;
    const { snake, food } = game.current;
    ctx.clearRect(0, 0, size, size);
    // Faint grid dots, like the editor background.
    ctx.fillStyle = cssToken("--border");
    for (let x = 0; x < CELLS; x++) {
      for (let y = 0; y < CELLS; y++)
        ctx.fillRect(x * cell + cell / 2 - 1, y * cell + cell / 2 - 1, 2, 2);
    }
    // The bug to eat.
    ctx.fillStyle = cssToken("--code-keyword");
    ctx.font = `600 ${Math.round(cell * 0.72)}px ${cssToken("--font-code")}, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("{}", food.x * cell + cell / 2, food.y * cell + cell / 2 + 1);
    // The snake: accent body, a brighter head.
    snake.forEach((part, i) => {
      ctx.fillStyle = i === 0 ? cssToken("--fg") : cssToken("--accent");
      ctx.globalAlpha = i === 0 ? 1 : Math.max(0.45, 1 - i / (snake.length + 6));
      const inset = i === 0 ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(
        part.x * cell + inset,
        part.y * cell + inset,
        cell - inset * 2,
        cell - inset * 2,
        3,
      );
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }, [canvasRef, size]);

  useEffect(draw, [draw]);

  const turn = useCallback(
    (dir: Point) => {
      const state = game.current;
      const last = state.queue.at(-1) ?? state.dir;
      // No reversing into yourself, and no repeating the same turn.
      if (last.x + dir.x === 0 && last.y + dir.y === 0) return;
      if (last.x === dir.x && last.y === dir.y) return;
      if (state.queue.length < 3) state.queue.push(dir);
      if (status !== "running") {
        if (status === "over") {
          game.current = { ...freshState(), queue: [dir] };
          setScore(0);
        }
        setStatus("running");
      }
    },
    [status],
  );

  // The game loop: one step per tick, faster as the snake grows.
  useEffect(() => {
    if (status !== "running") return;
    const delay = Math.max(MIN_MS, START_MS - score * 5);
    const timer = window.setInterval(() => {
      const state = game.current;
      state.dir = state.queue.shift() ?? state.dir;
      const head = { x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y };
      const hitWall = head.x < 0 || head.y < 0 || head.x >= CELLS || head.y >= CELLS;
      const hitSelf = state.snake
        .slice(0, -1)
        .some((part) => part.x === head.x && part.y === head.y);
      if (hitWall || hitSelf) {
        setStatus("over");
        saveBest(state.snake.length - 3);
        return;
      }
      state.snake.unshift(head);
      if (head.x === state.food.x && head.y === state.food.y) {
        state.food = randomFood(state.snake);
        setScore(state.snake.length - 3);
      } else {
        state.snake.pop();
      }
      draw();
    }, delay);
    return () => window.clearInterval(timer);
  }, [status, score, draw, saveBest]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const dir = DIRECTIONS[event.key] ?? DIRECTIONS[event.key.toLowerCase()];
      if (!dir) return;
      event.preventDefault();
      turn(dir);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [turn]);

  // Swipes on the board.
  const touch = useRef<Point | null>(null);

  const restart = () => {
    game.current = freshState();
    setScore(0);
    setStatus("idle");
    draw();
  };

  const message =
    status === "over"
      ? t("snake.over", { n: score })
      : status === "idle"
        ? t("snake.start")
        : t("score", { n: score });

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-border bg-[var(--code-bg)]">
        <p className="border-b border-border px-3 py-2 font-mono text-[11.5px] text-fg-subtle">
          <span className="text-accent">~/snake</span> $ npm run eat-bugs
        </p>
        <canvas
          ref={canvasRef}
          className="block aspect-square w-full touch-none"
          onTouchStart={(event) => {
            touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
          }}
          onTouchEnd={(event) => {
            const start = touch.current;
            touch.current = null;
            if (!start) return;
            const dx = event.changedTouches[0].clientX - start.x;
            const dy = event.changedTouches[0].clientY - start.y;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
            turn(
              Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) },
            );
          }}
        />
      </div>
      {/* On-screen pad for touch screens. */}
      <div className="mx-auto mt-3 hidden w-36 grid-cols-3 gap-1.5 pointer-coarse:grid">
        {(
          [
            ["", null],
            ["ArrowUp", ArrowUp],
            ["", null],
            ["ArrowLeft", ArrowLeft],
            ["ArrowDown", ArrowDown],
            ["ArrowRight", ArrowRight],
          ] as const
        ).map(([key, Icon], i) =>
          Icon ? (
            <button
              key={key}
              type="button"
              aria-label={key}
              onClick={() => turn(DIRECTIONS[key])}
              className="flex h-10 items-center justify-center rounded-lg border border-border-strong bg-bg-subtle text-fg active:bg-accent-soft"
            >
              <Icon className="size-4" aria-hidden />
            </button>
          ) : (
            <span key={i} />
          ),
        )}
      </div>
      <GameBar
        status={message}
        best={best === null ? null : t("best", { n: best })}
        onRestart={restart}
      />
    </div>
  );
}
