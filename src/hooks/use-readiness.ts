"use client";

import { useEffect, useState } from "react";
import { useContentBank } from "./use-content-bank";
import { useProgress } from "./use-progress";
import { computeCurrentStreak, computeReadiness, type ReadinessSummary } from "@/lib/mastery";
import type { AttemptRecord, MockExamSummary } from "@/lib/progress-types";
import type { DomainKey } from "@/content/types";

export function useReadiness() {
  const { bank } = useContentBank();
  const { client, status } = useProgress();
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [streak, setStreak] = useState(0);
  const [mockExamHistory, setMockExamHistory] = useState<MockExamSummary[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bank || status === "loading") return;
    let cancelled = false;

    async function load() {
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
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [bank, client, status]);

  return { readiness, streak, mockExamHistory, attempts, loading: loading || !bank };
}
