"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import clsx from "clsx";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/study", label: "Study" },
  { href: "/practice", label: "Practice" },
  { href: "/exam", label: "Mock Exam" },
  { href: "/glossary", label: "Glossary" },
  { href: "/tutor", label: "AI Tutor" },
];

export function NavBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white"
            >
              720
            </span>
            <span className="hidden sm:inline">720 Ready</span>
          </Link>
          <nav aria-label="Primary" className="hidden md:flex md:items-center md:gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-soft text-brand-strong"
                      : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>
          <ThemeToggle />
          {status === "authenticated" && session?.user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="hidden rounded-md px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-muted hover:text-foreground sm:inline"
              >
                {session.user.name ?? session.user.email}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-muted"
              >
                Sign out
              </button>
            </div>
          ) : status === "loading" ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-surface-muted" />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-strong"
              >
                Create account
              </Link>
            </div>
          )}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav aria-label="Primary mobile" className="border-t border-border px-4 py-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
