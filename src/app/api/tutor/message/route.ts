import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import {
  askTutor,
  TUTOR_HISTORY_WINDOW,
  TUTOR_MAX_MESSAGES_PER_DAY,
} from "@/lib/anthropic";
import { buildLearnerContextBlock, resolveFocusContext } from "@/lib/tutor-context";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  focus: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a message." }, { status: 400 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const usedToday = await prisma.tutorMessage.count({
    where: { userId: auth.userId, role: "USER", createdAt: { gte: startOfDay } },
  });
  if (usedToday >= TUTOR_MAX_MESSAGES_PER_DAY) {
    return NextResponse.json(
      {
        error: `You've reached today's limit of ${TUTOR_MAX_MESSAGES_PER_DAY} tutor messages. Please come back tomorrow.`,
      },
      { status: 429 },
    );
  }

  let conversation = await prisma.tutorConversation.findFirst({
    where: { userId: auth.userId },
    orderBy: { createdAt: "asc" },
    include: { messages: { orderBy: { createdAt: "desc" }, take: TUTOR_HISTORY_WINDOW } },
  });

  if (!conversation) {
    conversation = await prisma.tutorConversation.create({
      data: { userId: auth.userId, title: "Study tutor" },
      include: { messages: true },
    });
  }

  const history = [...conversation.messages].reverse().map((m) => ({
    role: m.role.toLowerCase() as "user" | "assistant",
    content: m.content,
  }));
  history.push({ role: "user", content: parsed.data.message });

  const [learnerContext, focusContext] = await Promise.all([
    buildLearnerContextBlock(auth.userId),
    resolveFocusContext(parsed.data.focus),
  ]);

  let reply: string;
  try {
    reply = await askTutor(history, { learnerContext, focusContext });
  } catch (err) {
    console.error("Tutor request failed", err);
    return NextResponse.json(
      { error: "The tutor is temporarily unavailable. Please try again shortly." },
      { status: 502 },
    );
  }

  await prisma.$transaction([
    prisma.tutorMessage.create({
      data: {
        conversationId: conversation.id,
        userId: auth.userId,
        role: "USER",
        content: parsed.data.message,
      },
    }),
    prisma.tutorMessage.create({
      data: {
        conversationId: conversation.id,
        userId: auth.userId,
        role: "ASSISTANT",
        content: reply,
      },
    }),
    prisma.tutorConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    }),
  ]);

  return NextResponse.json({
    reply,
    remainingToday: Math.max(0, TUTOR_MAX_MESSAGES_PER_DAY - usedToday - 1),
  });
}
