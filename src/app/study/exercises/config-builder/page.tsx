"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  CONFIG_BUCKETS,
  CONFIG_BUILDER_ITEM_ID,
  CONFIG_BUILDER_SCENARIO,
  type ConfigBucketId,
} from "@/content/exercises";
import { useProgress } from "@/hooks/use-progress";

export default function ConfigBuilderPage() {
  const { client } = useProgress();
  const [assignments, setAssignments] = useState<Record<string, ConfigBucketId | "">>({});
  const [checked, setChecked] = useState(false);

  const allAssigned = CONFIG_BUILDER_SCENARIO.items.every((item) => assignments[item.id]);
  const correctCount = useMemo(
    () =>
      CONFIG_BUILDER_SCENARIO.items.filter((item) => assignments[item.id] === item.correctBucket).length,
    [assignments],
  );

  async function checkAnswers() {
    setChecked(true);
    await client.recordExerciseAttempt({
      exerciseType: "CONFIG_BUILDER",
      itemId: CONFIG_BUILDER_ITEM_ID,
      isCorrect: correctCount === CONFIG_BUILDER_SCENARIO.items.length,
    });
  }

  function reset() {
    setAssignments({});
    setChecked(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/study/exercises" className="text-sm text-brand hover:underline">
        ← All exercises
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{CONFIG_BUILDER_SCENARIO.title}</h1>
      <p className="mt-2 text-foreground-muted">{CONFIG_BUILDER_SCENARIO.intro}</p>

      {checked && (
        <div
          className={clsx(
            "mt-6 rounded-lg p-4 text-sm font-medium",
            correctCount === CONFIG_BUILDER_SCENARIO.items.length
              ? "bg-success-soft text-success"
              : "bg-warning-soft text-foreground",
          )}
        >
          You placed {correctCount} of {CONFIG_BUILDER_SCENARIO.items.length} correctly.
        </div>
      )}

      <div className="mt-6 space-y-4">
        {CONFIG_BUILDER_SCENARIO.items.map((item) => {
          const chosen = assignments[item.id] ?? "";
          const isCorrect = checked && chosen === item.correctBucket;
          const isWrong = checked && chosen !== item.correctBucket;
          return (
            <div
              key={item.id}
              className={clsx(
                "rounded-lg border p-4",
                isCorrect ? "border-success bg-success-soft" : isWrong ? "border-danger bg-danger-soft" : "border-border bg-surface",
              )}
            >
              <p className="text-sm">{item.text}</p>
              <select
                value={chosen}
                disabled={checked}
                onChange={(e) =>
                  setAssignments((prev) => ({ ...prev, [item.id]: e.target.value as ConfigBucketId }))
                }
                className="mt-3 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm disabled:opacity-70"
              >
                <option value="">Choose where this belongs…</option>
                {CONFIG_BUCKETS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
              {checked && (
                <p className="mt-2 text-sm text-foreground-muted">
                  <strong className={isCorrect ? "text-success" : "text-danger"}>
                    Correct answer: {CONFIG_BUCKETS.find((b) => b.id === item.correctBucket)?.label}.
                  </strong>{" "}
                  {item.rationale}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        {!checked ? (
          <button
            onClick={checkAnswers}
            disabled={!allAssigned}
            className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-50"
          >
            Check my answers
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

      <div className="mt-8 rounded-lg border border-border bg-surface p-4 text-xs text-foreground-muted">
        <p className="font-semibold text-foreground">Reference</p>
        <ul className="mt-2 space-y-1">
          {CONFIG_BUCKETS.map((b) => (
            <li key={b.id}>
              <strong>{b.label}:</strong> {b.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
