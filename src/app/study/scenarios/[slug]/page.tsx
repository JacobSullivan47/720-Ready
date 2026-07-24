import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { scenarios } from "@/content/scenarios";
import { scenarioKeyFromSlug, scenarioSlug } from "@/lib/slugs";
import { TopicOverview } from "@/components/topic-overview";
import { MarkOverviewViewed } from "@/components/mark-overview-viewed";

export function generateStaticParams() {
  return scenarios.map((s) => ({ slug: scenarioSlug(s.key) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const key = scenarioKeyFromSlug(slug);
  const scenario = scenarios.find((s) => s.key === key);
  return { title: scenario?.name ?? "Scenario" };
}

export default async function ScenarioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const key = scenarioKeyFromSlug(slug);
  const scenario = scenarios.find((s) => s.key === key);
  if (!scenario) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <MarkOverviewViewed itemType="SCENARIO" itemKey={scenario.key} />
      <TopicOverview
        data={scenario}
        eyebrow="Production scenario"
        actions={
          <>
            <Link
              href={`/study/flashcards?scenario=${scenario.key}`}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Study flashcards
            </Link>
            <Link
              href={`/practice?scenario=${scenario.key}`}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted"
            >
              Practice questions
            </Link>
          </>
        }
      />
      <div className="mt-8">
        <Link href="/study/overview" className="text-sm text-brand hover:underline">
          ← Back to all domains &amp; scenarios
        </Link>
      </div>
    </div>
  );
}
