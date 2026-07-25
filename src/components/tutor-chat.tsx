"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_START_PROMPTS = [
  "Explain my weakest domain and why it matters for the exam.",
  "What should I study next?",
  "Quiz me with a question about agentic architecture.",
];

function focusLabel(focus: string | null): string | null {
  if (!focus) return null;
  const separatorIndex = focus.indexOf(":");
  if (separatorIndex === -1) return null;
  const kind = focus.slice(0, separatorIndex);
  const key = focus.slice(separatorIndex + 1);

  if (kind === "domain") return domains.find((d) => d.key === key)?.name ?? null;
  if (kind === "scenario") return scenarios.find((s) => s.key === key)?.name ?? null;
  if (kind === "question") return "a practice question you missed";
  return null;
}

function focusStarterMessage(focus: string | null, label: string | null): string | null {
  if (!focus || !label) return null;
  if (focus.startsWith("question:")) return "I got this question wrong — can you explain why?";
  return `Can you help me understand ${label}?`;
}

export function TutorChat({
  focus = null,
  variant = "page",
  onClose,
}: {
  focus?: string | null;
  variant?: "page" | "drawer";
  onClose?: () => void;
}) {
  const { status } = useSession();
  const label = focusLabel(focus);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [chipDismissed, setChipDismissed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prefilledForFocus = useRef<string | null>(null);
  const lastSentFocus = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    const url = focus ? `/api/tutor/messages?focus=${encodeURIComponent(focus)}` : "/api/tutor/messages";
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setMessages(data.messages.map((m: ChatMessage) => ({ id: m.id, role: m.role, content: m.content })));
        setRemaining(data.remainingToday);
        setLimit(data.limitPerDay);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [status, focus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!focus || !label) return;
    if (prefilledForFocus.current === focus) return;
    prefilledForFocus.current = focus;
    setInput(focusStarterMessage(focus, label) ?? "");
  }, [focus, label]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const focusToSend = focus && lastSentFocus.current !== focus ? focus : undefined;

    setError(null);
    setSending(true);
    setInput("");
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: "user", content: text }]);

    const res = await fetch("/api/tutor/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, focus: focusToSend }),
    });
    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    if (focusToSend) lastSentFocus.current = focusToSend;
    setMessages((prev) => [...prev, { id: `reply-${Date.now()}`, role: "assistant", content: data.reply }]);
    setRemaining(data.remainingToday);
  }

  function applyQuickStart(prompt: string) {
    setInput(prompt);
  }

  const isDrawer = variant === "drawer";

  if (status === "loading") {
    return (
      <div className={isDrawer ? "flex h-full flex-col p-4" : "mx-auto max-w-2xl px-4 py-10 sm:px-6"}>
        <div className="h-64 animate-pulse rounded-lg bg-surface-muted" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div
        className={
          isDrawer
            ? "flex h-full flex-col items-center justify-center px-6 text-center"
            : "mx-auto max-w-md px-4 py-16 text-center sm:px-6"
        }
      >
        <h1 className="text-2xl font-semibold tracking-tight">AI Study Tutor</h1>
        <p className="mt-3 text-foreground-muted">
          Ask follow-up questions about anything you&apos;re stuck on. This feature requires a free
          account so we can keep usage fair for everyone.
        </p>
        <Link
          href="/register"
          className="mt-6 inline-block rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          Create a free account
        </Link>
        <p className="mt-3 text-sm text-foreground-muted">
          Already have one?{" "}
          <Link href="/login" className="text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  const showQuickStart = loaded && messages.length === 0 && (!focus || !label || chipDismissed);

  return (
    <div
      className={
        isDrawer
          ? "flex h-full flex-col px-4 py-4"
          : "mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-4 py-6 sm:px-6"
      }
    >
      <div className="flex items-baseline justify-between gap-2">
        <h1 className={isDrawer ? "text-lg font-semibold tracking-tight" : "text-xl font-semibold tracking-tight"}>
          AI Study Tutor
        </h1>
        <div className="flex items-center gap-3">
          {remaining != null && limit != null && (
            <span className="text-xs text-foreground-muted">
              {remaining} of {limit} left today
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close tutor"
              className="text-lg leading-none text-foreground-muted hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-foreground-muted">
        Explains concepts from this app&apos;s study material — it can&apos;t reveal or predict real
        exam questions.
      </p>

      {focus && label && !chipDismissed && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-md bg-brand-soft px-3 py-2 text-sm text-brand-strong">
          <span>
            Discussing: <strong>{label}</strong>
          </span>
          <button
            onClick={() => setChipDismissed(true)}
            className="text-xs text-brand-strong hover:underline"
            aria-label="Dismiss context"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-lg border border-border bg-surface p-4">
        {!loaded ? (
          <div className="h-full animate-pulse rounded-md bg-surface-muted" />
        ) : messages.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-foreground-muted">
              {showQuickStart
                ? "Not sure where to start? Try one of these:"
                : "Ask something like \"What's the difference between compaction and context editing?\""}
            </p>
            {showQuickStart && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {QUICK_START_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => applyQuickStart(prompt)}
                    className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium hover:bg-border"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={clsx(
                  "max-w-[85%] whitespace-pre-wrap rounded-lg px-4 py-2.5 text-sm",
                  m.role === "user" ? "bg-brand text-white" : "bg-surface-muted text-foreground",
                )}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-surface-muted px-4 py-2.5 text-sm text-foreground-muted">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p role="alert" className="mt-2 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          disabled={sending || remaining === 0}
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending || !input.trim() || remaining === 0}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
