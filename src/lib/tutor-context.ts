import { prisma } from "@/lib/prisma";
import { computeReadiness } from "@/lib/mastery";
import type { SrsState } from "@/lib/srs";
import type { AttemptRecord, ExerciseAttemptRecord } from "@/lib/progress-types";
import type { DomainKey } from "@/content/types";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";

/**
 * Summarizes a user's real progress (mastery per domain, weakest area) as a
 * short text block for the tutor's system prompt — background info to help
 * it tailor answers, not something it should recite back verbatim.
 * Returns null for a brand-new user with no activity yet.
 */
export async function buildLearnerContextBlock(userId: string): Promise<string | null> {
  const [flashcards, cardProgressRows, attemptRows, exerciseRows] = await Promise.all([
    prisma.flashcard.findMany({ select: { id: true, domainKey: true } }),
    prisma.cardProgress.findMany({ where: { userId } }),
    prisma.questionAttempt.findMany({
      where: { userId },
      include: { question: { select: { domainKey: true } } },
    }),
    prisma.exerciseAttempt.findMany({ where: { userId } }),
  ]);

  if (cardProgressRows.length === 0 && attemptRows.length === 0 && exerciseRows.length === 0) {
    return null;
  }

  const cardsByDomain: Record<DomainKey, string[]> = {} as Record<DomainKey, string[]>;
  for (const card of flashcards) {
    (cardsByDomain[card.domainKey] ??= []).push(card.id);
  }

  const cardStates: Record<string, SrsState> = {};
  for (const row of cardProgressRows) {
    cardStates[row.cardId] = {
      easeFactor: row.easeFactor,
      intervalDays: row.intervalDays,
      repetitions: row.repetitions,
      lapses: row.lapses,
    };
  }

  const attempts: AttemptRecord[] = attemptRows.map((r) => ({
    questionId: r.questionId,
    domainKey: r.question.domainKey,
    selectedIndexes: r.selectedIndexes as number[],
    isCorrect: r.isCorrect,
    mode: r.mode,
    mockExamId: r.mockExamId ?? undefined,
    createdAt: r.createdAt.toISOString(),
  }));

  const exerciseAttempts: ExerciseAttemptRecord[] = exerciseRows.map((r) => ({
    itemId: r.itemId,
    domainKey: r.domainKey,
    isCorrect: r.isCorrect,
    createdAt: r.createdAt.toISOString(),
  }));

  const readiness = computeReadiness(cardsByDomain, cardStates, attempts, exerciseAttempts);

  const lines = [
    "Learner's current progress in this app (background info to help you tailor explanations and suggestions to their actual weak spots — don't just recite these numbers back verbatim):",
    `- Overall readiness: ${readiness.overallReadinessPct}%`,
    ...readiness.domains.map(
      (d) => `- ${d.name} (${d.weightPct}% of exam): ${d.masteryPct}% mastery`,
    ),
  ];
  if (readiness.weakestDomain) {
    lines.push(`- Weakest area: ${readiness.weakestDomain.name}`);
  }
  return lines.join("\n");
}

/**
 * Resolves a client-supplied `focus` key (e.g. "domain:AGENTIC_ARCHITECTURE",
 * "scenario:CUSTOMER_SUPPORT_AGENT", "question:<id>") into a short context
 * block for the tutor's system prompt. Only the key is trusted — the actual
 * name/summary/prompt text is always looked up server-side against real
 * content, never taken from the client. Returns null for a missing or
 * unresolvable focus (fails silently — the chat just proceeds without it).
 */
export async function resolveFocusContext(focus: string | undefined): Promise<string | null> {
  if (!focus) return null;
  const separatorIndex = focus.indexOf(":");
  if (separatorIndex === -1) return null;
  const kind = focus.slice(0, separatorIndex);
  const key = focus.slice(separatorIndex + 1);
  if (!key) return null;

  if (kind === "domain") {
    const domain = domains.find((d) => d.key === key);
    if (!domain) return null;
    return `The learner is currently looking at the domain overview for "${domain.name}": ${domain.summary}`;
  }

  if (kind === "scenario") {
    const scenario = scenarios.find((s) => s.key === key);
    if (!scenario) return null;
    return `The learner is currently looking at the scenario overview for "${scenario.name}": ${scenario.summary}`;
  }

  if (kind === "question") {
    const question = await prisma.question.findUnique({ where: { id: key } });
    if (!question) return null;
    return [
      "The learner just answered this practice question incorrectly and wants it explained further:",
      `Question: ${question.prompt}`,
      `Options: ${(question.options as string[]).join(" | ")}`,
      `Correct answer explanation: ${question.explanation}`,
    ].join("\n");
  }

  return null;
}
