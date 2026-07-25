"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { useProgress } from "@/hooks/use-progress";
import { AskTutorButton } from "@/components/ask-tutor-button";
import { shuffle } from "@/lib/scoring";
import type { BankQuestion } from "@/lib/content-bank-client";

function arraysEqualAsSets(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const as = [...a].sort();
  const bs = [...b].sort();
  return as.every((v, i) => v === bs[i]);
}

export function PracticeQuestionCard({
  question,
  onAnswered,
  initiallyBookmarked = false,
}: {
  question: BankQuestion;
  onAnswered?: (isCorrect: boolean) => void;
  initiallyBookmarked?: boolean;
}) {
  const { client } = useProgress();
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [bookmarked, setBookmarked] = useState(initiallyBookmarked);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  // Stored option order otherwise leaks the answer (the correct one is
  // overwhelmingly the same position in the content bank) — shuffle the
  // display order per viewing, independent of the original/correct indices
  // used everywhere else (grading, recordAttempt, etc.).
  // Reshuffle only when the question itself changes, not on every render.
  const displayOrder = useMemo(
    () => shuffle(question.options.map((_, i) => i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [question.id],
  );

  const isMulti = question.type === "MULTI";

  function toggleOption(idx: number) {
    if (submitted) return;
    setSelected((prev) => {
      if (isMulti) {
        return prev.includes(idx) ? prev.filter((v) => v !== idx) : [...prev, idx];
      }
      return [idx];
    });
  }

  async function saveAttempt(isCorrect: boolean) {
    setSaveError(null);
    try {
      await client.recordAttempt({
        questionId: question.id,
        domainKey: question.domainKey,
        selectedIndexes: selected,
        isCorrect,
        mode: "PRACTICE",
      });
      onAnswered?.(isCorrect);
    } catch (err) {
      // Grading itself already happened locally (isCorrectOverall below), so
      // the user still sees Correct/Not quite — but without this, a failed
      // save here was previously silent and just never counted toward
      // progress, with no indication anything went wrong.
      setSaveError(err instanceof Error ? err.message : "Couldn't save this attempt.");
    }
  }

  async function submit() {
    if (selected.length === 0 || submitted) return;
    const isCorrect = arraysEqualAsSets(selected, question.correctIndexes);
    setSubmitted(true);
    await saveAttempt(isCorrect);
  }

  async function retrySave() {
    setRetrying(true);
    await saveAttempt(arraysEqualAsSets(selected, question.correctIndexes));
    setRetrying(false);
  }

  async function toggleBookmark() {
    const nowBookmarked = await client.toggleBookmark("QUESTION", question.id);
    setBookmarked(nowBookmarked);
  }

  const isCorrectOverall = submitted && arraysEqualAsSets(selected, question.correctIndexes);

  return (
    <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-brand-soft px-2 py-0.5 font-medium text-brand-strong">
            {question.type === "MULTI" ? "Select two" : "Single choice"}
          </span>
          <span className="rounded-full bg-surface-muted px-2 py-0.5 font-medium text-foreground-muted">
            {question.difficulty}
          </span>
        </div>
        <button
          onClick={toggleBookmark}
          aria-pressed={bookmarked}
          className={clsx(
            "rounded-md border px-2 py-1 text-xs font-medium",
            bookmarked
              ? "border-accent bg-accent-soft text-accent"
              : "border-border text-foreground-muted hover:bg-surface-muted",
          )}
        >
          {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
        </button>
      </div>

      <p className="mt-4 text-lg font-medium">{question.prompt}</p>

      <div className="mt-4 space-y-2" role="group" aria-label="Answer options">
        {displayOrder.map((idx) => {
          const option = question.options[idx];
          const isSelected = selected.includes(idx);
          const isCorrectOption = question.correctIndexes.includes(idx);
          let stateClass = "border-border hover:bg-surface-muted";
          if (submitted) {
            if (isCorrectOption) stateClass = "border-success bg-success-soft";
            else if (isSelected && !isCorrectOption) stateClass = "border-danger bg-danger-soft";
          } else if (isSelected) {
            stateClass = "border-brand bg-brand-soft";
          }
          return (
            <button
              key={idx}
              type="button"
              onClick={() => toggleOption(idx)}
              disabled={submitted}
              className={clsx(
                "flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors",
                stateClass,
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
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={submit}
          disabled={selected.length === 0}
          className="mt-5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-50"
        >
          Submit answer
        </button>
      ) : (
        <div className="mt-5 space-y-3">
          <p
            className={clsx(
              "rounded-md px-3 py-2 text-sm font-semibold",
              isCorrectOverall ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
            )}
          >
            {isCorrectOverall ? "Correct" : "Not quite"}
          </p>
          {saveError && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger"
            >
              <span>Didn&apos;t save to your progress: {saveError}</span>
              <button
                onClick={retrySave}
                disabled={retrying}
                className="rounded-md border border-danger px-2 py-1 text-xs font-semibold hover:bg-danger/10 disabled:opacity-60"
              >
                {retrying ? "Retrying…" : "Retry"}
              </button>
            </div>
          )}
          <div className="rounded-md bg-surface-muted p-4">
            <p className="text-sm font-semibold text-foreground">Explanation</p>
            <p className="mt-1 text-sm text-foreground-muted">{question.explanation}</p>
          </div>
          <div className="rounded-md bg-accent-soft p-4">
            <p className="text-sm font-semibold text-accent">Explain it like I&apos;m 10</p>
            <p className="mt-1 text-sm text-foreground">{question.eli10}</p>
          </div>
          {!isCorrectOverall && (
            <AskTutorButton
              focus={`question:${question.id}`}
              className="inline-block text-sm text-brand hover:underline"
            >
              Ask the tutor to explain this →
            </AskTutorButton>
          )}
        </div>
      )}
    </div>
  );
}
