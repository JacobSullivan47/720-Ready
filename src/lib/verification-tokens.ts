import crypto from "crypto";
import { prisma } from "@/lib/prisma";

type TokenPurpose = "verify" | "reset";

const TOKEN_TTL_MS: Record<TokenPurpose, number> = {
  verify: 24 * 60 * 60 * 1000,
  reset: 60 * 60 * 1000,
};

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Issues a single-use token for the given purpose+email, reusing Auth.js's
 * VerificationToken table (identifier/token/expires) — unused elsewhere in
 * this app — namespaced by prefixing `identifier` with the purpose. Only the
 * token's hash is persisted; the raw token is returned for the email link.
 */
export async function createToken(purpose: TokenPurpose, email: string): Promise<string> {
  const identifier = `${purpose}:${email}`;
  const rawToken = crypto.randomBytes(32).toString("hex");

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashToken(rawToken),
      expires: new Date(Date.now() + TOKEN_TTL_MS[purpose]),
    },
  });

  return rawToken;
}

/** Validates and consumes (deletes) a token. Returns whether it was valid and unexpired. */
export async function consumeToken(
  purpose: TokenPurpose,
  email: string,
  rawToken: string,
): Promise<boolean> {
  const identifier = `${purpose}:${email}`;
  const token = hashToken(rawToken);

  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });
  if (!record) return false;

  await prisma.verificationToken.delete({ where: { identifier_token: { identifier, token } } });
  return record.expires > new Date();
}
