/** Module-level date override so `todayKey()` follows admin simulated dates. */

let overrideDateKey: string | null = null;
/** Stable Day-1 anchor while App Clock is before the real joinedDate. */
let qaJourneyJoinKey: string | null = null;

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const QA_JOIN_STORAGE_KEY = "edubite.clock.qaJourneyJoin";

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

export function getQaJourneyJoin(): string | null {
  return qaJourneyJoinKey;
}

function readPersistedQaJoin(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromLocal = localStorage.getItem(QA_JOIN_STORAGE_KEY);
    if (fromLocal && DATE_KEY_RE.test(fromLocal)) return fromLocal;
    // Migrate older session-only QA anchors so restarts keep Day 1 stable.
    const fromSession = sessionStorage.getItem(QA_JOIN_STORAGE_KEY);
    if (fromSession && DATE_KEY_RE.test(fromSession)) {
      localStorage.setItem(QA_JOIN_STORAGE_KEY, fromSession);
      return fromSession;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function setQaJourneyJoin(dateKey: string | null): void {
  if (dateKey === null) {
    qaJourneyJoinKey = null;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(QA_JOIN_STORAGE_KEY);
        sessionStorage.removeItem(QA_JOIN_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    return;
  }
  if (!DATE_KEY_RE.test(dateKey)) return;
  qaJourneyJoinKey = dateKey;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(QA_JOIN_STORAGE_KEY, dateKey);
      sessionStorage.removeItem(QA_JOIN_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

/** Load QA join from localStorage (call once on AppClock mount). */
export function hydrateQaJourneyJoinFromSession(): void {
  const raw = readPersistedQaJoin();
  if (raw) qaJourneyJoinKey = raw;
}

/**
 * While simulating a date before real join, keep Day 1 fixed at the earliest
 * QA date so advancing +1 day does not wipe the previous day's streak card.
 */
export function ensureQaJourneyJoin(
  asOfDateKey: string,
  realJoinedDate: string | null | undefined,
): string | null {
  if (!DATE_KEY_RE.test(asOfDateKey)) return qaJourneyJoinKey;
  if (realJoinedDate && asOfDateKey >= realJoinedDate) return qaJourneyJoinKey;
  if (!qaJourneyJoinKey || asOfDateKey < qaJourneyJoinKey) {
    setQaJourneyJoin(asOfDateKey);
  }
  return qaJourneyJoinKey;
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
