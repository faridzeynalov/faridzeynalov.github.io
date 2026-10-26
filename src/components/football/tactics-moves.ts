/**
 * The team moves on the Football style's tactics board, on a 105×68 pitch (metres), the home
 * side attacking the right-hand goal. Each move is a list of beats: where the ball goes (and
 * how long it takes), who has it, and who runs where meanwhile. Every pass is onside (see
 * tactics-moves.test.ts) and every shot is struck from outside the six-yard box.
 */

export type Point = readonly [number, number];

export interface Beat {
  ball: Point;
  ms: number;
  /** Who has the ball once it arrives (unset on the shot). */
  carrier?: number;
  runs?: Record<string, Point>;
  shot?: boolean;
}

/** The home side, by shirt number, at kick-off. */
export const HOME: Record<number, Point> = {
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
export const AWAY: Record<string, Point> = {
  gk: [101, 34],
  cb1: [86, 28],
  cb2: [86, 40],
  lb: [84, 14],
  rb: [84, 54],
  dm1: [75, 25],
  dm2: [75, 43],
};

export const MOVES: Beat[][] = [
  // Down the right to the byline, then a cut-back to the edge of the box.
  [
    { ball: [5, 34], ms: 0, carrier: 1 },
    { ball: [18, 42], ms: 700, carrier: 4, runs: { 6: [33, 37] } },
    { ball: [33, 37], ms: 650, carrier: 6, runs: { 10: [50, 48] } },
    {
      ball: [50, 48],
      ms: 650,
      carrier: 10,
      runs: { 7: [74, 58], 9: [78, 36], 11: [78, 14], dm2: [72, 46] },
    },
    { ball: [74, 58], ms: 750, carrier: 7, runs: { rb: [80, 56], 9: [84, 38] } },
    {
      ball: [98, 56],
      ms: 900,
      carrier: 7,
      runs: { 7: [98, 56], rb: [95, 55], 9: [86, 36], cb2: [95, 41], cb1: [94, 32], gk: [101, 38] },
    },
    { ball: [87, 37], ms: 600, carrier: 9, runs: { 9: [87, 37], cb1: [91, 34] } },
    { ball: [105.6, 31.8], ms: 380, shot: true, runs: { gk: [101.5, 37] } },
  ],
  // A run timed off the last defender, then a lay-off for a shot from the edge.
  [
    { ball: [5, 34], ms: 0, carrier: 1 },
    { ball: [18, 26], ms: 700, carrier: 5, runs: { 8: [40, 20] } },
    { ball: [40, 20], ms: 700, carrier: 8, runs: { 10: [56, 40], 9: [70, 30], dm1: [70, 26] } },
    {
      ball: [56, 40],
      ms: 650,
      carrier: 10,
      runs: { 9: [82, 33], 11: [80, 14], cb1: [85, 30], cb2: [85, 40] },
    },
    {
      ball: [90, 35],
      ms: 800,
      carrier: 9,
      runs: { 9: [90, 35], 10: [84, 42], cb1: [92, 31], cb2: [91, 40], gk: [99, 35] },
    },
    { ball: [85, 42], ms: 550, carrier: 10, runs: { 10: [85, 42], dm2: [80, 46] } },
    { ball: [105.6, 36.6], ms: 400, shot: true, runs: { gk: [102, 31] } },
  ],
  // Switched to the left, a give-and-go down the wing and a shot from distance.
  [
    { ball: [5, 34], ms: 0, carrier: 1 },
    { ball: [22, 12], ms: 750, carrier: 3, runs: { 3: [22, 12], 11: [60, 10] } },
    { ball: [60, 10], ms: 800, carrier: 11, runs: { 8: [62, 26], lb: [70, 12] } },
    { ball: [62, 26], ms: 550, carrier: 8, runs: { 11: [82, 10], 9: [80, 30], dm1: [72, 24] } },
    {
      ball: [88, 9],
      ms: 750,
      carrier: 11,
      runs: { 11: [88, 9], lb: [85, 12], 8: [83, 28], cb1: [88, 26] },
    },
    { ball: [83, 28], ms: 600, carrier: 8, runs: { cb1: [90, 30], 9: [93, 36] } },
    { ball: [105.6, 35.8], ms: 420, shot: true, runs: { gk: [102, 32] } },
  ],
  // Through the middle: into the striker's feet, and a one-two on the edge of the box.
  [
    { ball: [5, 34], ms: 0, carrier: 1 },
    { ball: [22, 56], ms: 700, carrier: 2, runs: { 2: [22, 56], 6: [40, 44] } },
    { ball: [40, 44], ms: 650, carrier: 6, runs: { 10: [64, 44], 9: [78, 36] } },
    { ball: [64, 44], ms: 600, carrier: 10, runs: { dm2: [70, 42] } },
    {
      ball: [80, 37],
      ms: 550,
      carrier: 9,
      runs: { 9: [80, 37], 10: [84, 46], cb2: [82, 40] },
    },
    { ball: [87, 44], ms: 500, carrier: 10, runs: { 10: [87, 44], rb: [90, 48], cb2: [88, 42] } },
    { ball: [105.6, 31.2], ms: 380, shot: true, runs: { gk: [101.5, 36] } },
  ],
];

/** Everyone's position once a beat of a move has played out. */
export function positionsAt(move: Beat[], beat: number): Record<string, Point> {
  const at: Record<string, Point> = { ...Object.fromEntries(Object.entries(HOME)), ...AWAY };
  for (const step of move.slice(0, beat + 1)) Object.assign(at, step.runs ?? {});
  return at;
}

/**
 * Whether the pass made at this beat is offside: when it's played, the receiver is in the
 * opponents' half, ahead of the ball and ahead of the second-last defender (the keeper counts).
 */
export function isOffside(move: Beat[], beat: number) {
  const step = move[beat];
  const before = move[beat - 1];
  if (!before || step.carrier === undefined || step.carrier === before.carrier) return false;
  const at = positionsAt(move, beat - 1);
  const [x] = at[step.carrier];
  const defenders = Object.keys(AWAY)
    .map((id) => at[id][0])
    .sort((a, b) => b - a);
  return x > 52.5 && x > before.ball[0] && x > defenders[1];
}
