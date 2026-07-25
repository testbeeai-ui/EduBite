"use client";

import { useEffect, useState } from "react";
import {
  DID_YOU_KNOW,
  ROLE_MODEL,
  normalizeRoleModel,
  toRoleModel,
} from "@/data/inspiration";
import { useAppClock } from "@/lib/clock/app-clock";
import {
  phenomenonForDate,
  quoteForDate,
  roleModelForDate,
  toDidYouKnowBlock,
} from "@/lib/inspiration/daily";

export type InspirationState = {
  dateKey: string;
  quote: string;
  roleModel: typeof ROLE_MODEL;
  didYouKnow: typeof DID_YOU_KNOW;
  source?: "supabase" | "static";
  /** True until App Clock is ready and we have settled content for that day. */
  loading: boolean;
};

/** Shared across Inspiration remounts — one network call per App Clock day. */
let cachedInspiration: InspirationState | null = null;
let inflightKey: string | null = null;
let inflight: Promise<InspirationState> | null = null;

/** Date-keyed static pack — never the hardcoded Aryabhata default. */
function staticInspirationForDate(dateKey: string): InspirationState {
  return {
    dateKey,
    quote: quoteForDate(dateKey).quote,
    roleModel: toRoleModel(roleModelForDate(dateKey)),
    didYouKnow: toDidYouKnowBlock(phenomenonForDate(dateKey)),
    source: "static",
    loading: false,
  };
}

function inspirationEqual(a: InspirationState, b: InspirationState): boolean {
  return (
    a.dateKey === b.dateKey &&
    a.quote === b.quote &&
    a.roleModel.name === b.roleModel.name &&
    a.roleModel.quote === b.roleModel.quote &&
    a.didYouKnow.question === b.didYouKnow.question
  );
}

async function fetchInspiration(dateKey: string): Promise<InspirationState> {
  try {
    const res = await fetch(
      `/api/content/inspiration?dateKey=${encodeURIComponent(dateKey)}`,
      { credentials: "include" },
    );
    if (!res.ok) throw new Error("inspiration fetch failed");
    const json = (await res.json()) as InspirationState;
    if (!json.quote) throw new Error("empty inspiration payload");
    return {
      dateKey: json.dateKey || dateKey,
      quote: json.quote,
      roleModel: normalizeRoleModel(json.roleModel ?? ROLE_MODEL),
      didYouKnow:
        json.didYouKnow?.linkedConcepts && json.didYouKnow?.followUpQuestion
          ? json.didYouKnow
          : DID_YOU_KNOW,
      source: json.source,
      loading: false,
    };
  } catch {
    return staticInspirationForDate(dateKey);
  }
}

function loadInspirationClient(dateKey: string): Promise<InspirationState> {
  if (
    cachedInspiration &&
    cachedInspiration.dateKey === dateKey &&
    !cachedInspiration.loading
  ) {
    return Promise.resolve(cachedInspiration);
  }
  if (inflight && inflightKey === dateKey) {
    return inflight;
  }
  inflightKey = dateKey;
  inflight = fetchInspiration(dateKey).then((next) => {
    cachedInspiration = next;
    inflight = null;
    inflightKey = null;
    return next;
  });
  return inflight;
}

export function useInspirationContent(): InspirationState {
  const { todayKey: dateKey, ready } = useAppClock();
  const [state, setState] = useState<InspirationState | null>(() => {
    if (
      cachedInspiration &&
      cachedInspiration.dateKey === dateKey &&
      !cachedInspiration.loading
    ) {
      return cachedInspiration;
    }
    return null;
  });

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    // Paint the correct day's static pack immediately — no Aryabhata flash.
    const local = staticInspirationForDate(dateKey);
    if (
      cachedInspiration &&
      cachedInspiration.dateKey === dateKey &&
      !cachedInspiration.loading
    ) {
      setState(cachedInspiration);
    } else {
      setState(local);
    }

    void loadInspirationClient(dateKey).then((next) => {
      if (cancelled) return;
      setState((prev) => {
        if (prev && inspirationEqual(prev, next)) {
          return { ...prev, source: next.source, loading: false };
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [dateKey, ready]);

  if (!ready || !state) {
    return {
      dateKey,
      quote: "",
      roleModel: ROLE_MODEL,
      didYouKnow: DID_YOU_KNOW,
      loading: true,
    };
  }

  return state;
}
