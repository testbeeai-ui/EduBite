const DEFAULT_ADMIN_EMAILS = [
  "mailidpwd@gmail.com",
  "alexis36sg@gmail.com",
] as const;

export function normalizeAdminEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

/** Allowlist from env (comma-separated) or the built-in defaults. */
export function getAdminAllowlist(): string[] {
  const fromEnv = process.env.EDUBITE_ADMIN_EMAILS?.trim();
  if (fromEnv) {
    return fromEnv
      .split(",")
      .map((e) => normalizeAdminEmail(e))
      .filter(Boolean);
  }
  return DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase());
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const normalized = normalizeAdminEmail(email);
  if (!normalized) return false;
  return getAdminAllowlist().includes(normalized);
}
