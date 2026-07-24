import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-foreground-muted sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Terms of Use</h1>
      <p className="mt-4 text-sm italic">
        Draft placeholder — last updated July 2026. This is boilerplate, not legal advice; have a
        lawyer review and adapt it to your jurisdiction and business details before you publish
        this app publicly.
      </p>

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. What this service is</h2>
          <p className="mt-2">
            720 Ready (&quot;the Service&quot;) is an independent, unofficial study tool for the Claude
            Certified Architect – Foundations exam. It is not produced, endorsed, or verified by
            Anthropic, and passing quizzes or mock exams here is not a guarantee of any outcome on
            the real certification exam.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Accounts</h2>
          <p className="mt-2">
            You are responsible for keeping your account credentials secure and for all activity
            under your account. You must provide accurate information when registering.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Acceptable use</h2>
          <p className="mt-2">
            Don&apos;t attempt to disrupt the Service, scrape it at scale, resell its content, or
            use it to build a competing product without permission.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Content and accuracy</h2>
          <p className="mt-2">
            Study content is provided for educational purposes on an &quot;as is&quot; basis, without
            warranty of accuracy or completeness. Exam logistics (fees, scoring, retake policy)
            change over time — always confirm current details with Anthropic directly.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Changes</h2>
          <p className="mt-2">
            These terms may be updated from time to time. Continued use of the Service after a
            change constitutes acceptance of the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
