import type { Metadata } from "next";
import Link from "next/link";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import { domainSlug, scenarioSlug } from "@/lib/slugs";

export const metadata: Metadata = { title: "Study" };

export default function StudyIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Study</h1>
      <p className="mt-2 max-w-2xl text-foreground-muted">
        Read the concept overviews, then reinforce them with flashcards and interactive exercises.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/study/flashcards"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          Study flashcards
        </Link>
        <Link
          href="/study/exercises"
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted"
        >
          Interactive exercises
        </Link>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Domains</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {domains.map((d) => (
          <Link
            key={d.key}
            href={`/study/domains/${domainSlug(d.key)}`}
            className="rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-muted"
          >
            <div className="flex items-baseline justify-between">
              <h3 className="font-medium">{d.name}</h3>
              <span className="text-sm font-semibold text-brand">{d.weightPct}%</span>
            </div>
            <p className="mt-2 text-sm text-foreground-muted">{d.summary}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Scenarios</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {scenarios.map((s) => (
          <Link
            key={s.key}
            href={`/study/scenarios/${scenarioSlug(s.key)}`}
            className="rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-muted"
          >
            <h3 className="font-medium">{s.name}</h3>
            <p className="mt-2 text-sm text-foreground-muted">{s.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
