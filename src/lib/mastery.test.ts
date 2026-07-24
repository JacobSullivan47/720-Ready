import { describe, expect, it } from "vitest";
import { computeCurrentStreak, computeReadiness } from "./mastery";
import { domains } from "@/content/domains";
import type { AttemptRecord } from "./progress-types";

const cardsByDomain = Object.fromEntries(
  domains.map((d) => [d.key, [`${d.key}-1`, `${d.key}-2`, `${d.key}-3`, `${d.key}-4`]]),
) as Record<string, string[]>;

describe("computeReadiness", () => {
  it("gives every domain 0 mastery with no activity", () => {
    const result = computeReadiness(cardsByDomain, {}, []);
    expect(result.overallReadinessPct).toBe(0);
    for (const d of result.domains) expect(d.masteryPct).toBe(0);
  });

  it("weights overall readiness by domain weight, not a plain average", () => {
    // Perfect mastery only in the highest-weighted domain (Agentic Architecture, 27%).
    // Each of 10 questions answered correctly TWICE (mastery requires
    // MASTERY_MIN_REPETITIONS correct answers per question), AND all 4 of
    // that domain's flashcards mastered too — full mastery requires both.
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
    const result = computeReadiness(cardsByDomain, cardStates, attempts);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    expect(agentic.masteryPct).toBe(100);
    expect(agentic.questionsMastered).toBe(10);
    expect(agentic.questionsAttempted).toBe(10);
    // Overall should be well below 100 since 4 other domains are untouched.
    expect(result.overallReadinessPct).toBeLessThan(50);
    expect(result.overallReadinessPct).toBeGreaterThan(0);
  });

  it("caps mastery at 50% when only flashcards (no questions) have been done", () => {
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
    expect(agentic.masteryPct).toBe(50);
  });

  it("caps mastery at 50% when only questions (no flashcards) have been done", () => {
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
    expect(agentic.masteryPct).toBe(50);
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
