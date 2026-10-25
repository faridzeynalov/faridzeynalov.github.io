import { describe, expect, it } from "vitest";
import {
  ballAt,
  diveTime,
  handsOf,
  keeperAt,
  resolve,
  strike,
  SPOT,
  type Shot,
} from "@/components/games/penalty-physics";

const shot = (x: number, y: number, duration = 600): Shot => ({
  target: { x, y },
  duration,
  power: 0.6,
});

describe("penalty physics", () => {
  it("saves a shot straight at the keeper, without a dive", () => {
    expect(resolve(shot(150, 84), null)).toBe("saved");
  });

  it("lets a low corner in when the keeper stays put", () => {
    expect(resolve(shot(82, 106), null)).toBe("goal");
  });

  it("saves a low corner with an early dive the right way", () => {
    expect(resolve(shot(82, 106), { target: { x: 82, y: 106 }, start: 0 })).toBe("saved");
  });

  it("is beaten by the same shot when the dive is late", () => {
    expect(resolve(shot(82, 106), { target: { x: 82, y: 106 }, start: 400 })).toBe("goal");
  });

  it("can't reach the top corner, even at full stretch", () => {
    expect(resolve(shot(66, 46, 900), { target: { x: 66, y: 46 }, start: 0 })).toBe("goal");
  });

  it("tells the woodwork, over the bar and wide apart", () => {
    expect(resolve(shot(61, 90), null)).toBe("post");
    expect(resolve(shot(150, 41), null)).toBe("post");
    expect(resolve(shot(150, 25), null)).toBe("over");
    expect(resolve(shot(40, 90), null)).toBe("wide");
  });

  it("brings the keeper back to his line between kicks", () => {
    const standing = keeperAt(null, 500);
    expect(standing.angle).toBe(0);
    expect(handsOf(standing).y).toBeLessThan(standing.feet.y);
  });

  it("dives in a finite time and stays at full stretch after", () => {
    const dive = { target: { x: 82, y: 106 }, start: 0 };
    const time = diveTime(dive.target);
    expect(time).toBeGreaterThan(200);
    expect(time).toBeLessThan(800);
    expect(keeperAt(dive, time).progress).toBe(1);
    expect(keeperAt(dive, time + 500)).toEqual(keeperAt(dive, time));
  });

  it("flies the ball from the spot to its target, smaller as it goes", () => {
    const s = shot(200, 70);
    expect(ballAt(s, 0)).toMatchObject({ x: SPOT.x, y: SPOT.y, scale: 1 });
    const end = ballAt(s, s.duration);
    expect(end.x).toBeCloseTo(200);
    expect(end.y).toBeCloseTo(70);
    expect(end.scale).toBeCloseTo(0.5);
  });

  it("trades accuracy for power, and blazes a maximum-power shot high", () => {
    const sequence = (values: number[]) => {
      let i = 0;
      return () => values[i++ % values.length];
    };
    // The same random draws: a gentle and a full-power strike at the same spot.
    const soft = strike({ x: 150, y: 90 }, 0.4, sequence([0.3, 0.7]));
    const hard = strike({ x: 150, y: 90 }, 1, sequence([0.3, 0.7]));
    expect(hard.duration).toBeLessThan(soft.duration);
    expect(Math.abs(hard.target.x - 150)).toBeGreaterThan(Math.abs(soft.target.x - 150));
    expect(hard.target.y).toBeLessThan(soft.target.y);
  });
});
