/** Canonical RDM reward keys + static defaults (fallback if DB unavailable). */

export type RdmRewardUnit = "rdm" | "points" | "divisor";

export type RdmRewardKey =
  | "dose.per_correct"
  | "habit.sleep"
  | "habit.water"
  | "habit.eyes"
  | "habit.move"
  | "habit.pomodoro"
  | "habit.noscreen"
  | "habit.meals"
  | "habit.noai"
  | "funbrain.base_points"
  | "funbrain.combo_bonus"
  | "brain_gym.min_base"
  | "brain_gym.score_divisor"
  | "brain_gym.win_bonus"
  | "brain_gym.daily_win_bonus"
  | "brain_gym.session_cap"
  | "challenge.target_rdm"
  | "challenge.entry_stake";

export type RdmRewardCategory =
  | "DailyDose"
  | "Habits"
  | "FunBrain"
  | "Brain Gym"
  | "Challenge";

export interface RdmRewardDef {
  key: RdmRewardKey;
  category: RdmRewardCategory;
  label: string;
  description: string;
  amount: number;
  unit: RdmRewardUnit;
  sortOrder: number;
}

export const RDM_REWARD_DEFAULTS: readonly RdmRewardDef[] = [
  {
    key: "dose.per_correct",
    category: "DailyDose",
    label: "Per correct answer",
    description:
      "RDM credited for each correct DailyDose question (replay does not re-farm).",
    amount: 45,
    unit: "rdm",
    sortOrder: 10,
  },
  {
    key: "habit.sleep",
    category: "Habits",
    label: "7–8 hrs sleep",
    description: "RDM when this habit is checked for the day.",
    amount: 15,
    unit: "rdm",
    sortOrder: 20,
  },
  {
    key: "habit.water",
    category: "Habits",
    label: "Hydration · 8 glasses",
    description: "RDM when this habit is checked for the day.",
    amount: 10,
    unit: "rdm",
    sortOrder: 21,
  },
  {
    key: "habit.eyes",
    category: "Habits",
    label: "20‑20‑20 eye breaks",
    description: "RDM when this habit is checked for the day.",
    amount: 8,
    unit: "rdm",
    sortOrder: 22,
  },
  {
    key: "habit.move",
    category: "Habits",
    label: "10‑min movement break",
    description: "RDM when this habit is checked for the day.",
    amount: 10,
    unit: "rdm",
    sortOrder: 23,
  },
  {
    key: "habit.pomodoro",
    category: "Habits",
    label: "Pomodoro technique",
    description: "RDM when this habit is checked for the day.",
    amount: 12,
    unit: "rdm",
    sortOrder: 24,
  },
  {
    key: "habit.noscreen",
    category: "Habits",
    label: "No‑screen wind‑down",
    description: "RDM when this habit is checked for the day.",
    amount: 10,
    unit: "rdm",
    sortOrder: 25,
  },
  {
    key: "habit.meals",
    category: "Habits",
    label: "No skipped meals",
    description: "RDM when this habit is checked for the day.",
    amount: 12,
    unit: "rdm",
    sortOrder: 26,
  },
  {
    key: "habit.noai",
    category: "Habits",
    label: "Use AI responsibly",
    description: "RDM when this habit is checked for the day.",
    amount: 15,
    unit: "rdm",
    sortOrder: 27,
  },
  {
    key: "funbrain.base_points",
    category: "FunBrain",
    label: "Base points per correct",
    description:
      "Score points (1:1 RDM) for a correct answer with 0 combo.",
    amount: 10,
    unit: "points",
    sortOrder: 30,
  },
  {
    key: "funbrain.combo_bonus",
    category: "FunBrain",
    label: "Combo bonus per streak",
    description:
      "Extra score points per combo step (becomes RDM 1:1).",
    amount: 5,
    unit: "points",
    sortOrder: 31,
  },
  {
    key: "brain_gym.min_base",
    category: "Brain Gym",
    label: "Minimum session RDM",
    description: "Floor used in max(min_base, floor(score / divisor)).",
    amount: 5,
    unit: "rdm",
    sortOrder: 40,
  },
  {
    key: "brain_gym.score_divisor",
    category: "Brain Gym",
    label: "Score ÷ divisor",
    description: "Divisor in floor(score / divisor) for session RDM.",
    amount: 20,
    unit: "divisor",
    sortOrder: 41,
  },
  {
    key: "brain_gym.win_bonus",
    category: "Brain Gym",
    label: "Win bonus",
    description: "Extra RDM when the session is won.",
    amount: 15,
    unit: "rdm",
    sortOrder: 42,
  },
  {
    key: "brain_gym.daily_win_bonus",
    category: "Brain Gym",
    label: "Daily challenge win bonus",
    description: "Extra RDM when the daily challenge is won.",
    amount: 25,
    unit: "rdm",
    sortOrder: 43,
  },
  {
    key: "brain_gym.session_cap",
    category: "Brain Gym",
    label: "Session RDM cap",
    description: "Maximum RDM awarded for a single Brain Gym session.",
    amount: 120,
    unit: "rdm",
    sortOrder: 44,
  },
  {
    key: "challenge.target_rdm",
    category: "Challenge",
    label: "Monthly Challenge unlock",
    description: "RDM balance required to unlock Monthly Challenge entry.",
    amount: 5000,
    unit: "rdm",
    sortOrder: 50,
  },
  {
    key: "challenge.entry_stake",
    category: "Challenge",
    label: "Monthly Challenge entry stake",
    description:
      "RDM deducted from the learner’s balance when they enroll in the Monthly Challenge.",
    amount: 3000,
    unit: "rdm",
    sortOrder: 51,
  },
] as const;

export const HABIT_RDM_KEYS = [
  "habit.sleep",
  "habit.water",
  "habit.eyes",
  "habit.move",
  "habit.pomodoro",
  "habit.noscreen",
  "habit.meals",
  "habit.noai",
] as const satisfies readonly RdmRewardKey[];

export type HabitRdmKey = (typeof HABIT_RDM_KEYS)[number];

/** Map habit id → reward key. */
export const HABIT_ID_TO_RDM_KEY: Record<string, HabitRdmKey> = {
  sleep: "habit.sleep",
  water: "habit.water",
  eyes: "habit.eyes",
  move: "habit.move",
  pomodoro: "habit.pomodoro",
  noscreen: "habit.noscreen",
  meals: "habit.meals",
  noai: "habit.noai",
};

export function defaultRdmAmount(key: RdmRewardKey): number {
  const row = RDM_REWARD_DEFAULTS.find((d) => d.key === key);
  return row?.amount ?? 0;
}

export function defaultsAsMap(): Record<RdmRewardKey, number> {
  const out = {} as Record<RdmRewardKey, number>;
  for (const row of RDM_REWARD_DEFAULTS) {
    out[row.key] = row.amount;
  }
  return out;
}
