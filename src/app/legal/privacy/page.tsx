import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-foreground-muted sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Privacy Policy</h1>
      <p className="mt-4 text-sm italic">
        Draft placeholder — last updated July 2026. This is boilerplate, not legal advice; have a
        lawyer review this against applicable privacy law (e.g. GDPR/CCPA) for your actual user
        base before you publish this app publicly.
      </p>

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">What we collect</h2>
          <p className="mt-2">
            Account information you provide (name, email, hashed password or OAuth identity), and
            study activity you generate while using the Service (flashcard ratings, quiz answers,
            mock exam scores, bookmarks) so your progress can persist across devices. If you use
            the AI tutor chat, your messages are sent to Anthropic&apos;s API to generate a
            response and stored so your conversation history is available across sessions.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Guest mode</h2>
          <p className="mt-2">
            If you use the Service without an account, your progress is stored only in your
            browser&apos;s local storage and is never sent to our servers. It will not sync across
            devices and can be lost if you clear your browser data.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">How we use it</h2>
          <p className="mt-2">
            To operate the Service (save your progress, schedule flashcard reviews, compute mock
            exam scores) and to improve it. We do not sell your personal data.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Third parties</h2>
          <p className="mt-2">
            We use Anthropic&apos;s API to power the optional AI tutor chat feature. Messages you
            send to the tutor are processed by Anthropic to generate a response, subject to
            Anthropic&apos;s own data handling terms.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Your choices</h2>
          <p className="mt-2">
            You can request deletion of your account and associated data at any time by contacting
            the site operator.
          </p>
        </section>
      </div>
    </div>
  );
}
