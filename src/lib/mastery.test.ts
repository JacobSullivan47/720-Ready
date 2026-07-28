import { describe, expect, it } from "vitest";
import { computeCurrentStreak, computeReadiness, MASTERY_WEIGHTS } from "./mastery";
import { domains } from "@/content/domains";
import { EXERCISE_ITEMS_BY_DOMAIN } from "@/content/exercises";
import type { AttemptRecord, ExerciseAttemptRecord, MockExamSummary } from "./progress-types";

// A completed mock exam fixture giving 100% accuracy in every domain, used
// to keep the "perfect mastery" test's premise intact now that mock exams
// are their own pillar.
function perfectMockExam(id: string): MockExamSummary {
  return {
    id,
    scenarioKeys: [],
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    scaledScore: 1000,
    passed: true,
    domainBreakdown: Object.fromEntries(
      domains.map((d) => [d.key, { correct: 10, total: 10 }]),
    ) as MockExamSummary["domainBreakdown"],
  };
}

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

describe("MASTERY_WEIGHTS", () => {
  it("is questions 35%, flashcards 25%, mock exams 25%, exercises 15%, summing to 1", () => {
    expect(MASTERY_WEIGHTS).toEqual({ cards: 0.25, quiz: 0.35, exercises: 0.15, exam: 0.25 });
    expect(
      MASTERY_WEIGHTS.cards + MASTERY_WEIGHTS.quiz + MASTERY_WEIGHTS.exercises + MASTERY_WEIGHTS.exam,
    ).toBe(1);
  });
});

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
    // domain's flashcards mastered, all of its exercise items mastered (one
    // correct attempt each), AND a perfect mock exam — full mastery requires
    // engaging with all four.
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
    const mockExams = [perfectMockExam("exam-1")];
    const result = computeReadiness(cardsByDomain, cardStates, attempts, exerciseAttempts, mockExams);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    expect(agentic.masteryPct).toBe(100);
    expect(agentic.questionsMastered).toBe(10);
    expect(agentic.questionsAttempted).toBe(10);
    expect(agentic.exercisesMastered).toBe(agenticExerciseItems.length);
    expect(agentic.examAccuracyPct).toBe(100);
    // Overall should be well below 100 since 4 other domains are untouched.
    expect(result.overallReadinessPct).toBeLessThan(50);
    expect(result.overallReadinessPct).toBeGreaterThan(0);
  });

  it("caps mastery at 25% when only flashcards (no questions, exercises, or mock exams) have been done", () => {
    // Flashcards are weighted 25% of a domain's blended mastery.
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
    expect(agentic.examAccuracyPct).toBe(0);
    expect(agentic.masteryPct).toBe(25);
  });

  it("caps mastery at 35% when only questions (no flashcards, exercises, or mock exams) have been done", () => {
    // Questions are weighted 35% of a domain's blended mastery.
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
    expect(agentic.examAccuracyPct).toBe(0);
    expect(agentic.masteryPct).toBe(35);
  });

  it("caps mastery at 60% when only flashcards and questions (no exercises or mock exams) have been done", () => {
    // 25% (flashcards) + 35% (questions), both maxed; exercises' 15% and exam's 25% shares are untouched.
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
    expect(agentic.examAccuracyPct).toBe(0);
    expect(agentic.masteryPct).toBe(60);
  });

  it("caps mastery at 75% when flashcards, questions, and exercises are maxed but no mock exam has been completed", () => {
    // 25% (flashcards) + 35% (questions) + 15% (exercises), all maxed; the
    // exam pillar's 25% share is untouched with zero completed mock exams.
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
    const exerciseAttempts = masteredExerciseAttempts(agenticExerciseItems);
    const result = computeReadiness(cardsByDomain, cardStates, attempts, exerciseAttempts, []);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    expect(agentic.exerciseMasteryPct).toBe(100);
    expect(agentic.examAccuracyPct).toBe(0);
    expect(agentic.masteryPct).toBe(75);
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

  it("does not count MOCK-mode attempts toward quiz accuracy", () => {
    const attempts: AttemptRecord[] = Array.from({ length: 4 }, (_, i) => i).map((i) => ({
      questionId: `q${i}`,
      domainKey: "AGENTIC_ARCHITECTURE" as const,
      selectedIndexes: [0],
      isCorrect: true,
      mode: "MOCK" as const,
      mockExamId: "exam-1",
      createdAt: new Date().toISOString(),
    }));
    const result = computeReadiness(cardsByDomain, {}, attempts);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    expect(agentic.questionsAttempted).toBe(0);
    expect(agentic.quizAccuracyPct).toBe(0);
  });

  it("only counts the PRACTICE side of a mix of PRACTICE and MOCK attempts on the same question", () => {
    const attempts: AttemptRecord[] = [
      {
        questionId: "q1",
        domainKey: "AGENTIC_ARCHITECTURE",
        selectedIndexes: [0],
        isCorrect: true,
        mode: "MOCK",
        mockExamId: "exam-1",
        createdAt: new Date(2026, 0, 1).toISOString(),
      },
      {
        questionId: "q1",
        domainKey: "AGENTIC_ARCHITECTURE",
        selectedIndexes: [0],
        isCorrect: true,
        mode: "PRACTICE",
        createdAt: new Date(2026, 0, 2).toISOString(),
      },
    ];
    const result = computeReadiness(cardsByDomain, {}, attempts);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    // Only 1 PRACTICE correct answer is on record — not enough to hit
    // MASTERY_MIN_REPETITIONS even though 2 total (PRACTICE + MOCK) exist.
    expect(agentic.questionsAttempted).toBe(1);
    expect(agentic.questionsMastered).toBe(0);
  });

  it("aggregates exam accuracy across every completed mock exam, not just the latest", () => {
    const examOne: MockExamSummary = {
      id: "exam-1",
      scenarioKeys: [],
      startedAt: new Date(2026, 0, 1).toISOString(),
      completedAt: new Date(2026, 0, 1).toISOString(),
      scaledScore: 700,
      passed: false,
      domainBreakdown: { AGENTIC_ARCHITECTURE: { correct: 8, total: 10 } },
    };
    const examTwo: MockExamSummary = {
      id: "exam-2",
      scenarioKeys: [],
      startedAt: new Date(2026, 0, 8).toISOString(),
      completedAt: new Date(2026, 0, 8).toISOString(),
      scaledScore: 900,
      passed: true,
      domainBreakdown: { AGENTIC_ARCHITECTURE: { correct: 9, total: 10 } },
    };
    const result = computeReadiness(cardsByDomain, {}, [], [], [examOne, examTwo]);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    expect(agentic.examCorrect).toBe(17);
    expect(agentic.examTotal).toBe(20);
    expect(agentic.examAccuracyPct).toBe(85);
  });

  it("ignores an in-progress (uncompleted) mock exam in the exam pillar", () => {
    const inProgress: MockExamSummary = {
      id: "exam-in-progress",
      scenarioKeys: [],
      startedAt: new Date().toISOString(),
      completedAt: null,
      scaledScore: null,
      passed: null,
      domainBreakdown: null,
    };
    const result = computeReadiness(cardsByDomain, {}, [], [], [inProgress]);
    const agentic = result.domains.find((d) => d.domainKey === "AGENTIC_ARCHITECTURE")!;
    expect(agentic.examCorrect).toBe(0);
    expect(agentic.examTotal).toBe(0);
    expect(agentic.examAccuracyPct).toBe(0);
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
