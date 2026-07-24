import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { INITIAL_SRS_STATE, scheduleFromRating } from "@/lib/srs";
import type { SrsState } from "@/lib/srs";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const rows = await prisma.cardProgress.findMany({ where: { userId: auth.userId } });
  const map: Record<string, SrsState> = {};
  for (const row of rows) {
    map[row.cardId] = {
      easeFactor: row.easeFactor,
      intervalDays: row.intervalDays,
      repetitions: row.repetitions,
      lapses: row.lapses,
    };
  }
  return NextResponse.json(map);
}

const bodySchema = z.object({
  cardId: z.string().min(1),
  rating: z.enum(["STILL_LEARNING", "KNEW_IT"]),
});

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  const { cardId, rating } = parsed.data;

  const existing = await prisma.cardProgress.findUnique({
    where: { userId_cardId: { userId: auth.userId, cardId } },
  });
  const prevState: SrsState = existing ?? INITIAL_SRS_STATE;
  const result = scheduleFromRating(prevState, rating);

  await prisma.cardProgress.upsert({
    where: { userId_cardId: { userId: auth.userId, cardId } },
    create: {
      userId: auth.userId,
      cardId,
      easeFactor: result.easeFactor,
      intervalDays: result.intervalDays,
      repetitions: result.repetitions,
      lapses: result.lapses,
      dueAt: result.dueAt,
      lastRating: rating === "KNEW_IT" ? 1 : 0,
    },
    update: {
      easeFactor: result.easeFactor,
      intervalDays: result.intervalDays,
      repetitions: result.repetitions,
      lapses: result.lapses,
      dueAt: result.dueAt,
      lastRating: rating === "KNEW_IT" ? 1 : 0,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.studyLog.upsert({
    where: { userId_date: { userId: auth.userId, date: today } },
    create: { userId: auth.userId, date: today },
    update: {},
  });

  const responseState: SrsState = {
    easeFactor: result.easeFactor,
    intervalDays: result.intervalDays,
    repetitions: result.repetitions,
    lapses: result.lapses,
  };
  return NextResponse.json(responseState);
}
