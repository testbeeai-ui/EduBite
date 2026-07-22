"use client";

import { Flame, Sparkles, Sprout } from "lucide-react";
import { RewardsChallengeCard } from "@/components/home/rewards-challenge-card";
import { EdublastBanner } from "@/components/home/edublast-banner";
import { StreakMeter } from "@/components/home/streak-meter";
import { HabitsTodayCard } from "@/components/home/habits-today";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/modal";
import { useGame } from "@/lib/store/game-provider";
import { formatRdm } from "@/lib/utils";

function LevelRing({
  level,
  progress,
}: {
  level: number;
  progress: number;
}) {
  return (
    <div
      className="w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-full shrink-0 flex items-center justify-center shadow-inner"
      style={{
        background: `conic-gradient(var(--teal) ${progress}%, var(--line) 0)`,
      }}
    >
      <div className="w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] rounded-full bg-[var(--surface)] flex items-center justify-center font-mono font-bold text-xs text-[var(--text)] shadow-sm">
        Lv{level}
      </div>
    </div>
  );
}

export function HomeView() {
  const { state, levelInfo, habitsStats } = useGame();

  return (
    <div className="space-y-1 sm:space-y-0">
      <EdublastBanner />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-5 items-stretch">
        {/* Left Block: Redesigned Daily Learner Card */}
        <Card className="p-4 sm:p-5 border-[var(--line)] bg-gradient-to-br from-purple/[0.12] via-slate-900/80 to-teal/[0.08] relative overflow-hidden flex flex-col justify-between shadow-xl">
          {/* Ambient Glows */}
          <div className="absolute -top-10 -left-10 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-teal/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative space-y-3.5">
            {/* Top Row: Level Info & Progress */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <LevelRing level={levelInfo.current.level} progress={levelInfo.progress} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-base sm:text-lg text-[var(--text)] leading-tight">
                      {levelInfo.current.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-teal/15 text-teal border border-teal/30 shrink-0">
                      Lv.{levelInfo.current.level}
                    </span>
                  </div>
                  <p className="text-[var(--text-dim)] text-[11px] sm:text-xs mt-0.5 leading-snug">
                    {levelInfo.rdmToNext > 0
                      ? `${formatRdm(levelInfo.rdmToNext)} RDM to Level ${levelInfo.next.level}`
                      : "Max level reached — keep the streak alive."}
                  </p>
                </div>
              </div>

              {/* XP Progress Indicator on Top Right */}
              <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] font-mono text-[var(--text-dim)]">
                  {Math.round(levelInfo.progress)}% to Lv{levelInfo.next.level}
                </span>
                <div className="w-24 h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-teal via-indigo-400 to-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${levelInfo.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row: 3 Glassmorphic Stat Pills Spanning Full Width */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-0.5">
              {/* Streak */}
              <div className="flex items-center gap-2.5 p-2 px-2.5 sm:px-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition-colors">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 leading-none">
                    Streak
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[var(--text)] mt-0.5 truncate">
                    {state.streak} days
                  </div>
                </div>
              </div>

              {/* Total RDM */}
              <div className="flex items-center gap-2.5 p-2 px-2.5 sm:px-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-teal/30 transition-colors">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal/15 border border-teal/25 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 leading-none">
                    Total RDM
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-teal mt-0.5 truncate">
                    {formatRdm(state.rdm)}
                  </div>
                </div>
              </div>

              {/* Habits */}
              <div className="flex items-center gap-2.5 p-2 px-2.5 sm:px-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-colors">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                  <Sprout className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 leading-none">
                    Habits
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[var(--text)] mt-0.5 truncate">
                    {habitsStats.done}/{habitsStats.total} done
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Block: Monthly Challenge Card */}
        <RewardsChallengeCard />
      </div>

      <SectionTitle className="my-4 sm:my-7 mb-3 sm:mb-3.5">
        Habits today
      </SectionTitle>
      <HabitsTodayCard />

      <SectionTitle className="my-4 sm:my-7 mb-3 sm:mb-3.5">
        Streak meter
      </SectionTitle>
      <Card className="p-4 sm:p-6 border-white/[0.08] bg-gradient-to-b from-[var(--surface)] to-[var(--surface-2)]/50 overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <StreakMeter />
        </div>
      </Card>
    </div>
  );
}
