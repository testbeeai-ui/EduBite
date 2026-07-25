import {
  defaultsAsMap,
  defaultRdmAmount,
  type RdmRewardKey,
} from "@/data/rdm-rewards";

/** Process-wide live RDM schedule — updated by RdmRewardsProvider after fetch. */
let liveAmounts: Record<RdmRewardKey, number> = defaultsAsMap();

export function setLiveRdmAmounts(next: Record<RdmRewardKey, number>) {
  liveAmounts = { ...defaultsAsMap(), ...next };
}

export function getLiveRdmAmount(key: RdmRewardKey): number {
  const value = liveAmounts[key];
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  return defaultRdmAmount(key);
}

export function getLiveRdmAmounts(): Record<RdmRewardKey, number> {
  return { ...liveAmounts };
}
