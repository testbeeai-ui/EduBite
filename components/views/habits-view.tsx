"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HabitRow, HabitsProgressHero } from "@/components/habits/habit-row";
import { ViewHeader } from "@/components/ui/modal";
import { useGame } from "@/lib/store/game-provider";

export function HabitsView() {
  const { state, toggleHabit } = useGame();
  const done = state.habits.filter((habit) => habit.done).length;
  const total = state.habits.length;
  const rdmEarned = useMemo(
    () =>
      state.habits.reduce(
        (sum, habit) => sum + (habit.done ? habit.rdm : 0),
        0,
      ),
    [state.habits],
  );
  const [openInfoId, setOpenInfoId] = useState<string | null>(null);
  const [pulseRdm, setPulseRdm] = useState(false);
  const prevRdm = useRef(rdmEarned);

  useEffect(() => {
    if (rdmEarned !== prevRdm.current) {
      setPulseRdm(true);
      const timer = window.setTimeout(() => setPulseRdm(false), 500);
      prevRdm.current = rdmEarned;
      return () => window.clearTimeout(timer);
    }
  }, [rdmEarned]);

  useEffect(() => {
    if (!openInfoId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenInfoId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openInfoId]);

  return (
    <div className="relative -mt-1 sm:-mt-2">
      <ViewHeader
        compact
        eyebrow="Wellbeing Layer"
        title="Habits"
        subtitle={`${total} habits that protect against burnout.`}
      />

      <div className="relative mt-1 overflow-visible rounded-[20px] border border-white/[0.09] bg-[#12141A] px-4 pb-2.5 pt-5 sm:px-5 sm:pt-6">
        <HabitsProgressHero
          done={done}
          total={total}
          rdmEarned={rdmEarned}
          pulseRdm={pulseRdm}
        />

        <div className="flex flex-col">
          {state.habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              openInfoId={openInfoId}
              onToggleInfo={(id) =>
                setOpenInfoId((current) => (current === id ? null : id))
              }
              onToggleDone={toggleHabit}
            />
          ))}
        </div>
      </div>

      {openInfoId ? (
        <button
          type="button"
          aria-label="Close habit details"
          className="fixed inset-0 z-40 cursor-default bg-transparent"
          onClick={() => setOpenInfoId(null)}
        />
      ) : null}
    </div>
  );
}
