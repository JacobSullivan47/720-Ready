// Loads all structured content under src/content/ into the database.
// Run with `npm run db:seed`. Safe to re-run — every write is an upsert
// keyed on a stable, deterministic ID derived from the content itself, so
// re-seeding after editing a content file updates existing rows instead of
// duplicating them.
import path from "node:path";
import { config as loadEnv } from "dotenv";

// `npm run db:seed` runs this file directly via tsx, bypassing the Prisma
// CLI's own env loading (prisma.config.ts) — so load .env.local ourselves.
loadEnv({ path: path.join(__dirname, "..", ".env.local") });
loadEnv({ path: path.join(__dirname, "..", ".env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createHash } from "node:crypto";
import { domains } from "../src/content/domains";
import { scenarios } from "../src/content/scenarios";
import { flashcards as agenticArchitectureCards } from "../src/content/flashcards/agentic-architecture";
import { flashcards as toolDesignMcpCards } from "../src/content/flashcards/tool-design-mcp";
import { flashcards as claudeCodeWorkflowsCards } from "../src/content/flashcards/claude-code-workflows";
import { flashcards as promptEngineeringCards } from "../src/content/flashcards/prompt-engineering";
import { flashcards as contextManagementCards } from "../src/content/flashcards/context-management";
import { questions as agenticArchitectureQuestions } from "../src/content/questions/agentic-architecture";
import { questions as toolDesignMcpQuestions } from "../src/content/questions/tool-design-mcp";
import { questions as claudeCodeWorkflowsQuestions } from "../src/content/questions/claude-code-workflows";
import { questions as promptEngineeringQuestions } from "../src/content/questions/prompt-engineering";
import { questions as contextManagementQuestions } from "../src/content/questions/context-management";
import type { FlashcardSeed, QuestionSeed } from "../src/content/types";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const allFlashcards: FlashcardSeed[] = [
  ...agenticArchitectureCards,
  ...toolDesignMcpCards,
  ...claudeCodeWorkflowsCards,
  ...promptEngineeringCards,
  ...contextManagementCards,
];

const allQuestions: QuestionSeed[] = [
  ...agenticArchitectureQuestions,
  ...toolDesignMcpQuestions,
  ...claudeCodeWorkflowsQuestions,
  ...promptEngineeringQuestions,
  ...contextManagementQuestions,
];

function stableId(prefix: string, parts: string[]): string {
  const hash = createHash("sha256").update(parts.join("::")).digest("hex").slice(0, 24);
  return `${prefix}_${hash}`;
}

async function main() {
  console.log(`Seeding ${domains.length} domains, ${scenarios.length} scenarios, ${allFlashcards.length} flashcards, ${allQuestions.length} questions...`);

  for (const d of domains) {
    await prisma.domain.upsert({
      where: { key: d.key },
      create: { key: d.key, name: d.name, weightPct: d.weightPct, sortOrder: d.sortOrder },
      update: { name: d.name, weightPct: d.weightPct, sortOrder: d.sortOrder },
    });
  }

  for (const s of scenarios) {
    await prisma.scenario.upsert({
      where: { key: s.key },
      create: { key: s.key, name: s.name, sortOrder: s.sortOrder },
      update: { name: s.name, sortOrder: s.sortOrder },
    });
  }

  const validCardIds = new Set<string>();
  const validQuestionIds = new Set<string>();

  let cardIndex = 0;
  for (const c of allFlashcards) {
    const id = stableId("card", [c.domainKey, c.term]);
    validCardIds.add(id);
    await prisma.flashcard.upsert({
      where: { id },
      create: {
        id,
        domainKey: c.domainKey,
        scenarioKey: c.scenarioKey,
        term: c.term,
        definition: c.definition,
        example: c.example,
        difficulty: c.difficulty ?? "MEDIUM",
        sortOrder: cardIndex++,
      },
      update: {
        scenarioKey: c.scenarioKey,
        definition: c.definition,
        example: c.example,
        difficulty: c.difficulty ?? "MEDIUM",
      },
    });
  }

  let questionIndex = 0;
  for (const q of allQuestions) {
    const id = stableId("question", [q.domainKey, q.prompt.slice(0, 80)]);
    validQuestionIds.add(id);
    await prisma.question.upsert({
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
        sortOrder: questionIndex++,
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
  }

  // A prompt/domain edit changes a question's stable ID (see stableId above),
  // which upserts a new row rather than updating the old one in place —
  // otherwise the old row would linger forever and still get served. Same
  // idea for a flashcard whose term changed. Deleting a stale row cascades
  // to any QuestionAttempt/Bookmark/MockExamQuestion tied to that exact old
  // ID (schema-level onDelete: Cascade), which is the intended cleanup here,
  // not a bug — see AGENTS.md's note on prompt edits orphaning attempts.
  const staleQuestions = await prisma.question.deleteMany({
    where: { id: { notIn: [...validQuestionIds] } },
  });
  const staleCards = await prisma.flashcard.deleteMany({
    where: { id: { notIn: [...validCardIds] } },
  });
  if (staleQuestions.count > 0 || staleCards.count > 0) {
    console.log(
      `Pruned ${staleQuestions.count} stale question(s) and ${staleCards.count} stale flashcard(s) no longer in content.`,
    );
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
