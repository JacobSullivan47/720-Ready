import { domains } from "@/content/domains";
import { EXERCISE_ITEMS_BY_DOMAIN } from "@/content/exercises";
import { cardRetentionScore, MASTERY_MIN_REPETITIONS, type SrsState } from "./srs";
import type { AttemptRecord, ExerciseAttemptRecord, MockExamSummary } from "./progress-types";
import type { DomainKey } from "@/content/types";

/** A flashcard counts as individually "mastered" once its retention score crosses this line. */
export const CARD_MASTERY_RETENTION_CUTOFF = 0.75;

/** How much each component contributes to a domain's blended mastery score. Must sum to 1. */
export const MASTERY_WEIGHTS = {
  cards: 0.25,
  quiz: 0.35,
  exercises: 0.15,
  exam: 0.25,
} as const;

export interface DomainMastery {
  domainKey: DomainKey;
  name: string;
  weightPct: number;
  cardRetentionPct: number; // 0-100
  quizAccuracyPct: number; // 0-100 — % of attempted PRACTICE questions "mastered" (answered correctly at least MASTERY_MIN_REPETITIONS times)
  exerciseMasteryPct: number; // 0-100 — % of this domain's exercise items "mastered" (correct at least once)
  examAccuracyPct: number; // 0-100 — correct/total across every completed mock exam's domain breakdown
  masteryPct: number; // 0-100, blended
  cardsReviewed: number;
  cardsMastered: number; // reviewed cards at/above CARD_MASTERY_RETENTION_CUTOFF
  cardsTotal: number;
  attemptsCount: number;
  questionsMastered: number;
  questionsAttempted: number;
  exercisesMastered: number;
  exercisesTotal: number;
  examCorrect: number;
  examTotal: number;
}

export interface ReadinessSummary {
  overallReadinessPct: number; // 0-100
  domains: DomainMastery[];
  weakestDomain: DomainMastery | null;
}

/**
 * Blends flashcard retention (SM-2 state), practice-question mastery,
 * interactive exercise mastery, and mock-exam accuracy into a single 0-100
 * mastery score per domain, weighted per MASTERY_WEIGHTS (questions 35%,
 * flashcards 25%, mock exams 25%, exercises 15%) — a domain with perfect
 * flashcard/question/exercise scores but zero completed mock exams caps out
 * at 75%, not 100%; full mastery requires engaging with all four — then a
 * weight-adjusted overall readiness score. A domain with no activity at all
 * scores 0. Flashcards and questions require repeat success on the
 * individual item level (see MASTERY_MIN_REPETITIONS) — one correct answer
 * or one good flashcard rating isn't mastery on its own. Exercises are the
 * exception: one correct attempt is enough to count an item as mastered.
 * Mock-exam question attempts (mode "MOCK") are excluded from the quiz
 * component — only PRACTICE attempts count there — since mock performance
 * is scored separately via each completed exam's own domain breakdown,
 * aggregated (summed, not just the latest) across every exam taken.
 */
export function computeReadiness(
  cardsByDomain: Record<DomainKey, string[]>, // domainKey -> all card IDs in that domain
  cardStates: Record<string, SrsState>,
  attempts: AttemptRecord[],
  exerciseAttempts: ExerciseAttemptRecord[] = [],
  mockExams: MockExamSummary[] = [],
): ReadinessSummary {
  const attemptsByDomain = new Map<DomainKey, AttemptRecord[]>();
  for (const a of attempts) {
    if (a.mode !== "PRACTICE") continue; // MOCK attempts feed the exam pillar instead
    const list = attemptsByDomain.get(a.domainKey) ?? [];
    list.push(a);
    attemptsByDomain.set(a.domainKey, list);
  }

  const exerciseAttemptsByDomain = new Map<DomainKey, ExerciseAttemptRecord[]>();
  for (const a of exerciseAttempts) {
    const list = exerciseAttemptsByDomain.get(a.domainKey) ?? [];
    list.push(a);
    exerciseAttemptsByDomain.set(a.domainKey, list);
  }

  const examTotalsByDomain = new Map<DomainKey, { correct: number; total: number }>();
  for (const exam of mockExams) {
    if (!exam.completedAt || !exam.domainBreakdown) continue;
    for (const [domainKey, stats] of Object.entries(exam.domainBreakdown) as [
      DomainKey,
      { correct: number; total: number },
    ][]) {
      const running = examTotalsByDomain.get(domainKey) ?? { correct: 0, total: 0 };
      running.correct += stats.correct;
      running.total += stats.total;
      examTotalsByDomain.set(domainKey, running);
    }
  }

  const domainStats: DomainMastery[] = domains.map((d) => {
    const cardIds = cardsByDomain[d.key] ?? [];
    const reviewed = cardIds.filter((id) => cardStates[id]);
    const retentionScores = reviewed.map((id) => cardRetentionScore(cardStates[id]));
    const cardRetentionPct =
      retentionScores.length > 0
        ? (retentionScores.reduce((a, b) => a + b, 0) / retentionScores.length) * 100
        : 0;
    const cardsMastered = retentionScores.filter((score) => score >= CARD_MASTERY_RETENTION_CUTOFF).length;

    const domainAttempts = attemptsByDomain.get(d.key) ?? [];

    // A question only counts as "mastered" once it's been answered correctly
    // at least MASTERY_MIN_REPETITIONS times — a single lucky guess doesn't
    // count, matching how flashcard retention already requires repeat success.
    const correctCountByQuestion = new Map<string, number>();
    const attemptedQuestionIds = new Set<string>();
    for (const a of domainAttempts) {
      attemptedQuestionIds.add(a.questionId);
      if (a.isCorrect) {
        correctCountByQuestion.set(a.questionId, (correctCountByQuestion.get(a.questionId) ?? 0) + 1);
      }
    }
    const questionsAttempted = attemptedQuestionIds.size;
    const questionsMastered = [...correctCountByQuestion.values()].filter(
      (count) => count >= MASTERY_MIN_REPETITIONS,
    ).length;
    const quizAccuracyPct = questionsAttempted > 0 ? (questionsMastered / questionsAttempted) * 100 : 0;

    // Unlike flashcards/questions, an exercise item counts as mastered after
    // a single correct attempt — no repeat-success requirement. Denominator
    // is the domain's total available exercise items (not just attempted
    // ones), since the exercise bank is small and fully enumerable per domain.
    const exerciseItemIds = EXERCISE_ITEMS_BY_DOMAIN[d.key] ?? [];
    const domainExerciseAttempts = exerciseAttemptsByDomain.get(d.key) ?? [];
    const correctExerciseItemIds = new Set(
      domainExerciseAttempts.filter((a) => a.isCorrect).map((a) => a.itemId),
    );
    const exercisesMastered = exerciseItemIds.filter((itemId) => correctExerciseItemIds.has(itemId)).length;
    const exercisesTotal = exerciseItemIds.length;
    const exerciseMasteryPct = exercisesTotal > 0 ? (exercisesMastered / exercisesTotal) * 100 : 0;

    const examStats = examTotalsByDomain.get(d.key);
    const examCorrect = examStats?.correct ?? 0;
    const examTotal = examStats?.total ?? 0;
    const examAccuracyPct = examTotal > 0 ? (examCorrect / examTotal) * 100 : 0;

    // Always blend all four components, even when some have no data yet
    // (0%). Doing nothing but some of flashcards/questions/exercises/mock
    // exams for a domain caps out below 100% — full mastery requires
    // engaging with all four.
    const masteryPct =
      cardRetentionPct * MASTERY_WEIGHTS.cards +
      quizAccuracyPct * MASTERY_WEIGHTS.quiz +
      exerciseMasteryPct * MASTERY_WEIGHTS.exercises +
      examAccuracyPct * MASTERY_WEIGHTS.exam;

    return {
      domainKey: d.key,
      name: d.name,
      weightPct: d.weightPct,
      cardRetentionPct: Math.round(cardRetentionPct),
      quizAccuracyPct: Math.round(quizAccuracyPct),
      exerciseMasteryPct: Math.round(exerciseMasteryPct),
      examAccuracyPct: Math.round(examAccuracyPct),
      masteryPct: Math.round(masteryPct),
      cardsReviewed: reviewed.length,
      cardsMastered,
      cardsTotal: cardIds.length,
      attemptsCount: domainAttempts.length,
      questionsMastered,
      questionsAttempted,
      exercisesMastered,
      exercisesTotal,
      examCorrect,
      examTotal,
    };
  });

  const totalWeight = domainStats.reduce((sum, d) => sum + d.weightPct, 0) || 1;
  const overallReadinessPct = Math.round(
    domainStats.reduce((sum, d) => sum + d.masteryPct * d.weightPct, 0) / totalWeight,
  );

  const weakestDomain = [...domainStats].sort((a, b) => {
    if (a.masteryPct !== b.masteryPct) return a.masteryPct - b.masteryPct;
    return b.weightPct - a.weightPct;
  })[0] ?? null;

  return { overallReadinessPct, domains: domainStats, weakestDomain };
}

/** Longest current streak of consecutive days (ending today or yesterday) with study activity. */
export function computeCurrentStreak(studyDates: string[], today: Date = new Date()): number {
  const set = new Set(studyDates);
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);

  const todayKey = cursor.toISOString().slice(0, 10);
  if (!set.has(todayKey)) {
    // Streak can still be "alive" if the user studied yesterday and just
    // hasn't studied yet today.
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(cursor.toISOString().slice(0, 10))) return 0;
  }

  let streak = 0;
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
