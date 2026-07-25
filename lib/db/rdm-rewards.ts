import {
  RDM_REWARD_DEFAULTS,
  type RdmRewardDef,
  type RdmRewardKey,
  type RdmRewardUnit,
  defaultsAsMap,
} from "@/data/rdm-rewards";
import { createEdubiteSupabaseServer } from "@/lib/supabase/server";

export const EDUBITE_RDM_REWARDS_TABLE = "edubite_rdm_rewards";

type DbRow = {
  reward_key: string;
  category: string;
  label: string;
  description: string;
  amount: number;
  unit: string;
  sort_order: number;
  updated_at: string;
  updated_by: string | null;
};

function mapRow(row: DbRow): RdmRewardDef & { updatedAt?: string } {
  return {
    key: row.reward_key as RdmRewardKey,
    category: row.category as RdmRewardDef["category"],
    label: row.label,
    description: row.description ?? "",
    amount: Math.max(0, Math.floor(Number(row.amount) || 0)),
    unit: (row.unit as RdmRewardUnit) || "rdm",
    sortOrder: row.sort_order ?? 0,
    updatedAt: row.updated_at,
  };
}

/** Merge DB rows onto static defaults (unknown keys ignored). */
export function mergeRdmRewards(rows: RdmRewardDef[]): RdmRewardDef[] {
  const byKey = new Map(rows.map((r) => [r.key, r]));
  return RDM_REWARD_DEFAULTS.map((def) => {
    const live = byKey.get(def.key);
    if (!live) return { ...def };
    return {
      ...def,
      amount: live.amount,
      label: live.label || def.label,
      description: live.description || def.description,
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listRdmRewards(): Promise<RdmRewardDef[]> {
  const supabase = await createEdubiteSupabaseServer();
  const { data, error } = await supabase
    .from(EDUBITE_RDM_REWARDS_TABLE)
    .select(
      "reward_key, category, label, description, amount, unit, sort_order, updated_at, updated_by",
    )
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[rdm-rewards] list failed", error);
    return RDM_REWARD_DEFAULTS.map((d) => ({ ...d }));
  }

  const mapped = (data as DbRow[] | null)?.map(mapRow) ?? [];
  return mergeRdmRewards(mapped);
}

export async function getRdmAmountsMap(): Promise<Record<RdmRewardKey, number>> {
  const rows = await listRdmRewards();
  const out = defaultsAsMap();
  for (const row of rows) {
    out[row.key] = row.amount;
  }
  return out;
}

export async function updateRdmRewardAmount(
  key: RdmRewardKey,
  amount: number,
  updatedBy: string,
): Promise<RdmRewardDef> {
  if (!Number.isFinite(amount) || amount < 0 || !Number.isInteger(amount)) {
    throw new Error("amount must be a non-negative integer");
  }
  const known = RDM_REWARD_DEFAULTS.find((d) => d.key === key);
  if (!known) {
    throw new Error(`Unknown reward key: ${key}`);
  }

  const supabase = await createEdubiteSupabaseServer();
  const { data, error } = await supabase
    .from(EDUBITE_RDM_REWARDS_TABLE)
    .upsert(
      {
        reward_key: key,
        category: known.category,
        label: known.label,
        description: known.description,
        amount,
        unit: known.unit,
        sort_order: known.sortOrder,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      },
      { onConflict: "reward_key" },
    )
    .select(
      "reward_key, category, label, description, amount, unit, sort_order, updated_at, updated_by",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update RDM reward");
  }
  return mapRow(data as DbRow);
}
