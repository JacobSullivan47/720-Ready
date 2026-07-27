"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { DeleteAccountSection } from "@/components/delete-account-section";

export default function AccountPage() {
  const { data: session, status, update } = useSession();
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // Verifying email happens via a link opened in another tab/navigation, so
  // the session JWT cached here can go stale. Re-check once on mount and
  // whenever the user switches back to this tab. `status` itself flips
  // through "loading" as a *side effect* of calling `update()` (they share
  // next-auth's internal loading state), so this must run exactly once and
  // read current values through a ref rather than as effect dependencies —
  // otherwise every completed refresh would re-trigger another one.
  const latest = useRef({ status, emailVerified: session?.user?.emailVerified, update });
  useEffect(() => {
    latest.current = { status, emailVerified: session?.user?.emailVerified, update };
  });

  useEffect(() => {
    function maybeRefresh() {
      const { status, emailVerified, update } = latest.current;
      if (status === "authenticated" && !emailVerified) update();
    }
    maybeRefresh();
    window.addEventListener("focus", maybeRefresh);
    return () => window.removeEventListener("focus", maybeRefresh);
  }, []);

  async function handleResendVerification() {
    setResendState("sending");
    const res = await fetch("/api/auth/resend-verification", { method: "POST" });
    setResendState(res.ok ? "sent" : "error");
  }

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
        <p className="flex items-center gap-2 font-medium">
          {session?.user?.email}
          {session?.user?.emailVerified && (
            <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
              ✓ Verified
            </span>
          )}
        </p>
        {!session?.user?.emailVerified && (
          <div className="mt-3 rounded-md bg-warning-soft px-3 py-2 text-sm text-warning">
            <p>Your email isn&apos;t verified yet.</p>
            {resendState === "sent" ? (
              <p className="mt-1 font-medium">Verification email sent — check your inbox.</p>
            ) : (
              <button
                onClick={handleResendVerification}
                disabled={resendState === "sending"}
                className="mt-1 font-medium underline disabled:opacity-60"
              >
                {resendState === "sending" ? "Sending…" : "Resend verification email"}
              </button>
            )}
            {resendState === "error" && (
              <p className="mt-1 text-danger">Something went wrong. Please try again.</p>
            )}
          </div>
        )}
      </div>
      <div className="mt-4 rounded-lg border border-border bg-surface p-5">
        <p className="text-sm text-foreground-muted">Appearance</p>
        <p className="mt-1 text-xs text-foreground-muted">
          Choose how 720 Ready looks on this device.
        </p>
        <div className="mt-3">
          <ThemeToggle />
        </div>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-4 w-full rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted"
      >
        Sign out
      </button>

      <div className="mt-4">
        <DeleteAccountSection />
      </div>
    </div>
  );
}
