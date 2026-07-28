// Loads all structured content under src/content/ into the database.
// Run with `npm run db:seed`. Safe to re-run — every write is an upsert
// keyed on a stable, deterministic ID derived from the content itself, so
// re-seeding after editing a content file updates existing rows instead of
// duplicating them. See src/lib/seed-content.ts for the actual logic —
// this file is just the CLI/local-env wrapper around it (the admin re-seed
// API route is the other caller, for when the DB is a Vercel "Sensitive"
// env var that can't be dotenv-loaded locally at all).
import path from "node:path";
import { config as loadEnv } from "dotenv";

// `npm run db:seed` runs this file directly via tsx, bypassing the Prisma
// CLI's own env loading (prisma.config.ts) — so load .env.local ourselves.
loadEnv({ path: path.join(__dirname, "..", ".env.local") });
loadEnv({ path: path.join(__dirname, "..", ".env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { domains } from "../src/content/domains";
import { scenarios } from "../src/content/scenarios";
import { allFlashcards, allQuestions, seedContent } from "../src/lib/seed-content";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(
    `Seeding ${domains.length} domains, ${scenarios.length} scenarios, ${allFlashcards.length} flashcards, ${allQuestions.length} questions...`,
  );

  const { prunedQuestions, prunedCards } = await seedContent(prisma);
  if (prunedQuestions > 0 || prunedCards > 0) {
    console.log(
      `Pruned ${prunedQuestions} stale question(s) and ${prunedCards} stale flashcard(s) no longer in content.`,
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
