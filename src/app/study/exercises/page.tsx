import type { Metadata } from "next";
import Link from "next/link";
import { ExercisesList } from "./ExercisesList";

export const metadata: Metadata = { title: "Interactive Exercises" };

export default function ExercisesIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/study" className="text-sm text-brand hover:underline">
        ← Back to Study
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Interactive exercises</h1>
      <p className="mt-2 text-foreground-muted">
        Hands-on practice that goes beyond multiple choice.
      </p>
      <ExercisesList />
    </div>
  );
}
