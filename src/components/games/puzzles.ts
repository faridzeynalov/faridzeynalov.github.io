/**
 * Mate-in-three puzzles for the Chess style, White to move. `line` is the main line: White's
 * moves (the first one is the only one that works, see puzzles.test.ts) and Black's best
 * defences in between. White's later moves are accepted whenever they still force mate in
 * time, and the last one whenever it mates.
 */
export interface Puzzle {
  /** Message key (Games.chess.names) for the pattern's name, shown once it's solved. */
  name: "anastasia" | "philidor" | "damiano" | "reti";
  /** "Kg1 Qc4 Nf7…": piece letter (uppercase White) and square. */
  setup: string;
  line: string[];
}

export const PUZZLES: Puzzle[] = [
  {
    // 1.Ne7+ Kh8 2.Qxh7+! Kxh7 3.Rh5#
    name: "anastasia",
    setup: "Kg1 Qh4 Re5 Nd5 Pf2 Pg2 Pa2 kg8 rf8 pf7 pg7 ph7 qa8 pa7",
    line: ["d5e7", "g8h8", "h4h7", "h8h7", "e5h5"],
  },
  {
    // 1.Nh6+ (double check) Kh8 2.Qg8+! Rxg8 3.Nf7# — the smothered mate.
    name: "philidor",
    setup: "Kg1 Qc4 Nf7 Pf2 Pg2 Ph2 kg8 rf8 pa7 pg7 ph7 qa5",
    line: ["f7h6", "g8h8", "c4g8", "f8g8", "h6f7"],
  },
  {
    // 1.Rh8+! Kxh8 2.Qh1+ Kg8 3.Qh7#
    name: "damiano",
    setup: "Kb1 Qd1 Rh2 Ne6 Pg6 Pa2 Pb3 kg8 rf8 pf7 pa7 pb7 nb8 pf3 bc6",
    line: ["h2h8", "g8h8", "d1h1", "h8g8", "h1h7"],
  },
  {
    // Réti – Tartakower, Vienna 1910: 9.Qd8+!! Kxd8 10.Bg5+ (double check) Kc7 11.Bd8#
    name: "reti",
    setup:
      "Kc1 Rd1 Qd3 Bd2 Bf1 Ng1 Rh1 Pa2 Pb2 Pc2 Pf2 Pg2 Ph2 ke8 qe5 ne4 ra8 nb8 bc8 bf8 rh8 pa7 pb7 pc6 pf7 pg7 ph7",
    line: ["d3d8", "e8d8", "d2g5", "d8c7", "g5d8"],
  },
];
