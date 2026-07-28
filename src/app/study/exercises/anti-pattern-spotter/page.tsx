"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ANTI_PATTERN_SCENARIOS } from "@/content/exercises";
import { domains } from "@/content/domains";
import { useProgress } from "@/hooks/use-progress";
import { shuffle } from "@/lib/scoring";

type Stage = "flaw" | "fix" | "done";

export default function AntiPatternSpotterPage() {
  const { client } = useProgress();
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("flaw");
  const [flawChoice, setFlawChoice] = useState<number | null>(null);
  const [fixChoice, setFixChoice] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const scenario = ANTI_PATTERN_SCENARIOS[index];
  const isLast = index === ANTI_PATTERN_SCENARIOS.length - 1;

  // Stored option order otherwise always puts the correct answer in the same
  // spot — shuffle the display order per scenario, computed once (not per
  // render) so answering doesn't visibly reshuffle it. Grading always uses
  // the original indices below, unaffected by this.
  const flawOrder = useMemo(
    () => shuffle(scenario.flawOptions.map((_, i) => i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenario.id],
  );
  const fixOrder = useMemo(
    () => shuffle(scenario.fixOptions.map((_, i) => i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenario.id],
  );

  function chooseFlaw(i: number) {
    if (flawChoice != null) return;
    setFlawChoice(i);
    if (i === scenario.correctFlawIndex) setScore((s) => s + 1);
  }

  async function chooseFix(i: number) {
    if (fixChoice != null) return;
    setFixChoice(i);
    if (i === scenario.correctFixIndex) setScore((s) => s + 1);

    const gotFlawRight = flawChoice === scenario.correctFlawIndex;
    const gotFixRight = i === scenario.correctFixIndex;
    await client.recordExerciseAttempt({
      exerciseType: "ANTI_PATTERN_SPOTTER",
      itemId: `apspotter:${scenario.id}`,
      isCorrect: gotFlawRight && gotFixRight,
    });
  }

  function next() {
    if (isLast) {
      setStage("done");
      return;
    }
    setIndex((i) => i + 1);
    setStage("flaw");
    setFlawChoice(null);
    setFixChoice(null);
  }

  function restart() {
    setIndex(0);
    setStage("flaw");
    setFlawChoice(null);
    setFixChoice(null);
    setScore(0);
  }

  if (stage === "done") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Exercise complete</h1>
        <p className="mt-2 text-foreground-muted">
          You scored {score} out of {ANTI_PATTERN_SCENARIOS.length * 2} (flaw + fix per scenario).
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={restart}
            className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
          >
            Try again
          </button>
          <Link
            href="/study/exercises"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold hover:bg-surface-muted"
          >
            All exercises
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/study/exercises" className="text-sm text-brand hover:underline">
        ← All exercises
      </Link>
      <p className="mt-3 text-sm text-foreground-muted">
        Scenario {index + 1} of {ANTI_PATTERN_SCENARIOS.length} · {domains.find((d) => d.key === scenario.domainKey)?.name}
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{scenario.title}</h1>
      <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm">{scenario.setup}</p>

      <h2 className="mt-6 font-semibold">What&apos;s wrong here?</h2>
      <div className="mt-3 space-y-2">
        {flawOrder.map((i) => {
          const option = scenario.flawOptions[i];
          const isSelected = flawChoice === i;
          const isCorrect = flawChoice != null && i === scenario.correctFlawIndex;
          const isWrongSelected = isSelected && i !== scenario.correctFlawIndex;
          return (
            <button
              key={i}
              onClick={() => chooseFlaw(i)}
              disabled={flawChoice != null}
              className={clsx(
                "block w-full rounded-md border px-4 py-3 text-left text-sm transition-colors",
                isCorrect
                  ? "border-success bg-success-soft"
                  : isWrongSelected
                    ? "border-danger bg-danger-soft"
                    : "border-border hover:bg-surface-muted",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {flawChoice != null && (
        <div className="mt-3 rounded-md bg-surface-muted p-3 text-sm text-foreground-muted">
          {scenario.flawRationale}
        </div>
      )}

      {flawChoice != null && (
        <>
          <h2 className="mt-6 font-semibold">What&apos;s the correct fix?</h2>
          <div className="mt-3 space-y-2">
            {fixOrder.map((i) => {
              const option = scenario.fixOptions[i];
              const isSelected = fixChoice === i;
              const isCorrect = fixChoice != null && i === scenario.correctFixIndex;
              const isWrongSelected = isSelected && i !== scenario.correctFixIndex;
              return (
                <button
                  key={i}
                  onClick={() => chooseFix(i)}
                  disabled={fixChoice != null}
                  className={clsx(
                    "block w-full rounded-md border px-4 py-3 text-left text-sm transition-colors",
                    isCorrect
                      ? "border-success bg-success-soft"
                      : isWrongSelected
                        ? "border-danger bg-danger-soft"
                        : "border-border hover:bg-surface-muted",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </>
      )}

      {fixChoice != null && (
        <div className="mt-3 rounded-md bg-surface-muted p-3 text-sm text-foreground-muted">
          {scenario.fixRationale}
        </div>
      )}

      {fixChoice != null && (
        <button
          onClick={next}
          className="mt-6 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          {isLast ? "Finish" : "Next scenario →"}
        </button>
      )}
    </div>
  );
}
