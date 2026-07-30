import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { TutorUnlimitedToggle } from "./TutorUnlimitedToggle";
import { ReseedContentButton } from "./ReseedContentButton";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth();
  // notFound() rather than a redirect/403 — a non-admin (or logged-out
  // visitor) hitting this URL should see an ordinary 404, not a page that
  // reveals an admin area exists here.
  if (!isAdminEmail(session?.user?.email)) notFound();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      tutorUnlimited: true,
      _count: {
        select: {
          questionAttempts: true,
          cardProgress: true,
          mockExams: true,
          exerciseAttempts: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        {users.length} registered account{users.length === 1 ? "" : "s"}.
      </p>

      <div className="mt-6">
        <ReseedContentButton />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-foreground-muted">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Signed up</th>
              <th className="px-4 py-2.5">AI Tutor</th>
              <th className="px-4 py-2.5">Questions answered</th>
              <th className="px-4 py-2.5">Cards reviewed</th>
              <th className="px-4 py-2.5">Mock exams</th>
              <th className="px-4 py-2.5">Exercises</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2.5">{u.name ?? "—"}</td>
                <td className="px-4 py-2.5 text-foreground-muted">{u.email ?? "—"}</td>
                <td className="px-4 py-2.5 text-foreground-muted">
                  {u.createdAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5">
                  <TutorUnlimitedToggle userId={u.id} initialValue={u.tutorUnlimited} />
                </td>
                <td className="px-4 py-2.5">{u._count.questionAttempts}</td>
                <td className="px-4 py-2.5">{u._count.cardProgress}</td>
                <td className="px-4 py-2.5">{u._count.mockExams}</td>
                <td className="px-4 py-2.5">{u._count.exerciseAttempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
