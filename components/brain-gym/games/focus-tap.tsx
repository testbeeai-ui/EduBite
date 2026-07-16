"use client";

import { useEffect, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine, gameTargetClass } from "./_shared";
import { cn } from "@/lib/utils";

type Target = { id: number; x: number; y: number; decoy: boolean };

export function FocusTapGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const duration = 40;
  const [left, setLeft] = useState(duration);
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [start] = useState(() => Date.now());
  const spawnMs = difficulty === "hard" ? 550 : difficulty === "medium" ? 700 : 850;

  useEffect(() => {
    if (paused || left <= 0) return;
    const id = window.setInterval(() => {
      setTargets((t) => {
        const decoyChance = difficulty === "easy" ? 0.2 : 0.35;
        const next: Target = {
          id: Date.now() + Math.random(),
          x: 8 + Math.random() * 76,
          y: 8 + Math.random() * 76,
          decoy: Math.random() < decoyChance,
        };
        return [...t.slice(-6), next];
      });
    }, spawnMs);
    return () => clearInterval(id);
  }, [paused, left, spawnMs, difficulty]);

  useEffect(() => {
    if (paused) return;
    if (left <= 0) {
      onComplete({ score, won: score >= 80, timeMs: Date.now() - start, difficulty });
      return;
    }
    const id = window.setTimeout(() => setLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [left, paused, score, start, difficulty, onComplete]);

  // auto-remove old targets
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setTargets((t) => t.filter((x) => Date.now() - x.id < 1800));
    }, 200);
    return () => clearInterval(id);
  }, [paused]);

  const hit = (t: Target) => {
    if (paused) return;
    setTargets((all) => all.filter((x) => x.id !== t.id));
    if (t.decoy) {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
      }
    } else {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(12 * difficultyMultiplier(difficulty));
      setScore(ns);
      onScoreChange?.(ns);
    }
  };

  return (
    <GameBoard>
      <StatusLine>
        ⏱ {left}s · Tap teal · Avoid red · Score {score}
      </StatusLine>
      <div className="relative w-full h-[280px] sm:h-[340px] rounded-xl border border-[var(--line)] bg-[var(--bg)] overflow-hidden touch-manipulation">
        {targets.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => hit(t)}
            className={cn(
              "absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg active:scale-90 transition-transform",
              t.decoy
                ? "bg-red-500/90"
                : "bg-teal shadow-[0_0_20px_rgba(45,212,191,0.45)]",
            )}
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
          />
        ))}
      </div>
    </GameBoard>
  );
}
