"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useProgress } from "@/hooks/use-progress";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import { PASSING_SCALED_SCORE, TOTAL_MOCK_QUESTIONS } from "@/lib/scoring";
import { ProgressBar } from "@/components/progress-bar";
import { ShareScoreCard } from "@/components/share-score-card";
import type {
  MockExamInProgress,
  MockExamResult,
  MockExamSummary,
} from "@/lib/progress-types";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function domainName(key: string): string {
  return domains.find((d) => d.key === key)?.name ?? key;
}

function scenarioName(key: string): string {
  return scenarios.find((s) => s.key === key)?.name ?? key;
}

function secondsRemaining(exam: MockExamInProgress): number {
  const elapsed = Math.floor((Date.now() - new Date(exam.startedAt).getTime()) / 1000);
  return exam.timeLimitSec - elapsed;
}

export default function ExamPage() {
  const { client } = useProgress();
  const [phase, setPhase] = useState<"loading" | "start" | "in-progress" | "results">("loading");
  const [history, setHistory] = useState<MockExamSummary[]>([]);
  const [activeExam, setActiveExam] = useState<MockExamInProgress | null>(null);
  const [exam, setExam] = useState<MockExamInProgress | null>(null);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [current, setCurrent] = useState(0);
  const [remainingSec, setRemainingSec] = useState(0);
  const [result, setResult] = useState<MockExamResult | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [starting, setStarting] = useState(false);
  const submittedRef = useRef(false);

  const submit = useCallback(
    async (examId: string, finalAnswers: Record<string, number[]>) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      const res = await client.submitMockExam(examId, finalAnswers);
      setResult(res);
      setPhase("results");
    },
    [client],
  );

  useEffect(() => {
    Promise.all([client.getMockExamHistory(), client.getActiveMockExam()]).then(([h, active]) => {
      setHistory(h);
      if (active) {
        if (secondsRemaining(active) > 0) {
          setActiveExam(active);
        } else {
          // Time already ran out while the user was away — close it out the
          // same way the in-tab timeout would have, instead of offering a
          // stale resume.
          submit(active.id, active.answers);
          return;
        }
      }
      setPhase("start");
    });
  }, [client, submit]);

  useEffect(() => {
    if (phase !== "in-progress" || !exam) return;
    if (remainingSec <= 0) {
      submit(exam.id, answers);
      return;
    }
    const timer = setInterval(() => setRemainingSec((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, exam, remainingSec, submit, answers]);

  // Autosave answers/current question while in progress, so the exam can be
  // resumed later. Debounced since selecting an answer can fire in quick
  // succession (e.g. toggling a multi-select option a few times).
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (phase !== "in-progress" || !exam) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      client.saveMockExamProgress(exam.id, answers, current).catch(() => {});
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [phase, exam, answers, current, client]);

  async function startExam() {
    setStarting(true);
    const newExam = await client.startMockExam();
    submittedRef.current = false;
    setActiveExam(null);
    setExam(newExam);
    setAnswers({});
    setCurrent(0);
    setRemainingSec(newExam.timeLimitSec);
    setResult(null);
    setReviewing(false);
    setPhase("in-progress");
    setStarting(false);
  }

  function resumeExam() {
    if (!activeExam) return;
    submittedRef.current = false;
    setExam(activeExam);
    setAnswers(activeExam.answers);
    setCurrent(activeExam.currentIndex);
    setRemainingSec(secondsRemaining(activeExam));
    setResult(null);
    setReviewing(false);
    setPhase("in-progress");
  }

  function toggleAnswer(questionId: string, idx: number, multi: boolean) {
    setAnswers((prev) => {
      const existing = prev[questionId] ?? [];
      if (multi) {
        const next = existing.includes(idx) ? existing.filter((v) => v !== idx) : [...existing, idx];
        return { ...prev, [questionId]: next };
      }
      return { ...prev, [questionId]: [idx] };
    });
  }

  const answeredCount = exam ? exam.questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length : 0;

  if (phase === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="h-64 animate-pulse rounded-lg bg-surface-muted" />
      </div>
    );
  }

  if (phase === "start") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Mock Exam</h1>
        <p className="mt-2 max-w-2xl text-foreground-muted">
          Replicates the real exam&apos;s format: {TOTAL_MOCK_QUESTIONS} questions across 4 randomly
          drawn scenarios, {"120"}-minute timer, and a scaled score estimate from 100–1000 against a{" "}
          {PASSING_SCALED_SCORE} passing bar. No feedback is shown until you submit — just like the
          real thing.
        </p>
        <p className="mt-2 text-xs text-foreground-muted">
          The scaled score is our own estimate for study purposes; the real exam&apos;s official
          scoring formula isn&apos;t publicly disclosed.
        </p>

        {activeExam && (
          <div className="mt-6 rounded-lg border border-brand-soft bg-brand-soft p-5">
            <p className="text-sm font-medium text-brand-strong">Exam in progress</p>
            <p className="mt-1 text-foreground">
              Question {activeExam.currentIndex + 1} of {activeExam.questions.length} ·{" "}
              {formatTime(secondsRemaining(activeExam))} remaining
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={resumeExam}
                className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-strong"
              >
                Resume exam
              </button>
              <button
                onClick={startExam}
                disabled={starting}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface-muted disabled:opacity-60"
              >
                Start a new exam instead
              </button>
            </div>
          </div>
        )}

        {!activeExam && (
          <button
            onClick={startExam}
            disabled={starting}
            className="mt-6 rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-60"
          >
            {starting ? "Assembling exam…" : "Start mock exam"}
          </button>
        )}

        {history.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold">Your history</h2>
            <div className="mt-3 space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {h.completedAt ? new Date(h.completedAt).toLocaleDateString() : "In progress"}
                    </p>
                    <p className="text-foreground-muted">
                      {h.scenarioKeys.map(scenarioName).join(", ")}
                    </p>
                  </div>
                  {h.scaledScore != null && (
                    <div className="text-right">
                      <p className="text-lg font-semibold">{h.scaledScore}</p>
                      <p className={h.passed ? "text-success" : "text-danger"}>
                        {h.passed ? "Passed" : "Not passing"}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === "in-progress" && exam) {
    const q = exam.questions[current];
    const isMulti = q.type === "MULTI";
    const selected = answers[q.id] ?? [];

    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4">
          <div className="text-sm">
            <span className="font-semibold">
              Question {current + 1} of {exam.questions.length}
            </span>
            <span className="ml-3 text-foreground-muted">{answeredCount} answered</span>
          </div>
          <div
            className={clsx(
              "rounded-md px-3 py-1 font-mono text-sm font-semibold",
              remainingSec < 300 ? "bg-danger-soft text-danger" : "bg-brand-soft text-brand-strong",
            )}
            aria-live="polite"
          >
            {formatTime(remainingSec)} remaining
          </div>
        </div>

        <div className="mt-4 grid grid-cols-10 gap-1.5 sm:grid-cols-12">
          {exam.questions.map((eq, i) => {
            const answered = (answers[eq.id]?.length ?? 0) > 0;
            return (
              <button
                key={eq.id}
                onClick={() => setCurrent(i)}
                className={clsx(
                  "h-8 rounded text-xs font-medium",
                  i === current
                    ? "bg-brand text-white"
                    : answered
                      ? "bg-success-soft text-success"
                      : "bg-surface-muted text-foreground-muted hover:bg-border",
                )}
                aria-label={`Question ${i + 1}${answered ? ", answered" : ", unanswered"}`}
                aria-current={i === current}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-lg border border-border bg-surface p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            {q.type === "MULTI" ? "Select two" : "Single choice"}
          </p>
          <p className="mt-2 text-lg font-medium">{q.prompt}</p>
          <div className="mt-4 space-y-2">
            {q.options.map((option, idx) => {
              const isSelected = selected.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => toggleAnswer(q.id, idx, isMulti)}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors",
                    isSelected ? "border-brand bg-brand-soft" : "border-border hover:bg-surface-muted",
                  )}
                >
                  <span
                    className={clsx(
                      "flex h-5 w-5 shrink-0 items-center justify-center border text-xs",
                      isMulti ? "rounded" : "rounded-full",
                      isSelected ? "border-brand bg-brand text-white" : "border-border",
                    )}
                    aria-hidden
                  >
                    {isSelected ? "✓" : ""}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted disabled:opacity-40"
          >
            ← Previous
          </button>
          {current < exam.questions.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => {
                if (answeredCount < exam.questions.length) {
                  const ok = window.confirm(
                    `You've answered ${answeredCount} of ${exam.questions.length} questions. Submit anyway?`,
                  );
                  if (!ok) return;
                }
                submit(exam.id, answers);
              }}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Submit exam
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "results" && result) {
    if (reviewing) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <button
            onClick={() => setReviewing(false)}
            className="text-sm text-brand hover:underline"
          >
            ← Back to results summary
          </button>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Answer review</h1>
          <div className="mt-6 space-y-5">
            {result.questions.map((q, i) => (
              <div key={q.id} className="rounded-lg border border-border bg-surface p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
                  Question {i + 1} · {domainName(q.domainKey)}
                </p>
                <p className="mt-2 font-medium">{q.prompt}</p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {q.options.map((option, idx) => {
                    const isCorrectOption = q.correctIndexes.includes(idx);
                    const wasSelected = q.selectedIndexes.includes(idx);
                    return (
                      <li
                        key={idx}
                        className={clsx(
                          "rounded-md border px-3 py-2",
                          isCorrectOption
                            ? "border-success bg-success-soft"
                            : wasSelected
                              ? "border-danger bg-danger-soft"
                              : "border-border",
                        )}
                      >
                        {option}
                        {wasSelected && <span className="ml-2 text-xs">(your answer)</span>}
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 rounded-md bg-surface-muted p-3 text-sm text-foreground-muted">
                  {q.explanation}
                </div>
                <div className="mt-2 rounded-md bg-accent-soft p-3 text-sm text-foreground">
                  <span className="font-semibold text-accent">ELI10: </span>
                  {q.eli10}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Your results</h1>
        <div className="mt-6">
          <ShareScoreCard scaledScore={result.scaledScore ?? 0} passed={!!result.passed} />
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold">Per-domain breakdown</h2>
          <div className="mt-4 space-y-4 rounded-lg border border-border bg-surface p-5">
            {domains.map((d) => {
              const entry = result.domainBreakdown?.[d.key];
              const pct = entry && entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0;
              return (
                <ProgressBar
                  key={d.key}
                  label={d.name}
                  sublabel={entry ? `${entry.correct}/${entry.total}` : "—"}
                  value={pct}
                  tone={pct < 50 ? "danger" : pct < 75 ? "warning" : "success"}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setReviewing(true)}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
          >
            Review every answer
          </button>
          <button
            onClick={startExam}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted"
          >
            Take another mock exam
          </button>
        </div>
      </div>
    );
  }

  return null;
}
