import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";

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
