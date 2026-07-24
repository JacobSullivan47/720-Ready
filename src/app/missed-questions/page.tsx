"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useContentBank } from "@/hooks/use-content-bank";
import { useProgress } from "@/hooks/use-progress";
import { PracticeQuestionCard } from "@/components/practice-question";
import type { AttemptRecord } from "@/lib/progress-types";

export default function MissedQuestionsPage() {
  const { bank, loading: bankLoading } = useContentBank();
  const { client } = useProgress();
  const [attempts, setAttempts] = useState<AttemptRecord[] | null>(null);

  useEffect(() => {
    client.getAttempts().then(setAttempts);
  }, [client]);

  const missedIds = useMemo(() => {
    if (!attempts) return null;
    const latestByQuestion = new Map<string, AttemptRecord>();
    for (const a of attempts) {
      const existing = latestByQuestion.get(a.questionId);
      if (!existing || new Date(a.createdAt) > new Date(existing.createdAt)) {
        latestByQuestion.set(a.questionId, a);
      }
    }
    return new Set(
      [...latestByQuestion.values()].filter((a) => !a.isCorrect).map((a) => a.questionId),
    );
  }, [attempts]);

  const missedQuestions = useMemo(() => {
    if (!bank || !missedIds) return [];
    return bank.questions.filter((q) => missedIds.has(q.id));
  }, [bank, missedIds]);

  const loading = bankLoading || !attempts;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Missed questions</h1>
      <p className="mt-2 text-foreground-muted">
        Anything you most recently answered incorrectly, collected here for review. Get it right
        and it drops off this list.
      </p>

      {loading ? (
        <div className="mt-6 h-64 animate-pulse rounded-lg bg-surface-muted" />
      ) : missedQuestions.length === 0 ? (
        <p className="mt-8 rounded-lg border border-border bg-surface p-6 text-center text-foreground-muted">
          Nothing to review right now.{" "}
          <Link href="/practice" className="text-brand hover:underline">
            Go practice
          </Link>{" "}
          to build this list up (or clear it out).
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {missedQuestions.map((q) => (
            <PracticeQuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}
