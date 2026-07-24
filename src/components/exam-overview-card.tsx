import Link from "next/link";
import { domains } from "@/content/domains";
import {
  MOCK_EXAM_SCENARIO_COUNT,
  PASSING_SCALED_SCORE,
  SCALED_SCORE_MAX,
  SCALED_SCORE_MIN,
  TOTAL_MOCK_QUESTIONS,
} from "@/lib/scoring";

const EXAM_GUIDE_URL =
  "https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf";

const questionsPerScenario = TOTAL_MOCK_QUESTIONS / MOCK_EXAM_SCENARIO_COUNT;
const timeLimitMinutes = 120;

/** First-time orientation: how the real CCA-F exam is structured, plus a
 * link out to Anthropic's official exam guide PDF for authoritative details. */
export function ExamOverviewCard() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">How the CCA-F exam works</h2>
        <a
          href={EXAM_GUIDE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-strong"
        >
          Read the Official Exam Guide (PDF)
          <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path
              d="M7 17 17 7M9 7h8v8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

      <p className="mt-3 text-sm text-foreground-muted">
        New to the exam? Here&apos;s the shape of it in plain terms:
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-foreground-muted">
        <li>
          <strong className="text-foreground">{TOTAL_MOCK_QUESTIONS} questions total</strong>, split across{" "}
          <strong className="text-foreground">{MOCK_EXAM_SCENARIO_COUNT} production scenarios</strong> randomly
          drawn from a pool of 6 possible ones each sitting — {questionsPerScenario} questions per scenario.
        </li>
        <li>
          Every question also maps to one of <strong className="text-foreground">{domains.length} weighted
          knowledge domains</strong>:{" "}
          {domains.map((d, i) => (
            <span key={d.key}>
              {d.name} ({d.weightPct}%)
              {i < domains.length - 2 ? ", " : i === domains.length - 2 ? ", and " : ""}
            </span>
          ))}
          . Domains with a higher weight make up more of the exam.
        </li>
        <li>
          You get <strong className="text-foreground">{timeLimitMinutes} minutes</strong> to complete it.
        </li>
        <li>
          Scored on a scale from <strong className="text-foreground">{SCALED_SCORE_MIN}</strong> to{" "}
          <strong className="text-foreground">{SCALED_SCORE_MAX}</strong>; you need{" "}
          <strong className="text-foreground">{PASSING_SCALED_SCORE}+</strong> to pass.
        </li>
      </ul>
      <p className="mt-3 text-xs text-foreground-muted">
        General guidance as of July 2026 — logistics like fees, retakes, and scoring can change, so treat the
        official guide above (and Anthropic&apos;s certification page) as the source of truth. This app&apos;s{" "}
        <Link href="/exam" className="text-brand hover:underline">
          mock exam
        </Link>{" "}
        mirrors this same format for practice.
      </p>
    </div>
  );
}
