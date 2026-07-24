import { domains } from "@/content/domains";
import { cardRetentionScore, type SrsState } from "./srs";
import type { AttemptRecord } from "./progress-types";
import type { DomainKey } from "@/content/types";

export interface DomainMastery {
  domainKey: DomainKey;
  name: string;
  weightPct: number;
  cardRetentionPct: number; // 0-100
  quizAccuracyPct: number; // 0-100
  masteryPct: number; // 0-100, blended
  cardsReviewed: number;
  cardsTotal: number;
  attemptsCount: number;
}

export interface ReadinessSummary {
  overallReadinessPct: number; // 0-100
  domains: DomainMastery[];
  weakestDomain: DomainMastery | null;
}

/**
 * Blends flashcard retention (SM-2 state) and quiz accuracy into a single
 * 0-100 mastery score per domain, then a weight-adjusted overall readiness
 * score. A domain with no activity at all scores 0, not an average of
 * nothing, so "what to study next" reliably surfaces untouched domains.
 */
export function computeReadiness(
  cardsByDomain: Record<DomainKey, string[]>, // domainKey -> all card IDs in that domain
  cardStates: Record<string, SrsState>,
  attempts: AttemptRecord[],
): ReadinessSummary {
  const attemptsByDomain = new Map<DomainKey, AttemptRecord[]>();
  for (const a of attempts) {
    const list = attemptsByDomain.get(a.domainKey) ?? [];
    list.push(a);
    attemptsByDomain.set(a.domainKey, list);
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
    const quizAccuracyPct =
      domainAttempts.length > 0
        ? (domainAttempts.filter((a) => a.isCorrect).length / domainAttempts.length) * 100
        : 0;

    const hasCardData = reviewed.length > 0;
    const hasQuizData = domainAttempts.length > 0;
    let masteryPct: number;
    if (hasCardData && hasQuizData) {
      masteryPct = 0.5 * cardRetentionPct + 0.5 * quizAccuracyPct;
    } else if (hasCardData) {
      masteryPct = cardRetentionPct;
    } else if (hasQuizData) {
      masteryPct = quizAccuracyPct;
    } else {
      masteryPct = 0;
    }

    return {
      domainKey: d.key,
      name: d.name,
      weightPct: d.weightPct,
      cardRetentionPct: Math.round(cardRetentionPct),
      quizAccuracyPct: Math.round(quizAccuracyPct),
      masteryPct: Math.round(masteryPct),
      cardsReviewed: reviewed.length,
      cardsTotal: cardIds.length,
      attemptsCount: domainAttempts.length,
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
