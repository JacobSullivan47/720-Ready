import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Passing `{ connectionString }` reproducibly breaks with "SASL:
// SCRAM-SERVER-FIRST-MESSAGE: client password must be a string" once queried
// through the full generated PrismaClient (though a bare PrismaPg adapter or
// plain `pg.Pool` with the same connection string both connect fine) —
// observed with @prisma/client 7.9.0 + @prisma/adapter-pg 7.9.0 + pg 8.22.0.
// Passing the parsed fields individually avoids whatever lazy connection-
// string parsing path triggers it.
function createClient() {
  const url = new URL(process.env.DATABASE_URL!);
  // Parsing fields individually (see note above) means the connection
  // string's own `sslmode` query param is never consulted by `pg` — read it
  // ourselves. Local Docker Postgres has no sslmode param (→ no SSL, as
  // before); managed hosts like Neon set `sslmode=require` and reject
  // unencrypted connections without this.
  const sslmode = url.searchParams.get("sslmode");
  const adapter = new PrismaPg({
    host: url.hostname,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: sslmode && sslmode !== "disable" ? { rejectUnauthorized: false } : undefined,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
