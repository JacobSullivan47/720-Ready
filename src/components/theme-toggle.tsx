"use client";

import { useState } from "react";

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

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  function toggle() {
    const next: Theme = (theme ?? getSystemTheme()) === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      {theme === "dark" ? (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path
            d="M12 3v1.5M12 19.5V21M4.22 4.22l1.06 1.06M18.72 18.72l1.06 1.06M3 12h1.5M19.5 12H21M4.22 19.78l1.06-1.06M18.72 5.28l1.06-1.06"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ) : (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path
            d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
