import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public, unauthenticated route: study content is the same for every user
// (guest or signed in). Only per-user progress differs, and that lives
// behind the authenticated /api/progress/* and /api/exam/* routes.
export async function GET() {
  const [flashcards, questions] = await Promise.all([
    prisma.flashcard.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.question.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return NextResponse.json(
    { flashcards, questions },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}
