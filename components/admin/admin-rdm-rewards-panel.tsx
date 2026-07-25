"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { RdmRewardDef, RdmRewardKey } from "@/data/rdm-rewards";
import {
  invalidateRdmRewardsCache,
  useRdmRewards,
} from "@/lib/rdm/rdm-rewards-provider";
import { cn, formatRdm } from "@/lib/utils";

type DraftMap = Record<string, string>;

export function AdminRdmRewardsPanel() {
  const { rewards, loading, refresh } = useRdmRewards();
  const [rows, setRows] = useState<RdmRewardDef[]>([]);
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rewards.length === 0) return;
    setRows(rewards);
    const next: DraftMap = {};
    for (const r of rewards) next[r.key] = String(r.amount);
    setDrafts(next);
  }, [rewards]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const dirtyKeys = useMemo(() => {
    const keys: RdmRewardKey[] = [];
    for (const row of rows) {
      const draft = Number(drafts[row.key]);
      if (
        Number.isInteger(draft) &&
        draft >= 0 &&
        draft !== row.amount
      ) {
        keys.push(row.key);
      }
    }
    return keys;
  }, [rows, drafts]);

  const grouped = useMemo(() => {
    const map = new Map<string, RdmRewardDef[]>();
    for (const row of rows) {
      const list = map.get(row.category) ?? [];
      list.push(row);
      map.set(row.category, list);
    }
    return Array.from(map.entries());
  }, [rows]);

  const save = useCallback(async () => {
    if (dirtyKeys.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const updates = dirtyKeys.map((key) => ({
        key,
        amount: Number(drafts[key]),
      }));
      const res = await fetch("/api/rdm-rewards", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = (await res.json()) as {
        error?: string;
        rewards?: RdmRewardDef[];
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Save failed");
      }
      invalidateRdmRewardsCache();
      await refresh();
      setToast(
        `Saved ${updates.length} RDM throttle${updates.length === 1 ? "" : "s"}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [dirtyKeys, drafts, refresh]);

  const resetDrafts = () => {
    const next: DraftMap = {};
    for (const r of rows) next[r.key] = String(r.amount);
    setDrafts(next);
    setError(null);
  };

  return (
    <div className="space-y-5">
      <Card className="p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-xl m-0">RDM rewards</h2>
            <p className="text-sm text-[var(--text-dim)] mt-1 max-w-xl">
              Every place Edubite awards (or gates) RDM. Edit amounts to throttle
              economy without a code deploy. Changes apply on next client load /
              session award.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={() => void refresh()}
              disabled={loading || saving}
            >
              Reload
            </Button>
            <Button
              variant="ghost"
              onClick={resetDrafts}
              disabled={dirtyKeys.length === 0 || saving}
            >
              Discard
            </Button>
            <Button
              onClick={() => void save()}
              disabled={dirtyKeys.length === 0 || saving}
            >
              {saving
                ? "Saving…"
                : dirtyKeys.length > 0
                  ? `Save ${dirtyKeys.length} change${dirtyKeys.length === 1 ? "" : "s"}`
                  : "Saved"}
            </Button>
          </div>
        </div>
        {toast && (
          <p className="text-sm text-teal font-mono m-0">{toast}</p>
        )}
        {error && (
          <p className="text-sm text-pink font-mono m-0">{error}</p>
        )}
        {loading && rows.length === 0 && (
          <p className="text-sm text-[var(--text-dim)] m-0">Loading rewards…</p>
        )}
      </Card>

      {grouped.map(([category, items]) => (
        <Card key={category} className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--line)] bg-[var(--surface-2)]">
            <h3 className="font-display font-bold text-base m-0">{category}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-mono uppercase tracking-wide text-[var(--text-dim)] border-b border-[var(--line)]">
                  <th className="px-4 py-2.5 font-medium">Reward</th>
                  <th className="px-4 py-2.5 font-medium hidden md:table-cell">
                    Key
                  </th>
                  <th className="px-4 py-2.5 font-medium w-28">Amount</th>
                  <th className="px-4 py-2.5 font-medium w-24">Unit</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const dirty = dirtyKeys.includes(row.key);
                  return (
                    <tr
                      key={row.key}
                      className={cn(
                        "border-b border-[var(--line)] last:border-0",
                        dirty && "bg-teal/5",
                      )}
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-[var(--text)]">
                          {row.label}
                        </div>
                        <div className="text-xs text-[var(--text-dim)] mt-0.5 leading-snug max-w-md">
                          {row.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top hidden md:table-cell">
                        <code className="text-[11px] font-mono text-[var(--text-dim)]">
                          {row.key}
                        </code>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={drafts[row.key] ?? String(row.amount)}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [row.key]: e.target.value,
                            }))
                          }
                          className={cn(
                            "w-24 rounded-lg border bg-[var(--surface)] px-2.5 py-1.5 font-mono text-sm tabular-nums",
                            dirty
                              ? "border-teal text-teal"
                              : "border-[var(--line)] text-[var(--text)]",
                          )}
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="font-mono text-xs text-[var(--text-dim)]">
                          {row.unit === "rdm"
                            ? `RDM (${formatRdm(Number(drafts[row.key]) || 0)})`
                            : row.unit}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}
