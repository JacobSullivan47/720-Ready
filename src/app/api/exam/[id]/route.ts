import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import type { GradedMockExamQuestion } from "@/lib/progress-types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const exam = await prisma.mockExam.findUnique({
    where: { id },
    include: { questions: { include: { question: true }, orderBy: { order: "asc" } } },
  });
  if (!exam || exam.userId !== auth.userId || exam.status !== "COMPLETED") {
    return NextResponse.json({ error: "Completed exam not found." }, { status: 404 });
  }

  const attempts = await prisma.questionAttempt.findMany({ where: { mockExamId: id, userId: auth.userId } });
  const attemptByQuestion = new Map(attempts.map((a) => [a.questionId, a]));

  const questions: GradedMockExamQuestion[] = exam.questions.map(({ question: q }) => {
    const attempt = attemptByQuestion.get(q.id);
    return {
      id: q.id,
      domainKey: q.domainKey,
      scenarioKey: q.scenarioKey ?? undefined,
      type: q.type,
      prompt: q.prompt,
      options: q.options as string[],
      correctIndexes: q.correctIndexes as number[],
      explanation: q.explanation,
      eli10: q.eli10,
      selectedIndexes: (attempt?.selectedIndexes as number[]) ?? [],
      isCorrect: attempt?.isCorrect ?? false,
    };
  });

  return NextResponse.json({
    id: exam.id,
    scenarioKeys: exam.scenarioKeys,
    startedAt: exam.startedAt.toISOString(),
    completedAt: exam.completedAt?.toISOString() ?? null,
    scaledScore: exam.scaledScore,
    passed: exam.passed,
    domainBreakdown: exam.domainBreakdown,
    questions,
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const exam = await prisma.mockExam.findUnique({ where: { id } });
  if (!exam || exam.userId !== auth.userId) {
    return NextResponse.json({ error: "Exam not found." }, { status: 404 });
  }

  // Cascades to MockExamQuestion; QuestionAttempt.mockExamId is SetNull, so
  // the underlying attempt/mastery history is preserved.
  await prisma.mockExam.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
