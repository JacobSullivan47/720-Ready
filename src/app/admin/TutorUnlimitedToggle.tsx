"use client";

import { useState } from "react";

export function TutorUnlimitedToggle({
  userId,
  initialValue,
}: {
  userId: string;
  initialValue: boolean;
}) {
  const [checked, setChecked] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !checked;
    setChecked(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorUnlimited: next }),
      });
      if (!res.ok) throw new Error("Request failed");
    } catch {
      setChecked(!next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        disabled={saving}
        onChange={toggle}
        className="h-4 w-4 rounded border-border accent-brand disabled:opacity-60"
      />
      <span className="text-xs text-foreground-muted">{checked ? "Unlimited" : "Standard"}</span>
    </label>
  );
}
