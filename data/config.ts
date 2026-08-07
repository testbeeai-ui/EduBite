export const STORAGE_KEY = "edubite.game.v1";

export const RDM_PER_DOSE_CORRECT = 45;
export const DOSE_QUESTION_COUNT = 5;
/** DailyDose exam window — session ends when this hits zero. */
export const DOSE_DURATION_SEC = 4 * 60;
/** FunBrain Quick Sprint window — session ends when this hits zero. */
export const FUNBRAIN_DURATION_SEC = 6 * 60;
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
    tagline: "4 MIN TIMER",
    eyebrow: "Function 01",
    streakLabel: "Daily Dose",
  },
  funbrain: {
    id: "funbrain" as const,
    label: "FunBrain",
    tagline: "6 MIN · QUICK SPRINT",
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
  /** Official Edubite WhatsApp group invite */
  joinUrl: "https://chat.whatsapp.com/KRGYkPhUWSRF89Ghp04iCb",
  rankPlaceholder: null as number | null,
};

/** Sibling app — full lessons / explore mode */
export const EDUBLAST_URL = "https://www.edublast.in";

/** Deep links into EduBlast (Edubite banner only — do not edit Web/). */
export const EDUBLAST_LINKS = {
  home: EDUBLAST_URL,
  /** Educational Social Media → Community wall */
  community: `${EDUBLAST_URL}/explore/community`,
  /** Gyan++ DoubtWall */
  gyan: `${EDUBLAST_URL}/doubts`,
  /** Rewards for Study / streaks → Play Hub */
  playHub: `${EDUBLAST_URL}/play`,
  /** Learning Buddy */
  learningBuddy: `${EDUBLAST_URL}/refer-earn?tab=learning_buddy`,
  /** Unlock Edufundz */
  edufundz: `${EDUBLAST_URL}/edufund`,
} as const;

export const NAV_ITEMS = [
  { id: "home", label: "Home", shortLabel: "Home", emoji: "⌂", accent: "from-teal/25 to-blue/15" },
  { id: "dailydose", label: "DailyDose", shortLabel: "DailyDose", emoji: "🍬", accent: "from-teal/30 to-teal/10" },
  { id: "funbrain", label: "FunBrain", shortLabel: "FunBrain", emoji: "⚡", accent: "from-blue/30 to-amber/15" },
  { id: "gyan", label: FEATURES.gyan.label, shortLabel: FEATURES.gyan.label, emoji: "🧠", accent: "from-purple/30 to-purple/10" },
  { id: "puzzles", label: FEATURES.puzzles.label, shortLabel: FEATURES.puzzles.label, emoji: "🧩", accent: "from-gold/30 to-amber/10" },
  { id: "wasquad", label: "WA Squad", shortLabel: "WA Squad", emoji: "💬", accent: "from-[#25D366]/30 to-[#25D366]/10" },
  { id: "habits", label: "Habits", shortLabel: "Habits", emoji: "🌱", accent: "from-emerald/30 to-teal/10" },
  { id: "achievements", label: "Achievements", shortLabel: "Achievements", emoji: "🏆", accent: "from-amber/30 to-orange/10" },
  { id: "inspiration", label: "Inspiration", shortLabel: "Inspiration", emoji: "🌟", accent: "from-yellow/25 to-amber/10" },
  { id: "ai", label: "AI", shortLabel: "AI", emoji: "🤖", accent: "from-purple/30 to-indigo/10" },
] as const;
