import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";

const bodySchema = z.object({
  currentIndex: z.number().int().min(0).optional(),
  correctCount: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  const { currentIndex, correctCount, completed } = parsed.data;

  const session = await prisma.practiceSession.findUnique({ where: { id } });
  if (!session || session.userId !== auth.userId) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  await prisma.practiceSession.update({
    where: { id },
    data: {
      ...(currentIndex != null ? { currentIndex } : {}),
      ...(correctCount != null ? { correctCount } : {}),
      ...(completed ? { completedAt: new Date() } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
