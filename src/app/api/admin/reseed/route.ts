import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { seedContent } from "@/lib/seed-content";
import { checkRateLimit } from "@/lib/rate-limit";

// Lets an admin re-seed content from a production deploy, where DATABASE_URL
// is typically a Vercel "Sensitive" env var — visible to the running app,
// but never readable from the dashboard/CLI to run `npm run db:seed`
// locally against it.
export const maxDuration = 60;

export async function POST() {
  const session = await auth();
  const email = session?.user?.email;
  // 404 rather than 401/403 — same rationale as /admin itself: a non-admin
  // shouldn't learn this route exists.
  if (!isAdminEmail(email)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // Defense-in-depth: this does real writes/deletes across the whole content
  // bank, so throttle it even for an authenticated admin (e.g. a compromised
  // session shouldn't be able to hammer the database with it).
  const { allowed } = await checkRateLimit(`admin-reseed:${email}`, {
    max: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many re-seed attempts. Try again later." }, { status: 429 });
  }

  try {
    const result = await seedContent(prisma);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Re-seed failed", err);
    return NextResponse.json({ error: "Re-seed failed. Check server logs." }, { status: 500 });
  }
}
