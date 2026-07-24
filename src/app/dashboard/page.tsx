"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useReadiness } from "@/hooks/use-readiness";
import { useProgress } from "@/hooks/use-progress";
import { ProgressBar } from "@/components/progress-bar";
import { ExamOverviewCard } from "@/components/exam-overview-card";
import { ScoreTrendChart } from "@/components/score-trend-chart";
import { domainSlug } from "@/lib/slugs";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import type { ViewedOverviews } from "@/lib/progress-types";

function readinessTone(pct: number): "danger" | "warning" | "success" {
  if (pct < 40) return "danger";
  if (pct < 75) return "warning";
  return "success";
}

const TOTAL_OVERVIEWS = domains.length + scenarios.length;

export default function DashboardPage() {
  const { readiness, streak, mockExamHistory, attempts, loading } = useReadiness();
  const { client, status } = useProgress();
  const [viewedOverviews, setViewedOverviews] = useState<ViewedOverviews>({ domainKeys: [], scenarioKeys: [] });

  useEffect(() => {
    client.getViewedOverviews().then(setViewedOverviews).catch(() => {});
  }, [client]);

  const missedCount = new Set(attempts.filter((a) => !a.isCorrect).map((a) => a.questionId)).size;
  const overviewsReadCount = viewedOverviews.domainKeys.length + viewedOverviews.scenarioKeys.length;

  const cardsMasteredTotal = readiness?.domains.reduce((sum, d) => sum + d.cardsMastered, 0) ?? 0;
  const questionsMasteredTotal = readiness?.domains.reduce((sum, d) => sum + d.questionsMastered, 0) ?? 0;
  const exercisesMasteredTotal = readiness?.domains.reduce((sum, d) => sum + d.exercisesMastered, 0) ?? 0;
  const itemsMasteredTotal = cardsMasteredTotal + questionsMasteredTotal + exercisesMasteredTotal;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {status === "guest"
              ? "Studying as a guest — progress is saved on this device only."
              : "Your progress, synced to your account."}
          </p>
        </div>
        {status === "guest" && (
          <Link
            href="/register"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted"
          >
            Create an account to sync progress
          </Link>
        )}
      </div>

      {loading || !readiness ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-surface-muted" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm text-foreground-muted">Overall readiness</p>
            <p className="mt-1 text-3xl font-semibold">{readiness.overallReadinessPct}%</p>
            <div className="mt-3">
              <ProgressBar value={readiness.overallReadinessPct} tone={readinessTone(readiness.overallReadinessPct)} />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm text-foreground-muted">Study streak</p>
            <p className="mt-1 text-3xl font-semibold">
              {streak} <span className="text-base font-normal text-foreground-muted">day{streak === 1 ? "" : "s"}</span>
            </p>
            <p className="mt-3 text-sm text-foreground-muted">
              {streak > 0 ? "Keep it going — study anything today to extend it." : "Study today to start a streak."}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm text-foreground-muted">Mock exams taken</p>
            <p className="mt-1 text-3xl font-semibold">{mockExamHistory.length}</p>
            {mockExamHistory[0]?.scaledScore != null ? (
              <p className="mt-3 text-sm text-foreground-muted">
                Last score: <span className="font-medium text-foreground">{mockExamHistory[0].scaledScore}</span> /
                1000 {mockExamHistory[0].passed ? "(passing)" : "(below passing)"}
              </p>
            ) : (
              <p className="mt-3 text-sm text-foreground-muted">Take a full mock exam to see a score here.</p>
            )}
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm text-foreground-muted">Items mastered</p>
            <p className="mt-1 text-3xl font-semibold">{itemsMasteredTotal}</p>
            <p className="mt-3 text-sm text-foreground-muted">
              {cardsMasteredTotal} flashcard{cardsMasteredTotal === 1 ? "" : "s"} · {questionsMasteredTotal} question
              {questionsMasteredTotal === 1 ? "" : "s"} · {exercisesMasteredTotal} exercise
              {exercisesMasteredTotal === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6">
        <ExamOverviewCard />
      </div>

      {!loading && readiness && (
        <>
          <div className="mt-8">
            <ScoreTrendChart history={mockExamHistory} />
          </div>

          {readiness.weakestDomain && (
            <div className="mt-6 rounded-lg border border-brand-soft bg-brand-soft p-5">
              <p className="text-sm font-medium text-brand-strong">Suggested next study session</p>
              <p className="mt-1 text-foreground">
                Your weakest area is <strong>{readiness.weakestDomain.name}</strong> (
                {readiness.weakestDomain.masteryPct}% mastery, {readiness.weakestDomain.weightPct}% of the exam).
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/study/domains/${domainSlug(readiness.weakestDomain.domainKey)}`}
                  className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-strong"
                >
                  Review overview
                </Link>
                <Link
                  href={`/study/flashcards?domain=${readiness.weakestDomain.domainKey}`}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
                >
                  Study flashcards
                </Link>
                <Link
                  href={`/practice?domain=${readiness.weakestDomain.domainKey}`}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
                >
                  Practice questions
                </Link>
                <Link
                  href={`/tutor?focus=domain:${readiness.weakestDomain.domainKey}`}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
                >
                  Ask the tutor
                </Link>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-semibold">Mastery by domain</h2>
            <div className="mt-4 space-y-6 rounded-lg border border-border bg-surface p-5">
              {readiness.domains.map((d) => (
                <div key={d.domainKey}>
                  <ProgressBar
                    label={`${d.name} (${d.weightPct}% of exam)`}
                    sublabel={`${d.masteryPct}%`}
                    value={d.masteryPct}
                    tone={readinessTone(d.masteryPct)}
                  />
                  <div className="mt-2 grid grid-cols-1 gap-3 text-xs text-foreground-muted sm:grid-cols-3">
                    <div>
                      Flashcard retention: {d.cardRetentionPct}% ({d.cardsMastered}/{d.cardsTotal} mastered,{" "}
                      {d.cardsReviewed} reviewed)
                    </div>
                    <div>
                      Questions mastered: {d.quizAccuracyPct}% ({d.questionsMastered}/{d.questionsAttempted} attempted)
                    </div>
                    <div>
                      Exercises mastered: {d.exerciseMasteryPct}% ({d.exercisesMastered}/{d.exercisesTotal})
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-foreground-muted">
              A question or exercise only counts toward mastery once you&apos;ve gotten it right at least twice; a
              flashcard counts once its spaced-repetition retention score crosses 75%. Full domain mastery requires
              engaging with flashcards, questions, and exercises alike.
            </p>
          </div>

          <div className="mt-8 rounded-lg border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Concept overviews read</h2>
                <p className="mt-1 text-sm text-foreground-muted">
                  {overviewsReadCount} of {TOTAL_OVERVIEWS} domain &amp; scenario overviews opened. Reading isn&apos;t
                  scored toward mastery, just tracked so you can see what&apos;s left.
                </p>
              </div>
              <Link
                href="/study/overview"
                className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
              >
                Browse overviews
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              href="/exam"
              className="rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-muted"
            >
              <h3 className="font-medium">Take a mock exam</h3>
              <p className="mt-1 text-sm text-foreground-muted">
                60 questions, 4 scenarios, 120 minutes, scored against the 720 passing bar.
              </p>
            </Link>
            <Link
              href="/study"
              className="rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-muted"
            >
              <h3 className="font-medium">Browse study material</h3>
              <p className="mt-1 text-sm text-foreground-muted">
                Domain and scenario overviews, flashcard decks, and interactive exercises.
              </p>
            </Link>
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
        </>
      )}
    </div>
  );
}
