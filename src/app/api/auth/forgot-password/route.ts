import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createToken } from "@/lib/verification-tokens";
import { sendEmail, passwordResetEmailHtml } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

const GENERIC_MESSAGE = "If an account exists for that email, we've sent a reset link.";

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  const { email } = parsed.data;

  const ip = getClientIp(request);
  const [byEmail, byIp] = await Promise.all([
    checkRateLimit(`reset:${email}`, { max: 3, windowMs: 60 * 60 * 1000 }),
    checkRateLimit(`reset:ip:${ip}`, { max: 3, windowMs: 60 * 60 * 1000 }),
  ]);
  // Rate-limited requests still return the generic message — don't reveal
  // whether the account exists or that a limit was hit.
  if (byEmail.allowed && byIp.allowed) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.passwordHash) {
      const token = await createToken("reset", email);
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      await sendEmail({
        to: email,
        subject: "Reset your 720 Ready password",
        html: passwordResetEmailHtml(resetUrl),
      }).catch((err) => console.error("Failed to send password reset email", err));
    }
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}
