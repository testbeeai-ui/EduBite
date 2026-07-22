"use client";

import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useGame } from "@/lib/store/game-provider";

function habitsMessage(done: number, total: number) {
  if (done === 0) {
    return "Open Habits and check off what you've completed today — habits are one of five streak activities.";
  }
  if (done === total) {
    return "All habits checked — one streak criterion down; finish the rest of today's five.";
  }
  return `${done} of ${total} done — head to Habits to finish the rest.`;
}

export function HabitsTodayCard() {
  const { habitsStats, setActiveView } = useGame();

  return (
    <Card className="p-4 sm:p-5 mb-1 sm:mb-2 border-white/[0.06] bg-gradient-to-br from-emerald/[0.06] via-[var(--surface)] to-blue/[0.04]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-emerald/30 to-teal/10 border border-white/[0.06] text-sm"
              aria-hidden
            >
              🌱
            </span>
            <div>
              <p className="font-display font-bold text-sm text-[var(--text)]">
                Daily check-in
              </p>
              <p className="font-mono text-[10px] text-teal/90 mt-0.5">
                {habitsStats.done}/{habitsStats.total} complete
              </p>
            </div>
          </div>
          <p className="text-[12px] text-[var(--text-dim)] mt-2 leading-relaxed">
            {habitsMessage(habitsStats.done, habitsStats.total)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveView("habits")}
          className="shrink-0 text-[11px] font-semibold text-teal hover:text-[var(--text)] border border-teal/25 hover:border-teal/40 bg-teal/[0.06] hover:bg-teal/10 px-2.5 py-1.5 rounded-full transition-colors whitespace-nowrap"
        >
          Open Habits →
        </button>
      </div>

      <ProgressBar value={habitsStats.pct} className="h-2.5" />

      <button
        type="button"
        onClick={() => setActiveView("habits")}
        className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-white/10 text-[12px] font-semibold text-[var(--text-dim)] hover:text-[var(--text)] hover:border-teal/25 hover:bg-teal/[0.04] transition-colors"
      >
        Go to Habits — tap what you&apos;ve done today
        <span className="text-teal" aria-hidden>
          →
        </span>
      </button>
    </Card>
  );
}
