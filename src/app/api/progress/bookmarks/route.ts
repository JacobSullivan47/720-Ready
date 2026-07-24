import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const rows = await prisma.bookmark.findMany({ where: { userId: auth.userId } });
  const cardIds = rows.filter((r) => r.cardId).map((r) => r.cardId!);
  const questionIds = rows.filter((r) => r.questionId).map((r) => r.questionId!);
  return NextResponse.json({ cardIds, questionIds });
}

const bodySchema = z.object({
  itemType: z.enum(["FLASHCARD", "QUESTION"]),
  id: z.string().min(1),
});

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  const { itemType, id } = parsed.data;

  const where =
    itemType === "FLASHCARD"
      ? { userId_cardId: { userId: auth.userId, cardId: id } }
      : { userId_questionId: { userId: auth.userId, questionId: id } };

  const existing = await prisma.bookmark.findUnique({ where });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.bookmark.create({
    data: {
      userId: auth.userId,
      itemType,
      cardId: itemType === "FLASHCARD" ? id : undefined,
      questionId: itemType === "QUESTION" ? id : undefined,
    },
  });
  return NextResponse.json({ bookmarked: true });
}
