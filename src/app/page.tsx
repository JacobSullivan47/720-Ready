import Link from "next/link";
import { auth } from "@/auth";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import { ExamOverviewCard } from "@/components/exam-overview-card";

export default async function LandingPage() {
  const session = await auth();
  const isSignedIn = !!session?.user;

  return (
    <div>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          Claude Certified Architect – Foundations
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Get to 720, and know exactly why.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-foreground-muted">
          720 Ready is a focused study tool for the CCA-F exam: spaced-repetition flashcards,
          original practice questions with plain-language explanations, interactive exercises, and
          full-length mock exams — all tracked against the exam&apos;s real domain weighting.
        </p>
        {isSignedIn ? (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              Go to your dashboard
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
              >
                Start studying — no account needed
              </Link>
              <Link
                href="/register"
                className="rounded-md border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
              >
                Create a free account
              </Link>
            </div>
            <p className="mt-3 text-sm text-foreground-muted">
              Guest progress is saved on this device only — create an account any time to sync it.
            </p>
          </>
        )}

        <div className="mt-10 max-w-3xl">
          <ExamOverviewCard />
        </div>
      </section>

      <section className="border-t border-border bg-surface py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-semibold">Five domains, weighted like the real exam</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {domains.map((d) => (
              <div key={d.key} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-medium">{d.name}</h3>
                  <span className="text-sm font-semibold text-brand">{d.weightPct}%</span>
                </div>
                <p className="mt-2 text-sm text-foreground-muted">{d.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-semibold">Six production scenarios, four drawn per exam</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {scenarios.map((s) => (
              <li key={s.key} className="rounded-lg border border-border bg-surface p-4 text-sm">
                <span className="font-medium text-foreground">{s.name}</span>
                <p className="mt-1 text-foreground-muted">{s.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
