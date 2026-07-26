"use client";

import { Flame, Sparkles, Sprout } from "lucide-react";
import { ConsistencyCorner } from "@/components/home/consistency-corner";
import { EdublastBanner } from "@/components/home/edublast-banner";
import { RewardsChallengeCard } from "@/components/home/rewards-challenge-card";
import { StreakMeter } from "@/components/home/streak-meter";
import { useGame } from "@/lib/store/game-provider";
import { formatRdm } from "@/lib/utils";

const RING = 2 * Math.PI * 27;

function LevelRing({ level, progress }: { level: number; progress: number }) {
  const offset = RING * (1 - Math.min(100, Math.max(0, progress)) / 100);
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90" aria-hidden>
        <circle cx="32" cy="32" r="27" fill="none" stroke="#1B2330" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r="27"
          fill="none"
          stroke="#1D9E75"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={RING}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display text-[15px] font-extrabold text-[#1D9E75]">
        Lv{level}
      </div>
    </div>
  );
}

export function HomeView() {
  const { state, levelInfo, habitsStats } = useGame();

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-9">
      <EdublastBanner />

      <div className="min-w-0 flex-1 space-y-[18px]">
        {/* Daily Learner + Monthly Challenge */}
        <section className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[1fr_1.28fr]">
          <div className="flex flex-col gap-3.5 rounded-[18px] border border-white/[0.07] bg-[#141A23] px-5 py-[18px]">
            <div className="flex items-center gap-3.5">
              <LevelRing
                level={levelInfo.current.level}
                progress={levelInfo.progress}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-[16.5px] font-bold text-[#EAEEF3] leading-tight">
                    {levelInfo.current.name}
                  </h2>
                  <span className="rounded-full bg-[rgba(29,158,117,0.14)] px-2 py-0.5 text-[10px] font-extrabold text-[#1D9E75]">
                    Lv.{levelInfo.current.level}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-[#5C6577]">
                  {levelInfo.rdmToNext > 0
                    ? `${formatRdm(levelInfo.rdmToNext)} RDM to Level ${levelInfo.next.level}`
                    : "Max level reached — keep the streak alive."}
                </p>
              </div>
              <div className="ml-auto hidden shrink-0 self-start text-right text-[11px] text-[#8B96A8] sm:block">
                {Math.round(levelInfo.progress)}% to Lv{levelInfo.next.level}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.045] bg-[#171E28] px-2.5 py-2.5">
                <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[rgba(239,159,39,0.14)] text-[#EF9F27]">
                  <Flame className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] uppercase tracking-[0.03em] text-[#5C6577]">
                    Streak
                  </div>
                  <div className="truncate font-display text-sm font-extrabold text-[#EAEEF3]">
                    {state.streak} days
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.045] bg-[#171E28] px-2.5 py-2.5">
                <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[rgba(29,158,117,0.14)] text-[#1D9E75]">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] uppercase tracking-[0.03em] text-[#5C6577]">
                    Total RDM
                  </div>
                  <div className="truncate font-display text-sm font-extrabold text-[#EAEEF3]">
                    {formatRdm(state.rdm)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.045] bg-[#171E28] px-2.5 py-2.5">
                <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[rgba(55,138,221,0.14)] text-[#378ADD]">
                  <Sprout className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] uppercase tracking-[0.03em] text-[#5C6577]">
                    Habits
                  </div>
                  <div className="truncate font-display text-sm font-extrabold text-[#EAEEF3]">
                    {habitsStats.done}/{habitsStats.total} done
                  </div>
                </div>
              </div>
            </div>
          </div>

          <RewardsChallengeCard />
        </section>

        <ConsistencyCorner />
        <StreakMeter />
      </div>
    </div>
  );
}
