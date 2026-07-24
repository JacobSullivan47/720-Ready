import type { ReactNode } from "react";
import type { TopicOverview as TopicOverviewData } from "@/content/types";

export function TopicOverview({
  data,
  eyebrow,
  actions,
}: {
  data: TopicOverviewData;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <div>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">{eyebrow}</p>
      )}
      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{data.name}</h1>
      <p className="mt-4 max-w-3xl text-foreground-muted">{data.summary}</p>

      {actions && <div className="mt-5 flex flex-wrap gap-3">{actions}</div>}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-semibold">Key knowledge</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground-muted">
            {data.keyKnowledge.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-semibold">Key skills</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground-muted">
            {data.keySkills.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-danger-soft bg-danger-soft p-5">
        <h2 className="font-semibold text-foreground">Common anti-patterns</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground">
          {data.antiPatterns.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-lg border border-brand-soft bg-brand-soft p-5">
        <h2 className="font-semibold text-brand-strong">How this shows up in exam-style questions</h2>
        <p className="mt-2 text-sm text-foreground">{data.examStyleNote}</p>
      </section>
    </div>
  );
}
