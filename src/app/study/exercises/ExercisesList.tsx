"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ANTI_PATTERN_SCENARIOS,
  CONFIG_BUILDER_ITEM_ID,
  SEQUENCING_EXERCISES,
} from "@/content/exercises";
import { useProgress } from "@/hooks/use-progress";

const EXERCISES = [
  {
    href: "/study/exercises/config-builder",
    title: "CLAUDE.md / rules config builder",
    description:
      "Sort real configuration decisions into root CLAUDE.md, nested CLAUDE.md, scoped rule files, the three MCP scopes, or hooks — and see why each placement matters.",
    itemIds: [CONFIG_BUILDER_ITEM_ID],
  },
  {
    href: "/study/exercises/anti-pattern-spotter",
    title: "Anti-pattern spotter",
    description:
      "Five flawed designs across different domains. Spot what's wrong, then pick the correct fix.",
    itemIds: ANTI_PATTERN_SCENARIOS.map((s) => `apspotter:${s.id}`),
  },
  {
    href: "/study/exercises/sequencing",
    title: "Sequence the agentic loop",
    description:
      "Click steps into the right order for a tool-use turn, a dynamic investigation, and an escalation handoff.",
    itemIds: SEQUENCING_EXERCISES.map((e) => `sequencing:${e.id}`),
  },
];

function ProgressBadge({ attempted, total }: { attempted: number; total: number }) {
  if (attempted === 0) return null;
  if (attempted >= total) {
    return (
      <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
        ✓ Completed
      </span>
    );
  }
  return (
    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-foreground-muted">
      {attempted}/{total} done
    </span>
  );
}

export function ExercisesList() {
  const { client } = useProgress();
  const [attemptedItemIds, setAttemptedItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    client
      .getExerciseAttempts()
      .then((attempts) => setAttemptedItemIds(new Set(attempts.map((a) => a.itemId))))
      .catch(() => {});
  }, [client]);

  return (
    <div className="mt-6 space-y-4">
      {EXERCISES.map((ex) => {
        const attempted = ex.itemIds.filter((id) => attemptedItemIds.has(id)).length;
        return (
          <Link
            key={ex.href}
            href={ex.href}
            className="block rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-muted"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-semibold">{ex.title}</h2>
              <ProgressBadge attempted={attempted} total={ex.itemIds.length} />
            </div>
            <p className="mt-1 text-sm text-foreground-muted">{ex.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
