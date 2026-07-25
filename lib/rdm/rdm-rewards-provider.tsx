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
  RDM_REWARD_DEFAULTS,
  defaultsAsMap,
  defaultRdmAmount,
  type RdmRewardDef,
  type RdmRewardKey,
} from "@/data/rdm-rewards";
import { setLiveRdmAmounts } from "@/lib/rdm/live-amounts";

type RdmRewardsContextValue = {
  rewards: RdmRewardDef[];
  amounts: Record<RdmRewardKey, number>;
  loading: boolean;
  getAmount: (key: RdmRewardKey) => number;
  refresh: () => Promise<void>;
};

const RdmRewardsContext = createContext<RdmRewardsContextValue | null>(null);

let cachedRewards: RdmRewardDef[] | null = null;
let inflight: Promise<RdmRewardDef[]> | null = null;

async function fetchRewards(): Promise<RdmRewardDef[]> {
  try {
    const res = await fetch("/api/rdm-rewards", { credentials: "include" });
    if (!res.ok) throw new Error("fetch failed");
    const data = (await res.json()) as { rewards?: RdmRewardDef[] };
    if (!Array.isArray(data.rewards) || data.rewards.length === 0) {
      throw new Error("empty");
    }
    return data.rewards;
  } catch {
    return RDM_REWARD_DEFAULTS.map((d) => ({ ...d }));
  }
}

function loadRewards(force = false): Promise<RdmRewardDef[]> {
  if (!force && cachedRewards) return Promise.resolve(cachedRewards);
  if (!force && inflight) return inflight;
  inflight = fetchRewards().then((next) => {
    cachedRewards = next;
    inflight = null;
    return next;
  });
  return inflight;
}

function amountsFrom(rewards: RdmRewardDef[]): Record<RdmRewardKey, number> {
  const out = defaultsAsMap();
  for (const row of rewards) {
    out[row.key] = row.amount;
  }
  return out;
}

export function RdmRewardsProvider({ children }: { children: ReactNode }) {
  const [rewards, setRewards] = useState<RdmRewardDef[]>(
    () => cachedRewards ?? [],
  );
  const [loading, setLoading] = useState(!cachedRewards);

  const refresh = useCallback(async () => {
    setLoading(true);
    const next = await loadRewards(true);
    setRewards(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadRewards().then((next) => {
      if (!cancelled) {
        setRewards(next);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const amounts = useMemo(() => amountsFrom(rewards), [rewards]);

  useEffect(() => {
    if (rewards.length === 0) return;
    setLiveRdmAmounts(amounts);
  }, [rewards, amounts]);

  const value = useMemo<RdmRewardsContextValue>(
    () => ({
      rewards,
      amounts,
      loading,
      getAmount: (key) => amounts[key] ?? defaultRdmAmount(key),
      refresh,
    }),
    [rewards, amounts, loading, refresh],
  );

  return (
    <RdmRewardsContext.Provider value={value}>
      {children}
    </RdmRewardsContext.Provider>
  );
}

export function useRdmRewards(): RdmRewardsContextValue {
  const ctx = useContext(RdmRewardsContext);
  if (!ctx) {
    const amounts = defaultsAsMap();
    return {
      rewards: [],
      amounts,
      loading: false,
      getAmount: (key) => amounts[key] ?? defaultRdmAmount(key),
      refresh: async () => undefined,
    };
  }
  return ctx;
}

/** Clear module cache after admin saves so next mount reloads. */
export function invalidateRdmRewardsCache() {
  cachedRewards = null;
}
