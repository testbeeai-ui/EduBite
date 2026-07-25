"use client";

import { useMemo, useState } from "react";
import {
  Lock,
  Info,
  CheckCircle2,
  Gift,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
import { formatRdm } from "@/lib/utils";

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
    // One click on the card: deduct stake for THIS clock month only, then open.
    if (entryState === "open" && !enrolled) {
      enrollMonthlyChallenge(meta.monthKey);
    }
    setActiveView("challenge");
  };

  return (
    <>
      <Card className="p-4 sm:p-5 border-purple-500/20 bg-[#121422] shadow-xl relative overflow-hidden flex flex-col justify-center">
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative space-y-2.5">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-lg shrink-0 shadow-inner">
                🏆
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-sm sm:text-base text-white leading-tight">
                  {monthLabel} Challenge
                </h3>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  {subtitleForState({
                    state: entryState,
                    nextEntryOpensLabel: meta.nextEntryOpensLabel,
                    enrolled,
                    monthLabel,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 relative">
              {showPrizeTooltip && (
                <div className="absolute right-0 top-7 z-30 w-52 p-2 px-2.5 rounded-xl bg-slate-950/95 border border-amber-500/40 text-[11px] text-amber-200 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                  <div className="flex items-start gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
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
                className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/30 text-amber-300 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Prize Info"
              >
                <Info className="w-3 h-3" />
              </button>

              <StatusBadge state={entryState} enrolled={enrolled} />
            </div>
          </div>

          {showUnlockProgress ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Progress to unlock</span>
                <span className="text-purple-300 font-semibold">
                  {formatRdm(currentRdm)} / {formatRdm(targetRdm)} RDM
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 rounded-full transition-all duration-500 shadow-[0_0_6px_rgba(168,85,247,0.4)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : null}

          {entryState === "open" ? (
            <button
              type="button"
              onClick={enterChallenge}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <span>🏆</span>{" "}
              {enrolled
                ? "Continue Challenge"
                : "Enter Challenge"}
            </button>
          ) : entryState === "locked_window" ? (
            <div className="w-full py-1.5 px-3 rounded-lg bg-slate-800/50 border border-amber-500/20 text-center text-[11px] font-medium text-amber-200/90 flex items-center justify-center gap-1.5">
              <Calendar className="w-3 h-3 text-amber-400/80" />
              {monthLabel} opens {meta.nextEntryOpensLabel}
            </div>
          ) : (
            <div className="w-full py-1.5 px-3 rounded-lg bg-slate-800/50 border border-white/5 text-center text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-400/80" /> Reach{" "}
              {formatRdm(targetRdm)} RDM to unlock {meta.monthLabel}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full py-1.5 px-3 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-300 hover:text-indigo-200 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer group"
          >
            <Info className="w-3 h-3 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>Learn How? — Conditions &amp; Benefits</span>
          </button>
        </div>
      </Card>

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
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border bg-purple-500/20 border-purple-500/40 text-purple-300">
          <CheckCircle2 className="w-3 h-3 text-purple-300" />{" "}
          {enrolled ? "Joined" : "Open"}
        </div>
      );
    case "locked_window":
      return (
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border bg-amber-500/10 border-amber-500/30 text-amber-300">
          <Calendar className="w-3 h-3 text-amber-400" /> Closed
        </div>
      );
    case "locked_rdm":
      return (
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border bg-amber-500/10 border-amber-500/30 text-amber-300">
          <Lock className="w-3 h-3 text-amber-400" /> Locked
        </div>
      );
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
