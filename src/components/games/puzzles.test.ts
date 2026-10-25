import { describe, expect, it } from "vitest";
import { PUZZLES } from "@/components/games/puzzles";
import {
  canMateIn,
  forcesMate,
  inCheck,
  isCheckmate,
  legalMoves,
  parsePosition,
  play,
} from "@/lib/chess";

describe.each(PUZZLES)("mate-in-three puzzle: $name", ({ setup, line }) => {
  const start = parsePosition(setup);

  it("starts from a legal position, with Black not in check", () => {
    expect(start.board.filter((piece) => piece === "K")).toHaveLength(1);
    expect(start.board.filter((piece) => piece === "k")).toHaveLength(1);
    expect(inCheck(start, false)).toBe(false);
  });

  it("can't be mated faster, and has exactly one key move", { timeout: 60_000 }, () => {
    expect(canMateIn(start, 2)).toBe(false);
    const keys = legalMoves(start).filter((move) => forcesMate(start, move, 3));
    expect(keys).toEqual([line[0]]);
  });

  it("follows a legal main line that ends in checkmate", { timeout: 60_000 }, () => {
    let position = start;
    line.forEach((move, ply) => {
      expect(legalMoves(position)).toContain(move);
      if (ply % 2 === 0) expect(forcesMate(position, move, 3 - ply / 2)).toBe(true);
      position = play(position, move);
    });
    expect(isCheckmate(position)).toBe(true);
  });
});

describe("chess rules", () => {
  it("doesn't let a pinned piece move off the pin", () => {
    // The e2 rook is pinned to the king by the e8 rook.
    const pinned = parsePosition("Ke1 Re2 kh8 re8");
    expect(legalMoves(pinned)).not.toContain("e2d2");
    expect(legalMoves(pinned)).toContain("e2e8");
  });

  it("finds checkmate and tells it from stalemate", () => {
    expect(isCheckmate(parsePosition("Kg1 Ra8 kg8 pf7 pg7 ph7", false))).toBe(true);
    const stalemate = parsePosition("Kf7 Qg6 kh8", false);
    expect(isCheckmate(stalemate)).toBe(false);
    expect(legalMoves(stalemate)).toHaveLength(0);
  });
});
