import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";

/**
 * Permanently deletes the signed-in user's account. Every user-owned table
 * (cards, attempts, mock exams, bookmarks, tutor history, exercises,
 * overview views, practice sessions, OAuth accounts/sessions) has
 * onDelete: Cascade on its userId foreign key, so this one call removes
 * everything — nothing further to clean up manually.
 */
export async function DELETE() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  await prisma.user.delete({ where: { id: auth.userId } });

  return NextResponse.json({ ok: true });
}
