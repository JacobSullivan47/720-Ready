"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import { domainSlug, scenarioSlug } from "@/lib/slugs";
import { useProgress } from "@/hooks/use-progress";
import type { ViewedOverviews } from "@/lib/progress-types";

function ReadBadge({ read }: { read: boolean }) {
  if (!read) return null;
  return (
    <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">✓ Read</span>
  );
}

export default function StudyOverviewPage() {
  const { client } = useProgress();
  const [viewed, setViewed] = useState<ViewedOverviews>({ domainKeys: [], scenarioKeys: [] });

  useEffect(() => {
    client.getViewedOverviews().then(setViewed).catch(() => {});
  }, [client]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Concept Overviews</h1>
      <p className="mt-2 max-w-2xl text-foreground-muted">
        Browse domain and scenario overviews covering key knowledge, key skills, and anti-patterns.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Domains</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {domains.map((d) => {
          const read = viewed.domainKeys.includes(d.key);
          return (
            <Link
              key={d.key}
              href={`/study/domains/${domainSlug(d.key)}`}
              className={clsx(
                "rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-muted",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-medium">{d.name}</h3>
                <div className="flex items-center gap-2">
                  <ReadBadge read={read} />
                  <span className="text-sm font-semibold text-brand">{d.weightPct}%</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-foreground-muted">{d.summary}</p>
            </Link>
          );
        })}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Scenarios</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {scenarios.map((s) => {
          const read = viewed.scenarioKeys.includes(s.key);
          return (
            <Link
              key={s.key}
              href={`/study/scenarios/${scenarioSlug(s.key)}`}
              className="rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-muted"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-medium">{s.name}</h3>
                <ReadBadge read={read} />
              </div>
              <p className="mt-2 text-sm text-foreground-muted">{s.summary}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10">
        <Link href="/study" className="text-sm text-brand hover:underline">
          ← Back to Study
        </Link>
      </div>
    </div>
  );
}
