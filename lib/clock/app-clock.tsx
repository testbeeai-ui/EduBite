"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getDateOverride,
  isValidDateKey,
  setDateOverride,
} from "@/lib/clock/override-store";
import { realTodayKey as deviceTodayKey } from "@/lib/utils";

const STORAGE_KEY = "edubite.clock.overrideDateKey";

type AppClockContextValue = {
  /** Effective “today” (override or real). */
  todayKey: string;
  /** Real calendar today (never overridden). */
  realTodayKey: string;
  isOverridden: boolean;
  setOverrideDateKey: (dateKey: string) => void;
  clearOverride: () => void;
};

const AppClockContext = createContext<AppClockContextValue | null>(null);

function readStoredOverride(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw && isValidDateKey(raw)) return raw;
  } catch {
    /* ignore */
  }
  return null;
}

function writeStoredOverride(dateKey: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (dateKey) sessionStorage.setItem(STORAGE_KEY, dateKey);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function AppClockProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredOverride();
    setDateOverride(stored);
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
    setOverride(null);
  }, []);

  const real = deviceTodayKey();
  const effective = override ?? (ready ? real : getDateOverride() ?? real);

  const value = useMemo<AppClockContextValue>(
    () => ({
      todayKey: effective,
      realTodayKey: real,
      isOverridden: override !== null,
      setOverrideDateKey,
      clearOverride,
    }),
    [effective, real, override, setOverrideDateKey, clearOverride],
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
