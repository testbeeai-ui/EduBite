export type PuzzleGrade = "XI" | "XII";

export interface PuzzleDef {
  id: string;
  number: number;
  grade: PuzzleGrade;
  title: string;
  prompt: string;
  hint: string;
  answer: string;
  topic: string;
}

export interface PuzzleAttempt {
  puzzleId: string;
  dateKey: string;
  note: string;
  submittedAt: string;
}

export interface PuzzleProgress {
  version: 1;
  attempts: Record<string, PuzzleAttempt>;
  streak: number;
  lastAttemptDate: string | null;
}

export function createDefaultPuzzleProgress(): PuzzleProgress {
  return {
    version: 1,
    attempts: {},
    streak: 0,
    lastAttemptDate: null,
  };
}
