import { Resend } from "resend";

let client: Resend | null = null;

function getResendClient(): Resend {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is not configured");

  const { error } = await getResendClient().emails.send({ from, to, subject, html });
  if (error) throw new Error(`Failed to send email: ${error.message}`);
}

function emailShell(bodyHtml: string): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 18px; font-weight: 600;">720 Ready</h1>
      ${bodyHtml}
    </div>
  `;
}

export function verificationEmailHtml(verifyUrl: string): string {
  return emailShell(`
    <p>Confirm your email address to finish setting up your 720 Ready account.</p>
    <p><a href="${verifyUrl}" style="color: #2563eb;">Verify your email</a></p>
    <p style="color: #6b7280; font-size: 13px;">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
  `);
}

export function passwordResetEmailHtml(resetUrl: string): string {
  return emailShell(`
    <p>We received a request to reset your 720 Ready password.</p>
    <p><a href="${resetUrl}" style="color: #2563eb;">Reset your password</a></p>
    <p style="color: #6b7280; font-size: 13px;">This link expires in 1 hour. If you didn't request this, you can ignore this email — your password won't change.</p>
  `);
}
