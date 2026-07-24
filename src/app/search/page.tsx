"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useContentBank } from "@/hooks/use-content-bank";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import { domainSlug, scenarioSlug } from "@/lib/slugs";

function matches(haystack: string, q: string) {
  return haystack.toLowerCase().includes(q);
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const { bank, loading } = useContentBank();

  const q = query.trim().toLowerCase();

  const domainResults = useMemo(
    () => (q ? domains.filter((d) => matches(d.name, q) || matches(d.summary, q)) : []),
    [q],
  );
  const scenarioResults = useMemo(
    () => (q ? scenarios.filter((s) => matches(s.name, q) || matches(s.summary, q)) : []),
    [q],
  );
  const flashcardResults = useMemo(() => {
    if (!q || !bank) return [];
    return bank.flashcards
      .filter((c) => matches(c.term, q) || matches(c.definition, q))
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
                    <span className="font-medium">{d.name}</span>
                    <p className="text-foreground-muted">{d.summary}</p>
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
                    <span className="font-medium">{s.name}</span>
                    <p className="text-foreground-muted">{s.summary}</p>
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
                  <div key={c.id} className="rounded-md border border-border bg-surface p-3 text-sm">
                    <span className="font-medium">{c.term}</span>
                    <p className="text-foreground-muted">{c.definition}</p>
                  </div>
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
                {questionResults.map((qq) => (
                  <Link
                    key={qq.id}
                    href={`/practice?domain=${qq.domainKey}`}
                    className="block rounded-md border border-border bg-surface p-3 text-sm hover:bg-surface-muted"
                  >
                    {qq.prompt}
                  </Link>
                ))}
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
