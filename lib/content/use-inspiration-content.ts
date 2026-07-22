"use client";

import { useEffect, useState } from "react";
import { ROLE_MODEL, DID_YOU_KNOW, normalizeRoleModel } from "@/data/inspiration";
import {
  todayPhenomenon,
  todayQuote,
  toDidYouKnowBlock,
} from "@/lib/inspiration/daily";
import { todayKey } from "@/lib/utils";

export type InspirationState = {
  dateKey: string;
  quote: string;
  roleModel: typeof ROLE_MODEL;
  didYouKnow: typeof DID_YOU_KNOW;
  source?: "supabase" | "static";
};

/** Shared across Inspiration remounts — one network call per calendar day. */
let cachedInspiration: InspirationState | null = null;
let inflight: Promise<InspirationState> | null = null;

function staticInspiration(): InspirationState {
  return {
    dateKey: todayKey(),
    quote: todayQuote().quote,
    roleModel: ROLE_MODEL,
    didYouKnow: toDidYouKnowBlock(todayPhenomenon()),
    source: "static",
  };
}

async function fetchInspiration(): Promise<InspirationState> {
  try {
    const res = await fetch("/api/content/inspiration", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("inspiration fetch failed");
    const json = (await res.json()) as InspirationState;
    if (!json.quote) throw new Error("empty inspiration payload");
    return {
      dateKey: json.dateKey || todayKey(),
      quote: json.quote,
      roleModel: normalizeRoleModel(json.roleModel ?? ROLE_MODEL),
      didYouKnow:
        json.didYouKnow?.linkedConcepts && json.didYouKnow?.followUpQuestion
          ? json.didYouKnow
          : DID_YOU_KNOW,
      source: json.source,
    };
  } catch {
    return staticInspiration();
  }
}

function loadInspirationClient(): Promise<InspirationState> {
  const dateKey = todayKey();
  if (cachedInspiration && cachedInspiration.dateKey === dateKey) {
    return Promise.resolve(cachedInspiration);
  }
  if (!inflight) {
    inflight = fetchInspiration().then((next) => {
      cachedInspiration = next;
      inflight = null;
      return next;
    });
  }
  return inflight;
}

export function useInspirationContent(): InspirationState {
  const [state, setState] = useState<InspirationState>(
    () => cachedInspiration ?? staticInspiration(),
  );

  useEffect(() => {
    let cancelled = false;
    const dateKey = todayKey();
    if (cachedInspiration && cachedInspiration.dateKey === dateKey) {
      setState(cachedInspiration);
      return;
    }
    void loadInspirationClient().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
