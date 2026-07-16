"use client";

import { Card } from "@/components/ui/card";
import { ViewHeader } from "@/components/ui/modal";
import {
  HabitRow,
  HabitsMilestoneToast,
  HabitsProgressHero,
} from "@/components/habits/habit-row";
import { useGame } from "@/lib/store/game-provider";

export function HabitsView() {
  const { state, toggleHabit } = useGame();
  const done = state.habits.filter((h) => h.done).length;
  const total = state.habits.length;

  return (
    <div className="space-y-2 -mt-1 sm:-mt-3">
      <ViewHeader
        compact
        eyebrow="Wellbeing layer"
        title="Habits"
        subtitle={`${total} habits that protect against burnout.`}
      />

      <HabitsMilestoneToast done={done} total={total} />

      <Card className="p-0 overflow-hidden border-white/[0.08]">
        <HabitsProgressHero done={done} total={total} />
        {state.habits.map((habit, index) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            index={index}
            onToggle={toggleHabit}
          />
        ))}
      </Card>
    </div>
  );
}
