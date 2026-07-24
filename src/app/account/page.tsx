"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="h-40 animate-pulse rounded-lg bg-surface-muted" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-3 text-foreground-muted">You&apos;re studying as a guest.</p>
        <Link
          href="/register"
          className="mt-6 inline-block rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          Create an account
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <p className="text-sm text-foreground-muted">Name</p>
        <p className="font-medium">{session?.user?.name ?? "—"}</p>
        <p className="mt-3 text-sm text-foreground-muted">Email</p>
        <p className="font-medium">{session?.user?.email}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-4 w-full rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted"
      >
        Sign out
      </button>
      <p className="mt-6 text-xs text-foreground-muted">
        To delete your account and data, see our{" "}
        <Link href="/legal/privacy" className="text-brand hover:underline">
          Privacy Policy
        </Link>{" "}
        for how to request deletion.
      </p>
    </div>
  );
}
