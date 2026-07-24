"use client";

import { useState } from "react";
import { PASSING_SCALED_SCORE, SCALED_SCORE_MAX } from "@/lib/scoring";

export function ShareScoreCard({ scaledScore, passed }: { scaledScore: number; passed: boolean }) {
  const [copied, setCopied] = useState(false);
  const shareText = `I scored ${scaledScore}/${SCALED_SCORE_MAX} on my 720 Ready mock exam for the Claude Certified Architect – Foundations exam${
    passed ? " — passing!" : `. (Passing is ${PASSING_SCALED_SCORE}+)`
  } 🎯`;

  async function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-brand bg-gradient-to-br from-brand-soft to-surface p-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong">
        720 Ready · Mock Exam Result
      </p>
      <p className="mt-3 text-5xl font-bold text-foreground">{scaledScore}</p>
      <p className="text-sm text-foreground-muted">out of {SCALED_SCORE_MAX}</p>
      <p
        className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
          passed ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
        }`}
      >
        {passed ? "Passing" : "Below passing (720)"}
      </p>
      <div className="mt-5">
        <button
          onClick={share}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          {copied ? "Copied!" : "Share this result"}
        </button>
      </div>
      <p className="mt-3 text-xs text-foreground-muted">
        Shares only your score summary — no real exam content.
      </p>
    </div>
  );
}
