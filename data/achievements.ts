import { FEATURES } from "@/data/config";
import type { AchievementDef } from "@/lib/types";

export const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  {
    id: "streak-7",
    icon: "🔥",
    title: "7-Day Streak",
    desc: "Complete all four streak criteria for 7 days straight.",
  },
  {
    id: "streak-30",
    icon: "🚀",
    title: "30-Day Streak",
    desc: "A full month without missing a beat.",
  },
  {
    id: "rdm-1000",
    icon: "💎",
    title: "1,000 RDM Club",
    desc: "Cross 1,000 RDM earned in total.",
  },
  {
    id: "rdm-5000",
    icon: "💠",
    title: "5,000 RDM Club",
    desc: "Cross 5,000 RDM earned in total.",
  },
  {
    id: "dose-perfect",
    icon: "🍬",
    title: "DailyDose Perfectionist",
    desc: "Get every question right in a single DailyDose.",
  },
  {
    id: "funbrain-high",
    icon: "⚡",
    title: "FunBrain High Scorer",
    desc: "Score 100+ points in a single 60-second sprint.",
  },
  {
    id: "habits-perfect",
    icon: "🌱",
    title: "Perfect Habit Day",
    desc: "Check off all 8 habits in a single day.",
  },
  {
    id: "pledge-integrity",
    icon: "🤖",
    title: "AI-Integrity Streak",
    desc: "Sign both the 8AM and 10PM pledge on the same day.",
  },
  {
    id: "gyan-explorer",
    icon: "✨",
    title: `${FEATURES.gyan.label} Explorer`,
    desc: `Spend 30 minutes inside ${FEATURES.gyan.label} in a single day.`,
  },
];
