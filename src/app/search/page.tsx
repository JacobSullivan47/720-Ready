"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useContentBank } from "@/hooks/use-content-bank";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import { domainSlug, scenarioSlug } from "@/lib/slugs";
import { PracticeQuestionCard } from "@/components/practice-question";

function matches(haystack: string, q: string) {
  return haystack.toLowerCase().includes(q);
}

/** Wraps every case-insensitive occurrence of `query` in `text` with `<mark>`. */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="rounded bg-brand-soft px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

function domainName(key: string): string {
  return domains.find((d) => d.key === key)?.name ?? key;
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const { bank, loading } = useContentBank();
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const q = query.trim().toLowerCase();

  // Rank a title/term match above a description-only match — stable sort
  // keeps everything else in its original relative order.
  const domainResults = useMemo(() => {
    if (!q) return [];
    return domains
      .filter((d) => matches(d.name, q) || matches(d.summary, q))
      .sort((a, b) => Number(matches(b.name, q)) - Number(matches(a.name, q)));
  }, [q]);
  const scenarioResults = useMemo(() => {
    if (!q) return [];
    return scenarios
      .filter((s) => matches(s.name, q) || matches(s.summary, q))
      .sort((a, b) => Number(matches(b.name, q)) - Number(matches(a.name, q)));
  }, [q]);
  const flashcardResults = useMemo(() => {
    if (!q || !bank) return [];
    return bank.flashcards
      .filter((c) => matches(c.term, q) || matches(c.definition, q))
      .sort((a, b) => Number(matches(b.term, q)) - Number(matches(a.term, q)))
      .slice(0, 30);
  }, [q, bank]);
  const questionResults = useMemo(() => {
    if (!q || !bank) return [];
    return bank.questions.filter((qq) => matches(qq.prompt, q)).slice(0, 20);
  }, [q, bank]);

  const totalResults =
    domainResults.length + scenarioResults.length + flashcardResults.length + questionResults.length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
      <input
        type="search"
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search overviews, flashcards, and glossary terms…"
        aria-label="Search"
        className="mt-4 w-full rounded-md border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-brand"
      />

      {!q ? (
        <p className="mt-8 text-center text-foreground-muted">Start typing to search everything.</p>
      ) : loading ? (
        <div className="mt-6 h-48 animate-pulse rounded-lg bg-surface-muted" />
      ) : totalResults === 0 ? (
        <p className="mt-8 text-center text-foreground-muted">No results for &quot;{query}&quot;.</p>
      ) : (
        <div className="mt-8 space-y-8">
          {domainResults.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">Domains</h2>
              <div className="mt-2 space-y-2">
                {domainResults.map((d) => (
                  <Link
                    key={d.key}
                    href={`/study/domains/${domainSlug(d.key)}`}
                    className="block rounded-md border border-border bg-surface p-3 text-sm hover:bg-surface-muted"
                  >
                    <span className="font-medium">
                      <Highlight text={d.name} query={q} />
                    </span>
                    <p className="text-foreground-muted">
                      <Highlight text={d.summary} query={q} />
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {scenarioResults.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">Scenarios</h2>
              <div className="mt-2 space-y-2">
                {scenarioResults.map((s) => (
                  <Link
                    key={s.key}
                    href={`/study/scenarios/${scenarioSlug(s.key)}`}
                    className="block rounded-md border border-border bg-surface p-3 text-sm hover:bg-surface-muted"
                  >
                    <span className="font-medium">
                      <Highlight text={s.name} query={q} />
                    </span>
                    <p className="text-foreground-muted">
                      <Highlight text={s.summary} query={q} />
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {flashcardResults.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">
                Flashcards &amp; glossary
              </h2>
              <div className="mt-2 space-y-2">
                {flashcardResults.map((c) => (
                  <Link
                    key={c.id}
                    href={`/glossary?q=${encodeURIComponent(c.term)}`}
                    className="block rounded-md border border-border bg-surface p-3 text-sm hover:bg-surface-muted"
                  >
                    <span className="font-medium">
                      <Highlight text={c.term} query={q} />
                    </span>
                    <p className="text-foreground-muted">
                      <Highlight text={c.definition} query={q} />
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {questionResults.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">
                Practice questions
              </h2>
              <div className="mt-2 space-y-2">
                {questionResults.map((qq) => {
                  const isExpanded = expandedQuestionId === qq.id;
                  return (
                    <div key={qq.id} className="rounded-md border border-border bg-surface">
                      <button
                        type="button"
                        onClick={() => setExpandedQuestionId(isExpanded ? null : qq.id)}
                        aria-expanded={isExpanded}
                        className="flex w-full items-start justify-between gap-3 p-3 text-left text-sm hover:bg-surface-muted"
                      >
                        <span>
                          <span className="mr-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-strong">
                            {domainName(qq.domainKey)}
                          </span>
                          <Highlight text={qq.prompt} query={q} />
                        </span>
                        <span className="shrink-0 text-foreground-muted">{isExpanded ? "▲" : "▼"}</span>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-border p-3">
                          <PracticeQuestionCard question={qq} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}
