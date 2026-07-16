"use client";

import { ExploreEdublastCard } from "@/components/home/explore-edublast-card";
import { EdublastBanner } from "@/components/home/edublast-banner";
import { StreakMeter } from "@/components/home/streak-meter";
import { HabitsTodayCard } from "@/components/home/habits-today";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/modal";
import { useGame } from "@/lib/store/game-provider";
import { formatRdm } from "@/lib/utils";
import { cn } from "@/lib/utils";

function LevelRing({
  level,
  progress,
}: {
  level: number;
  progress: number;
}) {
  return (
    <div
      className="w-[78px] h-[78px] rounded-full shrink-0 flex items-center justify-center"
      style={{
        background: `conic-gradient(var(--teal) ${progress}%, var(--line) 0)`,
      }}
    >
      <div className="w-16 h-16 rounded-full bg-[var(--surface)] flex items-center justify-center font-mono font-bold text-sm text-[var(--text)]">
        Lv{level}
      </div>
    </div>
  );
}

function HeroStat({
  icon,
  value,
  iconClassName,
}: {
  icon: React.ReactNode;
  value: string;
  iconClassName?: string;
}) {
  return (
    <div className="font-mono text-xs text-[var(--text-dim)]">
      <span className={cn("text-sm leading-none", iconClassName)}>{icon}</span>
      <b className="block text-[var(--text)] font-body font-bold text-sm mt-1">
        {value}
      </b>
    </div>
  );
}

export function HomeView() {
  const { state, levelInfo, habitsStats } = useGame();

  return (
    <div className="space-y-1 sm:space-y-0">
      <EdublastBanner />

      <Card className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-[22px] p-[26px] mb-4 sm:mb-[26px] border-[var(--line)] bg-gradient-to-br from-purple/[0.10] to-teal/[0.06]">
        <div className="flex flex-row items-center gap-[22px] flex-1 min-w-0">
          <LevelRing level={levelInfo.current.level} progress={levelInfo.progress} />
          <div className="flex-1 min-w-0 text-left">
            <h2 className="font-display font-bold text-[19px] text-[var(--text)]">
              {levelInfo.current.name}
            </h2>
            <p className="text-[var(--text-dim)] text-[13px] mt-1">
              {levelInfo.rdmToNext > 0
                ? `${formatRdm(levelInfo.rdmToNext)} RDM to Level ${levelInfo.next.level}`
                : "Max level reached — keep the streak alive."}
            </p>
            <div className="flex flex-wrap gap-6 sm:gap-8 mt-3">
              <HeroStat icon="🔥" value={`${state.streak} days`} />
              <HeroStat
                icon="◆"
                value={`${formatRdm(state.rdm)} RDM`}
                iconClassName="text-teal"
              />
              <HeroStat
                icon="🌱"
                value={`${habitsStats.done}/${habitsStats.total} habits`}
              />
            </div>
          </div>
        </div>

        <ExploreEdublastCard />
      </Card>

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
