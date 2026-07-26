"use client";

import { useGame } from "@/lib/store/game-provider";
import { formatRdm } from "@/lib/utils";

function habitsMessage(done: number, total: number) {
  if (done === 0) {
    return "Tap to check habits →";
  }
  if (done === total) {
    return "All habits checked today! →";
  }
  return `${done} of ${total} done in Habits →`;
}

export function ConsistencyCorner() {
  const { state, habitsStats, setActiveView } = useGame();
  const streak = state.streak ?? 0;
  const filledDots = Math.min(habitsStats.total, Math.max(0, habitsStats.done));

  return (
    <section className="rounded-[16px] border border-white/[0.07] bg-[#141A23] px-4 py-3 sm:px-5 sm:py-3.5 space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-[linear-gradient(145deg,rgba(239,159,39,0.16),transparent)] text-sm shadow-sm"
            aria-hidden
          >
            🔥
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-[15.5px] font-extrabold text-[#EAEEF3] leading-tight">
              Consistency Corner
            </h2>
            <p className="text-[11px] text-[#5C6577]">
              Daily Check‑in &amp; Streak Meter
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(239,159,39,0.3)] bg-[rgba(239,159,39,0.12)] px-2.5 py-0.5 text-[11px] font-extrabold text-[#EF9F27]">
            🔥 {streak} Day Streak
          </span>
        </div>
      </div>

      {/* Grid: Daily Check-In & Streak Meter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
        {/* Left Column: Daily Check-In */}
        <div className="flex flex-col justify-between gap-2.5 rounded-xl border border-white/[0.06] bg-[#171E28]/70 p-3 transition-colors hover:border-white/10">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(29,158,117,0.14)] text-xs text-[#1D9E75]"
                  aria-hidden
                >
                  🌱
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-[#EAEEF3]">
                    Daily check‑in
                  </div>
                  <div className="text-[10.5px] text-[#5C6577]">
                    Habits tracker progress
                  </div>
                </div>
              </div>
              <span className="rounded-full border border-[rgba(29,158,117,0.3)] bg-[rgba(29,158,117,0.12)] px-2 py-0.5 text-[11px] font-bold text-[#1D9E75]">
                {habitsStats.done}/{habitsStats.total}
              </span>
            </div>

            {/* Habit progress segment bar */}
            <div className="flex gap-1 pt-0.5" aria-hidden>
              {Array.from({ length: habitsStats.total }).map((_, i) => (
                <div
                  key={i}
                  className={
                    i < filledDots
                      ? "h-1.5 flex-1 rounded-full border border-[rgba(29,158,117,0.4)] bg-[#1D9E75] shadow-[0_0_6px_rgba(29,158,117,0.3)]"
                      : "h-1.5 flex-1 rounded-full border border-white/[0.05] bg-[#1B2330]"
                  }
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveView("habits")}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-[rgba(29,158,117,0.35)] bg-[rgba(29,158,117,0.12)] py-1.5 px-3 text-[11.5px] font-bold text-[#1D9E75] transition-all hover:bg-[rgba(29,158,117,0.2)] hover:border-[#1D9E75] cursor-pointer"
          >
            <span>{habitsMessage(habitsStats.done, habitsStats.total)}</span>
          </button>
        </div>

        {/* Right Column: Streak Meter */}
        <div className="flex flex-col justify-between gap-2.5 rounded-xl border border-white/[0.06] bg-[#171E28]/70 p-3 transition-colors hover:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(239,159,39,0.14)] text-xs text-[#EF9F27]"
                aria-hidden
              >
                🔥
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#EAEEF3]">
                  Streak Meter
                </div>
                <div className="text-[10.5px] text-[#5C6577]">
                  5 daily streak criteria
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative h-[56px] w-[56px] shrink-0">
              <svg
                width="56"
                height="56"
                viewBox="0 0 56 56"
                className="-rotate-90"
                aria-hidden
              >
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  fill="none"
                  stroke="#1B2330"
                  strokeWidth="5"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  fill="none"
                  stroke="#EF9F27"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 23}
                  strokeDashoffset={2 * Math.PI * 23 * (1 - Math.min(1, streak / 7))}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-[16px] font-extrabold leading-none text-[#EF9F27]">
                  {streak}
                </span>
                <span className="text-[7.5px] font-bold tracking-wider text-[#5C6577] mt-0.5">
                  DAYS
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 min-w-0 flex-1">
              <div className="rounded-lg border border-white/[0.05] bg-[#141A23] py-1.5 px-2 text-center">
                <div className="font-display text-[13px] font-extrabold text-[#1D9E75]">
                  {formatRdm(state.rdm)}
                </div>
                <div className="text-[8.5px] font-bold uppercase tracking-wider text-[#5C6577]">
                  Total RDM
                </div>
              </div>
              <div className="rounded-lg border border-white/[0.05] bg-[#141A23] py-1.5 px-2 text-center">
                <div className="font-display text-[13px] font-extrabold text-[#378ADD]">
                  {habitsStats.done}/{habitsStats.total}
                </div>
                <div className="text-[8.5px] font-bold uppercase tracking-wider text-[#5C6577]">
                  Habits
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-[10.5px] font-semibold text-[#8B96A8] border-t border-white/[0.05] pt-1.5">
            <span className="text-[#5C6577]">Habits contribute to full day</span>
            <button
              type="button"
              onClick={() => setActiveView("habits")}
              className="text-[#378ADD] hover:underline cursor-pointer"
            >
              Details →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
