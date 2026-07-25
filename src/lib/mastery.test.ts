import { describe, expect, it } from "vitest";
import { computeCurrentStreak, computeReadiness } from "./mastery";
import { domains } from "@/content/domains";
import { EXERCISE_ITEMS_BY_DOMAIN } from "@/content/exercises";
import type { AttemptRecord, ExerciseAttemptRecord } from "./progress-types";

const cardsByDomain = Object.fromEntries(
  domains.map((d) => [d.key, [`${d.key}-1`, `${d.key}-2`, `${d.key}-3`, `${d.key}-4`]]),
) as Record<string, string[]>;

// AGENTIC_ARCHITECTURE has 4 exercise items in the real content bank.
const agenticExerciseItems = EXERCISE_ITEMS_BY_DOMAIN.AGENTIC_ARCHITECTURE!;

function masteredExerciseAttempts(itemIds: string[]): ExerciseAttemptRecord[] {
  // Exercises need just one correct attempt to count as mastered.
  return itemIds.map((itemId) => ({
    itemId,
    domainKey: "AGENTIC_ARCHITECTURE" as const,
    isCorrect: true,
    createdAt: new Date().toISOString(),
  }));
}

describe("computeReadiness", () => {
  it("gives every domain 0 mastery with no activity", () => {
    const result = computeReadiness(cardsByDomain, {}, []);
    expect(result.overallReadinessPct).toBe(0);
    for (const d of result.domains) expect(d.masteryPct).toBe(0);
  });

  it("weights overall readiness by domain weight, not a plain average", () => {
    // Perfect mastery only in the highest-weighted domain (Agentic Architecture, 27%).
    // Each of 10 questions answered correctly TWICE (mastery requires
    // MASTERY_MIN_REPETITIONS correct answers per question), all 4 of that
    // domain's flashcards mastered, AND all of its exercise items mastered
    // (one correct attempt each) — full mastery requires engaging with all three.
    const cardStates = Object.fromEntries(
      cardsByDomain.AGENTIC_ARCHITECTURE.map((id) => [
        id,
        { easeFactor: 2.8, intervalDays: 30, repetitions: 5, lapses: 0 },
      ]),
    );
    const attempts: AttemptRecord[] = Array.from({ length: 10 }, (_, i) => i)
      .flatMap((i) => [i, i])
      .map((i, idx) => ({
        questionId: `q${i}`,
        domainKey: "AGENTIC_ARCHITECTURE" as const,
        selectedIndexes: [0],
        isCorrect: true,
        mode: "PRACTICE" as const,
        createdAt: new Date(Date.now() + idx).toISOString(),
      }));
    const exerciseAttempts = masteredExerciseAttempts(agenticExerciseItems);
    const result = computeReadiness(cardsByDomain, cardStates, attempts, exerciseAttempts);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    expect(agentic.masteryPct).toBe(100);
    expect(agentic.questionsMastered).toBe(10);
    expect(agentic.questionsAttempted).toBe(10);
    expect(agentic.exercisesMastered).toBe(agenticExerciseItems.length);
    // Overall should be well below 100 since 4 other domains are untouched.
    expect(result.overallReadinessPct).toBeLessThan(50);
    expect(result.overallReadinessPct).toBeGreaterThan(0);
  });

  it("caps mastery at ~33% when only flashcards (no questions or exercises) have been done", () => {
    const cardStates = Object.fromEntries(
      cardsByDomain.AGENTIC_ARCHITECTURE.map((id) => [
        id,
        { easeFactor: 2.8, intervalDays: 30, repetitions: 5, lapses: 0 },
      ]),
    );
    const result = computeReadiness(cardsByDomain, cardStates, []);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    expect(agentic.cardRetentionPct).toBe(100);
    expect(agentic.quizAccuracyPct).toBe(0);
    expect(agentic.exerciseMasteryPct).toBe(0);
    expect(agentic.masteryPct).toBe(33);
  });

  it("caps mastery at ~33% when only questions (no flashcards or exercises) have been done", () => {
    const attempts: AttemptRecord[] = Array.from({ length: 4 }, (_, i) => i)
      .flatMap((i) => [i, i])
      .map((i, idx) => ({
        questionId: `q${i}`,
        domainKey: "AGENTIC_ARCHITECTURE" as const,
        selectedIndexes: [0],
        isCorrect: true,
        mode: "PRACTICE" as const,
        createdAt: new Date(Date.now() + idx).toISOString(),
      }));
    const result = computeReadiness(cardsByDomain, {}, attempts);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    expect(agentic.cardRetentionPct).toBe(0);
    expect(agentic.quizAccuracyPct).toBe(100);
    expect(agentic.exerciseMasteryPct).toBe(0);
    expect(agentic.masteryPct).toBe(33);
  });

  it("caps mastery at ~67% when only flashcards and questions (no exercises) have been done", () => {
    const cardStates = Object.fromEntries(
      cardsByDomain.AGENTIC_ARCHITECTURE.map((id) => [
        id,
        { easeFactor: 2.8, intervalDays: 30, repetitions: 5, lapses: 0 },
      ]),
    );
    const attempts: AttemptRecord[] = Array.from({ length: 4 }, (_, i) => i)
      .flatMap((i) => [i, i])
      .map((i, idx) => ({
        questionId: `q${i}`,
        domainKey: "AGENTIC_ARCHITECTURE" as const,
        selectedIndexes: [0],
        isCorrect: true,
        mode: "PRACTICE" as const,
        createdAt: new Date(Date.now() + idx).toISOString(),
      }));
    const result = computeReadiness(cardsByDomain, cardStates, attempts, []);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    expect(agentic.cardRetentionPct).toBe(100);
    expect(agentic.quizAccuracyPct).toBe(100);
    expect(agentic.exerciseMasteryPct).toBe(0);
    expect(agentic.masteryPct).toBe(67);
  });

  it("counts an exercise item as mastered after just one correct attempt", () => {
    const exerciseAttempts: ExerciseAttemptRecord[] = [
      {
        itemId: agenticExerciseItems[0],
        domainKey: "AGENTIC_ARCHITECTURE",
        isCorrect: true,
        createdAt: new Date().toISOString(),
      },
    ];
    const result = computeReadiness(cardsByDomain, {}, [], exerciseAttempts);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    expect(agentic.exercisesMastered).toBe(1);
    expect(agentic.exerciseMasteryPct).toBeGreaterThan(0);
  });

  it("does NOT count an exercise item as mastered with zero correct attempts", () => {
    const exerciseAttempts: ExerciseAttemptRecord[] = [
      {
        itemId: agenticExerciseItems[0],
        domainKey: "AGENTIC_ARCHITECTURE",
        isCorrect: false,
        createdAt: new Date().toISOString(),
      },
    ];
    const result = computeReadiness(cardsByDomain, {}, [], exerciseAttempts);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    expect(agentic.exercisesMastered).toBe(0);
    expect(agentic.exerciseMasteryPct).toBe(0);
  });

  it("counts a flashcard as mastered only once its retention score crosses the 75% cutoff", () => {
    const cardStates = {
      // repetitions=5, ease=2.8 -> retention score 1.0, comfortably above cutoff.
      "AGENTIC_ARCHITECTURE-1": { easeFactor: 2.8, intervalDays: 30, repetitions: 5, lapses: 0 },
      // repetitions=2 (the minimum to score at all), low ease -> retention score well below cutoff.
      "AGENTIC_ARCHITECTURE-2": { easeFactor: 1.3, intervalDays: 1, repetitions: 2, lapses: 0 },
    };
    const result = computeReadiness(cardsByDomain, cardStates, []);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    expect(agentic.cardsReviewed).toBe(2);
    expect(agentic.cardsMastered).toBe(1);
  });

  it("does NOT count a question as mastered after only one correct answer", () => {
    const attempts: AttemptRecord[] = [
      {
        questionId: "q1",
        domainKey: "AGENTIC_ARCHITECTURE",
        selectedIndexes: [0],
        isCorrect: true,
        mode: "PRACTICE",
        createdAt: new Date().toISOString(),
      },
    ];
    const result = computeReadiness(cardsByDomain, {}, attempts);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    expect(agentic.questionsMastered).toBe(0);
    expect(agentic.questionsAttempted).toBe(1);
    expect(agentic.quizAccuracyPct).toBe(0);
    expect(agentic.masteryPct).toBe(0);
  });

  it("counts a question as mastered once answered correctly twice, even with a wrong attempt in between", () => {
    const attempts: AttemptRecord[] = [
      {
        questionId: "q1",
        domainKey: "AGENTIC_ARCHITECTURE",
        selectedIndexes: [0],
        isCorrect: true,
        mode: "PRACTICE",
        createdAt: new Date(2026, 0, 1).toISOString(),
      },
      {
        questionId: "q1",
        domainKey: "AGENTIC_ARCHITECTURE",
        selectedIndexes: [1],
        isCorrect: false,
        mode: "PRACTICE",
        createdAt: new Date(2026, 0, 2).toISOString(),
      },
      {
        questionId: "q1",
        domainKey: "AGENTIC_ARCHITECTURE",
        selectedIndexes: [0],
        isCorrect: true,
        mode: "PRACTICE",
        createdAt: new Date(2026, 0, 3).toISOString(),
      },
    ];
    const result = computeReadiness(cardsByDomain, {}, attempts);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    expect(agentic.questionsMastered).toBe(1);
    expect(agentic.questionsAttempted).toBe(1);
    expect(agentic.quizAccuracyPct).toBe(100);
  });

  it("identifies the weakest domain, tie-breaking toward higher weight", () => {
    const result = computeReadiness(cardsByDomain, {}, []);
    // All domains are tied at 0 mastery; weakest should be the highest-weighted one.
    expect(result.weakestDomain?.domainKey).toBe("AGENTIC_ARCHITECTURE");
  });

  it("blends card retention and quiz accuracy when both are present", () => {
    const cardStates = {
      "AGENTIC_ARCHITECTURE-1": { easeFactor: 2.8, intervalDays: 30, repetitions: 5, lapses: 0 },
    };
    const attempts: AttemptRecord[] = [
      {
        questionId: "q1",
        domainKey: "AGENTIC_ARCHITECTURE",
        selectedIndexes: [0],
        isCorrect: false,
        mode: "PRACTICE",
        createdAt: new Date().toISOString(),
      },
    ];
    const result = computeReadiness(cardsByDomain, cardStates, attempts);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    // High card retention (~100) blended with 0% quiz accuracy should land in between.
    expect(agentic.masteryPct).toBeGreaterThan(0);
    expect(agentic.masteryPct).toBeLessThan(100);
  });
});

describe("computeCurrentStreak", () => {
  it("is 0 with no study dates", () => {
    expect(computeCurrentStreak([])).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    const today = new Date("2026-01-10T12:00:00Z");
    const dates = ["2026-01-08", "2026-01-09", "2026-01-10"];
    expect(computeCurrentStreak(dates, today)).toBe(3);
  });

  it("stays alive if yesterday was studied but today has not happened yet", () => {
    const today = new Date("2026-01-10T08:00:00Z");
    const dates = ["2026-01-08", "2026-01-09"];
    expect(computeCurrentStreak(dates, today)).toBe(2);
  });

  it("resets to 0 if there's a gap", () => {
    const today = new Date("2026-01-10T12:00:00Z");
    const dates = ["2026-01-05", "2026-01-06"];
    expect(computeCurrentStreak(dates, today)).toBe(0);
  });
});
