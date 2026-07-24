import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { EXERCISE_ITEM_DOMAIN } from "@/content/exercises";
import type { ExerciseAttemptRecord } from "@/lib/progress-types";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const rows = await prisma.exerciseAttempt.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "asc" },
  });

  const attempts: ExerciseAttemptRecord[] = rows.map((r) => ({
    itemId: r.itemId,
    domainKey: r.domainKey,
    isCorrect: r.isCorrect,
    createdAt: r.createdAt.toISOString(),
  }));
  return NextResponse.json(attempts);
}

const bodySchema = z.object({
  exerciseType: z.enum(["CONFIG_BUILDER", "ANTI_PATTERN_SPOTTER", "SEQUENCING"]),
  itemId: z.string().min(1),
  isCorrect: z.boolean(),
});

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  const { exerciseType, itemId, isCorrect } = parsed.data;

  const domainKey = EXERCISE_ITEM_DOMAIN[itemId];
  if (!domainKey) {
    return NextResponse.json({ error: `Unknown exercise item: ${itemId}` }, { status: 400 });
  }

  await prisma.exerciseAttempt.create({
    data: { userId: auth.userId, exerciseType, itemId, domainKey, isCorrect },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.studyLog.upsert({
    where: { userId_date: { userId: auth.userId, date: today } },
    create: { userId: auth.userId, date: today },
    update: {},
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
