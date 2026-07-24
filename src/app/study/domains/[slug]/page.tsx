import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { domains } from "@/content/domains";
import { domainKeyFromSlug, domainSlug } from "@/lib/slugs";
import { TopicOverview } from "@/components/topic-overview";
import { MarkOverviewViewed } from "@/components/mark-overview-viewed";

export function generateStaticParams() {
  return domains.map((d) => ({ slug: domainSlug(d.key) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const key = domainKeyFromSlug(slug);
  const domain = domains.find((d) => d.key === key);
  return { title: domain?.name ?? "Domain" };
}

export default async function DomainPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const key = domainKeyFromSlug(slug);
  const domain = domains.find((d) => d.key === key);
  if (!domain) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <MarkOverviewViewed itemType="DOMAIN" itemKey={domain.key} />
      <TopicOverview
        data={domain}
        eyebrow={`Domain · ${domain.weightPct}% of the exam`}
        actions={
          <>
            <Link
              href={`/study/flashcards?domain=${domain.key}`}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Study flashcards
            </Link>
            <Link
              href={`/practice?domain=${domain.key}`}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted"
            >
              Practice questions
            </Link>
            <Link
              href={`/tutor?focus=domain:${domain.key}`}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted"
            >
              Ask the tutor
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
