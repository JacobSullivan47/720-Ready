"use client";

import { useState } from "react";

interface ReseedResult {
  domains: number;
  scenarios: number;
  flashcards: number;
  questions: number;
  prunedQuestions: number;
  prunedCards: number;
}

export function ReseedContentButton() {
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<ReseedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    const ok = window.confirm(
      "Re-seed content from source? This upserts every domain/scenario/flashcard/question from the current codebase into this database, and deletes any question/flashcard no longer present in the source content (along with any attempts/bookmarks tied to those exact rows). This can't be undone.",
    );
    if (!ok) return;

    setState("running");
    setError(null);
    try {
      const res = await fetch("/api/admin/reseed", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setResult(data);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="font-medium">Re-seed content</p>
      <p className="mt-1 text-sm text-foreground-muted">
        Loads the current codebase&apos;s domains, scenarios, flashcards, and questions into this
        database, and removes any that are no longer in the source content.
      </p>
      <button
        onClick={run}
        disabled={state === "running"}
        className="mt-3 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-60"
      >
        {state === "running" ? "Re-seeding…" : "Re-seed content from source"}
      </button>

      {state === "done" && result && (
        <p className="mt-3 rounded-md bg-success-soft px-3 py-2 text-sm text-success">
          Seeded {result.domains} domains, {result.scenarios} scenarios, {result.flashcards} flashcards,{" "}
          {result.questions} questions. Pruned {result.prunedQuestions} stale question(s) and{" "}
          {result.prunedCards} stale flashcard(s).
        </p>
      )}
      {state === "error" && error && (
        <p role="alert" className="mt-3 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
