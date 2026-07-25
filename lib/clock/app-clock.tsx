"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getDateOverride,
  hydrateQaJourneyJoinFromSession,
  isValidDateKey,
  setDateOverride,
  setQaJourneyJoin,
} from "@/lib/clock/override-store";
import { realTodayKey as deviceTodayKey } from "@/lib/utils";

const STORAGE_KEY = "edubite.clock.overrideDateKey";

type AppClockContextValue = {
  /** Effective “today” (override or real). */
  todayKey: string;
  /** Real calendar today (never overridden). */
  realTodayKey: string;
  isOverridden: boolean;
  /** False until session override is hydrated (avoids wrong-day content flash). */
  ready: boolean;
  setOverrideDateKey: (dateKey: string) => void;
  clearOverride: () => void;
};

const AppClockContext = createContext<AppClockContextValue | null>(null);

function readStoredOverride(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromLocal = localStorage.getItem(STORAGE_KEY);
    if (fromLocal && isValidDateKey(fromLocal)) return fromLocal;
    // Migrate session override so closing the browser does not wipe QA days.
    const fromSession = sessionStorage.getItem(STORAGE_KEY);
    if (fromSession && isValidDateKey(fromSession)) {
      localStorage.setItem(STORAGE_KEY, fromSession);
      sessionStorage.removeItem(STORAGE_KEY);
      return fromSession;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeStoredOverride(dateKey: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (dateKey) {
      localStorage.setItem(STORAGE_KEY, dateKey);
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

/** Keep module `todayKey()` aligned as soon as the client bundle runs. */
function syncOverrideStoreFromSession(): string | null {
  hydrateQaJourneyJoinFromSession();
  const stored = readStoredOverride();
  setDateOverride(stored);
  return stored;
}

if (typeof window !== "undefined") {
  syncOverrideStoreFromSession();
}

export function AppClockProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<string | null>(() =>
    typeof window !== "undefined" ? readStoredOverride() : null,
  );
  const [ready, setReady] = useState(() => typeof window !== "undefined");

  useLayoutEffect(() => {
    const stored = syncOverrideStoreFromSession();
    setOverride(stored);
    setReady(true);
  }, []);

  const setOverrideDateKey = useCallback((dateKey: string) => {
    if (!isValidDateKey(dateKey)) return;
    setDateOverride(dateKey);
    writeStoredOverride(dateKey);
    setOverride(dateKey);
  }, []);

  const clearOverride = useCallback(() => {
    setDateOverride(null);
    writeStoredOverride(null);
    setQaJourneyJoin(null);
    setOverride(null);
  }, []);

  const real = deviceTodayKey();
  const effective =
    override ?? (ready ? real : getDateOverride() ?? real);

  const value = useMemo<AppClockContextValue>(
    () => ({
      todayKey: effective,
      realTodayKey: real,
      isOverridden: override !== null,
      ready,
      setOverrideDateKey,
      clearOverride,
    }),
    [effective, real, override, ready, setOverrideDateKey, clearOverride],
  );

  return (
    <AppClockContext.Provider value={value}>{children}</AppClockContext.Provider>
  );
}

export function useAppClock(): AppClockContextValue {
  const ctx = useContext(AppClockContext);
  if (!ctx) {
    throw new Error("useAppClock must be used within AppClockProvider");
  }
  return ctx;
}
