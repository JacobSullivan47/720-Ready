import { describe, expect, it } from "vitest";
import {
  INITIAL_SRS_STATE,
  MASTERY_MIN_REPETITIONS,
  RATING_KNEW_IT,
  RATING_STILL_LEARNING,
  cardRetentionScore,
  scheduleFromQuality,
  scheduleFromRating,
  sortByDue,
} from "./srs";

describe("scheduleFromQuality", () => {
  it("rejects out-of-range quality", () => {
    expect(() => scheduleFromQuality(INITIAL_SRS_STATE, 6)).toThrow(RangeError);
    expect(() => scheduleFromQuality(INITIAL_SRS_STATE, -1)).toThrow(RangeError);
  });

  it("first successful review sets interval to 1 day", () => {
    const result = scheduleFromQuality(INITIAL_SRS_STATE, 4, new Date("2026-01-01"));
    expect(result.repetitions).toBe(1);
    expect(result.intervalDays).toBe(1);
    expect(result.dueAt.toISOString().slice(0, 10)).toBe("2026-01-02");
  });

  it("second successful review sets interval to 6 days", () => {
    const first = scheduleFromQuality(INITIAL_SRS_STATE, 4, new Date("2026-01-01"));
    const second = scheduleFromQuality(first, 4, new Date("2026-01-02"));
    expect(second.repetitions).toBe(2);
    expect(second.intervalDays).toBe(6);
  });

  it("third+ successful review multiplies interval by ease factor", () => {
    let state = scheduleFromQuality(INITIAL_SRS_STATE, 4, new Date("2026-01-01"));
    state = scheduleFromQuality(state, 4, new Date("2026-01-02"));
    const third = scheduleFromQuality(state, 4, new Date("2026-01-08"));
    expect(third.repetitions).toBe(3);
    expect(third.intervalDays).toBe(Math.round(6 * state.easeFactor));
  });

  it("a lapse (quality < 3) resets repetitions and interval, and increments lapses", () => {
    let state = scheduleFromQuality(INITIAL_SRS_STATE, 4, new Date("2026-01-01"));
    state = scheduleFromQuality(state, 4, new Date("2026-01-02"));
    expect(state.repetitions).toBe(2);

    const lapsed = scheduleFromQuality(state, 1, new Date("2026-01-08"));
    expect(lapsed.repetitions).toBe(0);
    expect(lapsed.intervalDays).toBe(1);
    expect(lapsed.lapses).toBe(1);
  });

  it("a lapse on a never-reviewed card does not count as a lapse", () => {
    const lapsed = scheduleFromQuality(INITIAL_SRS_STATE, 1, new Date("2026-01-01"));
    expect(lapsed.lapses).toBe(0);
  });

  it("ease factor never drops below 1.3", () => {
    let state = INITIAL_SRS_STATE;
    for (let i = 0; i < 20; i++) {
      state = scheduleFromQuality(state, 0, new Date("2026-01-01"));
    }
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("higher quality increases ease factor relative to lower quality", () => {
    const low = scheduleFromQuality(INITIAL_SRS_STATE, 3);
    const high = scheduleFromQuality(INITIAL_SRS_STATE, 5);
    expect(high.easeFactor).toBeGreaterThan(low.easeFactor);
  });
});

describe("scheduleFromRating", () => {
  it("maps STILL_LEARNING to a failing quality (resets on a learned card)", () => {
    let state = scheduleFromRating(INITIAL_SRS_STATE, RATING_KNEW_IT, new Date("2026-01-01"));
    state = scheduleFromRating(state, RATING_KNEW_IT, new Date("2026-01-02"));
    const result = scheduleFromRating(state, RATING_STILL_LEARNING, new Date("2026-01-08"));
    expect(result.repetitions).toBe(0);
    expect(result.lapses).toBe(1);
  });

  it("maps KNEW_IT to a passing quality", () => {
    const result = scheduleFromRating(INITIAL_SRS_STATE, RATING_KNEW_IT, new Date("2026-01-01"));
    expect(result.repetitions).toBe(1);
  });
});

describe("sortByDue", () => {
  it("returns only cards due at or before now, soonest first", () => {
    const now = new Date("2026-01-10");
    const cards = [
      { id: "a", dueAt: new Date("2026-01-05") },
      { id: "b", dueAt: new Date("2026-01-20") },
      { id: "c", dueAt: new Date("2026-01-01") },
    ];
    const result = sortByDue(cards, now);
    expect(result.map((c) => c.id)).toEqual(["c", "a"]);
  });
});

describe("cardRetentionScore", () => {
  it("is 0 for a never-reviewed card", () => {
    expect(cardRetentionScore(INITIAL_SRS_STATE)).toBe(0);
  });

  it("is exactly 0 after only one successful rep — mastery needs at least MASTERY_MIN_REPETITIONS", () => {
    const onceOnly = { easeFactor: 2.8, intervalDays: 1, repetitions: 1, lapses: 0 };
    expect(cardRetentionScore(onceOnly)).toBe(0);
  });

  it("scores above 0 once repetitions reach MASTERY_MIN_REPETITIONS", () => {
    const twice = { easeFactor: 2.5, intervalDays: 6, repetitions: MASTERY_MIN_REPETITIONS, lapses: 0 };
    expect(cardRetentionScore(twice)).toBeGreaterThan(0);
  });

  it("increases with more repetitions and higher ease", () => {
    const few = { easeFactor: 2.5, intervalDays: 6, repetitions: 1, lapses: 0 };
    const many = { easeFactor: 2.8, intervalDays: 30, repetitions: 5, lapses: 0 };
    expect(cardRetentionScore(many)).toBeGreaterThan(cardRetentionScore(few));
  });

  it("is reduced by lapses", () => {
    const clean = { easeFactor: 2.5, intervalDays: 6, repetitions: 3, lapses: 0 };
    const lapsed = { easeFactor: 2.5, intervalDays: 6, repetitions: 3, lapses: 2 };
    expect(cardRetentionScore(lapsed)).toBeLessThan(cardRetentionScore(clean));
  });

  it("never goes below 0 or above 1", () => {
    const extreme = { easeFactor: 1.3, intervalDays: 1, repetitions: 1, lapses: 10 };
    const score = cardRetentionScore(extreme);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});
