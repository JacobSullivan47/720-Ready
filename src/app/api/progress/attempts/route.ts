import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import type { AttemptRecord } from "@/lib/progress-types";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const rows = await prisma.questionAttempt.findMany({
    where: { userId: auth.userId },
    include: { question: { select: { domainKey: true } } },
    orderBy: { createdAt: "desc" },
  });

  const attempts: AttemptRecord[] = rows.map((r) => ({
    questionId: r.questionId,
    domainKey: r.question.domainKey,
    selectedIndexes: r.selectedIndexes as number[],
    isCorrect: r.isCorrect,
    mode: r.mode,
    mockExamId: r.mockExamId ?? undefined,
    createdAt: r.createdAt.toISOString(),
  }));
  return NextResponse.json(attempts);
}

const bodySchema = z.object({
  questionId: z.string().min(1),
  domainKey: z.string(),
  selectedIndexes: z.array(z.number().int().min(0)),
  isCorrect: z.boolean(),
  mode: z.enum(["PRACTICE", "MOCK"]),
  mockExamId: z.string().optional(),
});

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  const { questionId, selectedIndexes, isCorrect, mode, mockExamId } = parsed.data;

  await prisma.questionAttempt.create({
    data: {
      userId: auth.userId,
      questionId,
      selectedIndexes,
      isCorrect,
      mode,
      mockExamId,
    },
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
