"use client";

import { useEffect, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine, CellButton } from "./_shared";
import { pickRandom, shuffle } from "@/lib/brain-gym/utils/shuffle";

type ColorOpt = { name: string; css: string };

const COLORS: ColorOpt[] = [
  { name: "RED", css: "#ef4444" },
  { name: "BLUE", css: "#3b82f6" },
  { name: "GREEN", css: "#22c55e" },
  { name: "YELLOW", css: "#eab308" },
  { name: "PURPLE", css: "#a855f7" },
  { name: "ORANGE", css: "#f97316" },
  { name: "PINK", css: "#ec4899" },
  { name: "CYAN", css: "#06b6d4" },
  { name: "TEAL", css: "#14b8a6" },
  { name: "INDIGO", css: "#6366f1" },
  { name: "ROSE", css: "#f43f5e" },
  { name: "LIME", css: "#84cc16" },
];

export function StroopGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const duration = 40;
  const [left, setLeft] = useState(duration);
  const [word, setWord] = useState<ColorOpt>(COLORS[0]!);
  const [ink, setInk] = useState<ColorOpt>(COLORS[1]!);
  const [choices, setChoices] = useState<ColorOpt[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [start] = useState(() => Date.now());

  const roll = () => {
    const w = pickRandom(COLORS);
    let i = pickRandom(COLORS);
    if (difficulty !== "easy") {
      while (i.name === w.name) i = pickRandom(COLORS);
    }
    setWord(w);
    setInk(i);
    setChoices(shuffle([i, ...COLORS.filter((c) => c.name !== i.name)].slice(0, 4)));
  };

  useEffect(() => {
    roll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (paused) return;
    if (left <= 0) {
      onComplete({ score, won: score >= 80, timeMs: Date.now() - start, difficulty });
      return;
    }
    const id = window.setTimeout(() => setLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [left, paused, score, start, difficulty, onComplete]);

  const pick = (c: ColorOpt) => {
    if (paused || left <= 0) return;
    if (c.name === ink.name) {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(15 * difficultyMultiplier(difficulty));
      setScore(ns);
      onScoreChange?.(ns);
      roll();
    } else {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
      } else roll();
    }
  };

  return (
    <GameBoard>
      <StatusLine>⏱ {left}s · Tap the INK color, not the word</StatusLine>
      <div
        className="text-center text-4xl sm:text-5xl font-display font-extrabold py-10"
        style={{ color: ink.css }}
      >
        {word.name}
      </div>
      <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
        {choices.map((c) => (
          <CellButton key={c.name} onClick={() => pick(c)} className="py-3" style={{ color: c.css }}>
            {c.name}
          </CellButton>
        ))}
      </div>
    </GameBoard>
  );
}
