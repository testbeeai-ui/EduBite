/** Accept only same-origin relative paths for post-auth redirects. */
export function safeRelativePath(raw: string | null | undefined): string {
  if (
    !raw ||
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    raw.startsWith("/\\") ||
    raw.includes("\\") ||
    raw.includes("://")
  ) {
    return "/";
  }
  return raw;
}
