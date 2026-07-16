"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine, CellButton } from "./_shared";
import { cn } from "@/lib/utils";

export function SequenceMemoryGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const grid = difficulty === "hard" ? 9 : 9;
  const [seq, setSeq] = useState<number[]>([]);
  const [input, setInput] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [mode, setMode] = useState<"watch" | "input">("watch");
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [start] = useState(() => Date.now());

  const playSeq = useCallback(
    async (s: number[]) => {
      setMode("watch");
      setInput([]);
      for (const n of s) {
        if (paused) await new Promise((r) => setTimeout(r, 200));
        setLit(n);
        sfx.tap(soundEnabled);
        await new Promise((r) => setTimeout(r, difficulty === "hard" ? 380 : 520));
        setLit(null);
        await new Promise((r) => setTimeout(r, 140));
      }
      setMode("input");
    },
    [soundEnabled, difficulty, paused],
  );

  useEffect(() => {
    const first = [Math.floor(Math.random() * grid)];
    setSeq(first);
    void playSeq(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fail = (nextLives: number) => {
    sfx.wrong(soundEnabled);
    setLives(nextLives);
    onLivesChange?.(nextLives);
    if (nextLives <= 0) {
      onComplete({
        score,
        won: score >= 3,
        timeMs: Date.now() - start,
        difficulty,
      });
    } else {
      void playSeq(seq);
    }
  };

  const tap = (i: number) => {
    if (paused || mode !== "input") return;
    sfx.tap(soundEnabled);
    const next = [...input, i];
    setInput(next);
    const idx = next.length - 1;
    if (seq[idx] !== i) {
      fail(lives - 1);
      return;
    }
    if (next.length === seq.length) {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(10 * seq.length * difficultyMultiplier(difficulty));
      setScore(ns);
      onScoreChange?.(ns);
      if (seq.length >= (difficulty === "easy" ? 8 : difficulty === "medium" ? 10 : 12)) {
        onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
        return;
      }
      const extended = [...seq, Math.floor(Math.random() * grid)];
      setSeq(extended);
      setTimeout(() => void playSeq(extended), 450);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[rgba(11,13,18,0.4)] p-4 sm:p-6 max-w-sm mx-auto">
      <div className="text-center font-display font-semibold text-sm text-[var(--text-dim)] mb-5">
        {mode === "watch" ? "Watch sequence..." : "Your turn"} · Level {seq.length} · Score {score}
      </div>
      <div className="grid grid-cols-3 gap-3.5">
        {Array.from({ length: grid }, (_, i) => {
          const isActive = lit === i;
          return (
            <button
              key={i}
              type="button"
              disabled={paused || mode !== "input"}
              onClick={() => tap(i)}
              className={cn(
                "aspect-square rounded-2xl border font-display text-[26px] font-bold transition-all duration-150 touch-manipulation select-none outline-none",
                isActive
                  ? "border-[#2DD4BF] bg-[rgba(45,212,191,0.18)] text-white shadow-[0_0_20px_rgba(45,212,191,0.3)] scale-[1.03]"
                  : "border-[var(--line)] bg-[var(--surface-2)] text-white hover:border-teal/40 hover:bg-teal/[0.04] cursor-pointer"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
