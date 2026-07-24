// Simplified SM-2 spaced-repetition scheduler.
//
// Ratings in the UI are binary ("Still learning" / "I knew it"), which we map
// to SM-2 "quality" scores (0-5 scale) before running the standard algorithm.
// Quality < 3 is a lapse: repetitions and interval reset, and lapses++.

export const RATING_STILL_LEARNING = "STILL_LEARNING" as const;
export const RATING_KNEW_IT = "KNEW_IT" as const;
export type Rating = typeof RATING_STILL_LEARNING | typeof RATING_KNEW_IT;

const RATING_TO_QUALITY: Record<Rating, number> = {
  [RATING_STILL_LEARNING]: 2,
  [RATING_KNEW_IT]: 4,
};

export interface SrsState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
}

export const INITIAL_SRS_STATE: SrsState = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
  lapses: 0,
};

export interface SrsResult extends SrsState {
  dueAt: Date;
}

const MIN_EASE_FACTOR = 1.3;

/**
 * Runs one SM-2 step given a 0-5 quality score. Quality < 3 counts as a
 * lapse: repetitions/interval reset to a 1-day relearn interval.
 */
export function scheduleFromQuality(
  state: SrsState,
  quality: number,
  now: Date = new Date(),
): SrsResult {
  if (quality < 0 || quality > 5) {
    throw new RangeError("quality must be between 0 and 5");
  }

  const nextEase = Math.max(
    MIN_EASE_FACTOR,
    state.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  let repetitions: number;
  let intervalDays: number;
  let lapses = state.lapses;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
    if (state.repetitions > 0) lapses += 1;
  } else {
    repetitions = state.repetitions + 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.round(state.intervalDays * nextEase);
  }

  const dueAt = new Date(now);
  dueAt.setDate(dueAt.getDate() + intervalDays);

  return { easeFactor: nextEase, intervalDays, repetitions, lapses, dueAt };
}

/** Convenience wrapper for the two-button UI rating. */
export function scheduleFromRating(
  state: SrsState,
  rating: Rating,
  now: Date = new Date(),
): SrsResult {
  return scheduleFromQuality(state, RATING_TO_QUALITY[rating], now);
}

/** Cards due at or before `now`, soonest first. */
export function sortByDue<T extends { dueAt: Date }>(cards: T[], now: Date = new Date()): T[] {
  return [...cards]
    .filter((c) => c.dueAt.getTime() <= now.getTime())
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
}

/**
 * Retention score in [0, 1] for a single card, used for mastery %.
 * Cards with more successful repetitions and a higher ease factor score
 * higher; a recent lapse pulls the score back down.
 */
export function cardRetentionScore(state: SrsState): number {
  if (state.repetitions === 0) return 0;
  const easeComponent = Math.min(1, (state.easeFactor - MIN_EASE_FACTOR) / (2.8 - MIN_EASE_FACTOR));
  const repComponent = Math.min(1, state.repetitions / 5);
  const lapsePenalty = Math.min(0.5, state.lapses * 0.1);
  return Math.max(0, Math.min(1, 0.5 * easeComponent + 0.5 * repComponent - lapsePenalty));
}
