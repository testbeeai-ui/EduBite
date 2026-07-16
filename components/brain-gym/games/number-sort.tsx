"use client";

import { useEffect, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine, CellButton } from "./_shared";
import { shuffle, range } from "@/lib/brain-gym/utils/shuffle";
import { cn } from "@/lib/utils";

export function NumberSortGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const count = difficulty === "easy" ? 9 : difficulty === "medium" ? 12 : 16;
  const [nums] = useState(() => shuffle(range(count, 1)));
  const [next, setNext] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [start] = useState(() => Date.now());
  const [left, setLeft] = useState(difficulty === "hard" ? 25 : 35);

  useEffect(() => {
    if (paused) return;
    if (left <= 0) {
      onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
      return;
    }
    const id = window.setTimeout(() => setLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [left, paused, score, start, difficulty, onComplete]);

  const tap = (n: number) => {
    if (paused || left <= 0) return;
    if (n === next) {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(12 * difficultyMultiplier(difficulty));
      setScore(ns);
      onScoreChange?.(ns);
      if (next >= count) {
        const timeMs = Date.now() - start;
        const bonus = left * 5;
        const final = ns + bonus;
        onScoreChange?.(final);
        onComplete({ score: final, won: true, timeMs, difficulty });
      } else setNext((x) => x + 1);
    } else {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
      }
    }
  };

  return (
    <GameBoard>
      <StatusLine>
        ⏱ {left}s · Tap {next} next
      </StatusLine>
      <div
        className={cn(
          "grid gap-2 max-w-md mx-auto",
          count <= 9 ? "grid-cols-3" : "grid-cols-4",
        )}
      >
        {nums.map((n) => (
          <CellButton
            key={n}
            onClick={() => tap(n)}
            disabled={n < next}
            className={cn(
              "aspect-square text-lg font-mono",
              n < next && "opacity-30",
              n === next && "border-amber/50",
            )}
          >
            {n}
          </CellButton>
        ))}
      </div>
    </GameBoard>
  );
}
