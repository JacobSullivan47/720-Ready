import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Study",
  description:
    "Study for the Claude Certified Architect – Foundations exam with concept overviews, spaced-repetition flashcards, and interactive exercises.",
};

const STUDY_MODES = [
  {
    href: "/study/overview",
    title: "Concept Overviews",
    description:
      "Read domain and scenario overviews — key knowledge, key skills, anti-patterns, and how it shows up in exam-style questions.",
  },
  {
    href: "/study/flashcards",
    title: "Flashcards",
    description: "Spaced-repetition flashcards, organized by domain or scenario.",
  },
  {
    href: "/study/exercises",
    title: "Interactive Exercises",
    description:
      "Hands-on practice: a CLAUDE.md config builder, an anti-pattern spotter, and a sequencing exercise.",
  },
];

export default function StudyIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Study</h1>
      <p className="mt-2 max-w-2xl text-foreground-muted">
        Read the concept overviews, then reinforce them with flashcards and interactive exercises.
      </p>

      <div className="mt-6 space-y-4">
        {STUDY_MODES.map((mode) => (
          <Link
            key={mode.href}
            href={mode.href}
            className="block rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-muted"
          >
            <h2 className="font-semibold">{mode.title}</h2>
            <p className="mt-1 text-sm text-foreground-muted">{mode.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
