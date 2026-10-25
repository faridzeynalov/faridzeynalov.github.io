"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useSkin } from "@/components/layout/use-appearance";
import { cn } from "@/lib/utils";

/**
 * Morphy's "Opera Game" (Paris, 1858), the most famous short game: 17 moves, ending in mate.
 * Long algebraic moves for the board, and the usual notation for the caption.
 */
const MOVES = [
  ["e2e4", "e4"],
  ["e7e5", "e5"],
  ["g1f3", "Nf3"],
  ["d7d6", "d6"],
  ["d2d4", "d4"],
  ["c8g4", "Bg4"],
  ["d4e5", "dxe5"],
  ["g4f3", "Bxf3"],
  ["d1f3", "Qxf3"],
  ["d6e5", "dxe5"],
  ["f1c4", "Bc4"],
  ["g8f6", "Nf6"],
  ["f3b3", "Qb3"],
  ["d8e7", "Qe7"],
  ["b1c3", "Nc3"],
  ["c7c6", "c6"],
  ["c1g5", "Bg5"],
  ["b7b5", "b5"],
  ["c3b5", "Nxb5"],
  ["c6b5", "cxb5"],
  ["c4b5", "Bxb5+"],
  ["b8d7", "Nbd7"],
  ["e1c1", "O-O-O"],
  ["a8d8", "Rd8"],
  ["d1d7", "Rxd7"],
  ["d8d7", "Rxd7"],
  ["h1d1", "Rd1"],
  ["e7e6", "Qe6"],
  ["b5d7", "Bxd7+"],
  ["f6d7", "Nxd7"],
  ["b3b8", "Qb8+"],
  ["d7b8", "Nxb8"],
  ["d1d8", "Rd8#"],
] as const;

/** Time per move, and how long the final mate stays on the board before the game restarts. */
const MOVE_MS = 1150;
const MATE_HOLD_MS = 4200;

export type Kind = "p" | "n" | "b" | "r" | "q" | "k";

interface Piece {
  id: string;
  kind: Kind;
  white: boolean;
  square: string;
  captured: boolean;
}

const BACK_RANK: Kind[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
const FILES = "abcdefgh";

function startingPieces(): Piece[] {
  const pieces: Piece[] = [];
  for (const white of [true, false]) {
    const [back, pawns] = white ? ["1", "2"] : ["8", "7"];
    FILES.split("").forEach((file, i) => {
      pieces.push({
        id: `${file}${back}`,
        kind: BACK_RANK[i],
        white,
        square: `${file}${back}`,
        captured: false,
      });
      pieces.push({
        id: `${file}${pawns}`,
        kind: "p",
        white,
        square: `${file}${pawns}`,
        captured: false,
      });
    });
  }
  return pieces;
}

/** The pieces after the first `ply` moves (castling moves the rook too; captures are kept, faded). */
function position(ply: number): Piece[] {
  const pieces = startingPieces();
  for (const [move] of MOVES.slice(0, ply)) {
    const from = move.slice(0, 2);
    const to = move.slice(2, 4);
    const victim = pieces.find((piece) => piece.square === to && !piece.captured);
    if (victim) victim.captured = true;
    const mover = pieces.find((piece) => piece.square === from && !piece.captured);
    if (!mover) continue;
    mover.square = to;
    if (mover.kind === "k" && from === "e1" && to === "c1") {
      const rook = pieces.find((piece) => piece.square === "a1" && !piece.captured);
      if (rook) rook.square = "d1";
    }
  }
  return pieces;
}

/** Board coordinates of a square, 0–7 from the left and from the top (White at the bottom). */
function coords(square: string) {
  return { x: FILES.indexOf(square[0]), y: 8 - Number(square[1]) };
}

/**
 * Chess style: a board lying on the table, tilted away in perspective, with the pieces standing
 * on it and replaying the Opera Game move by move. It plays only while on screen (and shows the
 * final position with reduced motion); in the other styles it isn't rendered at all.
 */
export function OperaGame({ className }: { className?: string }) {
  const skin = useSkin();
  if (skin !== "chess") return null;
  return <Board className={className} />;
}

function Board({ className }: { className?: string }) {
  const t = useTranslations("Chess");
  const ref = useRef<HTMLDivElement>(null);
  // Only rendered in the browser (the style is unknown on the server), so this can be read now.
  const [still] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [ply, setPly] = useState(still ? MOVES.length : 0);
  const [visible, setVisible] = useState(false);
  const pieces = useMemo(() => position(ply), [ply]);

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
    const done = ply >= MOVES.length;
    const timer = window.setTimeout(
      () => setPly(done ? 0 : ply + 1),
      done ? MATE_HOLD_MS : ply === 0 ? 700 : MOVE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [visible, still, ply]);

  const last = ply > 0 ? MOVES[ply - 1][0] : null;
  const mate = ply === MOVES.length;
  const moveNumber = Math.ceil(ply / 2);
  const notation = ply > 0 ? `${moveNumber}.${ply % 2 === 0 ? ".." : ""} ${MOVES[ply - 1][1]}` : "";

  return (
    <figure ref={ref} className={cn("chess-game mx-auto w-full max-w-[26rem]", className)}>
      <div className="chess-stage" aria-hidden>
        <div className="chess-board">
          <div className="chess-squares" />
          {last && (
            <>
              <Square square={last.slice(0, 2)} className="chess-last" />
              <Square square={last.slice(2, 4)} className="chess-last" />
            </>
          )}
          {mate && <Square square="e8" className="chess-check" />}
          {/* Coordinates on the board's edge squares, as on a tournament board. */}
          {FILES.split("").map((file, i) => (
            <span key={file} className="chess-coord chess-file" style={{ left: `${i * 12.5}%` }}>
              {file}
            </span>
          ))}
          {[8, 7, 6, 5, 4, 3, 2, 1].map((rank, i) => (
            <span key={rank} className="chess-coord chess-rank" style={{ top: `${i * 12.5}%` }}>
              {rank}
            </span>
          ))}
          {pieces.map((piece) => {
            const { x, y } = coords(piece.square);
            return (
              <div
                key={piece.id}
                className="chess-piece"
                data-captured={piece.captured || undefined}
                style={{ "--x": x, "--y": y } as CSSProperties}
              >
                <PieceShape kind={piece.kind} white={piece.white} />
              </div>
            );
          })}
        </div>
      </div>
      <figcaption className="mt-6 flex items-baseline justify-between gap-4 text-left">
        <span>
          <span className="block font-serif text-lg text-fg italic">{t("game")}</span>
          <span className="mt-0.5 block text-xs text-fg-subtle">{t("players")}</span>
        </span>
        <span className="shrink-0 font-mono text-sm text-accent tabular-nums" aria-hidden>
          {notation}
        </span>
      </figcaption>
    </figure>
  );
}

function Square({ square, className }: { square: string; className: string }) {
  const { x, y } = coords(square);
  return (
    <div
      className={cn("chess-square", className)}
      style={{ "--x": x, "--y": y } as CSSProperties}
    />
  );
}

/** Staunton-like silhouettes, drawn standing on a base (viewBox 40×48). */
const SHAPES: Record<Kind, string> = {
  p: "M14 40c0-6 3-10 4-13h-3a2 2 0 0 1 0-4h2.2A7 7 0 1 1 22.8 23H25a2 2 0 0 1 0 4h-3c1 3 4 7 4 13z",
  r: "M11 40l2-5h1V20l-3-2V9h4v3h3V9h4v3h3V9h4v9l-3 2v15h1l2 5z",
  b: "M13 40c0-5 3-8 4-11h-2a2 2 0 0 1 0-4h1.5C13 22 12 19 12 16c0-5 4-9 8-12 4 3 8 7 8 12 0 3-1 6-4.5 9H25a2 2 0 0 1 0 4h-2c1 3 4 6 4 11z",
  n: "M12 40c0-7 3-11 7-15-3 0-6 2-8 2-2-1-3-3-1-6 2-2 4-5 6-8 1-3 3-5 5-5l1 2c5 1 9 7 9 15 0 7-2 11-3 15z",
  q: "M12 40c0-5 2-8 3-10h-1a2 2 0 0 1 0-4h1L10 13l5 5 2-9 3 8 3-8 2 9 5-5-5 13h1a2 2 0 0 1 0 4h-1c1 2 3 5 3 10z",
  k: "M12 40c0-5 2-8 3-10h-1a2 2 0 0 1 0-4h1.5L12 16c3-2 5-3 8-3s5 1 8 3l-3.5 10H26a2 2 0 0 1 0 4h-1c1 2 3 5 3 10z",
};

/** Small extras per piece: the bishop's mitre slit and ball, the queen's crown balls, the king's
 * cross, the knight's eye. */
function Details({ kind }: { kind: Kind }) {
  switch (kind) {
    case "b":
      return (
        <>
          <circle cx="20" cy="3" r="2" />
          <path d="M22 9.5l-3.5 5" fill="none" className="chess-cut" />
        </>
      );
    case "q":
      return (
        <>
          <circle cx="10" cy="12" r="2" />
          <circle cx="17" cy="8" r="2" />
          <circle cx="23" cy="8" r="2" />
          <circle cx="30" cy="12" r="2" />
        </>
      );
    case "k":
      return <path d="M18.5 2h3v3.5H25v3h-3.5V12h-3V8.5H15v-3h3.5z" />;
    case "n":
      return <circle cx="19.5" cy="13" r="1.2" className="chess-cut-fill" />;
    default:
      return null;
  }
}

export function PieceShape({ kind, white }: { kind: Kind; white: boolean }) {
  return (
    <svg
      viewBox="0 0 40 48"
      className={cn("chess-figure", white ? "chess-white" : "chess-black")}
      aria-hidden
    >
      <ellipse cx="20" cy="45" rx="13" ry="3" className="chess-shadow" />
      <path d="M8 40h24a3 3 0 0 1 3 3v2H5v-2a3 3 0 0 1 3-3z" />
      <path d={SHAPES[kind]} />
      <Details kind={kind} />
    </svg>
  );
}
