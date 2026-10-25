"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { GameBar } from "@/components/games/game-ui";

type Mark = "x" | "o" | null;

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

function winner(board: Mark[]) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { mark: board[a], line };
  }
  return null;
}

/** Minimax score for `turn` to play on `board` (+1: O wins, −1: X wins). */
function minimax(board: Mark[], turn: "x" | "o"): number {
  const win = winner(board);
  if (win) return win.mark === "o" ? 1 : -1;
  if (board.every(Boolean)) return 0;
  const scores = board.flatMap((cell, i) => {
    if (cell) return [];
    const next = [...board];
    next[i] = turn;
    return [minimax(next, turn === "o" ? "x" : "o")];
  });
  return turn === "o" ? Math.max(...scores) : Math.min(...scores);
}

/** The computer (O): best move, but now and then a casual one, so it can be beaten. */
function computerMove(board: Mark[]) {
  const free = board.flatMap((cell, i) => (cell ? [] : [i]));
  if (Math.random() < 0.22) return free[Math.floor(Math.random() * free.length)];
  let best = free[0];
  let bestScore = -Infinity;
  for (const i of free) {
    const next = [...board];
    next[i] = "o";
    const score = minimax(next, "x");
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

/** Centre of a cell in the 300×300 board. */
const centre = (i: number) => ({ x: 50 + (i % 3) * 100, y: 50 + Math.floor(i / 3) * 100 });

/**
 * Paper style: noughts and crosses on the notebook page against the computer. The grid and
 * every mark are drawn in ink, stroke by stroke.
 */
export default function TicTacToe() {
  const t = useTranslations("Games");
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(null));
  const [tally, setTally] = useState({ you: 0, draw: 0, me: 0 });
  const [round, setRound] = useState(0);
  const win = winner(board);
  const full = board.every(Boolean);
  const done = Boolean(win) || full;
  const xTurn = board.filter(Boolean).length % 2 === (round % 2 === 0 ? 0 : 1);

  // The computer answers after a moment (and opens every other round).
  useEffect(() => {
    if (done || xTurn) return;
    const timer = window.setTimeout(() => {
      setBoard((current) => {
        const next = [...current];
        next[computerMove(current)] = "o";
        return next;
      });
    }, 550);
    return () => window.clearTimeout(timer);
  }, [board, done, xTurn]);

  // Count the result once per round.
  useEffect(() => {
    if (!done) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- derived from the finished board
    setTally((current) =>
      win?.mark === "x"
        ? { ...current, you: current.you + 1 }
        : win?.mark === "o"
          ? { ...current, me: current.me + 1 }
          : { ...current, draw: current.draw + 1 },
    );
  }, [done, win?.mark]);

  const play = (i: number) => {
    if (done || !xTurn || board[i]) return;
    const next = [...board];
    next[i] = "x";
    setBoard(next);
  };

  const restart = () => {
    setBoard(Array(9).fill(null));
    setRound((value) => value + 1);
  };

  const status = win
    ? win.mark === "x"
      ? t("ttt.won")
      : t("ttt.lost")
    : full
      ? t("ttt.draw")
      : xTurn
        ? t("ttt.yourTurn")
        : t("ttt.thinking");

  const strike = win && { from: centre(win.line[0]), to: centre(win.line[2]) };

  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-[19rem]">
        <svg
          viewBox="0 0 300 300"
          className="absolute inset-0 size-full overflow-visible text-fg"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <g strokeWidth="3.5" className="ink-draw" key={`grid-${round}`}>
            <path d="M101 14 C 97 100, 104 200, 99 286" pathLength={1} />
            <path
              d="M200 12 C 204 110, 197 190, 202 288"
              pathLength={1}
              style={{ animationDelay: "0.15s" }}
            />
            <path
              d="M14 99 C 100 103, 190 96, 287 101"
              pathLength={1}
              style={{ animationDelay: "0.3s" }}
            />
            <path
              d="M12 201 C 110 197, 200 205, 288 199"
              pathLength={1}
              style={{ animationDelay: "0.45s" }}
            />
          </g>
          {board.map((mark, i) => {
            if (!mark) return null;
            const { x, y } = centre(i);
            return mark === "x" ? (
              <g
                key={`${round}-${i}`}
                strokeWidth="5"
                className="ink-draw text-accent"
                stroke="currentColor"
              >
                <path
                  d={`M${x - 26} ${y - 25} C ${x - 8} ${y - 6}, ${x + 6} ${y + 8}, ${x + 25} ${y + 27}`}
                  pathLength={1}
                />
                <path
                  d={`M${x + 24} ${y - 27} C ${x + 6} ${y - 6}, ${x - 8} ${y + 8}, ${x - 27} ${y + 24}`}
                  pathLength={1}
                  style={{ animationDelay: "0.18s" }}
                />
              </g>
            ) : (
              <path
                key={`${round}-${i}`}
                className="ink-draw"
                strokeWidth="4.5"
                pathLength={1}
                d={`M${x + 2} ${y - 28} C ${x + 22} ${y - 28}, ${x + 30} ${y - 10}, ${x + 28} ${y + 4} C ${x + 26} ${y + 22}, ${x + 10} ${y + 30}, ${x - 4} ${y + 28} C ${x - 22} ${y + 26}, ${x - 30} ${y + 10}, ${x - 28} ${y - 6} C ${x - 26} ${y - 22}, ${x - 12} ${y - 30}, ${x + 6} ${y - 26}`}
              />
            );
          })}
          {strike && (
            <path
              className="ink-draw text-accent"
              stroke="currentColor"
              strokeWidth="4"
              pathLength={1}
              style={{ animationDelay: "0.35s" }}
              d={`M${strike.from.x - (strike.to.x - strike.from.x) * 0.22} ${strike.from.y - (strike.to.y - strike.from.y) * 0.22} L ${strike.to.x + (strike.to.x - strike.from.x) * 0.22} ${strike.to.y + (strike.to.y - strike.from.y) * 0.22 + 3}`}
            />
          )}
        </svg>
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {board.map((mark, i) => (
            <button
              key={i}
              type="button"
              onClick={() => play(i)}
              disabled={done || !xTurn || Boolean(mark)}
              aria-label={t("ttt.cell", { n: i + 1, mark: mark ?? "–" })}
              className="cursor-pointer rounded-lg transition-colors enabled:hover:bg-accent-soft disabled:cursor-default"
            />
          ))}
        </div>
      </div>
      <GameBar
        status={<span className="font-serif text-xl">{status}</span>}
        best={t("ttt.tally", tally)}
        onRestart={restart}
      />
    </div>
  );
}
