"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/hooks/use-progress";
import type { BankFlashcard } from "@/lib/content-bank-client";
import { INITIAL_SRS_STATE, type SrsState } from "@/lib/srs";
import clsx from "clsx";

interface QueueItem {
  card: BankFlashcard;
  state: SrsState;
  status: "due" | "new" | "scheduled";
}

function buildQueue(cards: BankFlashcard[], states: Record<string, SrsState>): QueueItem[] {
  const items: QueueItem[] = cards.map((card) => {
    const state = states[card.id];
    if (!state) return { card, state: INITIAL_SRS_STATE, status: "new" };
    return { card, state, status: "scheduled" };
  });

  // "due" needs the actual dueAt, which isn't in SrsState alone — we treat any
  // card with repetitions > 0 as due (the API only stores the latest state;
  // review scheduling nuance is handled server-side / locally at rating time).
  // For ordering purposes here: new cards and previously-lapsed cards first,
  // well-known cards last.
  return items.sort((a, b) => {
    const rank = (s: QueueItem) => (s.status === "new" ? 0 : s.state.repetitions <= 1 ? 1 : 2);
    return rank(a) - rank(b);
  });
}

export function FlashcardSession({
  cards,
  deckLabel,
  onExit,
}: {
  cards: BankFlashcard[];
  deckLabel: string;
  onExit: () => void;
}) {
  const { client } = useProgress();
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [ratedCount, setRatedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([client.getAllCardStates(), client.getBookmarks()]).then(([states, bm]) => {
      if (cancelled) return;
      setQueue(buildQueue(cards, states));
      setBookmarked(new Set(bm.cardIds));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  const current = queue?.[index];
  const done = queue && index >= queue.length;

  async function rate(rating: "STILL_LEARNING" | "KNEW_IT") {
    if (!current) return;
    await client.rateCard(current.card.id, rating);
    setRatedCount((c) => c + 1);
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  async function toggleBookmark() {
    if (!current) return;
    const nowBookmarked = await client.toggleBookmark("FLASHCARD", current.card.id);
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (nowBookmarked) next.add(current.card.id);
      else next.delete(current.card.id);
      return next;
    });
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (done || !current) return;
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && (e.key === "1" || e.key.toLowerCase() === "l")) {
        rate("STILL_LEARNING");
      } else if (flipped && (e.key === "2" || e.key.toLowerCase() === "k")) {
        rate("KNEW_IT");
      } else if (e.key.toLowerCase() === "b") {
        toggleBookmark();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, current, done]);

  if (!queue) {
    return <div className="h-64 animate-pulse rounded-lg bg-surface-muted" />;
  }

  if (queue.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <p className="text-foreground-muted">No flashcards match this deck yet.</p>
        <button onClick={onExit} className="mt-4 text-sm text-brand hover:underline">
          ← Back to deck picker
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-lg border border-success-soft bg-success-soft p-8 text-center">
        <p className="text-lg font-semibold text-foreground">Deck complete 🎉</p>
        <p className="mt-1 text-foreground-muted">
          You rated {ratedCount} card{ratedCount === 1 ? "" : "s"} in {deckLabel}.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={() => {
              setIndex(0);
              setFlipped(false);
            }}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
          >
            Study again
          </button>
          <button
            onClick={onExit}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted"
          >
            Choose another deck
          </button>
        </div>
      </div>
    );
  }

  const isBookmarked = current ? bookmarked.has(current.card.id) : false;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-foreground-muted">
        <span>
          {deckLabel} · Card {index + 1} of {queue.length}
        </span>
        <button
          onClick={toggleBookmark}
          aria-pressed={isBookmarked}
          className={clsx(
            "rounded-md border px-2 py-1 text-xs font-medium",
            isBookmarked
              ? "border-accent bg-accent-soft text-accent"
              : "border-border text-foreground-muted hover:bg-surface-muted",
          )}
        >
          {isBookmarked ? "★ Bookmarked" : "☆ Bookmark"}
        </button>
      </div>

      <div className="card-flip-scene h-72 sm:h-64">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className={clsx(
            "card-flip-inner relative h-full w-full text-left",
            flipped && "is-flipped",
          )}
          aria-label={flipped ? "Showing definition. Click to show term." : "Showing term. Click to reveal definition."}
        >
          <div className="card-flip-face absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-border bg-surface p-8 shadow-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
              {current!.status === "new" ? "New" : "Term"}
            </span>
            <p className="mt-3 text-center text-2xl font-semibold">{current!.card.term}</p>
            <p className="mt-6 text-xs text-foreground-muted">Click, tap, or press Space to flip</p>
          </div>
          <div className="card-flip-face card-flip-face-back absolute inset-0 flex flex-col justify-center overflow-y-auto rounded-xl border border-border bg-brand-soft p-8">
            <p className="font-medium text-foreground">{current!.card.definition}</p>
            <p className="mt-3 text-sm italic text-foreground-muted">{current!.card.example}</p>
          </div>
        </button>
      </div>

      {flipped ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => rate("STILL_LEARNING")}
            className="rounded-md border border-danger bg-danger-soft px-4 py-3 text-sm font-semibold text-danger hover:opacity-90"
          >
            Still learning{" "}
            <span className="hidden font-normal text-foreground-muted sm:inline">(1)</span>
          </button>
          <button
            onClick={() => rate("KNEW_IT")}
            className="rounded-md border border-success bg-success-soft px-4 py-3 text-sm font-semibold text-success hover:opacity-90"
          >
            I knew it <span className="hidden font-normal text-foreground-muted sm:inline">(2)</span>
          </button>
        </div>
      ) : (
        <p className="mt-5 text-center text-sm text-foreground-muted">Flip the card to rate yourself.</p>
      )}

      <div className="mt-6 text-center">
        <button onClick={onExit} className="text-sm text-foreground-muted hover:text-foreground hover:underline">
          Exit to deck picker
        </button>
      </div>
    </div>
  );
}
