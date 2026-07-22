export type AppView =
  | "home"
  | "dailydose"
  | "funbrain"
  | "gyan"
  | "puzzles"
  | "wasquad"
  | "habits"
  | "achievements"
  | "inspiration"
  | "ai"
  | "challenge";

export type PledgeType = "am" | "pm";

export interface Question {
  tag: string;
  q: string;
  opts: string[];
  correct: number;
}

export interface HabitDef {
  id: string;
  icon: string;
  bg: string;
  name: string;
  sub: string;
  desc: string;
  benefits: string[];
  rdm: number;
}

export interface HabitState extends HabitDef {
  done: boolean;
}

export interface GyanCard {
  id: string;
  title: string;
  sub: string;
  unlocked: boolean;
  body: string;
}

export interface Notification {
  id: string;
  icon: string;
  text: string;
}

/** A calendar day counts toward streak only when all five are true. */
export interface DayCriteria {
  dose: boolean;
  funbrain: boolean;
  puzzles: boolean;
  habits: boolean;
  pledges: boolean;
}

export type JourneyDayStatus = "join" | "past" | "today" | "upcoming";

export interface JourneyDay {
  dateKey: string;
  dayNumber: number;
  status: JourneyDayStatus;
  criteria: DayCriteria;
}

export interface DoseState {
  index: number;
  locked: boolean;
  correct: number;
  completed: boolean;
  index11: number;
  locked11: boolean;
  correct11: number;
  completed11: boolean;
  index12: number;
  locked12: boolean;
  correct12: number;
  completed12: boolean;
  currentClass: "11" | "12";
  answers11: number[];
  answers12: number[];
}

export interface FunBrainState {
  running: boolean;
  timeLeft: number;
  score: number;
  combo: number;
  highScore: number;
  currentQuestionIndex: number;
  /** Selected option index per question; null = unanswered / timed out. */
  answers: (number | null)[];
  /** Session just ended (same as completed for UI). */
  finished: boolean;
  /** Marks today's sprint as completed; replay keeps RDM credit protected separately. */
  completed: boolean;
}

export interface GameState {
  rdm: number;
  streak: number;
  signedIn: boolean;
  pledgeAM: boolean;
  pledgePM: boolean;
  gyanTimeMs: number;
  gyanOpenId: string | null;
  habits: HabitState[];
  dose: DoseState;
  funbrain: FunBrainState;
  gyanUnlockedIds: string[];
  notifications: Notification[];
  history: DayCriteria[];
  joinedDate: string;
  lastActiveDate: string;
  /** RDM already credited from DailyDose today (prevents replay farming). */
  doseRdmCredited: number;
  /** RDM already credited from FunBrain today (prevents replay farming). */
  funbrainRdmCredited: number;
  /** Today's puzzle attempt submitted (synced from puzzle progress). */
  puzzleCompleted: boolean;
  /**
   * Per-day Daily Dose scores for Monthly Challenge (80%+ streak).
   * Keyed by YYYY-MM-DD. Kept across day rolls.
   */
  doseDayLog: Record<string, DoseDayRecord>;
  /** Month key (YYYY-MM) the user enrolled in during days 1–5. */
  challengeEnrolledMonthKey: string | null;
  /** Month key if they already submitted this month's final puzzle. */
  challengePuzzleSubmittedMonthKey: string | null;
}

export interface DoseDayRecord {
  correct: number;
  total: number;
  /** 0–100 */
  pct: number;
  completed: boolean;
  classLevel: "11" | "12";
}

export interface AchievementDef {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export interface AchievementProgress {
  unlocked: boolean;
  current: number;
  target: number;
}

export interface ModalState {
  pledge: PledgeType | null;
  reel: PledgeType | null;
}
