"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useProgress } from "@/hooks/use-progress";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import { PASSING_SCALED_SCORE, shuffle, TOTAL_MOCK_QUESTIONS } from "@/lib/scoring";
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

export default function ExamPage() {
  const { client } = useProgress();
  const [phase, setPhase] = useState<"loading" | "start" | "in-progress" | "results">("loading");
  const [history, setHistory] = useState<MockExamSummary[]>([]);
  const [activeExam, setActiveExam] = useState<MockExamInProgress | null>(null);
  const [exam, setExam] = useState<MockExamInProgress | null>(null);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [current, setCurrent] = useState(0);
  const [remainingSec, setRemainingSec] = useState(0);
  const [tabVisible, setTabVisible] = useState(true);
  const [result, setResult] = useState<MockExamResult | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [viewingPastResult, setViewingPastResult] = useState(false);
  const [loadingHistoryId, setLoadingHistoryId] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);
  const submittedRef = useRef(false);
  const remainingSecRef = useRef(0);

  useEffect(() => {
    remainingSecRef.current = remainingSec;
  }, [remainingSec]);

  const submit = useCallback(
    async (examId: string, finalAnswers: Record<string, number[]>) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      const res = await client.submitMockExam(examId, finalAnswers);
      setResult(res);
      setViewingPastResult(false);
      setPhase("results");
    },
    [client],
  );

  async function viewPastExam(examId: string) {
    setLoadingHistoryId(examId);
    const res = await client.getMockExamResult(examId).finally(() => setLoadingHistoryId(null));
    if (!res) return;
    setResult(res);
    setReviewing(false);
    setViewingPastResult(true);
    setPhase("results");
  }

  useEffect(() => {
    Promise.all([client.getMockExamHistory(), client.getActiveMockExam()]).then(([h, active]) => {
      setHistory(h);
      if (active) {
        if (active.remainingSec > 0) {
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

  // The timer only ticks while the tab is actually visible — switching away
  // freezes it exactly where it was, instead of continuing to burn time in
  // the background, and it picks back up (not catches up) when you return.
  useEffect(() => {
    function handleVisibilityChange() {
      const visible = document.visibilityState === "visible";
      setTabVisible(visible);
      if (!visible && exam) {
        client.saveMockExamProgress(exam.id, answers, current, remainingSecRef.current).catch(() => {});
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [exam, answers, current, client]);

  useEffect(() => {
    if (phase !== "in-progress" || !exam || !tabVisible) return;
    if (remainingSec <= 0) {
      submit(exam.id, answers);
      return;
    }
    const timer = setInterval(() => setRemainingSec((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, exam, remainingSec, tabVisible, submit, answers]);

  // Autosave answers/current question/remaining time while in progress, so
  // the exam can be resumed later. Debounced since selecting an answer can
  // fire in quick succession (e.g. toggling a multi-select option a few
  // times) — remainingSec itself isn't a trigger here (it'd fire every
  // second); it just rides along at whatever value the ref last saw.
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (phase !== "in-progress" || !exam) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      client.saveMockExamProgress(exam.id, answers, current, remainingSecRef.current).catch(() => {});
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
    setViewingPastResult(false);
    setPhase("in-progress");
    setStarting(false);
  }

  function resumeExam() {
    if (!activeExam) return;
    submittedRef.current = false;
    setExam(activeExam);
    setAnswers(activeExam.answers);
    setCurrent(activeExam.currentIndex);
    setRemainingSec(activeExam.remainingSec);
    setResult(null);
    setReviewing(false);
    setViewingPastResult(false);
    setPhase("in-progress");
  }

  async function saveAndExit() {
    if (!exam || exiting) return;
    setExiting(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await client
      .saveMockExamProgress(exam.id, answers, current, remainingSecRef.current)
      .catch(() => {});
    setActiveExam({ ...exam, answers, currentIndex: current, remainingSec: remainingSecRef.current });
    setExam(null);
    setExiting(false);
    setPhase("start");
  }

  async function deleteExam(examId: string) {
    const ok = window.confirm(
      "Delete this mock exam? Its score and progress will be permanently removed — this can't be undone.",
    );
    if (!ok) return;
    await client.deleteMockExam(examId);
    setHistory((h) => h.filter((entry) => entry.id !== examId));
    setActiveExam((a) => (a?.id === examId ? null : a));
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

  // Stored option order otherwise leaks the answer — shuffle display order
  // per question, computed once per attempt (not per render) so revisiting a
  // question via Previous/the palette doesn't visibly reshuffle it mid-exam.
  // Grading always uses the original indices below, unaffected by this.
  const displayOrders = useMemo(() => {
    if (!exam) return {} as Record<string, number[]>;
    return Object.fromEntries(
      exam.questions.map((q) => [q.id, shuffle(q.options.map((_, i) => i))]),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam?.id]);

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
              {formatTime(activeExam.remainingSec)} remaining
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
                  onClick={() => h.completedAt && viewPastExam(h.id)}
                  className={clsx(
                    "flex items-center justify-between rounded-lg border border-border bg-surface p-4 text-sm",
                    h.completedAt && "cursor-pointer transition-colors hover:bg-surface-muted",
                  )}
                >
                  <div>
                    <p className="font-medium">
                      {h.completedAt ? new Date(h.completedAt).toLocaleDateString() : "In progress"}
                    </p>
                    <p className="text-foreground-muted">
                      {h.scenarioKeys.map(scenarioName).join(", ")}
                    </p>
                    {h.completedAt && (
                      <p className="mt-1 text-xs text-brand">
                        {loadingHistoryId === h.id ? "Loading…" : "View full results →"}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {h.scaledScore != null && (
                      <div className="text-right">
                        <p className="text-lg font-semibold">{h.scaledScore}</p>
                        <p className={h.passed ? "text-success" : "text-danger"}>
                          {h.passed ? "Passed" : "Not passing"}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteExam(h.id);
                      }}
                      aria-label="Delete this exam"
                      className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground-muted hover:border-danger hover:text-danger"
                    >
                      Delete
                    </button>
                  </div>
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
        <button
          onClick={saveAndExit}
          disabled={exiting}
          className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground disabled:opacity-60"
        >
          {exiting ? "Saving…" : "← Save & exit"}
        </button>
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
                      ? "bg-brand-soft text-brand-strong"
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
            {(displayOrders[q.id] ?? q.options.map((_, i) => i)).map((idx) => {
              const option = q.options[idx];
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
        <button
          onClick={() => {
            if (!viewingPastResult) {
              // Fold the just-finished exam into the in-memory history list
              // so it shows up immediately on the way back, without a refetch.
              const summary: MockExamSummary = {
                id: result.id,
                scenarioKeys: result.scenarioKeys,
                startedAt: result.startedAt,
                completedAt: result.completedAt,
                scaledScore: result.scaledScore,
                passed: result.passed,
                domainBreakdown: result.domainBreakdown,
              };
              setHistory((h) => [summary, ...h.filter((entry) => entry.id !== summary.id)]);
            }
            setViewingPastResult(false);
            setResult(null);
            setPhase("start");
          }}
          className="text-sm text-brand hover:underline"
        >
          {viewingPastResult ? "← Back to history" : "← Back to exam list"}
        </button>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          {viewingPastResult ? "Exam results" : "Your results"}
        </h1>
        <div className="mt-6">
          <ShareScoreCard scaledScore={result.scaledScore ?? 0} passed={!!result.passed} />
        </div>
        <p className="mt-3 text-center text-sm text-foreground-muted">
          {result.questions.filter((q) => q.isCorrect).length}/{result.questions.length} correct
        </p>

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
