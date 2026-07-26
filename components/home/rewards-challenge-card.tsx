"use client";

import { useMemo, useState } from "react";
import { Lock, Info, CheckCircle2, Gift, Calendar } from "lucide-react";
import { MonthlyChallengeInfoModal } from "@/components/modals/monthly-challenge-info-modal";
import { useAppClock } from "@/lib/clock/app-clock";
import {
  getChallengeMonthMeta,
  getEntryState,
  getMonthlyChallengeTargetRdm,
  isEnrolledForChallengeMonth,
  type MonthlyEntryState,
} from "@/lib/challenge/monthly";
import { useGame } from "@/lib/store/game-provider";
import { cn, formatRdm } from "@/lib/utils";

export function RewardsChallengeCard() {
  const { state, setActiveView, enrollMonthlyChallenge } = useGame();
  const { todayKey } = useAppClock();
  const [showModal, setShowModal] = useState(false);
  const [showPrizeTooltip, setShowPrizeTooltip] = useState(false);

  const currentRdm = state.rdm ?? 0;
  const targetRdm = getMonthlyChallengeTargetRdm();
  const meta = useMemo(() => getChallengeMonthMeta(todayKey), [todayKey]);
  const enrolled = isEnrolledForChallengeMonth(
    meta.monthKey,
    state.challengeEnrolledMonthKey,
    state.challengeEnrolledMonths,
  );
  const entryState = getEntryState({
    rdm: currentRdm,
    dateKey: todayKey,
    enrolledMonthKey: state.challengeEnrolledMonthKey,
    enrolledMonths: state.challengeEnrolledMonths,
  });
  const progressPercent = Math.min(
    100,
    Math.round((currentRdm / Math.max(1, targetRdm)) * 100),
  );
  const showUnlockProgress = entryState === "locked_rdm";
  const monthLabel = `${meta.monthLabel} ${meta.year}`;

  const enterChallenge = () => {
    if (entryState === "open" && !enrolled) {
      enrollMonthlyChallenge(meta.monthKey);
    }
    setActiveView("challenge");
  };

  return (
    <>
      <section className="flex h-full flex-col gap-3 rounded-[18px] border border-white/[0.07] bg-[#141A23] px-5 py-[18px]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(150deg,#7F77DD,#574fc9)] text-[19px] shadow-[0_4px_16px_rgba(127,119,221,0.35)]"
              aria-hidden
            >
              🏆
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-[15px] font-bold text-[#EAEEF3] leading-tight">
                {monthLabel} Challenge
              </h3>
              <p className="mt-0.5 text-[10.5px] text-[#5C6577] leading-snug">
                {subtitleForState({
                  state: entryState,
                  nextEntryOpensLabel: meta.nextEntryOpensLabel,
                  enrolled,
                  monthLabel,
                })}
              </p>
            </div>
          </div>

          <div className="relative flex shrink-0 items-center gap-1.5">
            {showPrizeTooltip && (
              <div className="pointer-events-none absolute right-0 top-8 z-30 w-52 rounded-xl border border-amber-500/40 bg-slate-950/95 p-2 text-[11px] text-amber-200 shadow-2xl backdrop-blur-md">
                <div className="flex items-start gap-1.5">
                  <Gift className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <div>
                    <span className="font-bold text-amber-300">₹5,000 Prize:</span>{" "}
                    First 5 correct entries win ₹5,000 each!
                  </div>
                </div>
              </div>
            )}
            <button
              type="button"
              onMouseEnter={() => setShowPrizeTooltip(true)}
              onMouseLeave={() => setShowPrizeTooltip(false)}
              onClick={() => setShowPrizeTooltip(!showPrizeTooltip)}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/15 text-amber-300 transition-colors hover:bg-amber-500/30"
              aria-label="Prize Info"
            >
              <Info className="h-3 w-3" />
            </button>
            <StatusBadge state={entryState} enrolled={enrolled} />
          </div>
        </div>

        {showUnlockProgress ? (
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#5C6577]">
              <span>Progress to unlock</span>
              <b className="font-bold text-[#8B96A8]">
                {formatRdm(currentRdm)} / {formatRdm(targetRdm)} RDM
              </b>
            </div>
            <div className="mt-1.5 h-[7px] overflow-hidden rounded-full bg-[#1B2330]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#7F77DD,#378ADD)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : null}

        {entryState === "open" ? (
          <button
            type="button"
            onClick={enterChallenge}
            className="w-full rounded-[11px] border border-[rgba(127,119,221,0.35)] bg-[rgba(127,119,221,0.18)] py-2.5 text-center text-xs font-bold text-[#AFA9EC] transition-colors hover:bg-[rgba(127,119,221,0.28)]"
          >
            🏆 {enrolled ? "Continue Challenge" : "Enter Challenge"}
          </button>
        ) : entryState === "locked_window" ? (
          <div className="flex w-full items-center justify-center gap-1.5 rounded-[11px] border border-[rgba(239,159,39,0.3)] bg-[rgba(239,159,39,0.08)] py-2.5 text-center text-xs font-bold text-[#EF9F27]">
            <Calendar className="h-3.5 w-3.5" />
            {monthLabel} opens {meta.nextEntryOpensLabel}
          </div>
        ) : (
          <div className="flex w-full items-center justify-center gap-1.5 rounded-[11px] border border-[rgba(239,159,39,0.3)] bg-[rgba(239,159,39,0.08)] py-2.5 text-center text-xs font-bold text-[#EF9F27]">
            <Lock className="h-3.5 w-3.5" />
            Reach {formatRdm(targetRdm)} RDM to unlock {meta.monthLabel}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-[11px] border border-[rgba(127,119,221,0.28)] bg-[rgba(127,119,221,0.06)] py-2.5 text-[11.5px] font-semibold text-[#7F77DD] transition-colors hover:bg-[rgba(127,119,221,0.12)]"
        >
          <Info className="h-3.5 w-3.5" />
          Learn How? — Conditions &amp; Benefits
        </button>
      </section>

      <MonthlyChallengeInfoModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

function subtitleForState(args: {
  state: MonthlyEntryState;
  nextEntryOpensLabel: string;
  enrolled: boolean;
  monthLabel: string;
}): string {
  switch (args.state) {
    case "open":
      return args.enrolled
        ? `You're in for ${args.monthLabel} — stake already paid. Next month needs a new entry.`
        : `${args.monthLabel} unlocked — enter once to join (entry stake applies).`;
    case "locked_window":
      return `Opens ${args.nextEntryOpensLabel} — each month is a fresh entry + stake`;
    case "locked_rdm":
      return `Reach ${formatRdm(getMonthlyChallengeTargetRdm())} RDM to unlock ${args.monthLabel}`;
    default: {
      const _exhaustive: never = args.state;
      return _exhaustive;
    }
  }
}

function StatusBadge({
  state,
  enrolled,
}: {
  state: MonthlyEntryState;
  enrolled: boolean;
}) {
  switch (state) {
    case "open":
      return (
        <div
          className={cn(
            "flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold",
            enrolled
              ? "border-[rgba(127,119,221,0.35)] bg-[rgba(127,119,221,0.14)] text-[#AFA9EC]"
              : "border-[rgba(29,158,117,0.35)] bg-[rgba(29,158,117,0.14)] text-[#1D9E75]",
          )}
        >
          <CheckCircle2 className="h-3 w-3" />
          {enrolled ? "Joined" : "Open"}
        </div>
      );
    case "locked_window":
      return (
        <div className="flex items-center gap-1 whitespace-nowrap rounded-full border border-[rgba(239,159,39,0.3)] bg-[rgba(239,159,39,0.14)] px-2.5 py-1 text-[10px] font-bold text-[#EF9F27]">
          <Calendar className="h-3 w-3" /> Closed
        </div>
      );
    case "locked_rdm":
      return (
        <div className="flex items-center gap-1 whitespace-nowrap rounded-full border border-[rgba(239,159,39,0.3)] bg-[rgba(239,159,39,0.14)] px-2.5 py-1 text-[10px] font-bold text-[#EF9F27]">
          <Lock className="h-3 w-3" /> Locked
        </div>
      );
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
