"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-danger">Error</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-foreground-muted">
        Sorry about that — this page hit an unexpected error. Try again, or head back to the dashboard.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold hover:bg-surface-muted"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
