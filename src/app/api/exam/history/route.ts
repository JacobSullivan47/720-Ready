import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const rows = await prisma.mockExam.findMany({
    where: { userId: auth.userId },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      scenarioKeys: r.scenarioKeys,
      startedAt: r.startedAt.toISOString(),
      completedAt: r.completedAt?.toISOString() ?? null,
      scaledScore: r.scaledScore,
      passed: r.passed,
      domainBreakdown: r.domainBreakdown,
    })),
  );
}
