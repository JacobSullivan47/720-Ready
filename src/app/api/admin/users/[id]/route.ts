import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  tutorUnlimited: z.boolean(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  // 404 rather than 401/403 — same rationale as /admin itself: a non-admin
  // shouldn't learn this route exists.
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { tutorUnlimited: parsed.data.tutorUnlimited },
    select: { id: true, tutorUnlimited: true },
  }).catch(() => null);

  if (!user) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, tutorUnlimited: user.tutorUnlimited });
}
