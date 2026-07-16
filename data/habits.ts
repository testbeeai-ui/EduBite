import type { HabitDef } from "@/lib/types";

export const HABIT_DEFINITIONS: HabitDef[] = [
  {
    id: "sleep",
    icon: "😴",
    bg: "rgba(96,165,250,.16)",
    name: "7–8 hrs sleep",
    sub: "Locks in what today's dose taught",
  },
  {
    id: "water",
    icon: "💧",
    bg: "rgba(45,212,191,.16)",
    name: "Hydration · 8 glasses",
    sub: "Tap each glass through the day",
  },
  {
    id: "eyes",
    icon: "👁️",
    bg: "rgba(251,191,36,.16)",
    name: "20-20-20 eye breaks",
    sub: "Every 20 min, look 20ft away",
  },
  {
    id: "move",
    icon: "🧘",
    bg: "rgba(244,114,182,.16)",
    name: "10-min movement break",
    sub: "Stretch, walk, or shadow-box",
  },
  {
    id: "pomodoro",
    icon: "🍅",
    bg: "rgba(96,165,250,.16)",
    name: "Pomodoro technique",
    sub: "25 min focus, 5 min break, repeat",
  },
  {
    id: "noscreen",
    icon: "📵",
    bg: "rgba(167,139,250,.16)",
    name: "No-screen wind-down",
    sub: "30 min phone-free before bed",
  },
  {
    id: "meals",
    icon: "🍽️",
    bg: "rgba(251,191,36,.16)",
    name: "No skipped meals",
    sub: "Breakfast especially — brain fuel",
  },
  {
    id: "noai",
    icon: "🚫",
    bg: "rgba(244,114,182,.16)",
    name: "Stay away from AI",
    sub: "While practising, thinking, testing",
  },
];
