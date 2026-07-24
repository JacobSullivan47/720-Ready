import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Interactive Exercises" };

const EXERCISES = [
  {
    href: "/study/exercises/config-builder",
    title: "CLAUDE.md / rules config builder",
    description:
      "Sort real configuration decisions into root CLAUDE.md, nested CLAUDE.md, scoped rule files, the three MCP scopes, or hooks — and see why each placement matters.",
  },
  {
    href: "/study/exercises/anti-pattern-spotter",
    title: "Anti-pattern spotter",
    description:
      "Five flawed designs across different domains. Spot what's wrong, then pick the correct fix.",
  },
  {
    href: "/study/exercises/sequencing",
    title: "Sequence the agentic loop",
    description:
      "Click steps into the right order for a tool-use turn, a dynamic investigation, and an escalation handoff.",
  },
];

export default function ExercisesIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Interactive exercises</h1>
      <p className="mt-2 text-foreground-muted">
        Hands-on practice that goes beyond multiple choice.
      </p>
      <div className="mt-6 space-y-4">
        {EXERCISES.map((ex) => (
          <Link
            key={ex.href}
            href={ex.href}
            className="block rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-muted"
          >
            <h2 className="font-semibold">{ex.title}</h2>
            <p className="mt-1 text-sm text-foreground-muted">{ex.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
