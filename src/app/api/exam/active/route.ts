import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const exam = await prisma.mockExam.findFirst({
    where: { userId: auth.userId, status: "IN_PROGRESS" },
    orderBy: { startedAt: "desc" },
    include: { questions: { include: { question: true }, orderBy: { order: "asc" } } },
  });

  if (!exam) return NextResponse.json({ exam: null });

  return NextResponse.json({
    exam: {
      id: exam.id,
      scenarioKeys: exam.scenarioKeys,
      startedAt: exam.startedAt.toISOString(),
      completedAt: null,
      scaledScore: null,
      passed: null,
      domainBreakdown: null,
      timeLimitSec: exam.timeLimitSec,
      answers: exam.answers,
      currentIndex: exam.currentIndex,
      remainingSec: exam.remainingSec,
      questions: exam.questions.map((eq) => ({
        id: eq.question.id,
        domainKey: eq.question.domainKey,
        scenarioKey: eq.question.scenarioKey ?? undefined,
        type: eq.question.type,
        prompt: eq.question.prompt,
        options: eq.question.options as string[],
      })),
    },
  });
}
