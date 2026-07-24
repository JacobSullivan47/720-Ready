import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const rows = await prisma.studyLog.findMany({
    where: { userId: auth.userId },
    orderBy: { date: "desc" },
    take: 400,
  });
  return NextResponse.json(rows.map((r) => r.date.toISOString().slice(0, 10)));
}

export async function POST() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.studyLog.upsert({
    where: { userId_date: { userId: auth.userId, date: today } },
    create: { userId: auth.userId, date: today },
    update: {},
  });
  return NextResponse.json({ ok: true });
}
