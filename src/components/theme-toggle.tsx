"use client";

import { useState } from "react";
import clsx from "clsx";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Lazy initializer (not an effect): reads the already-applied data-theme
// attribute set synchronously by ThemeScript before hydration, so this
// matches what the user actually sees on first paint without a second
// render pass.
function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const stamped = document.documentElement.getAttribute("data-theme") as Theme | null;
  return stamped ?? getSystemTheme();
}

function SunIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M12 3v1.5M12 19.5V21M4.22 4.22l1.06 1.06M18.72 18.72l1.06 1.06M3 12h1.5M19.5 12H21M4.22 19.78l1.06-1.06M18.72 5.28l1.06-1.06"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const OPTIONS: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
];

/** Segmented light/dark control — settings-page control, not a header icon button. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  function choose(next: Theme) {
    if (next === theme) return;
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="inline-flex rounded-full border border-border bg-surface-muted p-1"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          onClick={() => choose(value)}
          className={clsx(
            "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            theme === value
              ? "bg-brand text-white"
              : "text-foreground-muted hover:text-foreground",
          )}
        >
          <Icon />
          {label}
        </button>
      ))}
    </div>
  );
}
