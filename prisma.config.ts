import path from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// The Prisma CLI (migrate, studio, seed) doesn't run inside Next.js, so it
// doesn't get .env.local loaded automatically the way `next dev` does.
loadEnv({ path: path.join(__dirname, ".env.local") });
loadEnv({ path: path.join(__dirname, ".env") });

// `prisma generate` (run via postinstall on every deploy) only needs the
// schema file, not a live connection — but Prisma's `env()` helper throws
// immediately if DATABASE_URL isn't resolvable, which fails the whole build
// if the platform hasn't injected it into the install step yet. Fall back to
// a placeholder so `generate` always succeeds; migrate/studio/the app itself
// still use the real value whenever it's actually set.
const databaseUrl = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
