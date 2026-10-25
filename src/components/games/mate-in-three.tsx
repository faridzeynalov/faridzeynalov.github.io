"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { PieceShape, type Kind } from "@/components/chess/opera-game";
import { GameBar } from "@/components/games/game-ui";
import { PUZZLES } from "@/components/games/puzzles";
import {
  forcesMate,
  inCheck,
  isCheckmate,
  legalMoves,
  parsePosition,
  play,
  type Position,
} from "@/lib/chess";
import { cn } from "@/lib/utils";

const FILES = "abcdefgh";
/** Squares in screen order: a8 top left, White at the bottom. */
const SQUARES = Array.from({ length: 64 }, (_, i) => `${FILES[i % 8]}${8 - Math.floor(i / 8)}`);
/** Piece symbols for the squares' labels (screen readers name them, e.g. "white chess queen"). */
const SYMBOLS = {
  white: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  black: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
} as const;
/** How long Black takes to answer. */
const REPLY_MS = 650;

interface BoardPiece {
  id: string;
  kind: Kind;
  white: boolean;
  square: string;
}

function startPieces(setup: string): BoardPiece[] {
  return setup
    .split(/\s+/)
    .filter((token) => token.length === 3)
    .map((token) => ({
      id: token,
      kind: token[0].toLowerCase() as Kind,
      white: token[0] === token[0].toUpperCase(),
      square: token.slice(1),
    }));
}

/** The pieces after a move: a capture leaves the board, a pawn on the last rank becomes a queen. */
function movePieces(pieces: BoardPiece[], move: string): BoardPiece[] {
  const from = move.slice(0, 2);
  const to = move.slice(2, 4);
  return pieces
    .filter((piece) => piece.square !== to)
    .map((piece) => {
      if (piece.square !== from) return piece;
      const promotes = piece.kind === "p" && (to[1] === "8" || to[1] === "1");
      return { ...piece, square: to, kind: promotes ? "q" : piece.kind };
    });
}

const coords = (square: string) => ({ x: FILES.indexOf(square[0]), y: 8 - Number(square[1]) });

/**
 * Chess style: mate-in-three puzzles from classic patterns and a famous game. Pick a white
 * piece to see where it can go, then play; Black answers each move. The first move must be the
 * key; after that any move that still mates in time counts.
 */
export default function MateInThree() {
  const t = useTranslations("Games");
  const [index, setIndex] = useState(0);
  const puzzle = PUZZLES[index];
  const [position, setPosition] = useState<Position>(() => parsePosition(PUZZLES[0].setup));
  const [pieces, setPieces] = useState(() => startPieces(PUZZLES[0].setup));
  /** Moves played so far (both sides). */
  const [ply, setPly] = useState(0);
  const [onMainLine, setOnMainLine] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"solved" | "wrong" | null>(null);
  const [last, setLast] = useState<string | null>(null);
  const blackToMove = !position.white && result !== "solved";

  const moves = useMemo(() => legalMoves(position), [position]);
  const targets = useMemo(
    () =>
      selected
        ? new Set(moves.filter((move) => move.startsWith(selected)).map((move) => move.slice(2)))
        : new Set<string>(),
    [moves, selected],
  );

  const load = (next: number) => {
    setIndex(next);
    setPosition(parsePosition(PUZZLES[next].setup));
    setPieces(startPieces(PUZZLES[next].setup));
    setPly(0);
    setOnMainLine(true);
    setSelected(null);
    setResult(null);
    setLast(null);
  };

  const apply = useCallback((move: string) => {
    setPosition((current) => play(current, move));
    setPieces((current) => movePieces(current, move));
    setLast(move);
    setPly((value) => value + 1);
  }, []);

  // Black's answer: the main line's defence while on it, otherwise any (they all lose in time).
  useEffect(() => {
    if (!blackToMove) return;
    const timer = window.setTimeout(() => {
      const scripted = onMainLine ? puzzle.line[ply] : undefined;
      const reply = scripted && moves.includes(scripted) ? scripted : moves[0];
      if (reply) apply(reply);
    }, REPLY_MS);
    return () => window.clearTimeout(timer);
  }, [blackToMove, onMainLine, puzzle, ply, moves, apply]);

  const pick = (square: string) => {
    if (result === "solved" || blackToMove) return;
    const piece = pieces.find((other) => other.square === square);
    if (piece?.white) {
      setSelected(square === selected ? null : square);
      setResult(null);
      return;
    }
    if (!selected || !targets.has(square)) {
      setSelected(null);
      return;
    }
    const move = `${selected}${square}`;
    const step = ply / 2;
    const left = 3 - step;
    const after = play(position, move);
    const good =
      step === 0
        ? move === puzzle.line[0]
        : left === 1
          ? isCheckmate(after)
          : forcesMate(position, move, left);
    setSelected(null);
    if (!good) {
      setResult("wrong");
      return;
    }
    setResult(isCheckmate(after) ? "solved" : null);
    setOnMainLine((value) => value && move === puzzle.line[ply]);
    apply(move);
  };

  const status =
    result === "solved"
      ? t("chess.solved", { name: t(`chess.names.${puzzle.name}`) })
      : result === "wrong"
        ? t("chess.wrong")
        : blackToMove
          ? t("chess.reply")
          : t("chess.toMove", { n: ply / 2 + 1 });

  const kingInCheck = inCheck(position)
    ? pieces.find((piece) => piece.kind === "k" && piece.white === position.white)?.square
    : undefined;

  return (
    <div>
      <div
        className={cn(
          "puzzle-board relative aspect-square w-full overflow-hidden rounded-md shadow-[0_0_0_6px_var(--board-rim)]",
          result === "wrong" && "animate-[shake_0.35s]",
        )}
      >
        <div className="grid size-full grid-cols-8">
          {SQUARES.map((square, i) => {
            const piece = pieces.find((other) => other.square === square);
            const dark = (Math.floor(i / 8) + (i % 8)) % 2 === 1;
            const target = targets.has(square);
            return (
              <button
                key={square}
                type="button"
                onClick={() => pick(square)}
                aria-label={[
                  square,
                  piece && SYMBOLS[piece.white ? "white" : "black"][piece.kind],
                  target && t("chess.target"),
                ]
                  .filter(Boolean)
                  .join(", ")}
                aria-pressed={selected === square}
                className={cn(
                  "relative",
                  dark ? "bg-[var(--square-dark)]" : "bg-[var(--square-light)]",
                  (piece?.white || target) &&
                    !blackToMove &&
                    result !== "solved" &&
                    "cursor-pointer",
                )}
              >
                {last && (last.startsWith(square) || last.endsWith(square)) && (
                  <span className="absolute inset-0 bg-[var(--move)]" />
                )}
                {selected === square && (
                  <span className="absolute inset-0 bg-[var(--move)] ring-2 ring-[var(--accent)] ring-inset" />
                )}
                {kingInCheck === square && (
                  <span className="absolute inset-0 bg-[radial-gradient(circle,var(--check)_0_30%,transparent_72%)]" />
                )}
                {/* Where the selected piece can go: a dot, or a ring around a piece to capture. */}
                {target &&
                  (piece ? (
                    <span className="absolute inset-[4%] rounded-full border-[5px] border-[rgb(0_0_0/0.22)]" />
                  ) : (
                    <span className="absolute top-1/2 left-1/2 size-[28%] -translate-1/2 rounded-full bg-[rgb(0_0_0/0.22)]" />
                  ))}
              </button>
            );
          })}
        </div>
        {/* The pieces slide between squares; clicks go through to the squares. */}
        <div className="pointer-events-none absolute inset-0">
          {pieces.map((piece) => {
            const { x, y } = coords(piece.square);
            return (
              <span
                key={piece.id}
                className="absolute top-0 left-0 size-[12.5%] transition-[translate] duration-300 ease-out-expo"
                style={{ translate: `${x * 100}% ${y * 100}%` } as CSSProperties}
              >
                {/* (An inset box: padding in % would be a share of the board, not the square.) */}
                <span className="absolute inset-[6%]">
                  <PieceShape kind={piece.kind} white={piece.white} />
                </span>
              </span>
            );
          })}
        </div>
      </div>
      <GameBar
        status={status}
        best={t("chess.count", { n: index + 1, total: PUZZLES.length })}
        onRestart={() => load(index)}
      >
        {result === "solved" && (
          <button
            type="button"
            onClick={() => load((index + 1) % PUZZLES.length)}
            className="inline-flex h-9 items-center gap-1.5 rounded-pill bg-fg px-3.5 text-[13px] font-medium text-bg"
          >
            {t("chess.next")}
            <ArrowRight className="size-3.5" aria-hidden />
          </button>
        )}
      </GameBar>
    </div>
  );
}
