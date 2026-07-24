import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { TUTOR_MAX_MESSAGES_PER_DAY } from "@/lib/anthropic";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const conversation = await prisma.tutorConversation.findFirst({
    where: { userId: auth.userId },
    orderBy: { createdAt: "asc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const usedToday = await prisma.tutorMessage.count({
    where: { userId: auth.userId, role: "USER", createdAt: { gte: startOfDay } },
  });

  return NextResponse.json({
    messages:
      conversation?.messages.map((m) => ({
        id: m.id,
        role: m.role.toLowerCase(),
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })) ?? [],
    remainingToday: Math.max(0, TUTOR_MAX_MESSAGES_PER_DAY - usedToday),
    limitPerDay: TUTOR_MAX_MESSAGES_PER_DAY,
  });
}
