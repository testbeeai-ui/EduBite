/** Module-level date override so `todayKey()` follows admin simulated dates. */

let overrideDateKey: string | null = null;

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function getDateOverride(): string | null {
  return overrideDateKey;
}

export function setDateOverride(dateKey: string | null): void {
  if (dateKey === null) {
    overrideDateKey = null;
    return;
  }
  overrideDateKey = DATE_KEY_RE.test(dateKey) ? dateKey : null;
}

export function isValidDateKey(dateKey: string): boolean {
  if (!DATE_KEY_RE.test(dateKey)) return false;
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === m - 1 &&
    dt.getDate() === d
  );
}
