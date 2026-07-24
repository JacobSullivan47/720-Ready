import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import type { ViewedOverviews } from "@/lib/progress-types";
import type { DomainKey, ScenarioKey } from "@/content/types";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const rows = await prisma.overviewView.findMany({ where: { userId: auth.userId } });
  const result: ViewedOverviews = {
    domainKeys: rows.filter((r) => r.domainKey).map((r) => r.domainKey!),
    scenarioKeys: rows.filter((r) => r.scenarioKey).map((r) => r.scenarioKey!),
  };
  return NextResponse.json(result);
}

const bodySchema = z.object({
  itemType: z.enum(["DOMAIN", "SCENARIO"]),
  key: z.string().min(1),
});

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  const { itemType, key } = parsed.data;

  const isValid =
    itemType === "DOMAIN" ? domains.some((d) => d.key === key) : scenarios.some((s) => s.key === key);
  if (!isValid) return NextResponse.json({ error: `Unknown ${itemType.toLowerCase()}: ${key}` }, { status: 400 });

  if (itemType === "DOMAIN") {
    const domainKey = key as DomainKey;
    const existing = await prisma.overviewView.findUnique({
      where: { userId_domainKey: { userId: auth.userId, domainKey } },
    });
    if (!existing) {
      await prisma.overviewView.create({
        data: { userId: auth.userId, itemType, domainKey },
      });
    }
  } else {
    const scenarioKey = key as ScenarioKey;
    const existing = await prisma.overviewView.findUnique({
      where: { userId_scenarioKey: { userId: auth.userId, scenarioKey } },
    });
    if (!existing) {
      await prisma.overviewView.create({
        data: { userId: auth.userId, itemType, scenarioKey },
      });
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
