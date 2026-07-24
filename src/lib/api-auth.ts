import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** Resolves the current session's user ID, or returns a 401 response to send as-is. */
export async function requireUserId(): Promise<{ userId: string } | { error: NextResponse }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  }
  return { userId: session.user.id };
}
