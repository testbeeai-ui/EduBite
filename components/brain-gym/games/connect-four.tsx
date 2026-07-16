"use client";

import { useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine } from "./_shared";
import { cn } from "@/lib/utils";
import { range } from "@/lib/brain-gym/utils/shuffle";

const ROWS = 6;
const COLS = 7;

type Cell = 0 | 1 | 2;

function checkWin(board: Cell[][], p: Cell): boolean {
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (board[r]![c] !== p) continue;
      for (const [dr, dc] of dirs) {
        let n = 1;
        for (let k = 1; k < 4; k++) {
          const nr = r + dr! * k;
          const nc = c + dc! * k;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
          if (board[nr]![nc] === p) n++;
          else break;
        }
        if (n >= 4) return true;
      }
    }
  return false;
}

function drop(board: Cell[][], col: number, p: Cell): Cell[][] | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r]![col] === 0) {
      const next = board.map((row) => [...row] as Cell[]);
      next[r]![col] = p;
      return next;
    }
  }
  return null;
}

function aiMove(board: Cell[][], smart: boolean): number {
  const valid = range(COLS).filter((c) => board[0]![c] === 0);
  if (!valid.length) return 0;
  if (smart) {
    for (const c of valid) {
      const b = drop(board, c, 2);
      if (b && checkWin(b, 2)) return c;
    }
    for (const c of valid) {
      const b = drop(board, c, 1);
      if (b && checkWin(b, 1)) return c;
    }
  }
  return valid[Math.floor(Math.random() * valid.length)]!;
}

export function ConnectFourGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
}: GameComponentProps) {
  const [board, setBoard] = useState<Cell[][]>(() =>
    range(ROWS).map(() => range(COLS).map(() => 0 as Cell)),
  );
  const [lock, setLock] = useState(false);
  const [start] = useState(() => Date.now());
  const [moves, setMoves] = useState(0);

  const play = (col: number) => {
    if (lock) return;
    const afterYou = drop(board, col, 1);
    if (!afterYou) return;
    sfx.tap(soundEnabled);
    const m = moves + 1;
    setMoves(m);
    setBoard(afterYou);
    if (checkWin(afterYou, 1)) {
      const score = Math.max(
        100,
        Math.round((800 - m * 20) * difficultyMultiplier(difficulty)),
      );
      onScoreChange?.(score);
      sfx.win(soundEnabled);
      onComplete({ score, won: true, timeMs: Date.now() - start, difficulty });
      return;
    }
    if (afterYou.every((row) => row.every((c) => c !== 0))) {
      onComplete({ score: 50, won: false, timeMs: Date.now() - start, difficulty });
      return;
    }
    setLock(true);
    setTimeout(() => {
      const colAi = aiMove(afterYou, difficulty !== "easy");
      const afterAi = drop(afterYou, colAi, 2);
      if (!afterAi) {
        setLock(false);
        return;
      }
      setBoard(afterAi);
      if (checkWin(afterAi, 2)) {
        sfx.lose(soundEnabled);
        onComplete({
          score: Math.round(m * 8 * difficultyMultiplier(difficulty)),
          won: false,
          timeMs: Date.now() - start,
          difficulty,
        });
      }
      setLock(false);
    }, 350);
  };

  return (
    <GameBoard>
      <StatusLine>You are 🔴 · AI is 🟡 · Get 4 in a row</StatusLine>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 max-w-md mx-auto bg-blue-900/40 p-2 rounded-2xl">
        {range(ROWS).map((r) =>
          range(COLS).map((c) => {
            const v = board[r]![c];
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => play(c)}
                className="aspect-square rounded-full bg-[var(--bg)] border border-[var(--line)] flex items-center justify-center text-lg sm:text-xl touch-manipulation"
              >
                {v === 1 ? "🔴" : v === 2 ? "🟡" : ""}
              </button>
            );
          }),
        )}
      </div>
      <div className="grid grid-cols-7 gap-1 max-w-md mx-auto mt-2">
        {range(COLS).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => play(c)}
            className={cn(
              "py-1 rounded-lg text-[10px] font-mono border border-[var(--line)] text-[var(--text-dim)]",
            )}
          >
            ↓
          </button>
        ))}
      </div>
    </GameBoard>
  );
}
