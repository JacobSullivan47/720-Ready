import { domains } from "@/content/domains";
import { EXERCISE_ITEMS_BY_DOMAIN } from "@/content/exercises";
import { cardRetentionScore, MASTERY_MIN_REPETITIONS, type SrsState } from "./srs";
import type { AttemptRecord, ExerciseAttemptRecord } from "./progress-types";
import type { DomainKey } from "@/content/types";

export interface DomainMastery {
  domainKey: DomainKey;
  name: string;
  weightPct: number;
  cardRetentionPct: number; // 0-100
  quizAccuracyPct: number; // 0-100 — % of attempted questions "mastered" (answered correctly at least MASTERY_MIN_REPETITIONS times)
  exerciseMasteryPct: number; // 0-100 — % of this domain's exercise items "mastered" (correct at least MASTERY_MIN_REPETITIONS times)
  masteryPct: number; // 0-100, blended
  cardsReviewed: number;
  cardsTotal: number;
  attemptsCount: number;
  questionsMastered: number;
  questionsAttempted: number;
  exercisesMastered: number;
  exercisesTotal: number;
}

export interface ReadinessSummary {
  overallReadinessPct: number; // 0-100
  domains: DomainMastery[];
  weakestDomain: DomainMastery | null;
}

/**
 * Blends flashcard retention (SM-2 state), question mastery, and interactive
 * exercise mastery into a single 0-100 mastery score per domain (always an
 * even three-way average — a domain with 100% flashcard retention but zero
 * activity in questions or exercises caps out at 33%, not 100%; full mastery
 * requires engaging with all three), then a weight-adjusted overall readiness
 * score. A domain with no activity at all scores 0. All three inputs also
 * require repeat success on the individual item level (see
 * MASTERY_MIN_REPETITIONS) — one correct answer, one good flashcard rating,
 * or one correct exercise attempt isn't mastery on its own.
 */
export function computeReadiness(
  cardsByDomain: Record<DomainKey, string[]>, // domainKey -> all card IDs in that domain
  cardStates: Record<string, SrsState>,
  attempts: AttemptRecord[],
  exerciseAttempts: ExerciseAttemptRecord[] = [],
): ReadinessSummary {
  const attemptsByDomain = new Map<DomainKey, AttemptRecord[]>();
  for (const a of attempts) {
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

  const domainStats: DomainMastery[] = domains.map((d) => {
    const cardIds = cardsByDomain[d.key] ?? [];
    const reviewed = cardIds.filter((id) => cardStates[id]);
    const retentionScores = reviewed.map((id) => cardRetentionScore(cardStates[id]));
    const cardRetentionPct =
      retentionScores.length > 0
        ? (retentionScores.reduce((a, b) => a + b, 0) / retentionScores.length) * 100
        : 0;

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

    // Same repeat-success rule applied to interactive exercises: an exercise
    // item counts as mastered only once answered correctly at least
    // MASTERY_MIN_REPETITIONS times. Denominator is the domain's total
    // available exercise items (not just attempted ones), since the exercise
    // bank is small and fully enumerable per domain.
    const exerciseItemIds = EXERCISE_ITEMS_BY_DOMAIN[d.key] ?? [];
    const domainExerciseAttempts = exerciseAttemptsByDomain.get(d.key) ?? [];
    const correctCountByExerciseItem = new Map<string, number>();
    for (const a of domainExerciseAttempts) {
      if (a.isCorrect) {
        correctCountByExerciseItem.set(a.itemId, (correctCountByExerciseItem.get(a.itemId) ?? 0) + 1);
      }
    }
    const exercisesMastered = exerciseItemIds.filter(
      (itemId) => (correctCountByExerciseItem.get(itemId) ?? 0) >= MASTERY_MIN_REPETITIONS,
    ).length;
    const exercisesTotal = exerciseItemIds.length;
    const exerciseMasteryPct = exercisesTotal > 0 ? (exercisesMastered / exercisesTotal) * 100 : 0;

    // Always blend all three components, even when some have no data yet
    // (0%). Doing nothing but one or two of flashcards/questions/exercises
    // for a domain caps out below 100% — full mastery requires engaging
    // with all three.
    const masteryPct = (cardRetentionPct + quizAccuracyPct + exerciseMasteryPct) / 3;

    return {
      domainKey: d.key,
      name: d.name,
      weightPct: d.weightPct,
      cardRetentionPct: Math.round(cardRetentionPct),
      quizAccuracyPct: Math.round(quizAccuracyPct),
      exerciseMasteryPct: Math.round(exerciseMasteryPct),
      masteryPct: Math.round(masteryPct),
      cardsReviewed: reviewed.length,
      cardsTotal: cardIds.length,
      attemptsCount: domainAttempts.length,
      questionsMastered,
      questionsAttempted,
      exercisesMastered,
      exercisesTotal,
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
