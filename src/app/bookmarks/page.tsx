"use client";

import { useEffect, useMemo, useState } from "react";
import { useContentBank } from "@/hooks/use-content-bank";
import { useProgress } from "@/hooks/use-progress";
import { PracticeQuestionCard } from "@/components/practice-question";

export default function BookmarksPage() {
  const { bank, loading: bankLoading } = useContentBank();
  const { client } = useProgress();
  const [bookmarks, setBookmarks] = useState<{ cardIds: string[]; questionIds: string[] } | null>(null);
  const [tab, setTab] = useState<"cards" | "questions">("cards");

  useEffect(() => {
    client.getBookmarks().then(setBookmarks);
  }, [client]);

  const cards = useMemo(
    () => bank?.flashcards.filter((c) => bookmarks?.cardIds.includes(c.id)) ?? [],
    [bank, bookmarks],
  );
  const questions = useMemo(
    () => bank?.questions.filter((q) => bookmarks?.questionIds.includes(q.id)) ?? [],
    [bank, bookmarks],
  );

  const loading = bankLoading || !bookmarks;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Bookmarks</h1>

      <div className="mt-5 flex gap-2 border-b border-border">
        {(["cards", "questions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t ? "border-brand text-brand" : "border-transparent text-foreground-muted"
            }`}
          >
            {t === "cards" ? `Flashcards (${cards.length})` : `Questions (${questions.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 h-64 animate-pulse rounded-lg bg-surface-muted" />
      ) : tab === "cards" ? (
        cards.length === 0 ? (
          <p className="mt-8 text-center text-foreground-muted">No flashcards bookmarked yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {cards.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-surface p-4">
                <p className="font-medium">{c.term}</p>
                <p className="mt-1 text-sm text-foreground-muted">{c.definition}</p>
              </div>
            ))}
          </div>
        )
      ) : questions.length === 0 ? (
        <p className="mt-8 text-center text-foreground-muted">No questions bookmarked yet.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {questions.map((q) => (
            <PracticeQuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}
