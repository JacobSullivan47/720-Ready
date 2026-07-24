"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useContentBank } from "@/hooks/use-content-bank";
import { PracticeQuestionCard } from "@/components/practice-question";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import { shuffle } from "@/lib/scoring";
import type { BankQuestion } from "@/lib/content-bank-client";
import type { DomainKey, Difficulty, ScenarioKey } from "@/content/types";

function PracticePageInner() {
  const { bank, loading } = useContentBank();
  const searchParams = useSearchParams();

  const [domainFilter, setDomainFilter] = useState<DomainKey | "ALL">(
    (searchParams.get("domain") as DomainKey) || "ALL",
  );
  const [scenarioFilter, setScenarioFilter] = useState<ScenarioKey | "ALL">(
    (searchParams.get("scenario") as ScenarioKey) || "ALL",
  );
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "ALL">("ALL");
  const [session, setSession] = useState<{ questions: BankQuestion[]; index: number; correct: number } | null>(
    null,
  );

  const filtered = useMemo(() => {
    if (!bank) return [];
    return bank.questions.filter((q) => {
      if (domainFilter !== "ALL" && q.domainKey !== domainFilter) return false;
      if (scenarioFilter !== "ALL" && q.scenarioKey !== scenarioFilter) return false;
      if (difficultyFilter !== "ALL" && q.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [bank, domainFilter, scenarioFilter, difficultyFilter]);

  if (loading || !bank) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="h-64 animate-pulse rounded-lg bg-surface-muted" />
      </div>
    );
  }

  if (session) {
    const current = session.questions[session.index];
    const isLast = session.index === session.questions.length - 1;
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-4 flex items-center justify-between text-sm text-foreground-muted">
          <span>
            Question {session.index + 1} of {session.questions.length}
          </span>
          <span>
            {session.correct} correct so far
          </span>
        </div>
        <PracticeQuestionCard
          key={current.id}
          question={current}
          onAnswered={(isCorrect) => {
            if (isCorrect) setSession((s) => (s ? { ...s, correct: s.correct + 1 } : s));
          }}
        />
        <div className="mt-5 flex justify-between">
          <button
            onClick={() => setSession(null)}
            className="text-sm text-foreground-muted hover:text-foreground hover:underline"
          >
            End session
          </button>
          {!isLast ? (
            <button
              onClick={() => setSession((s) => (s ? { ...s, index: s.index + 1 } : s))}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Next question →
            </button>
          ) : (
            <button
              onClick={() => setSession(null)}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Finish session
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Practice</h1>
      <p className="mt-2 text-foreground-muted">
        Untimed, instant feedback. Filter by domain, scenario, or difficulty, then start a session.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="text-sm">
          <span className="font-medium">Domain</span>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value as DomainKey | "ALL")}
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
          >
            <option value="ALL">All domains</option>
            {domains.map((d) => (
              <option key={d.key} value={d.key}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium">Scenario</span>
          <select
            value={scenarioFilter}
            onChange={(e) => setScenarioFilter(e.target.value as ScenarioKey | "ALL")}
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
          >
            <option value="ALL">All scenarios</option>
            {scenarios.map((s) => (
              <option key={s.key} value={s.key}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium">Difficulty</span>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | "ALL")}
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
          >
            <option value="ALL">All difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </label>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-surface p-4">
        <p className="text-sm text-foreground-muted">
          <strong className="text-foreground">{filtered.length}</strong> question
          {filtered.length === 1 ? "" : "s"} match these filters.
        </p>
        <button
          onClick={() => setSession({ questions: shuffle(filtered), index: 0, correct: 0 })}
          disabled={filtered.length === 0}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-50"
        >
          Start practice
        </button>
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense>
      <PracticePageInner />
    </Suspense>
  );
}
