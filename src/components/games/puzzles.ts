/**
 * Mate-in-three puzzles for the Chess style, White to move, roughly from easier to harder.
 * `line` is the main line: White's moves (the first one is the only one that works, see
 * puzzles.test.ts) and Black's most stubborn defences in between. White's later moves are
 * accepted whenever they still force mate in time, and the last one whenever it mates.
 *
 * The classic patterns are from chess history; the others were found by searching random
 * attacking positions with the rules engine (src/lib/chess.ts) and kept when the solution is
 * unique.
 */
export interface Puzzle {
  /** Message key (Games.chess.names) for the puzzle's name, shown once it's solved. */
  name:
    | "anastasia"
    | "backRank"
    | "philidor"
    | "damiano"
    | "corridor"
    | "openFile"
    | "quietQueen"
    | "hFile"
    | "quietKnight"
    | "reti";
  /** "Kg1 Qc4 Nf7…": piece letter (uppercase White) and square. */
  setup: string;
  line: string[];
}

export const PUZZLES: Puzzle[] = [
  {
    // 1.Ne7+ Kh8 2.Qxh7+!! Kxh7 3.Rh5#
    name: "anastasia",
    setup: "Kg1 Qh4 Re5 Nd5 Pf2 Pg2 Pa2 kg8 rf8 pf7 pg7 ph7 qa8 pa7",
    line: ["d5e7", "g8h8", "h4h7", "h8h7", "e5h5"],
  },
  {
    // 1.Rxe8+ Kh7 2.Qxf5+ g6 3.Qxf7#
    name: "backRank",
    setup: "Ka1 Qg4 Re4 Pb2 kg8 re8 pf7 pg7 ph6 pf5",
    line: ["e4e8", "g8h7", "g4f5", "g7g6", "f5f7"],
  },
  {
    // 1.Nh6+ (double check) Kh8 2.Qg8+!! Rxg8 3.Nf7# — the smothered mate.
    name: "philidor",
    setup: "Kg1 Qc4 Nf7 Pf2 Pg2 Ph2 kg8 rf8 pa7 pg7 ph7 qa5",
    line: ["f7h6", "g8h8", "c4g8", "f8g8", "h6f7"],
  },
  {
    // 1.Rh8+!! Kxh8 2.Qh1+ Kg8 3.Qh7#
    name: "damiano",
    setup: "Kb1 Qd1 Rh2 Ne6 Pg6 Pa2 Pb3 kg8 rf8 pf7 pa7 pb7 nb8 pf3 bc6",
    line: ["h2h8", "g8h8", "d1h1", "h8g8", "h1h7"],
  },
  {
    // 1.Qe5+ Qf6 2.Qxf6+ Rg7 3.Rb8#
    name: "corridor",
    setup: "Kc1 Qd6 Rb5 Pa2 Pc2 kh8 rg8 qc6 pg6 ph7 pc5",
    line: ["d6e5", "c6f6", "e5f6", "g8g7", "b5b8"],
  },
  {
    // 1.Qe5+ Kf8 2.Qd6+ Ke8 3.Rg8#
    name: "openFile",
    setup: "Ka1 Qg5 Rg1 Bd5 Pa2 Pb2 Pc2 ke8 rd8 qa7 na6 pd7 pf7",
    line: ["g5e5", "e8f8", "e5d6", "f8e8", "g1g8"],
  },
  {
    // 1.Qxe8+ Kh7 2.Qf7! h5 3.Qxg7#
    name: "quietQueen",
    setup: "Ka1 Qa4 Bf6 Nf1 Pa2 Pb2 Pc2 kh8 re8 pg7 ph6",
    line: ["a4e8", "h8h7", "e8f7", "h6h5", "f7g7"],
  },
  {
    // 1.Rxh6+!! gxh6 2.Qxh6+ Kg8 3.Qh7#
    name: "hFile",
    setup: "Kb1 Qh5 Rg6 Rd7 Pa2 Pb2 Pc2 kh8 rf8 qc7 be8 pg7 ph6 pe5",
    line: ["g6h6", "g7h6", "h5h6", "h8g8", "h6h7"],
  },
  {
    // 1.Rxe8+ Qg8 2.Nh5! (threatening Qxg7#) Nc8 3.Qxg7#
    name: "quietKnight",
    setup: "Kc1 Qg1 Re1 Ng3 Pa2 kh8 re8 qd5 nb6 pg7 ph7",
    line: ["e1e8", "d5g8", "g3h5", "b6c8", "g1g7"],
  },
  {
    // Réti – Tartakower, Vienna 1910: 9.Qd8+!! Kxd8 10.Bg5+ (double check) Kc7 11.Bd8#
    name: "reti",
    setup:
      "Kc1 Rd1 Qd3 Bd2 Bf1 Ng1 Rh1 Pa2 Pb2 Pc2 Pf2 Pg2 Ph2 ke8 qe5 ne4 ra8 nb8 bc8 bf8 rh8 pa7 pb7 pc6 pf7 pg7 ph7",
    line: ["d3d8", "e8d8", "d2g5", "d8c7", "g5d8"],
  },
];
