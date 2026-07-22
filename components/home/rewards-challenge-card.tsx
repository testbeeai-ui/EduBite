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
import { ModalOverlay, ModalCard } from "@/components/ui/modal";
import { useAppClock } from "@/lib/clock/app-clock";
import {
  getChallengeMonthMeta,
  getEntryState,
  MONTHLY_CHALLENGE_TARGET_RDM,
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
  const meta = useMemo(() => getChallengeMonthMeta(todayKey), [todayKey]);
  const enrolled = state.challengeEnrolledMonthKey === meta.monthKey;
  const entryState = getEntryState({
    rdm: currentRdm,
    dateKey: todayKey,
    enrolledMonthKey: state.challengeEnrolledMonthKey,
  });
  const progressPercent = Math.min(
    100,
    Math.round((currentRdm / MONTHLY_CHALLENGE_TARGET_RDM) * 100),
  );

  const enterChallenge = () => {
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
                  Monthly Challenge
                </h3>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  {subtitleForState(entryState, meta.nextEntryOpensLabel, enrolled)}
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

              <StatusBadge state={entryState} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Progress to unlock</span>
              <span className="text-purple-300 font-semibold">
                {formatRdm(currentRdm)} / {formatRdm(MONTHLY_CHALLENGE_TARGET_RDM)}{" "}
                RDM
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-white/5 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 rounded-full transition-all duration-500 shadow-[0_0_6px_rgba(168,85,247,0.4)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {entryState === "open" ? (
            <button
              type="button"
              onClick={enterChallenge}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <span>🏆</span>{" "}
              {enrolled ? "Continue Challenge" : "Enter Monthly Challenge"}
            </button>
          ) : entryState === "locked_window" ? (
            <div className="w-full py-1.5 px-3 rounded-lg bg-slate-800/50 border border-amber-500/20 text-center text-[11px] font-medium text-amber-200/90 flex items-center justify-center gap-1.5">
              <Calendar className="w-3 h-3 text-amber-400/80" />
              Opens {meta.nextEntryOpensLabel}
            </div>
          ) : (
            <div className="w-full py-1.5 px-3 rounded-lg bg-slate-800/50 border border-white/5 text-center text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-400/80" /> Reach 5,000 RDM to unlock
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

      <ModalOverlay open={showModal} onClose={() => setShowModal(false)}>
        <ModalCard className="max-w-[420px] p-5 bg-[#141724] border border-purple-500/30 text-left space-y-3.5 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-xl shrink-0 shadow-inner">
                🏆
              </div>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-white leading-tight">
                  Monthly Challenge
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  How it works, who qualifies, and what you can win.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="text-slate-400 hover:text-white text-lg font-bold w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            >
              ×
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20">
            🔑 Requires 5,000 RDM
          </div>

          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/25 flex items-center gap-3">
            <div className="text-2xl shrink-0">🗓️</div>
            <div>
              <div className="font-bold text-purple-300 text-xs sm:text-sm">
                Enter only on days 1–5
              </div>
              <div className="text-[11px] text-slate-400">
                of every month. After you enter, the challenge stays valid for
                the rest of that month. Miss the window? Wait until{" "}
                {meta.nextEntryOpensLabel}.
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>🎁</span> Prize
            </h4>
            <ul className="space-y-1 text-xs text-slate-300 pl-4 list-disc marker:text-purple-400">
              <li>
                The first 5 entries to submit the correct answer win a gift prize
                worth ₹5,000 each.
              </li>
              <li>Prizes are physically shipped to your registered address.</li>
            </ul>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>📩</span> Notification
            </h4>
            <ul className="space-y-1 text-xs text-slate-300 pl-4 list-disc marker:text-purple-400">
              <li>
                Winners are notified via WhatsApp and email, sent only to your
                registered contact details.
              </li>
            </ul>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>🎬</span> Recognition
            </h4>
            <ul className="space-y-1 text-xs text-slate-300 pl-4 list-disc marker:text-purple-400">
              <li>
                Each winner gets a short reel/podcast feature on our social
                channels — a chance to get famous, along with your school.
              </li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>📜</span> Terms &amp; Conditions
            </h4>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2 text-[11px] text-slate-300 leading-relaxed">
              <p>
                <b className="text-slate-200">1.</b> Qualify with 5,000 RDM, then
                enter only between the 1st and 5th. Once enrolled, the challenge
                is valid for the rest of that month.
              </p>
              <p>
                <b className="text-slate-200">2.</b> Score 80%+ on Daily Dose for
                15 consecutive days, then crack the final puzzle on the last day
                of the month.
              </p>
              <p>
                <b className="text-slate-200">3.</b> First 5 correct entries win.
                Edubite notifies winners on WhatsApp and email. Names appear on
                the site with submission time for transparency.
              </p>
              <p>
                <b className="text-slate-200">4.</b> The Edubite system record of
                submission time and correctness is binding on all parties.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </ModalCard>
      </ModalOverlay>
    </>
  );
}

function subtitleForState(
  state: MonthlyEntryState,
  nextEntryOpensLabel: string,
  enrolled: boolean,
): string {
  switch (state) {
    case "open":
      return enrolled
        ? "You're in — keep your 15-day streak"
        : "Live now — enter before the 5th ends";
    case "locked_window":
      return `Opens ${nextEntryOpensLabel}`;
    case "locked_rdm":
      return "Unlocks once you reach 5,000 RDM";
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

function StatusBadge({ state }: { state: MonthlyEntryState }) {
  switch (state) {
    case "open":
      return (
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border bg-purple-500/20 border-purple-500/40 text-purple-300">
          <CheckCircle2 className="w-3 h-3 text-purple-300" /> Live
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
