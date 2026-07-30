"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useContentBank } from "@/hooks/use-content-bank";
import { domains } from "@/content/domains";
import type { DomainKey } from "@/content/types";

function GlossaryPageInner() {
  const searchParams = useSearchParams();
  const { bank, loading } = useContentBank();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [domainFilter, setDomainFilter] = useState<DomainKey | "ALL">("ALL");

  const entries = useMemo(() => {
    if (!bank) return [];
    const q = query.trim().toLowerCase();
    return bank.flashcards
      .filter((c) => domainFilter === "ALL" || c.domainKey === domainFilter)
      .filter((c) => !q || c.term.toLowerCase().includes(q) || c.definition.toLowerCase().includes(q))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [bank, query, domainFilter]);

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof entries>();
    for (const entry of entries) {
      const letter = entry.term[0]?.toUpperCase() ?? "#";
      const key = /[A-Z]/.test(letter) ? letter : "#";
      groups.set(key, [...(groups.get(key) ?? []), entry]);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [entries]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Glossary</h1>
      <p className="mt-2 text-foreground-muted">
        Every term across all domains, alphabetized. Filter by domain or search.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms…"
          aria-label="Search glossary terms"
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value as DomainKey | "ALL")}
          aria-label="Filter by domain"
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="ALL">All domains</option>
          {domains.map((d) => (
            <option key={d.key} value={d.key}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="mt-6 h-64 animate-pulse rounded-lg bg-surface-muted" />
      ) : grouped.length === 0 ? (
        <p className="mt-8 text-center text-foreground-muted">No terms match.</p>
      ) : (
        <div className="mt-8 space-y-8">
          {grouped.map(([letter, items]) => (
            <div key={letter}>
              <h2 className="text-sm font-semibold text-brand">{letter}</h2>
              <dl className="mt-2 divide-y divide-border">
                {items.map((c) => (
                  <div key={c.id} className="py-3">
                    <dt className="font-medium">{c.term}</dt>
                    <dd className="mt-1 text-sm text-foreground-muted">{c.definition}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GlossaryClient() {
  return (
    <Suspense>
      <GlossaryPageInner />
    </Suspense>
  );
}
