import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { createToken } from "@/lib/verification-tokens";
import { sendEmail, verificationEmailHtml } from "@/lib/email";

export async function POST() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const { allowed } = await checkRateLimit(`resend-verify:${auth.userId}`, {
    max: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: auth.userId } });
  if (!user?.email) {
    return NextResponse.json({ error: "No email on file for this account." }, { status: 400 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ message: "Your email is already verified." });
  }

  const token = await createToken("verify", user.email);
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your 720 Ready email",
    html: verificationEmailHtml(verifyUrl),
  });

  return NextResponse.json({ message: "Verification email sent." });
}
