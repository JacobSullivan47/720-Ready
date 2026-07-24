"use client";

import Link from "next/link";
import { useReadiness } from "@/hooks/use-readiness";
import { ProgressBar } from "@/components/progress-bar";
import { ScoreTrendChart } from "@/components/score-trend-chart";

function tone(pct: number): "danger" | "warning" | "success" {
  if (pct < 40) return "danger";
  if (pct < 75) return "warning";
  return "success";
}

export default function ProgressPage() {
  const { readiness, streak, mockExamHistory, attempts, loading } = useReadiness();

  const missedCount = new Set(
    attempts.filter((a) => !a.isCorrect).map((a) => a.questionId),
  ).size;

  if (loading || !readiness) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="h-64 animate-pulse rounded-lg bg-surface-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
      <p className="mt-2 text-foreground-muted">
        Overall readiness: <strong className="text-foreground">{readiness.overallReadinessPct}%</strong> ·
        Current streak: <strong className="text-foreground">{streak} day{streak === 1 ? "" : "s"}</strong>
      </p>

      <div className="mt-8">
        <ScoreTrendChart history={mockExamHistory} />
      </div>

      <div className="mt-8 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-semibold">Mastery by domain</h2>
        <div className="mt-4 space-y-6">
          {readiness.domains.map((d) => (
            <div key={d.domainKey}>
              <ProgressBar
                label={`${d.name} (${d.weightPct}% of exam)`}
                sublabel={`${d.masteryPct}% mastery`}
                value={d.masteryPct}
                tone={tone(d.masteryPct)}
              />
              <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-foreground-muted">
                <div>
                  Flashcard retention: {d.cardRetentionPct}% ({d.cardsReviewed}/{d.cardsTotal} reviewed)
                </div>
                <div>
                  Quiz accuracy: {d.quizAccuracyPct}% ({d.attemptsCount} attempt{d.attemptsCount === 1 ? "" : "s"})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/missed-questions"
          className="rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-muted"
        >
          <h3 className="font-medium">Missed questions</h3>
          <p className="mt-1 text-sm text-foreground-muted">
            {missedCount > 0
              ? `${missedCount} question${missedCount === 1 ? "" : "s"} you've gotten wrong at least once.`
              : "Nothing here yet — questions you miss will collect for review."}
          </p>
        </Link>
        <Link
          href="/bookmarks"
          className="rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-muted"
        >
          <h3 className="font-medium">Bookmarks</h3>
          <p className="mt-1 text-sm text-foreground-muted">
            Flashcards and questions you&apos;ve starred to revisit later.
          </p>
        </Link>
      </div>
    </div>
  );
}
