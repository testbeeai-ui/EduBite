const DEFAULT_ADMIN_EMAILS = [
  "mailidpwd@gmail.com",
  "alexis36sg@gmail.com",
] as const;

export function normalizeAdminEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

/**
 * Allowlist = built-in defaults ∪ optional env emails.
 * Env can ADD admins; it must not remove the built-in accounts by accident
 * (a partial EDUBITE_ADMIN_EMAILS override used to wipe defaults).
 */
export function getAdminAllowlist(): string[] {
  const defaults = DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase());
  const fromEnv = (
    process.env.EDUBITE_ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_EDUBITE_ADMIN_EMAILS ||
    ""
  ).trim();
  if (!fromEnv) return defaults;

  const extra = fromEnv
    .split(",")
    .map((e) => normalizeAdminEmail(e))
    .filter(Boolean);
  return Array.from(new Set([...defaults, ...extra]));
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const normalized = normalizeAdminEmail(email);
  if (!normalized) return false;
  return getAdminAllowlist().includes(normalized);
}
