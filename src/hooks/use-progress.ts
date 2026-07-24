"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { localProgressClient } from "@/lib/progress-local";
import { remoteProgressClient } from "@/lib/progress-remote";
import type { ProgressClient } from "@/lib/progress-types";

/**
 * Returns the right persistence backend for the current auth state:
 * localStorage for guests, API-backed Postgres for signed-in users. Both
 * implement the same ProgressClient interface, so calling code never
 * branches on auth status itself.
 */
export function useProgress(): { client: ProgressClient; status: "loading" | "guest" | "authenticated" } {
  const { status } = useSession();

  const client = useMemo(
    () => (status === "authenticated" ? remoteProgressClient : localProgressClient),
    [status],
  );

  if (status === "loading") return { client, status: "loading" };
  return { client, status: status === "authenticated" ? "authenticated" : "guest" };
}
