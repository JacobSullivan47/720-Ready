"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useContentBank } from "@/hooks/use-content-bank";
import { FlashcardSession } from "@/components/flashcard-session";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import type { DomainKey, ScenarioKey } from "@/content/types";

function FlashcardsPageInner() {
  const { bank, loading } = useContentBank();
  const router = useRouter();
  const searchParams = useSearchParams();
  const domainParam = searchParams.get("domain") as DomainKey | null;
  const scenarioParam = searchParams.get("scenario") as ScenarioKey | null;

  const [selection, setSelection] = useState<
    { type: "all" } | { type: "domain"; key: DomainKey } | { type: "scenario"; key: ScenarioKey } | null
  >(domainParam ? { type: "domain", key: domainParam } : scenarioParam ? { type: "scenario", key: scenarioParam } : null);

  const filtered = useMemo(() => {
    if (!bank || !selection) return [];
    if (selection.type === "all") return bank.flashcards;
    if (selection.type === "domain") return bank.flashcards.filter((c) => c.domainKey === selection.key);
    return bank.flashcards.filter((c) => c.scenarioKey === selection.key);
  }, [bank, selection]);

  const deckLabel = useMemo(() => {
    if (!selection) return "";
    if (selection.type === "all") return "All terms";
    if (selection.type === "domain") return domains.find((d) => d.key === selection.key)?.name ?? "Domain deck";
    return scenarios.find((s) => s.key === selection.key)?.name ?? "Scenario deck";
  }, [selection]);

  if (loading || !bank) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="h-64 animate-pulse rounded-lg bg-surface-muted" />
      </div>
    );
  }

  if (!selection) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Flashcards</h1>
        <p className="mt-2 text-foreground-muted">Choose a deck to study.</p>

        <button
          onClick={() => setSelection({ type: "all" })}
          className="mt-6 block w-full rounded-lg border border-brand bg-brand-soft p-4 text-left transition-colors hover:opacity-90"
        >
          <span className="font-medium text-brand-strong">All terms</span>
          <span className="ml-2 text-sm text-foreground-muted">{bank.flashcards.length} cards</span>
        </button>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-foreground-muted">By domain</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {domains.map((d) => {
            const count = bank.flashcards.filter((c) => c.domainKey === d.key).length;
            return (
              <button
                key={d.key}
                onClick={() => setSelection({ type: "domain", key: d.key })}
                className="rounded-lg border border-border bg-surface p-3 text-left text-sm transition-colors hover:bg-surface-muted"
              >
                <span className="font-medium">{d.name}</span>
                <span className="ml-2 text-foreground-muted">{count} cards</span>
              </button>
            );
          })}
        </div>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-foreground-muted">By scenario</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {scenarios.map((s) => {
            const count = bank.flashcards.filter((c) => c.scenarioKey === s.key).length;
            return (
              <button
                key={s.key}
                onClick={() => setSelection({ type: "scenario", key: s.key })}
                disabled={count === 0}
                className="rounded-lg border border-border bg-surface p-3 text-left text-sm transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="font-medium">{s.name}</span>
                <span className="ml-2 text-foreground-muted">{count} cards</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <FlashcardSession
        cards={filtered}
        deckLabel={deckLabel}
        onExit={() => {
          setSelection(null);
          router.replace("/study/flashcards");
        }}
      />
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense>
      <FlashcardsPageInner />
    </Suspense>
  );
}
