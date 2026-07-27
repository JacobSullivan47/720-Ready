import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { TUTOR_MAX_MESSAGES_PER_DAY } from "@/lib/anthropic";

export async function GET(request: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const focus = new URL(request.url).searchParams.get("focus");

  const [user, conversation] = await Promise.all([
    prisma.user.findUnique({ where: { id: auth.userId }, select: { tutorUnlimited: true } }),
    prisma.tutorConversation.findFirst({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    }),
  ]);

  // A focus that doesn't match the most recent conversation means a new one
  // will be created on the next message — show an empty thread now rather
  // than a previous, unrelated conversation's history.
  const isStaleFocus = !!focus && conversation?.focus !== focus;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const usedToday = await prisma.tutorMessage.count({
    where: { userId: auth.userId, role: "USER", createdAt: { gte: startOfDay } },
  });

  return NextResponse.json({
    messages: isStaleFocus
      ? []
      : (conversation?.messages.map((m) => ({
          id: m.id,
          role: m.role.toLowerCase(),
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })) ?? []),
    remainingToday: user?.tutorUnlimited ? null : Math.max(0, TUTOR_MAX_MESSAGES_PER_DAY - usedToday),
    limitPerDay: TUTOR_MAX_MESSAGES_PER_DAY,
    unlimited: !!user?.tutorUnlimited,
  });
}
