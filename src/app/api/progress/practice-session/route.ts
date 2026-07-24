import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import type { ActivePracticeSession } from "@/lib/progress-types";
import type { DomainKey, ScenarioKey, Difficulty } from "@/content/types";

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const row = await prisma.practiceSession.findFirst({
    where: { userId: auth.userId, completedAt: null },
    orderBy: { startedAt: "desc" },
  });

  if (!row) return NextResponse.json({ session: null });

  const session: ActivePracticeSession = {
    id: row.id,
    questionIds: row.questionIds as string[],
    currentIndex: row.currentIndex,
    correctCount: row.correctCount,
    filters: {
      domainKey: row.domainFilter ?? undefined,
      scenarioKey: row.scenarioFilter ?? undefined,
      difficulty: row.difficultyFilter ?? undefined,
    },
  };
  return NextResponse.json({ session });
}

const bodySchema = z.object({
  questionIds: z.array(z.string().min(1)).min(1),
  filters: z.object({
    domainKey: z.string().optional(),
    scenarioKey: z.string().optional(),
    difficulty: z.string().optional(),
  }),
});

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  const { questionIds, filters } = parsed.data;

  // Filters are display-only metadata — validate against real content instead
  // of trusting arbitrary client-supplied strings, silently dropping anything
  // that doesn't match a real key rather than erroring the whole request.
  const domainFilter: DomainKey | null =
    filters.domainKey && domains.some((d) => d.key === filters.domainKey)
      ? (filters.domainKey as DomainKey)
      : null;
  const scenarioFilter: ScenarioKey | null =
    filters.scenarioKey && scenarios.some((s) => s.key === filters.scenarioKey)
      ? (filters.scenarioKey as ScenarioKey)
      : null;
  const difficultyFilter: Difficulty | null =
    filters.difficulty && DIFFICULTIES.includes(filters.difficulty as Difficulty)
      ? (filters.difficulty as Difficulty)
      : null;

  // Only one active session per user — starting a new one supersedes the old.
  await prisma.practiceSession.updateMany({
    where: { userId: auth.userId, completedAt: null },
    data: { completedAt: new Date() },
  });

  const created = await prisma.practiceSession.create({
    data: {
      userId: auth.userId,
      questionIds,
      domainFilter,
      scenarioFilter,
      difficultyFilter,
    },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
