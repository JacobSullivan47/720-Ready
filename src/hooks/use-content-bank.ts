"use client";

import { useEffect, useState } from "react";
import { fetchContentBank, type ContentBank } from "@/lib/content-bank-client";

export function useContentBank() {
  const [bank, setBank] = useState<ContentBank | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchContentBank()
      .then((data) => {
        if (!cancelled) setBank(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load content.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { bank, loading: !bank && !error, error };
}
