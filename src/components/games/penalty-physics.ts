/**
 * The penalty shoot-out's physics, in the scene's coordinates (an SVG viewBox of 300×200 seen
 * from behind the penalty spot): the ball's flight, the keeper's dive and who wins.
 *
 * The goal mouth spans x 60–240 and y 40 (crossbar) to 120 (goal line). The keeper is a body
 * of a given length standing on his feet; diving, he steps across, leaves the ground for high
 * balls, leans over and stretches, and only so far and so fast: a shot into the top corner can
 * beat a full-stretch dive, a late dive doesn't get there.
 */

export interface Vec {
  x: number;
  y: number;
}

export type Outcome = "goal" | "saved" | "post" | "wide" | "over";

export interface Shot {
  /** Where it crosses the goal line. */
  target: Vec;
  /** Flight time to the goal line, in ms. */
  duration: number;
  /** 0–1: faster, flatter and less accurate as it grows. */
  power: number;
}

export interface Dive {
  /** The point the keeper throws his hands at. */
  target: Vec;
  /** When he sets off, in ms after the ball is struck (negative: he went early). */
  start: number;
}

export interface KeeperPose {
  feet: Vec;
  /** Lean from upright, in degrees (negative: to the left). */
  angle: number;
  /** Feet to hands. */
  length: number;
  /** 0 standing – 1 at full stretch. */
  progress: number;
}

export const SPOT: Vec = { x: 150, y: 178 };
export const GOAL = { left: 60, right: 240, top: 40, line: 120 } as const;
/** How close to a post or the bar (centre to centre) the ball hits the woodwork. */
const WOODWORK = 4.5;
/** The keeper on his line, ready. */
export const FEET: Vec = { x: 150, y: 120 };
export const STANDING = 38;
const MAX_STEP = 22;
const MAX_STRETCH = 64;
/** How fast the hands travel (px per ms), and how long a dive takes to get going. */
const HAND_SPEED = 0.2;
const DIVE_WIND_UP = 120;
/** A ball this close to the gloves, or to the body, is saved. */
const GLOVE_REACH = 15;
const BODY_REACH = 9;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const distance = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);

/** A normally distributed random number (mean 0, deviation 1). */
function gaussian(random: () => number) {
  const u = Math.max(random(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
}

export const handsOf = (pose: KeeperPose): Vec => {
  const radians = (pose.angle * Math.PI) / 180;
  return {
    x: pose.feet.x + pose.length * Math.sin(radians),
    y: pose.feet.y - pose.length * Math.cos(radians),
  };
};

const STANDING_HANDS = handsOf({ feet: FEET, angle: 0, length: STANDING, progress: 0 });

/** The keeper at full stretch towards a point: as far as his step, spring and reach allow. */
function fullStretch(target: Vec): Omit<KeeperPose, "progress"> {
  const feet = {
    x: FEET.x + clamp((target.x - FEET.x) * 0.3, -MAX_STEP, MAX_STEP),
    // He springs off the ground for high balls.
    y: FEET.y - (target.y < 72 ? 10 : 0),
  };
  const dx = target.x - feet.x;
  const dy = feet.y - target.y;
  return {
    feet,
    angle: (Math.atan2(dx, Math.max(dy, 0)) * 180) / Math.PI,
    length: clamp(Math.hypot(dx, dy), 30, MAX_STRETCH),
  };
}

/** How long a dive takes from the line to full stretch. */
export function diveTime(target: Vec) {
  return (
    DIVE_WIND_UP +
    distance(STANDING_HANDS, handsOf({ ...fullStretch(target), progress: 1 })) / HAND_SPEED
  );
}

/** The keeper's pose t ms after the ball was struck. */
export function keeperAt(dive: Dive | null, t: number): KeeperPose {
  if (!dive) return { feet: FEET, angle: 0, length: STANDING, progress: 0 };
  const final = fullStretch(dive.target);
  const progress = clamp((t - dive.start) / diveTime(dive.target));
  // Explosive off the line, slowing into the stretch.
  const e = 1 - (1 - progress) ** 2;
  return {
    feet: { x: lerp(FEET.x, final.feet.x, e), y: lerp(FEET.y, final.feet.y, e) },
    angle: lerp(0, final.angle, e),
    length: lerp(STANDING, final.length, e),
    progress,
  };
}

function distanceToSegment(p: Vec, a: Vec, b: Vec) {
  const length = distance(a, b) ** 2;
  if (length === 0) return distance(p, a);
  const t = clamp(((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / length);
  return distance(p, { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
}

/** Where the ball ends up: off target, off the woodwork, saved, or in. */
export function resolve(shot: Shot, dive: Dive | null): Outcome {
  const { x, y } = shot.target;
  if (y < GOAL.top - WOODWORK) return "over";
  if (x < GOAL.left - WOODWORK || x > GOAL.right + WOODWORK) return "wide";
  const nearPost = Math.abs(x - GOAL.left) <= WOODWORK || Math.abs(x - GOAL.right) <= WOODWORK;
  if (nearPost || Math.abs(y - GOAL.top) <= WOODWORK) return "post";
  const pose = keeperAt(dive, shot.duration);
  const hands = handsOf(pose);
  if (distance(hands, shot.target) < GLOVE_REACH) return "saved";
  if (distanceToSegment(shot.target, pose.feet, hands) < BODY_REACH) return "saved";
  return "goal";
}

/** The ball in flight: along its arc towards the goal, smaller as it goes. */
export function ballAt(shot: Shot, t: number) {
  const u = clamp(t / shot.duration);
  // It slows a little through the air.
  const e = 1 - (1 - u) ** 1.25;
  const arc = 6 + 16 * (1 - shot.power);
  const ground = lerp(SPOT.y, GOAL.line, e);
  return {
    x: lerp(SPOT.x, shot.target.x, e),
    y: lerp(SPOT.y, shot.target.y, e) - arc * Math.sin(Math.PI * u),
    /** Its shadow, straight below it on the grass. */
    ground,
    scale: 1 - 0.5 * e,
    spin: u * (360 + shot.power * 900),
  };
}

/** The ball after it reaches the goal: into the net, back off the keeper, off the woodwork… */
export function ballAfter(shot: Shot, outcome: Outcome, t: number) {
  const u = clamp(t / 650);
  const { x, y } = shot.target;
  const side = x < SPOT.x ? -1 : 1;
  switch (outcome) {
    case "goal":
      // Into the back of the net, then down.
      return {
        x: x + (x - SPOT.x) * 0.05 * u,
        y: lerp(y, GOAL.line - 2, u ** 2),
        scale: 0.5 - 0.06 * u,
        opacity: 1,
      };
    case "saved":
      // Parried away, coming back towards the camera.
      return {
        x: x + side * 48 * u,
        y: y - 16 * Math.sin(Math.PI * u) + 46 * u,
        scale: 0.5 + 0.28 * u,
        opacity: 1,
      };
    case "post":
      // Off the woodwork and away.
      return { x: x - side * 26 * u, y: y + 52 * u, scale: 0.5 + 0.22 * u, opacity: 1 };
    default:
      // On past the goal, into the crowd.
      return {
        x: x + (x - SPOT.x) * 0.3 * u,
        y: y - (outcome === "over" ? 30 : 6) * u,
        scale: 0.5 - 0.12 * u,
        opacity: 1 - u,
      };
  }
}

/** Your shot: aimed at a point, struck with some power. Power costs accuracy, and too much
 * of it lifts the ball; a soft one dips. */
export function strike(aim: Vec, power: number, random: () => number = Math.random): Shot {
  const spread = 4 + 22 * power ** 2;
  return {
    target: {
      x: aim.x + gaussian(random) * spread,
      y:
        aim.y +
        gaussian(random) * spread * 0.8 -
        Math.max(0, power - 0.72) * 95 +
        Math.max(0, 0.25 - power) * 60,
    },
    duration: lerp(820, 430, power),
    power,
  };
}

/** Spots a penalty taker aims for, and how often: mostly low corners, rarely the middle. */
const ZONES: { at: Vec; weight: number }[] = [
  { at: { x: 82, y: 104 }, weight: 0.24 },
  { at: { x: 218, y: 104 }, weight: 0.24 },
  { at: { x: 78, y: 54 }, weight: 0.12 },
  { at: { x: 222, y: 54 }, weight: 0.12 },
  { at: { x: 150, y: 100 }, weight: 0.14 },
  { at: { x: 150, y: 60 }, weight: 0.06 },
  { at: { x: 116, y: 80 }, weight: 0.04 },
  { at: { x: 184, y: 80 }, weight: 0.04 },
];

function pickZone(random: () => number) {
  let r = random() * ZONES.reduce((sum, zone) => sum + zone.weight, 0);
  for (const zone of ZONES) {
    r -= zone.weight;
    if (r <= 0) return zone.at;
  }
  return ZONES[0].at;
}

/** The computer keeper: mostly guesses a side early, sometimes reads a slower shot. */
export function keeperGuess(shot: Shot, random: () => number = Math.random): Dive {
  if (random() < 0.08) return { target: { x: 150, y: 84 }, start: 60 };
  if (random() < 0.22 + 0.35 * (1 - shot.power)) {
    return {
      target: {
        x: shot.target.x + gaussian(random) * 14,
        y: shot.target.y + gaussian(random) * 10,
      },
      start: 210 + random() * 60,
    };
  }
  return { target: pickZone(random), start: 20 + random() * 60 };
}

/** The rival's penalty: a spot, a power, the usual inaccuracy. Slower than yours, so you can
 * react in goal. */
export function rivalStrike(random: () => number = Math.random): Shot {
  const aim = pickZone(random);
  const power = 0.45 + random() * 0.4;
  const spread = 7 + 10 * power;
  return {
    target: { x: aim.x + gaussian(random) * spread, y: aim.y + gaussian(random) * spread * 0.7 },
    duration: lerp(980, 640, power),
    power,
  };
}
