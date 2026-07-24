"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { SEQUENCING_EXERCISES } from "@/content/exercises";
import { shuffle } from "@/lib/scoring";
import { useProgress } from "@/hooks/use-progress";

function shuffledDistinctFrom<T>(items: T[]): T[] {
  let result = shuffle(items);
  let attempts = 0;
  while (result.every((v, i) => v === items[i]) && attempts < 10) {
    result = shuffle(items);
    attempts++;
  }
  return result;
}

export default function SequencingPage() {
  const { client } = useProgress();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const exercise = SEQUENCING_EXERCISES[exerciseIndex];

  const [pool, setPool] = useState<string[]>(() => shuffledDistinctFrom(exercise.steps));
  const [ordered, setOrdered] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const isComplete = pool.length === 0;
  const correctness = useMemo(
    () => ordered.map((step, i) => step === exercise.steps[i]),
    [ordered, exercise.steps],
  );
  const correctCount = correctness.filter(Boolean).length;

  function addStep(step: string) {
    if (checked) return;
    setPool((p) => p.filter((s) => s !== step));
    setOrdered((o) => [...o, step]);
  }

  function removeStep(step: string) {
    if (checked) return;
    setOrdered((o) => o.filter((s) => s !== step));
    setPool((p) => [...p, step]);
  }

  function loadExercise(i: number) {
    setExerciseIndex(i);
    setPool(shuffledDistinctFrom(SEQUENCING_EXERCISES[i].steps));
    setOrdered([]);
    setChecked(false);
  }

  function reset() {
    loadExercise(exerciseIndex);
  }

  async function checkOrder() {
    setChecked(true);
    await client.recordExerciseAttempt({
      exerciseType: "SEQUENCING",
      itemId: `sequencing:${exercise.id}`,
      isCorrect: correctCount === exercise.steps.length,
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/study/exercises" className="text-sm text-brand hover:underline">
        ← All exercises
      </Link>

      <div className="mt-3 flex flex-wrap gap-2">
        {SEQUENCING_EXERCISES.map((ex, i) => (
          <button
            key={ex.id}
            onClick={() => loadExercise(i)}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-medium",
              i === exerciseIndex ? "bg-brand text-white" : "bg-surface-muted text-foreground-muted hover:bg-border",
            )}
          >
            {ex.title}
          </button>
        ))}
      </div>

      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{exercise.title}</h1>
      <p className="mt-2 text-foreground-muted">{exercise.intro}</p>

      {checked && (
        <div
          className={clsx(
            "mt-4 rounded-lg p-4 text-sm font-medium",
            correctCount === exercise.steps.length ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
          )}
        >
          {correctCount} of {exercise.steps.length} steps in the correct position.
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">
          Your sequence (click a step to remove it)
        </h2>
        <ol className="mt-2 space-y-2">
          {ordered.length === 0 && (
            <li className="rounded-md border border-dashed border-border p-4 text-center text-sm text-foreground-muted">
              Click steps below to build the sequence.
            </li>
          )}
          {ordered.map((step, i) => (
            <li key={step}>
              <button
                onClick={() => removeStep(step)}
                disabled={checked}
                className={clsx(
                  "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left text-sm",
                  checked
                    ? correctness[i]
                      ? "border-success bg-success-soft"
                      : "border-danger bg-danger-soft"
                    : "border-brand bg-brand-soft hover:opacity-90",
                )}
              >
                <span className="font-semibold text-brand-strong">{i + 1}.</span>
                <span>{step}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {pool.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">Remaining steps</h2>
          <div className="mt-2 space-y-2">
            {pool.map((step) => (
              <button
                key={step}
                onClick={() => addStep(step)}
                className="block w-full rounded-md border border-border bg-surface px-4 py-3 text-left text-sm hover:bg-surface-muted"
              >
                {step}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        {!checked ? (
          <button
            onClick={checkOrder}
            disabled={!isComplete}
            className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-50"
          >
            Check my order
          </button>
        ) : (
          <button
            onClick={reset}
            className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold hover:bg-surface-muted"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
