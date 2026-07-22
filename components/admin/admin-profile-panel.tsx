"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-provider";
import { useAppClock } from "@/lib/clock/app-clock";
import {
  getChallengeMonthMeta,
  getEntryState,
  MONTHLY_CHALLENGE_TARGET_RDM,
  nextCalendarDay,
} from "@/lib/challenge/monthly";
import { useGame } from "@/lib/store/game-provider";
import { cn, formatRdm, parseDateKey, realTodayKey } from "@/lib/utils";

export function AdminProfilePanel() {
  const { user } = useAuth();
  const { state, awardRDM, setRdm } = useGame();
  const {
    todayKey,
    realTodayKey: clockReal,
    isOverridden,
    setOverrideDateKey,
    clearOverride,
  } = useAppClock();

  const [draft, setDraft] = useState(todayKey);
  const [rdmDraft, setRdmDraft] = useState(String(state.rdm));
  const [toast, setToast] = useState<string | null>(null);
  const meta = useMemo(() => getChallengeMonthMeta(todayKey), [todayKey]);
  const entryState = getEntryState({
    rdm: state.rdm,
    dateKey: todayKey,
    enrolledMonthKey: state.challengeEnrolledMonthKey,
  });
  const deviceToday = realTodayKey();

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    setRdmDraft(String(state.rdm));
  }, [state.rdm]);

  const presets = useMemo(() => {
    const d = parseDateKey(todayKey);
    const y = d.getFullYear();
    const m = d.getMonth();
    const pad = (n: number) => String(n).padStart(2, "0");
    const month = `${y}-${pad(m + 1)}`;
    const lastDay = new Date(y, m + 1, 0).getDate();
    return [
      { label: "Real today", key: deviceToday },
      { label: "1st of month", key: `${month}-01` },
      { label: "5th of month", key: `${month}-05` },
      { label: "6th of month", key: `${month}-06` },
      { label: "Last day", key: `${month}-${pad(lastDay)}` },
      { label: "+1 day", key: nextCalendarDay(todayKey) },
    ];
  }, [todayKey, deviceToday]);

  const applyDate = (key: string, label?: string) => {
    setDraft(key);
    if (key === deviceToday) {
      clearOverride();
      showToast(`Date cleared — using real today (${deviceToday})`);
      return;
    }
    setOverrideDateKey(key);
    showToast(`Date applied: ${label ?? key}`);
  };

  const bumpRdm = (amount: number) => {
    awardRDM(amount);
    showToast(`RDM increased by +${formatRdm(amount)} (admin QA)`);
  };

  const applyExactRdm = () => {
    const next = Number(rdmDraft);
    if (!Number.isFinite(next) || next < 0) {
      showToast("Enter a valid RDM amount (0 or higher)");
      return;
    }
    setRdm(Math.round(next));
    showToast(`RDM set to ${formatRdm(Math.round(next))} (admin QA)`);
  };

  return (
    <div className="space-y-5 max-w-2xl relative">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="sticky top-2 z-40 rounded-xl border border-teal/40 bg-teal/15 px-4 py-3 text-sm text-teal shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <span className="font-semibold">✓ Done — </span>
          {toast}
        </div>
      )}

      <Card className="p-5 space-y-3">
        <div className="font-mono text-[11px] uppercase tracking-wide text-amber">
          Admin profile
        </div>
        <h2 className="font-display font-bold text-xl m-0">QA controls</h2>
        <p className="text-sm text-[var(--text-dim)] leading-relaxed m-0">
          Admin-only tools for testing Monthly Challenge unlock. You can travel
          the calendar date and raise your RDM balance. Changes save to your
          game progress like a normal session.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-teal/30 bg-teal/10 text-teal">
            {user?.email ?? "unknown"}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-purple/30 bg-purple/10 text-purple">
            Admin
          </span>
        </div>
      </Card>

      {/* RDM controls */}
      <Card className="p-5 space-y-4">
        <div>
          <h3 className="font-display font-bold text-lg m-0">Increase RDM</h3>
          <p className="text-sm text-[var(--text-dim)] mt-1.5 leading-relaxed m-0">
            Monthly Challenge stays locked until you reach{" "}
            <b className="text-[var(--text)]">
              {formatRdm(MONTHLY_CHALLENGE_TARGET_RDM)} RDM
            </b>
            . Use these controls to top up your balance for unlock QA (admin
            only — not shown to students).
          </p>
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3">
          <div className="font-mono text-[10px] text-[var(--text-dim)] uppercase">
            Your current RDM
          </div>
          <div className="font-display font-bold text-2xl mt-0.5 text-teal">
            {formatRdm(state.rdm)}
          </div>
          <div className="text-[11px] text-[var(--text-dim)] mt-1">
            Need {formatRdm(MONTHLY_CHALLENGE_TARGET_RDM)} to unlock ·{" "}
            {state.rdm >= MONTHLY_CHALLENGE_TARGET_RDM
              ? "Threshold met"
              : `${formatRdm(MONTHLY_CHALLENGE_TARGET_RDM - state.rdm)} more to go`}
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] text-[var(--text-dim)] uppercase mb-2">
            Quick add
          </div>
          <div className="flex flex-wrap gap-2">
            {[500, 1000, 5000].map((amount) => (
              <Button
                key={amount}
                variant="ghost"
                onClick={() => bumpRdm(amount)}
              >
                +{formatRdm(amount)} RDM
              </Button>
            ))}
            <Button
              variant="primary"
              onClick={() => {
                setRdm(MONTHLY_CHALLENGE_TARGET_RDM);
                showToast(
                  `RDM set to ${formatRdm(MONTHLY_CHALLENGE_TARGET_RDM)} — challenge unlock threshold`,
                );
              }}
            >
              Set to {formatRdm(MONTHLY_CHALLENGE_TARGET_RDM)} (unlock)
            </Button>
          </div>
        </div>

        <div>
          <label className="block font-mono text-[11px] text-[var(--text-dim)] mb-1.5">
            Set exact RDM
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="number"
              min={0}
              step={1}
              value={rdmDraft}
              onChange={(e) => setRdmDraft(e.target.value)}
              className="w-36 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]"
            />
            <Button variant="primary" onClick={applyExactRdm}>
              Apply RDM
            </Button>
          </div>
        </div>
      </Card>

      {/* Date traveler */}
      <Card className="p-5 space-y-4">
        <div>
          <h3 className="font-display font-bold text-lg m-0">Date traveler</h3>
          <p className="text-sm text-[var(--text-dim)] mt-1.5 leading-relaxed m-0">
            Simulate a future (or past) calendar day for QA. Affects the
            challenge unlock window (days 1–5), and day-based flows that use the
            app clock (habits / streak day-roll).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3">
            <div className="font-mono text-[10px] text-[var(--text-dim)] uppercase">
              Effective today
            </div>
            <div className="font-display font-bold text-lg mt-0.5">{todayKey}</div>
            {isOverridden && (
              <div className="text-[11px] text-amber mt-1">
                Overridden (device: {clockReal})
              </div>
            )}
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3">
            <div className="font-mono text-[10px] text-[var(--text-dim)] uppercase">
              Challenge entry
            </div>
            <div className="font-display font-bold text-lg mt-0.5 capitalize">
              {entryState.replace("_", " ")}
            </div>
            <div className="text-[11px] text-[var(--text-dim)] mt-1">
              {formatRdm(state.rdm)} / {formatRdm(MONTHLY_CHALLENGE_TARGET_RDM)}{" "}
              RDM · window {meta.entryWindowLabel}
            </div>
          </div>
        </div>

        <div>
          <label className="block font-mono text-[11px] text-[var(--text-dim)] mb-1.5">
            Jump to date
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="date"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]"
            />
            <Button
              variant="primary"
              onClick={() => {
                if (!draft) {
                  showToast("Pick a date first");
                  return;
                }
                applyDate(draft);
              }}
            >
              Apply date
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                clearOverride();
                setDraft(deviceToday);
                showToast(`Override cleared — real today (${deviceToday})`);
              }}
              disabled={!isOverridden}
            >
              Clear override
            </Button>
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] text-[var(--text-dim)] uppercase mb-2">
            Date presets
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyDate(p.key, p.label)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                  todayKey === p.key
                    ? "border-teal bg-teal/15 text-teal"
                    : "border-[var(--line)] text-[var(--text-dim)] hover:border-teal/40",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
