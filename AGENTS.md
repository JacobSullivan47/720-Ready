<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 720 Ready — project notes

Durable knowledge that isn't obvious from reading any single file. Keep this
updated when a decision or gotcha here would otherwise get rediscovered the
hard way.

## Dev workflow (Windows)

- **Restart the dev server after any Prisma schema change or new/changed env
  var.** Turbopack caches a stale bundle otherwise — this has caused a live
  500 (`Unknown argument marketingOptIn`) that `prisma generate` alone didn't
  fix. Pure component/CSS-only edits hot-reload fine, no restart needed.
  Kill any `node.exe` running `npm run dev` for this project, then
  `npm run dev` again.
- In this environment, PowerShell's `Set-Location`/`cd` has intermittently
  reset the tool's working directory instead of running the intended command.
  `Push-Location`/`Pop-Location`, or just passing absolute paths (e.g.
  `npx --prefix "<path>" tsc ...`), works reliably.
- After any change: `npx tsc --noEmit`, `npx eslint .`, `npx vitest run`.

## Architecture

- **Dual-mode progress persistence.** The `ProgressClient` interface
  (`src/lib/progress-types.ts`) has two implementations — `progress-local.ts`
  (guest/localStorage) and `progress-remote.ts` (authenticated/API) — chosen
  by `useProgress()`. Any new progress-tracked feature needs both kept in
  sync, or guests silently lose that feature.
- **Content-as-data.** `src/content/*.ts` is the single source of truth for
  domain/scenario/question/flashcard/exercise text; Postgres only stores
  relational anchors plus a seeded copy (`prisma/seed.ts`). IDs are
  deterministic (`stableId("question", [domainKey, prompt.slice(0, 80)])`) so
  editing option text and re-seeding never changes IDs — but editing the
  prompt text or domain does, which orphans any existing attempts/bookmarks
  tied to the old ID.
- **Mastery blend** (`src/lib/mastery.ts`): `MASTERY_WEIGHTS = { cards: 0.25,
  quiz: 0.35, exercises: 0.15, exam: 0.25 }`. Quiz accuracy only counts
  `PRACTICE`-mode question attempts — `MOCK`-mode attempts are excluded and
  instead feed the `exam` pillar, which aggregates `correct`/`total` across
  every completed mock exam's `domainBreakdown`, per domain (summed across
  all exams taken, not just the latest). Flashcards/questions need
  `MASTERY_MIN_REPETITIONS = 2` correct reps to count as mastered; exercises
  need just 1. Flashcard "mastered" also requires
  `CARD_MASTERY_RETENTION_CUTOFF = 0.75` retention.
- **AI Tutor conversations are scoped by "focus"** (`TutorConversation.focus`,
  e.g. `"domain:AGENTIC_ARCHITECTURE"`, `"question:<id>"`). A new/different
  focus starts a fresh conversation instead of dragging in unrelated history
  (keeps token usage down); a focus-less message continues whatever
  conversation is most recent. The full `/tutor` page generates a one-off
  `session:<uuid>` focus per page visit so opening it always reads as a clear
  new chat rather than resuming old history. The `TutorDrawer` is mounted
  once at the root layout and auto-closes on route change (`usePathname()`
  watcher in `tutor-drawer-provider.tsx`) plus explicit `close()` calls
  wherever a page advances to a different question without changing route
  (e.g. `/practice`'s "Next question").
- **Admin access** is gated purely by the `ADMIN_EMAILS` env var
  (comma-separated) via `isAdminEmail()` in `src/lib/admin.ts` — not a DB
  role. `/admin` 404s (not 403s) for non-admins so the route's existence
  isn't revealed.
- **Bookmarks** (`Bookmark` model, `itemType` FLASHCARD/QUESTION) are surfaced
  as actual study decks — "★ Bookmarked cards" in the flashcards picker and
  "★ Bookmarked questions" in practice — not just a static list. The
  standalone `/bookmarks` page still exists (linked from the dashboard) as a
  read-only combined view but is intentionally no longer linked from the
  flashcards tab.

## Testing conventions

- Live end-to-end verification pattern for anything touching auth/DB:
  register a throwaway account via `POST /api/register`, log in via the
  NextAuth credentials flow (`GET /api/auth/csrf` → extract the token →
  `POST /api/auth/callback/credentials` with a cookie jar), exercise the
  feature via `curl` against real routes, verify DB state with a one-off
  `tsx` script (run from the project root so `dotenv`/`@prisma/client`
  resolve) that does `config({ path: ".env.local" })`. **Always delete the
  throwaway user afterward**, and check first whether a target email might
  already be a real account before touching it — never log into, modify, or
  delete real user data.

## ESLint gotchas

- `react-hooks/set-state-in-effect`: don't synchronously clear state at the
  top of an effect before an async fetch; use a `cancelled` guard flag
  instead (see `use-readiness.ts` for the pattern).
- `react-hooks/exhaustive-deps` disable comments must sit immediately before
  the dependency-array line itself, not before the `useEffect`/`useMemo`
  call — that's the only placement this config actually honors.

## Theming

- Colors in `src/app/globals.css` are validated colorblind-safe (see the
  `dataviz` skill) — don't introduce ad hoc hex colors for UI elements;
  extend the existing CSS custom properties instead.
- Theme tokens like `var(--foreground)` are meant for UI text/chrome, which
  flips between light and dark. Anything that must stay a fixed color in
  both themes (e.g. the AI Tutor mascot's ink/outlines) needs a hardcoded
  constant instead — see `INK` in `tutor-mascot.tsx`.
