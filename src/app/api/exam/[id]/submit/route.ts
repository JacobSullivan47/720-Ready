import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { computeDomainBreakdown, estimateScaledScore, isPassingScore } from "@/lib/scoring";
import type { GradedMockExamQuestion } from "@/lib/progress-types";

const bodySchema = z.object({
  answers: z.record(z.string(), z.array(z.number().int().min(0))),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  const { answers } = parsed.data;

  const exam = await prisma.mockExam.findUnique({
    where: { id },
    include: { questions: { include: { question: true }, orderBy: { order: "asc" } } },
  });

  if (!exam || exam.userId !== auth.userId) {
    return NextResponse.json({ error: "Exam not found." }, { status: 404 });
  }
  if (exam.status === "COMPLETED") {
    return NextResponse.json({ error: "This exam has already been submitted." }, { status: 409 });
  }

  const graded: GradedMockExamQuestion[] = exam.questions.map(({ question: q }) => {
    const selected = answers[q.id] ?? [];
    const correct = q.correctIndexes as number[];
    const isCorrect =
      selected.length === correct.length &&
      [...selected].sort().every((v, i) => v === [...correct].sort()[i]);
    return {
      id: q.id,
      domainKey: q.domainKey,
      scenarioKey: q.scenarioKey ?? undefined,
      type: q.type,
      prompt: q.prompt,
      options: q.options as string[],
      correctIndexes: correct,
      explanation: q.explanation,
      eli10: q.eli10,
      selectedIndexes: selected,
      isCorrect,
    };
  });

  const correctCount = graded.filter((g) => g.isCorrect).length;
  const scaledScore = estimateScaledScore(correctCount, graded.length);
  const passed = isPassingScore(scaledScore);
  const domainBreakdown = computeDomainBreakdown(
    graded.map((g) => ({ domainKey: g.domainKey, isCorrect: g.isCorrect })),
  );

  await prisma.$transaction([
    prisma.mockExam.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        scaledScore,
        passed,
        domainBreakdown: domainBreakdown as Prisma.InputJsonValue,
      },
    }),
    prisma.questionAttempt.createMany({
      data: graded.map((g) => ({
        userId: auth.userId,
        questionId: g.id,
        mode: "MOCK" as const,
        mockExamId: id,
        selectedIndexes: g.selectedIndexes,
        isCorrect: g.isCorrect,
      })),
    }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.studyLog.upsert({
    where: { userId_date: { userId: auth.userId, date: today } },
    create: { userId: auth.userId, date: today },
    update: {},
  });

  return NextResponse.json({
    id: exam.id,
    scenarioKeys: exam.scenarioKeys,
    startedAt: exam.startedAt.toISOString(),
    completedAt: new Date().toISOString(),
    scaledScore,
    passed,
    domainBreakdown,
    questions: graded,
  });
}
