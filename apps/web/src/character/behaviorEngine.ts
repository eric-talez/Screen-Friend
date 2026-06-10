/**
 * Slice 1 behavior engine for the Screen Friend web sandbox.
 *
 * Pure TypeScript finite state machine + weighted random scheduler.
 * No DOM/React dependencies so it can later move into a shared
 * character-engine package and be reused by the desktop shell.
 */

export type CharacterAction = "idle" | "walk" | "lie" | "sleepy" | "sleep" | "stretch";

export type Direction = -1 | 1;

export interface CharacterState {
  /** Current behavior action. */
  action: CharacterAction;
  /** Horizontal position normalized to stage width, 0..1. */
  x: number;
  /** Facing/walking direction. */
  direction: Direction;
  /** Remaining time in the current action, ms. */
  remainingMs: number;
  /** Accumulated drowsiness, 0..1. Drives idle -> sleepy -> sleep. */
  sleepiness: number;
  /** True while a blink micro-event is active. */
  blinking: boolean;
}

export interface BehaviorEngineOptions {
  /** Injectable RNG for testability. Defaults to Math.random. */
  random?: () => number;
  /** Walk speed in stage-widths per second. */
  walkSpeed?: number;
  /** Initial normalized x position. */
  initialX?: number;
}

interface ActionPlan {
  action: CharacterAction;
  durationMs: number;
}

const WALK_SPEED_DEFAULT = 0.055; // stage widths per second: slow, calm.
const EDGE_MARGIN = 0.04;

const BLINK_MIN_GAP_MS = 2_200;
const BLINK_MAX_GAP_MS = 6_500;
const BLINK_DURATION_MS = 140;

/** Sleepiness gained per second for low-energy actions. */
const SLEEPINESS_GAIN_PER_SEC = 0.016;
/** Sleepiness recovered per second while sleeping. */
const SLEEPINESS_RECOVERY_PER_SEC = 0.12;
const SLEEPY_THRESHOLD = 0.62;
const SLEEP_THRESHOLD = 0.85;

function randomBetween(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}

/** Weighted pick. Weights do not need to sum to 1. */
function pickWeighted<T>(random: () => number, entries: Array<[T, number]>): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

export interface BehaviorEngine {
  getState(): Readonly<CharacterState>;
  /** Advance the simulation by dtMs milliseconds. */
  tick(dtMs: number): Readonly<CharacterState>;
}

export function createBehaviorEngine(options: BehaviorEngineOptions = {}): BehaviorEngine {
  const random = options.random ?? Math.random;
  const walkSpeed = options.walkSpeed ?? WALK_SPEED_DEFAULT;

  const state: CharacterState = {
    action: "idle",
    x: options.initialX ?? 0.5,
    direction: 1,
    remainingMs: 1_800,
    sleepiness: 0,
    blinking: false,
  };

  let blinkCooldownMs = randomBetween(random, BLINK_MIN_GAP_MS, BLINK_MAX_GAP_MS);
  let blinkRemainingMs = 0;

  function planNextAction(): ActionPlan {
    // Forced sleep chain takes priority over the random scheduler.
    if (state.action === "sleepy") {
      return { action: "sleep", durationMs: randomBetween(random, 6_000, 12_000) };
    }
    if (state.action === "sleep" && state.sleepiness > 0.25) {
      // Keep napping until rested.
      return { action: "sleep", durationMs: randomBetween(random, 4_000, 8_000) };
    }
    if (state.sleepiness >= SLEEP_THRESHOLD) {
      return { action: "sleepy", durationMs: randomBetween(random, 1_600, 2_600) };
    }

    const sleepyBias = state.sleepiness >= SLEEPY_THRESHOLD ? 2.2 : 0.15;
    const action = pickWeighted<CharacterAction>(random, [
      ["idle", 3],
      ["walk", 3.4],
      ["lie", 1.4],
      ["stretch", 0.8],
      ["sleepy", sleepyBias],
    ]);

    switch (action) {
      case "walk":
        return { action, durationMs: randomBetween(random, 2_400, 6_500) };
      case "lie":
        return { action, durationMs: randomBetween(random, 3_500, 7_000) };
      case "stretch":
        return { action, durationMs: randomBetween(random, 1_200, 2_000) };
      case "sleepy":
        return { action, durationMs: randomBetween(random, 1_600, 2_600) };
      default:
        return { action: "idle", durationMs: randomBetween(random, 1_500, 4_200) };
    }
  }

  function enter(plan: ActionPlan): void {
    state.action = plan.action;
    state.remainingMs = plan.durationMs;
    if (plan.action === "walk") {
      // Occasionally turn around; always turn when hugging an edge.
      if (state.x <= EDGE_MARGIN) state.direction = 1;
      else if (state.x >= 1 - EDGE_MARGIN) state.direction = -1;
      else if (random() < 0.35) state.direction = state.direction === 1 ? -1 : 1;
    }
  }

  function tick(dtMs: number): Readonly<CharacterState> {
    const dtSec = dtMs / 1_000;

    // Blink micro-event runs independently of the action FSM (closed while asleep anyway).
    if (blinkRemainingMs > 0) {
      blinkRemainingMs -= dtMs;
      if (blinkRemainingMs <= 0) state.blinking = false;
    } else {
      blinkCooldownMs -= dtMs;
      if (blinkCooldownMs <= 0 && state.action !== "sleep") {
        state.blinking = true;
        blinkRemainingMs = BLINK_DURATION_MS;
        blinkCooldownMs = randomBetween(random, BLINK_MIN_GAP_MS, BLINK_MAX_GAP_MS);
      }
    }

    // Sleepiness drifts up over time and recovers while sleeping.
    if (state.action === "sleep") {
      state.sleepiness = Math.max(0, state.sleepiness - SLEEPINESS_RECOVERY_PER_SEC * dtSec);
    } else {
      state.sleepiness = Math.min(1, state.sleepiness + SLEEPINESS_GAIN_PER_SEC * dtSec);
    }

    // Movement.
    if (state.action === "walk") {
      state.x += state.direction * walkSpeed * dtSec;
      if (state.x <= EDGE_MARGIN) {
        state.x = EDGE_MARGIN;
        state.direction = 1;
      } else if (state.x >= 1 - EDGE_MARGIN) {
        state.x = 1 - EDGE_MARGIN;
        state.direction = -1;
      }
    }

    state.remainingMs -= dtMs;
    if (state.remainingMs <= 0) {
      enter(planNextAction());
    }

    return state;
  }

  return {
    getState: () => state,
    tick,
  };
}
