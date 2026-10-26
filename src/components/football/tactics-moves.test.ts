import { describe, expect, it } from "vitest";
import { isOffside, MOVES, positionsAt } from "@/components/football/tactics-moves";

describe("tactics board moves", () => {
  it.each(MOVES.map((move, i) => [i + 1, move] as const))(
    "move %i has no offside pass",
    (_, move) => {
      move.forEach((_, beat) => expect(isOffside(move, beat), `beat ${beat}`).toBe(false));
    },
  );

  it.each(MOVES.map((move, i) => [i + 1, move] as const))(
    "move %i ends with a shot from outside the six-yard box, on target",
    (_, move) => {
      const shot = move.at(-1)!;
      expect(shot.shot).toBe(true);
      const shooter = move.at(-2)!.carrier!;
      const [x] = positionsAt(move, move.length - 2)[shooter];
      expect(x).toBeLessThan(99.5);
      // Between the posts (the goal is 7.32 m wide, centred on y = 34).
      expect(shot.ball[1]).toBeGreaterThan(30.6);
      expect(shot.ball[1]).toBeLessThan(37.4);
    },
  );

  it("plays four different moves", () => {
    const routes = MOVES.map((move) => move.map((step) => step.carrier).join("-"));
    expect(new Set(routes).size).toBe(MOVES.length);
  });

  it("catches the old move's pass to a striker beyond the back line", () => {
    // The original move: the winger carries it to (91, 57) while the striker runs to (92, 39),
    // past the second-last defender (89) and ahead of the ball, before the pass.
    const move = [
      { ball: [79, 60] as const, ms: 0, carrier: 7 },
      {
        ball: [91, 57] as const,
        ms: 900,
        carrier: 7,
        runs: {
          7: [91, 57] as const,
          9: [92, 39] as const,
          cb2: [89, 44] as const,
          cb1: [89, 30] as const,
        },
      },
      { ball: [93, 38] as const, ms: 600, carrier: 9 },
    ];
    expect(isOffside(move, 2)).toBe(true);
  });

  it("allows a cut-back to a player behind the ball", () => {
    const move = [
      { ball: [98, 56] as const, ms: 0, carrier: 7, runs: { 9: [97, 36] as const } },
      { ball: [97, 36] as const, ms: 500, carrier: 9 },
    ];
    expect(isOffside(move, 1)).toBe(false);
  });
});
