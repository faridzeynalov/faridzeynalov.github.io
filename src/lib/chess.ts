/**
 * A small chess rules engine for the Chess style's puzzles: legal moves (pins and checks
 * included; no castling or en passant, which the puzzles don't need), checkmate, and a
 * forced-mate search used to verify the puzzles.
 *
 * Squares are "a1"–"h8"; a move is "e2e4" (promotions always make a queen). The board is 64
 * cells, a1 first, each "" or a piece letter: uppercase White (KQRBNP), lowercase Black.
 */

export interface Position {
  board: string[];
  /** Side to move. */
  white: boolean;
}

const FILES = "abcdefgh";

export const squareIndex = (square: string) =>
  (Number(square[1]) - 1) * 8 + FILES.indexOf(square[0]);
export const squareName = (index: number) => `${FILES[index % 8]}${Math.floor(index / 8) + 1}`;

const isWhite = (piece: string) => piece !== "" && piece === piece.toUpperCase();

/** "Kg1 Ra1 Pf2 kg8 pf7…" (piece letter, uppercase White, then square), White to move. */
export function parsePosition(setup: string, white = true): Position {
  const board = Array<string>(64).fill("");
  for (const token of setup.split(/\s+/)) {
    if (token.length === 3) board[squareIndex(token.slice(1))] = token[0];
  }
  return { board, white };
}

const KNIGHT = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
];
const KING = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];
const ROOK_DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
const BISHOP_DIRS = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

/** Moves by the rules of piece movement, ignoring whether they leave the king in check. */
function pseudoMoves(pos: Position): string[] {
  const moves: string[] = [];
  const { board, white } = pos;
  const own = (piece: string) => piece !== "" && isWhite(piece) === white;
  for (let from = 0; from < 64; from++) {
    const piece = board[from];
    if (!own(piece)) continue;
    const file = from % 8;
    const rank = Math.floor(from / 8);
    const add = (f: number, r: number) => {
      if (f < 0 || f > 7 || r < 0 || r > 7) return false;
      const to = r * 8 + f;
      if (own(board[to])) return false;
      moves.push(squareName(from) + squareName(to));
      return board[to] === "";
    };
    const kind = piece.toLowerCase();
    if (kind === "p") {
      const dir = white ? 1 : -1;
      const ahead = (rank + dir) * 8 + file;
      if (rank + dir >= 0 && rank + dir <= 7 && board[ahead] === "") {
        moves.push(squareName(from) + squareName(ahead));
        const startRank = white ? 1 : 6;
        const twoAhead = (rank + 2 * dir) * 8 + file;
        if (rank === startRank && board[twoAhead] === "") {
          moves.push(squareName(from) + squareName(twoAhead));
        }
      }
      for (const df of [-1, 1]) {
        const f = file + df;
        const r = rank + dir;
        if (f < 0 || f > 7 || r < 0 || r > 7) continue;
        const target = board[r * 8 + f];
        if (target !== "" && isWhite(target) !== white)
          moves.push(squareName(from) + squareName(r * 8 + f));
      }
    } else if (kind === "n" || kind === "k") {
      for (const [df, dr] of kind === "n" ? KNIGHT : KING) add(file + df, rank + dr);
    } else {
      const dirs =
        kind === "r" ? ROOK_DIRS : kind === "b" ? BISHOP_DIRS : [...ROOK_DIRS, ...BISHOP_DIRS];
      for (const [df, dr] of dirs) {
        for (let step = 1; add(file + df * step, rank + dr * step); step++);
      }
    }
  }
  return moves;
}

/** Whether `square` is attacked by the given side. */
function attacked(board: string[], square: number, byWhite: boolean): boolean {
  const file = square % 8;
  const rank = Math.floor(square / 8);
  const at = (f: number, r: number) => (f < 0 || f > 7 || r < 0 || r > 7 ? null : board[r * 8 + f]);
  const enemy = (piece: string | null, kinds: string) =>
    !!piece && isWhite(piece) === byWhite && kinds.includes(piece.toLowerCase());

  // Pawns attack diagonally forward (towards the side they attack).
  const pawnRank = byWhite ? rank - 1 : rank + 1;
  if (enemy(at(file - 1, pawnRank), "p") || enemy(at(file + 1, pawnRank), "p")) return true;
  if (KNIGHT.some(([df, dr]) => enemy(at(file + df, rank + dr), "n"))) return true;
  if (KING.some(([df, dr]) => enemy(at(file + df, rank + dr), "k"))) return true;
  for (const [dirs, kinds] of [
    [ROOK_DIRS, "rq"],
    [BISHOP_DIRS, "bq"],
  ] as const) {
    for (const [df, dr] of dirs) {
      for (let step = 1; ; step++) {
        const piece = at(file + df * step, rank + dr * step);
        if (piece === null) break;
        if (piece === "") continue;
        if (enemy(piece, kinds)) return true;
        break;
      }
    }
  }
  return false;
}

export function inCheck(pos: Position, white = pos.white): boolean {
  const king = pos.board.indexOf(white ? "K" : "k");
  return king >= 0 && attacked(pos.board, king, !white);
}

/** The position after a move (assumed legal). Pawns reaching the last rank become queens. */
export function play(pos: Position, move: string): Position {
  const board = [...pos.board];
  const from = squareIndex(move.slice(0, 2));
  const to = squareIndex(move.slice(2, 4));
  let piece = board[from];
  const lastRank = Math.floor(to / 8) === (pos.white ? 7 : 0);
  if (piece.toLowerCase() === "p" && lastRank) piece = pos.white ? "Q" : "q";
  board[to] = piece;
  board[from] = "";
  return { board, white: !pos.white };
}

/** Legal moves for the side to move. */
export function legalMoves(pos: Position): string[] {
  return pseudoMoves(pos).filter((move) => !inCheck(play(pos, move), pos.white));
}

export function isCheckmate(pos: Position): boolean {
  return inCheck(pos) && legalMoves(pos).length === 0;
}

/**
 * Whether the side to move can force mate within `n` of its own moves, whatever the defence.
 * Checks are tried first, which keeps puzzle verification quick.
 */
export function canMateIn(pos: Position, n: number): boolean {
  if (n <= 0) return false;
  const moves = legalMoves(pos);
  const ordered = [
    ...moves.filter((move) => inCheck(play(pos, move))),
    ...moves.filter((move) => !inCheck(play(pos, move))),
  ];
  return ordered.some((move) => mates(play(pos, move), n - 1));
}

/** After the attacker's move: mated now, or every defence still loses within `n` more moves. */
function mates(pos: Position, n: number): boolean {
  const defences = legalMoves(pos);
  if (defences.length === 0) return inCheck(pos);
  if (n === 0) return false;
  return defences.every((defence) => canMateIn(play(pos, defence), n));
}

/** Whether `move` forces mate within `n` moves in total (counting this one). */
export function forcesMate(pos: Position, move: string, n: number): boolean {
  return mates(play(pos, move), n - 1);
}
