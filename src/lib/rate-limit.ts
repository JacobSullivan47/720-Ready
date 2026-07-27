import { prisma } from "@/lib/prisma";

/**
 * Postgres-backed rate limiting (no Redis/Upstash dependency, works across
 * serverless invocations). Each call prunes expired attempts for the key
 * before counting, so the table stays bounded without a separate cleanup job.
 */
export async function checkRateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number },
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const windowStart = new Date(Date.now() - windowMs);

  await prisma.rateLimitAttempt.deleteMany({
    where: { key, createdAt: { lt: windowStart } },
  });

  const count = await prisma.rateLimitAttempt.count({ where: { key } });
  if (count >= max) {
    return { allowed: false, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  await prisma.rateLimitAttempt.create({ data: { key } });
  return { allowed: true };
}

/** Resolves the caller's IP from proxy headers, falling back for local dev. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
