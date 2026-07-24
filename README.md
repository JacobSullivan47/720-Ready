# 720 Ready — CCA-Foundations Prep

A study app for the (real, third-party) **Claude Certified Architect – Foundations (CCA-F)** certification exam: spaced-repetition flashcards, original practice questions with plain-language explanations, interactive exercises, mock exams with domain-weighted scoring, and an AI study tutor.

**720 Ready is an independent study tool, not affiliated with or endorsed by Anthropic.** It does not reproduce, leak, or simulate the real proctored exam — see [Content & licensing](#content--licensing) below.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript) | Server + client components in one app, API routes for backend logic |
| Database | PostgreSQL via Prisma 7 (`@prisma/adapter-pg`) | Relational, portable to any managed Postgres (Supabase, Neon, RDS, etc.) |
| Auth | Auth.js (NextAuth) v5 | Email/password (credentials) + optional Google OAuth, JWT sessions, `@auth/prisma-adapter` |
| Styling | Tailwind CSS v4 | Utility-first, CSS-variable design tokens for light/dark theming |
| AI tutor | `@anthropic-ai/sdk`, Claude Opus 4.8 | Server-side only; rate-limited per user |
| Tests | Vitest | Pure-logic unit tests (SM-2, scoring, exam assembly, content integrity) |

Content (flashcards, questions, domain/scenario overviews, interactive exercises) is structured TypeScript data under `src/content/`, loaded into Postgres by `prisma/seed.ts` — the database is a queryable mirror of that data, not a second place to edit content.

## Running locally

1. **Start Postgres** (Docker required):
   ```bash
   docker compose up -d
   ```
   This starts a local Postgres on `localhost:5432` matching the connection string already in `.env.local` (`DATABASE_URL`). If you'd rather use a hosted Postgres (Supabase, Neon, etc.), just replace `DATABASE_URL` in `.env.local`.

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set required environment variables** in `.env.local` (already scaffolded — fill in the blanks):
   - `DATABASE_URL` — Postgres connection string
   - `AUTH_SECRET` — random secret for session signing (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)
   - `ANTHROPIC_API_KEY` — only needed for the AI Study Tutor feature; everything else works without it
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (optional) — enables "Continue with Google"; also set `NEXT_PUBLIC_GOOGLE_ENABLED="true"` if you configure these

4. **Run migrations and seed content**:
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

5. **Start the dev server**:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000. Studying works immediately without an account (guest mode, progress saved in `localStorage`); create an account any time to sync progress to Postgres.

### Other useful commands

```bash
npm test              # run the Vitest suite once
npm run test:watch    # watch mode
npm run lint          # ESLint
npm run db:studio     # Prisma Studio (browse the database)
npm run build         # production build
```

## How guest mode vs. accounts work

Every interactive feature (flashcards, practice, mock exams, bookmarks) goes through a single `ProgressClient` interface (`src/lib/progress-types.ts`) with two implementations:

- **Guest (no account):** `src/lib/progress-local.ts` — reads/writes `localStorage` only, nothing touches the server.
- **Signed in:** `src/lib/progress-remote.ts` — calls the `/api/progress/*` and `/api/exam/*` routes, which persist to Postgres via Prisma.

`src/hooks/use-progress.ts` picks the right implementation based on the Auth.js session, so UI components never branch on auth state themselves. Study *content* (flashcards/questions) is always fetched from a public `/api/content/bank` route backed by Postgres — it's identical for guests and signed-in users; only *progress* differs.

## Adding or editing content

All study content lives as plain TypeScript data under `src/content/`:

```
src/content/
  types.ts              # shared interfaces (FlashcardSeed, QuestionSeed, ...)
  domains.ts            # the 5 domain overviews (summary, key knowledge, anti-patterns, ...)
  scenarios.ts          # the 6 scenario overviews
  exercises.ts          # data for the 3 interactive exercises
  flashcards/*.ts        # one file per domain, `export const flashcards: FlashcardSeed[]`
  questions/*.ts         # one file per domain, `export const questions: QuestionSeed[]`
```

To add content: edit or add entries to the relevant array, matching the shapes in `types.ts`, then re-run:

```bash
npm run db:seed
```

The seed script (`prisma/seed.ts`) upserts by a stable ID derived from the content itself, so re-seeding after an edit updates existing rows instead of duplicating them. `src/content/content.test.ts` and `src/content/exercises.test.ts` assert structural invariants (every domain has ≥20 flashcards and ≥15 questions, every question has a valid single/multi answer key, no duplicate terms, etc.) — run `npm test` after editing content to catch mistakes before seeding.

## Content & licensing

The exam's domain names, weights, and scenario list used to organize this app are adapted from the [**Community study guide for the Claude Certified Architect – Foundations certification exam**](https://github.com/daronyondem/claude-architect-exam-guide) by **Daron Yondem**, licensed under [**CC BY 4.0**](https://creativecommons.org/licenses/by/4.0/), which permits commercial reuse and adaptation with attribution. This notice is also shown in the app's footer and `/about` page, as required by the license.

**No text in this app is copied from that guide, its own practice questions, or any Anthropic documentation.** Every flashcard, practice question, explanation, ELI10 explanation, and overview page is original writing produced for this app, grounded in the underlying concepts but expressed in new wording with new examples and scenarios. No question is presented as an actual, leaked, or reconstructed real exam question — this app teaches the knowledge domains; it does not simulate or claim to reproduce the proprietary CCA-F exam itself.

Exam logistics displayed in the app (fee, retake windows, scoring scale, time limit) are labeled as general guidance, dated, and link to Anthropic's official certification page for current details, since these can change.

## Project structure (high level)

```
prisma/schema.prisma        # Domain/Scenario/Flashcard/Question/CardProgress/QuestionAttempt/
                             #   MockExam/Bookmark/StudyLog/TutorConversation/TutorMessage + Auth.js tables
prisma/seed.ts               # loads src/content/* into Postgres
src/auth.ts                  # Auth.js v5 config (credentials + optional Google)
src/lib/
  srs.ts                     # SM-2 spaced-repetition scheduler (pure, tested)
  scoring.ts                 # domain-weighted question allocation, scaled score, mock exam assembly (pure, tested)
  mastery.ts                 # readiness/mastery %, streak calculation (pure, tested)
  progress-{local,remote}.ts # guest vs. signed-in persistence, same interface
  anthropic.ts                # server-only Claude API client for the AI tutor
src/app/
  dashboard, study, practice, exam, progress, glossary, search, tutor, bookmarks,
  missed-questions, about, legal, login, register, account
  api/{auth,register,content,progress,exam,tutor}/...
```

## Tests

```bash
npm test
```

Covers: SM-2 scheduling edge cases (lapses, ease-factor floor, retention scoring), domain-weighted question-count apportionment, scaled-score estimation, mock exam assembly/randomization (including determinism under a seeded RNG and quota enforcement), mastery/readiness blending and streak calculation, and structural integrity of every content file (volume commitments, valid answer indexes, no duplicates).
