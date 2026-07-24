"use client";

import { useEffect, useState } from "react";
import { useContentBank } from "./use-content-bank";
import { useProgress } from "./use-progress";
import { computeCurrentStreak, computeReadiness, type ReadinessSummary } from "@/lib/mastery";
import type { AttemptRecord, MockExamSummary } from "@/lib/progress-types";
import type { DomainKey } from "@/content/types";

export function useReadiness() {
  const { bank, error: bankError } = useContentBank();
  const { client, status } = useProgress();
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [streak, setStreak] = useState(0);
  const [mockExamHistory, setMockExamHistory] = useState<MockExamSummary[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bank || status === "loading") return;
    let cancelled = false;

    async function load() {
      try {
        const [cardStates, fetchedAttempts, studyDates, history, exerciseAttempts] = await Promise.all([
          client.getAllCardStates(),
          client.getAttempts(),
          client.getStudyLogDates(),
          client.getMockExamHistory(),
          client.getExerciseAttempts(),
        ]);
        if (cancelled) return;

        const cardsByDomain: Record<DomainKey, string[]> = {} as Record<DomainKey, string[]>;
        for (const card of bank!.flashcards) {
          (cardsByDomain[card.domainKey] ??= []).push(card.id);
        }

        setReadiness(computeReadiness(cardsByDomain, cardStates, fetchedAttempts, exerciseAttempts));
        setStreak(computeCurrentStreak(studyDates));
        setMockExamHistory(history);
        setAttempts(fetchedAttempts);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load your progress.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [bank, client, status]);

  return {
    readiness,
    streak,
    mockExamHistory,
    attempts,
    // While the content bank itself is still loading, keep showing a loading
    // state unless it has definitively failed — in which case stop loading
    // and let the error surface instead of spinning forever.
    loading: !bank ? !bankError : loading,
    error: error ?? bankError ?? null,
  };
}
