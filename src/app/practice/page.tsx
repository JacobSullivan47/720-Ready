"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useContentBank } from "@/hooks/use-content-bank";
import { useProgress } from "@/hooks/use-progress";
import { useTutorDrawer } from "@/components/tutor-drawer-provider";
import { PracticeQuestionCard } from "@/components/practice-question";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import { shuffle } from "@/lib/scoring";
import type { BankQuestion } from "@/lib/content-bank-client";
import type { DomainKey, Difficulty, ScenarioKey } from "@/content/types";
import type { ActivePracticeSession } from "@/lib/progress-types";

interface Session {
  id: string;
  questions: BankQuestion[];
  index: number;
  correct: number;
}

function PracticePageInner() {
  const { bank, loading } = useContentBank();
  const { client } = useProgress();
  const { close: closeTutor } = useTutorDrawer();
  const searchParams = useSearchParams();

  const [domainFilter, setDomainFilter] = useState<DomainKey | "ALL">(
    (searchParams.get("domain") as DomainKey) || "ALL",
  );
  const [scenarioFilter, setScenarioFilter] = useState<ScenarioKey | "ALL">(
    (searchParams.get("scenario") as ScenarioKey) || "ALL",
  );
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "ALL">("ALL");
  const [session, setSession] = useState<Session | null>(null);
  const [activeSession, setActiveSession] = useState<ActivePracticeSession | null>(null);
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!bank) return;
    client.getActivePracticeSession().then(setActiveSession);
  }, [bank, client]);

  useEffect(() => {
    let cancelled = false;
    client.getBookmarks().then((bm) => {
      if (!cancelled) setBookmarkedQuestionIds(new Set(bm.questionIds));
    });
    return () => {
      cancelled = true;
    };
  }, [client]);

  const filtered = useMemo(() => {
    if (!bank) return [];
    return bank.questions.filter((q) => {
      if (domainFilter !== "ALL" && q.domainKey !== domainFilter) return false;
      if (scenarioFilter !== "ALL" && q.scenarioKey !== scenarioFilter) return false;
      if (difficultyFilter !== "ALL" && q.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [bank, domainFilter, scenarioFilter, difficultyFilter]);

  async function startNewSession() {
    const questions = shuffle(filtered);
    const { id } = await client.startPracticeSession(
      questions.map((q) => q.id),
      { domainKey: domainFilter === "ALL" ? undefined : domainFilter,
        scenarioKey: scenarioFilter === "ALL" ? undefined : scenarioFilter,
        difficulty: difficultyFilter === "ALL" ? undefined : difficultyFilter },
    );
    setActiveSession(null);
    setSession({ id, questions, index: 0, correct: 0 });
  }

  async function startBookmarkedSession() {
    if (!bank) return;
    const questions = shuffle(bank.questions.filter((q) => bookmarkedQuestionIds.has(q.id)));
    const { id } = await client.startPracticeSession(questions.map((q) => q.id), {});
    setActiveSession(null);
    setSession({ id, questions, index: 0, correct: 0 });
  }

  function resumeSession() {
    if (!activeSession || !bank) return;
    const byId = new Map(bank.questions.map((q) => [q.id, q]));
    const questions = activeSession.questionIds
      .map((id) => byId.get(id))
      .filter((q): q is BankQuestion => !!q);
    if (questions.length === 0) {
      setActiveSession(null);
      return;
    }
    setSession({
      id: activeSession.id,
      questions,
      index: Math.min(activeSession.currentIndex, questions.length - 1),
      correct: activeSession.correctCount,
    });
    setActiveSession(null);
  }

  async function startOver() {
    if (activeSession) await client.completePracticeSession(activeSession.id);
    setActiveSession(null);
  }

  async function endSession() {
    closeTutor();
    if (session) await client.completePracticeSession(session.id);
    setSession(null);
  }

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
            setSession((s) => {
              if (!s) return s;
              const next = { ...s, correct: isCorrect ? s.correct + 1 : s.correct };
              client
                .updatePracticeSessionProgress(next.id, {
                  currentIndex: next.index,
                  correctCount: next.correct,
                })
                .catch(() => {});
              return next;
            });
          }}
        />
        <div className="mt-5 flex justify-between">
          <button
            onClick={endSession}
            className="text-sm text-foreground-muted hover:text-foreground hover:underline"
          >
            End session
          </button>
          {!isLast ? (
            <button
              onClick={() => {
                closeTutor();
                setSession((s) => {
                  if (!s) return s;
                  const next = { ...s, index: s.index + 1 };
                  client
                    .updatePracticeSessionProgress(next.id, {
                      currentIndex: next.index,
                      correctCount: next.correct,
                    })
                    .catch(() => {});
                  return next;
                });
              }}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Next question →
            </button>
          ) : (
            <button
              onClick={endSession}
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

      {activeSession && (
        <div className="mt-6 rounded-lg border border-brand-soft bg-brand-soft p-5">
          <p className="text-sm font-medium text-brand-strong">Practice session in progress</p>
          <p className="mt-1 text-foreground">
            Question {activeSession.currentIndex + 1} of {activeSession.questionIds.length} ·{" "}
            {activeSession.correctCount} correct so far.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={resumeSession}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-strong"
            >
              Resume session
            </button>
            <button
              onClick={startOver}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
            >
              Start over
            </button>
          </div>
        </div>
      )}

      <button
        onClick={startBookmarkedSession}
        disabled={bookmarkedQuestionIds.size === 0}
        className="mt-6 block w-full rounded-lg border border-accent bg-accent-soft p-4 text-left transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="font-medium text-accent">★ Bookmarked questions</span>
        <span className="ml-2 text-sm text-foreground-muted">{bookmarkedQuestionIds.size} questions</span>
      </button>

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
          onClick={startNewSession}
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
