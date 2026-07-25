/**
 * Admin access is a plain email allowlist (no role/permission system exists
 * in the schema) — set ADMIN_EMAILS in .env.local to a comma-separated list
 * of the account email(s) allowed to view /admin. Unset means no one can
 * access it (fails closed), not "everyone."
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}
