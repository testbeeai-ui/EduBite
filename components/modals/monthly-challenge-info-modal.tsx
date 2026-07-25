"use client";

import { ModalOverlay, ModalCard } from "@/components/ui/modal";
import {
  getMonthlyChallengeEntryStakeRdm,
  getMonthlyChallengeTargetRdm,
} from "@/lib/challenge/monthly";
import { formatRdm } from "@/lib/utils";

type MonthlyChallengeInfoModalProps = {
  open: boolean;
  onClose: () => void;
};

export function MonthlyChallengeInfoModal({
  open,
  onClose,
}: MonthlyChallengeInfoModalProps) {
  const targetRdm = getMonthlyChallengeTargetRdm();
  const entryStakeRdm = getMonthlyChallengeEntryStakeRdm();

  return (
    <ModalOverlay open={open} onClose={onClose}>
      <ModalCard className="max-w-[480px] w-full p-3.5 sm:p-4.5 bg-[#141724] border border-purple-500/30 text-left space-y-2.5 sm:space-y-3 rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-base sm:text-lg shrink-0 shadow-inner">
              🏆
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm sm:text-base text-white leading-tight truncate">
                Monthly Challenge
              </h3>
              <p className="text-[10.5px] sm:text-[11px] text-slate-400 mt-0.5 leading-tight">
                How it works, who qualifies, and what you can win.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base font-bold w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] sm:text-[11px] font-mono font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20">
            🔑 Unlock at {formatRdm(targetRdm)} RDM
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] sm:text-[11px] font-mono font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20">
            ⚡ Entry stake in Terms
          </span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-purple-950/40 border border-purple-500/25 flex items-center gap-3">
          <div className="text-xl shrink-0">🗓️</div>
          <div>
            <div className="font-mono font-bold text-purple-300 text-xs sm:text-sm">
              Opens 1st - 5th
            </div>
            <div className="text-[10.5px] sm:text-[11px] text-slate-400">of every month</div>
          </div>
        </div>

        <div className="space-y-0.5">
          <h4 className="text-[11px] sm:text-[11.5px] font-bold text-white flex items-center gap-1.5">
            <span>🎁</span> Prize
          </h4>
          <ul className="space-y-0.5 text-[10.5px] sm:text-[11px] text-slate-300 pl-4 list-disc marker:text-purple-400 leading-snug">
            <li>
              The first 5 entries to submit the correct answer win a gift prize
              worth ₹5,000 each.
            </li>
            <li>Prizes are physically shipped to your registered address.</li>
          </ul>
        </div>

        <div className="space-y-0.5">
          <h4 className="text-[11px] sm:text-[11.5px] font-bold text-white flex items-center gap-1.5">
            <span>📩</span> Notification
          </h4>
          <ul className="space-y-0.5 text-[10.5px] sm:text-[11px] text-slate-300 pl-4 list-disc marker:text-purple-400 leading-snug">
            <li>
              Winners are notified via WhatsApp and email, sent only to your
              registered contact details.
            </li>
          </ul>
        </div>

        <div className="space-y-0.5">
          <h4 className="text-[11px] sm:text-[11.5px] font-bold text-white flex items-center gap-1.5">
            <span>🎬</span> Recognition
          </h4>
          <ul className="space-y-0.5 text-[10.5px] sm:text-[11px] text-slate-300 pl-4 list-disc marker:text-purple-400 leading-snug">
            <li>
              Each winner gets a short reel/podcast feature on our social
              channels — a chance to get famous, along with your school.
            </li>
          </ul>
        </div>

        <div className="space-y-1">
          <h4 className="text-[11px] sm:text-[11.5px] font-bold text-white flex items-center gap-1.5">
            <span>📜</span> Terms &amp; Conditions
          </h4>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1.5 text-[10.5px] sm:text-[11px] text-slate-400 leading-snug">
            <p>
              <b className="text-slate-300">1.</b> Winner names will be
              announced on the site along with their date and time of submission,
              for full transparency.
            </p>
            <p>
              <b className="text-slate-300">2.</b> The Edubite system record of
              submission time and correctness is binding on all parties.
            </p>
            <p>
              <b className="text-slate-300">3.</b> Entry stake — joining claims{" "}
              <b className="text-amber-300">{formatRdm(entryStakeRdm)} RDM</b>{" "}
              from your balance. That skin-in-the-game keeps the challenge
              serious. The stake is non-refundable once you enroll.
            </p>
            <p>
              <b className="text-slate-300">4.</b> One month only — enrollment
              is valid for the current calendar month. When the next month
              starts, it is a new challenge: you must unlock again (reach{" "}
              {formatRdm(targetRdm)} RDM) and pay a fresh{" "}
              {formatRdm(entryStakeRdm)} RDM entry stake.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="w-full py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer"
          onClick={onClose}
        >
          Close
        </button>
      </ModalCard>
    </ModalOverlay>
  );
}
