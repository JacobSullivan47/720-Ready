// Shared by `prisma/seed.ts` (CLI, local/dev) and the admin re-seed API route
// (production, where the DATABASE_URL is a Vercel "Sensitive" env var that
// can never be read out of the dashboard — but the running app can still
// use it fine at runtime). Keep both callers thin wrappers around this.
import type { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import { flashcards as agenticArchitectureCards } from "@/content/flashcards/agentic-architecture";
import { flashcards as toolDesignMcpCards } from "@/content/flashcards/tool-design-mcp";
import { flashcards as claudeCodeWorkflowsCards } from "@/content/flashcards/claude-code-workflows";
import { flashcards as promptEngineeringCards } from "@/content/flashcards/prompt-engineering";
import { flashcards as contextManagementCards } from "@/content/flashcards/context-management";
import { questions as agenticArchitectureQuestions } from "@/content/questions/agentic-architecture";
import { questions as toolDesignMcpQuestions } from "@/content/questions/tool-design-mcp";
import { questions as claudeCodeWorkflowsQuestions } from "@/content/questions/claude-code-workflows";
import { questions as promptEngineeringQuestions } from "@/content/questions/prompt-engineering";
import { questions as contextManagementQuestions } from "@/content/questions/context-management";
import type { FlashcardSeed, QuestionSeed } from "@/content/types";

export const allFlashcards: FlashcardSeed[] = [
  ...agenticArchitectureCards,
  ...toolDesignMcpCards,
  ...claudeCodeWorkflowsCards,
  ...promptEngineeringCards,
  ...contextManagementCards,
];

export const allQuestions: QuestionSeed[] = [
  ...agenticArchitectureQuestions,
  ...toolDesignMcpQuestions,
  ...claudeCodeWorkflowsQuestions,
  ...promptEngineeringQuestions,
  ...contextManagementQuestions,
];

export function stableId(prefix: string, parts: string[]): string {
  const hash = createHash("sha256").update(parts.join("::")).digest("hex").slice(0, 24);
  return `${prefix}_${hash}`;
}

export interface SeedResult {
  domains: number;
  scenarios: number;
  flashcards: number;
  questions: number;
  prunedQuestions: number;
  prunedCards: number;
}

/**
 * Upserts every domain/scenario/flashcard/question, then deletes any
 * flashcard/question row whose stable ID is no longer produced by current
 * content (a prompt or term edit changes the ID — see stableId above — so
 * the old row would otherwise linger forever instead of being replaced).
 * Deleting a stale row cascades to any QuestionAttempt/Bookmark/
 * MockExamQuestion tied to that exact old ID; see AGENTS.md.
 */
export async function seedContent(prisma: PrismaClient): Promise<SeedResult> {
  await Promise.all(
    domains.map((d) =>
      prisma.domain.upsert({
        where: { key: d.key },
        create: { key: d.key, name: d.name, weightPct: d.weightPct, sortOrder: d.sortOrder },
        update: { name: d.name, weightPct: d.weightPct, sortOrder: d.sortOrder },
      }),
    ),
  );

  await Promise.all(
    scenarios.map((s) =>
      prisma.scenario.upsert({
        where: { key: s.key },
        create: { key: s.key, name: s.name, sortOrder: s.sortOrder },
        update: { name: s.name, sortOrder: s.sortOrder },
      }),
    ),
  );

  const cardIds = allFlashcards.map((c) => stableId("card", [c.domainKey, c.term]));
  await Promise.all(
    allFlashcards.map((c, i) => {
      const id = cardIds[i];
      return prisma.flashcard.upsert({
        where: { id },
        create: {
          id,
          domainKey: c.domainKey,
          scenarioKey: c.scenarioKey,
          term: c.term,
          definition: c.definition,
          example: c.example,
          difficulty: c.difficulty ?? "MEDIUM",
          sortOrder: i,
        },
        update: {
          scenarioKey: c.scenarioKey,
          definition: c.definition,
          example: c.example,
          difficulty: c.difficulty ?? "MEDIUM",
        },
      });
    }),
  );

  const questionIds = allQuestions.map((q) => stableId("question", [q.domainKey, q.prompt.slice(0, 80)]));
  await Promise.all(
    allQuestions.map((q, i) => {
      const id = questionIds[i];
      return prisma.question.upsert({
        where: { id },
        create: {
          id,
          domainKey: q.domainKey,
          scenarioKey: q.scenarioKey,
          type: q.type,
          prompt: q.prompt,
          options: q.options,
          correctIndexes: q.correctIndexes,
          explanation: q.explanation,
          eli10: q.eli10,
          difficulty: q.difficulty ?? "MEDIUM",
          sortOrder: i,
        },
        update: {
          scenarioKey: q.scenarioKey,
          type: q.type,
          options: q.options,
          correctIndexes: q.correctIndexes,
          explanation: q.explanation,
          eli10: q.eli10,
          difficulty: q.difficulty ?? "MEDIUM",
        },
      });
    }),
  );

  const [staleQuestions, staleCards] = await Promise.all([
    prisma.question.deleteMany({ where: { id: { notIn: questionIds } } }),
    prisma.flashcard.deleteMany({ where: { id: { notIn: cardIds } } }),
  ]);

  return {
    domains: domains.length,
    scenarios: scenarios.length,
    flashcards: allFlashcards.length,
    questions: allQuestions.length,
    prunedQuestions: staleQuestions.count,
    prunedCards: staleCards.count,
  };
}
