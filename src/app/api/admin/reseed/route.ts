import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { seedContent } from "@/lib/seed-content";

// Lets an admin re-seed content from a production deploy, where DATABASE_URL
// is typically a Vercel "Sensitive" env var — visible to the running app,
// but never readable from the dashboard/CLI to run `npm run db:seed`
// locally against it.
export const maxDuration = 60;

export async function POST() {
  const session = await auth();
  // 404 rather than 401/403 — same rationale as /admin itself: a non-admin
  // shouldn't learn this route exists.
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const result = await seedContent(prisma);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Re-seed failed", err);
    return NextResponse.json({ error: "Re-seed failed. Check server logs." }, { status: 500 });
  }
}
