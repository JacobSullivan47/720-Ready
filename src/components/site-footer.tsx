import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-foreground-muted sm:px-6">
        <p className="max-w-3xl">
          Study content adapted from the{" "}
          <em>Community study guide for the Claude Certified Architect – Foundations certification exam</em>{" "}
          by Daron Yondem, licensed{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            CC BY 4.0
          </a>
          . All flashcards, practice questions, and explanations on this site are original
          writing — none are copied from that guide or from any Anthropic materials.
        </p>
        <p className="mt-2 max-w-3xl">
          720 Ready is an independent study tool and is not affiliated with, endorsed by, or
          sponsored by Anthropic. It does not reproduce or simulate the real CCA-F exam — every
          practice question here is original content written to teach the same knowledge
          domains.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/about" className="hover:text-foreground hover:underline">
            About &amp; Licensing
          </Link>
          <Link href="/legal/terms" className="hover:text-foreground hover:underline">
            Terms of Use
          </Link>
          <Link href="/legal/privacy" className="hover:text-foreground hover:underline">
            Privacy
          </Link>
          <a
            href="https://github.com/daronyondem/claude-architect-exam-guide"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground hover:underline"
          >
            Source guide (GitHub)
          </a>
        </div>
      </div>
    </footer>
  );
}
