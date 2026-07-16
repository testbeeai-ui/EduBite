"use client";

import { ACHIEVEMENT_DEFINITIONS } from "@/data/achievements";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ViewHeader } from "@/components/ui/modal";
import { useGame } from "@/lib/store/game-provider";
import { cn } from "@/lib/utils";

export function AchievementsView() {
  const { achievements } = useGame();

  return (
    <div>
      <ViewHeader
        eyebrow="Milestones"
        title="Achievements"
        subtitle="Badges unlock automatically as you build the habit — every one below is live, tied to your real progress."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[18px]">
        {ACHIEVEMENT_DEFINITIONS.map((def) => {
          const progress = achievements[def.id];
          const unlocked = progress?.unlocked ?? false;
          return (
            <Card
              key={def.id}
              className={cn(
                "relative overflow-hidden hover:-translate-y-0.5 transition-transform",
                unlocked && "border-[rgba(232,196,104,0.4)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-gradient-to-r before:from-[var(--gold)] before:to-amber",
              )}
            >
              <div
                className={cn(
                  "w-11 h-11 rounded-[13px] flex items-center justify-center text-xl bg-[var(--surface-2)]",
                  unlocked && "bg-gradient-to-br from-[rgba(232,196,104,0.25)] to-[rgba(251,191,36,0.1)]",
                )}
              >
                {def.icon}
              </div>
              <div className="font-display font-bold text-[14.5px] mt-3">{def.title}</div>
              <div className="text-xs text-[var(--text-dim)] mt-1 leading-relaxed min-h-8">
                {def.desc}
              </div>
              <div className="mt-3.5">
                {unlocked ? (
                  <div className="font-mono text-[10.5px] text-[var(--gold)]">
                    ✓ UNLOCKED
                  </div>
                ) : (
                  <>
                    <div className="font-mono text-[10.5px] text-[var(--text-dim)] mb-2">
                      {progress?.current ?? 0} / {progress?.target ?? 1}
                    </div>
                    <ProgressBar
                      value={((progress?.current ?? 0) / (progress?.target ?? 1)) * 100}
                      animated={false}
                    />
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
