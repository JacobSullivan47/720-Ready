import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";

const bodySchema = z.object({
  answers: z.record(z.string(), z.array(z.number().int().min(0))),
  currentIndex: z.number().int().min(0),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  const { answers, currentIndex } = parsed.data;

  const exam = await prisma.mockExam.findUnique({ where: { id } });
  if (!exam || exam.userId !== auth.userId) {
    return NextResponse.json({ error: "Exam not found." }, { status: 404 });
  }
  if (exam.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "This exam is no longer in progress." }, { status: 409 });
  }

  await prisma.mockExam.update({
    where: { id },
    data: { answers, currentIndex },
  });

  return NextResponse.json({ ok: true });
}
