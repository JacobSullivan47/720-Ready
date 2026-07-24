import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About & Licensing" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">About 720 Ready</h1>
      <p className="mt-4 text-foreground-muted">
        720 Ready is an independent study tool for people preparing for the Claude Certified
        Architect – Foundations (CCA-F) certification exam. It is not affiliated with, endorsed
        by, or sponsored by Anthropic, and it does not reproduce, leak, or simulate the real
        proctored exam. Everything here — every flashcard, practice question, and explanation —
        was written to teach the underlying knowledge domains, not to imitate the actual test.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Content licensing &amp; attribution</h2>
        <p className="mt-3 text-foreground-muted">
          The exam&apos;s domain structure, weighting, and scenario list used to organize this
          app&apos;s content are adapted from the{" "}
          <a
            href="https://github.com/daronyondem/claude-architect-exam-guide"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline hover:text-brand-strong"
          >
            Community study guide for the Claude Certified Architect – Foundations certification
            exam
          </a>
          , written by Daron Yondem and licensed under{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline hover:text-brand-strong"
          >
            Creative Commons Attribution 4.0 (CC BY 4.0)
          </a>
          , which permits commercial reuse and adaptation with attribution.
        </p>
        <p className="mt-3 text-foreground-muted">
          No text on this site is copied or lightly paraphrased from that guide, from its own
          practice questions, or from any Anthropic documentation. All flashcards, practice
          questions, explanations, and overview pages are original writing produced for this app,
          testing the same concepts through new scenarios and wording.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Not a reproduction of the real exam</h2>
        <p className="mt-3 text-foreground-muted">
          This app teaches the knowledge domains covered by the CCA-F exam. It does not claim to
          reproduce, simulate, or leak any actual exam question, and no content here should be
          treated as a preview of what will appear on the real, proctored exam.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Exam logistics (verify before you rely on this)</h2>
        <p className="mt-3 text-foreground-muted">
          Details like the exam fee, retake policy, time limit, and scoring scale shown in this
          app reflect general, publicly available guidance as of{" "}
          <strong>July 2026</strong> and can change. Always check{" "}
          <a
            href="https://www.anthropic.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline hover:text-brand-strong"
          >
            Anthropic&apos;s official certification page
          </a>{" "}
          for the current, authoritative details before registering or scheduling an exam.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Questions or corrections</h2>
        <p className="mt-3 text-foreground-muted">
          Found something inaccurate, or think a question is ambiguous? See{" "}
          <Link href="/legal/terms" className="text-brand underline hover:text-brand-strong">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="text-brand underline hover:text-brand-strong">
            Privacy
          </Link>{" "}
          for the rest of the fine print.
        </p>
      </section>
    </div>
  );
}
