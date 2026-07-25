"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

export function DeleteAccountSection() {
  const { data: session, status } = useSession();
  const [expanded, setExpanded] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status !== "authenticated") return null;

  const email = session?.user?.email ?? "";
  const canDelete = confirmText.trim().toLowerCase() === email.toLowerCase();

  async function handleDelete() {
    if (!canDelete || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete your account.");
      setDeleting(false);
    }
  }

  return (
    <div id="delete-account" className="rounded-lg border border-danger-soft bg-danger-soft p-5">
      <h3 className="font-semibold text-foreground">Delete your account</h3>
      <p className="mt-2 text-sm">
        Permanently deletes your account and everything tied to it — flashcard progress, practice
        and mock exam history, bookmarks, and tutor chat history. This can&apos;t be undone.
      </p>

      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="mt-4 rounded-md border border-danger px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/10"
        >
          Delete my account
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span>
              Type your email (<strong>{email}</strong>) to confirm:
            </span>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={email}
              disabled={deleting}
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-danger disabled:opacity-60"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDelete}
              disabled={!canDelete || deleting}
              className="rounded-md bg-danger px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Permanently delete my account"}
            </button>
            <button
              onClick={() => {
                setExpanded(false);
                setConfirmText("");
                setError(null);
              }}
              disabled={deleting}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
