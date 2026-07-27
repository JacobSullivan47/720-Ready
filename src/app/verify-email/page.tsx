"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyEmailPageInner() {
  const searchParams = useSearchParams();
  const success = searchParams.get("status") === "success";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-12 text-center sm:px-6">
      {success ? (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Email verified</h1>
          <p className="mt-3 text-foreground-muted">Your email address has been confirmed.</p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Verification link invalid</h1>
          <p className="mt-3 text-foreground-muted">
            This link is invalid or has expired. You can request a new one from your account
            page.
          </p>
        </>
      )}
      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-strong"
      >
        Go to dashboard
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailPageInner />
    </Suspense>
  );
}
