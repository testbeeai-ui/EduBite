export const STORAGE_KEY = "edubite.game.v1";

export const RDM_PER_DOSE_CORRECT = 45;
export const DOSE_QUESTION_COUNT = 5;
export const FUNBRAIN_DURATION_SEC = 60;
export const FUNBRAIN_BASE_POINTS = 10;
export const FUNBRAIN_COMBO_BONUS = 5;
export const GYAN_STREAK_GOAL_MS = 30 * 60 * 1000;
export const REEL_DURATION_SEC = 60;

export const LEVELS = [
  { level: 1, name: "Curious Starter", rdmRequired: 0 },
  { level: 2, name: "Daily Learner", rdmRequired: 500 },
  { level: 3, name: "Focused Builder", rdmRequired: 1200 },
  { level: 4, name: "Sharp Thinker", rdmRequired: 2100 },
  { level: 5, name: "Concept Master", rdmRequired: 3400 },
  { level: 6, name: "Exam Ready", rdmRequired: 5000 },
] as const;

export const FEATURES = {
  gyan: {
    id: "gyan" as const,
    label: "Brain Gym",
    tagline: "GO DEEPER",
    eyebrow: "Function 03",
    streakLabel: "Brain Gym playtime",
    subtitle:
      'Optional "why it works" deep dives, unlocked by streaks and levels — real concept mastery, no cramming.',
  },
  puzzles: {
    id: "puzzles" as const,
    label: "Puzzles",
    tagline: "ONE A DAY",
    eyebrow: "Function 03B",
    streakLabel: "Puzzles",
    subtitle:
      "Class XI & XII challenges. Solve today — answers unlock tomorrow.",
  },
  dailydose: {
    id: "dailydose" as const,
    label: "DailyDose",
    tagline: "3 MIN · +45 RDM",
    eyebrow: "Function 01",
    streakLabel: "Daily Dose",
  },
  funbrain: {
    id: "funbrain" as const,
    label: "FunBrain",
    tagline: "60 SEC SPRINT",
    eyebrow: "Function 02",
    streakLabel: "Fun Brain",
  },
  wasquad: {
    id: "wasquad" as const,
    label: "WA Squad",
    tagline: "TIPS · JACKPOT",
    eyebrow: "Function 04",
  },
} as const;

export const WA_SQUAD = {
  jackpotAmount: "₹10,000",
  joinUrl: "https://wa.me/910000000000",
  rankPlaceholder: null as number | null,
};

/** Sibling app — full lessons / explore mode */
export const EDUBLAST_URL = "https://www.edublast.in";

export const NAV_ITEMS = [
  { id: "home", label: "Home", shortLabel: "Home", emoji: "⌂", accent: "from-teal/25 to-blue/15" },
  { id: "dailydose", label: "DailyDose", shortLabel: "Dose", emoji: "🍬", accent: "from-teal/30 to-teal/10" },
  { id: "funbrain", label: "FunBrain", shortLabel: "Fun", emoji: "⚡", accent: "from-blue/30 to-amber/15" },
  { id: "gyan", label: FEATURES.gyan.label, shortLabel: "Gym", emoji: "🧠", accent: "from-purple/30 to-purple/10" },
  { id: "puzzles", label: FEATURES.puzzles.label, shortLabel: "Puzzles", emoji: "🧩", accent: "from-gold/30 to-amber/10" },
  { id: "wasquad", label: "WA Squad", shortLabel: "Squad", emoji: "💬", accent: "from-[#25D366]/30 to-[#25D366]/10" },
  { id: "habits", label: "Habits", shortLabel: "Habits", emoji: "🌱", accent: "from-emerald/30 to-teal/10" },
  { id: "achievements", label: "Achievements", shortLabel: "Badges", emoji: "🏆", accent: "from-amber/30 to-orange/10" },
  { id: "inspiration", label: "Inspiration", shortLabel: "Spark", emoji: "🌟", accent: "from-yellow/25 to-amber/10" },
  { id: "ai", label: "AI", shortLabel: "AI", emoji: "🤖", accent: "from-purple/30 to-indigo/10" },
] as const;
