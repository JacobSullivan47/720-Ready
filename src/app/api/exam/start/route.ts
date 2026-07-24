import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { assembleMockExam, MOCK_EXAM_TIME_LIMIT_SEC, type BankQuestion } from "@/lib/scoring";
import type { ScenarioKey } from "@/content/types";

const ALL_SCENARIOS: ScenarioKey[] = [
  "CUSTOMER_SUPPORT_AGENT",
  "CODE_GENERATION_CLAUDE_CODE",
  "MULTI_AGENT_RESEARCH",
  "DEVELOPER_PRODUCTIVITY_TOOLS",
  "CLAUDE_CODE_CI_CD",
  "STRUCTURED_DATA_EXTRACTION",
];

export async function POST() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const rows = await prisma.question.findMany();
  const bank: BankQuestion[] = rows.map((r) => ({
    id: r.id,
    domainKey: r.domainKey,
    scenarioKey: r.scenarioKey ?? undefined,
    type: r.type,
    prompt: r.prompt,
    options: r.options as string[],
    correctIndexes: r.correctIndexes as number[],
    explanation: r.explanation,
    eli10: r.eli10,
    difficulty: r.difficulty,
  }));

  let assembled;
  try {
    assembled = assembleMockExam(bank, ALL_SCENARIOS);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to assemble exam." },
      { status: 500 },
    );
  }

  const exam = await prisma.mockExam.create({
    data: {
      userId: auth.userId,
      status: "IN_PROGRESS",
      scenarioKeys: assembled.scenarioKeys,
      timeLimitSec: MOCK_EXAM_TIME_LIMIT_SEC,
      questions: {
        create: assembled.questions.map((q, order) => ({
          order,
          questionId: q.id,
        })),
      },
    },
    include: { questions: { include: { question: true }, orderBy: { order: "asc" } } },
  });

  return NextResponse.json({
    id: exam.id,
    scenarioKeys: exam.scenarioKeys,
    startedAt: exam.startedAt.toISOString(),
    completedAt: null,
    scaledScore: null,
    passed: null,
    domainBreakdown: null,
    timeLimitSec: exam.timeLimitSec,
    questions: exam.questions.map((eq) => ({
      id: eq.question.id,
      domainKey: eq.question.domainKey,
      scenarioKey: eq.question.scenarioKey ?? undefined,
      type: eq.question.type,
      prompt: eq.question.prompt,
      options: eq.question.options as string[],
    })),
  });
}
