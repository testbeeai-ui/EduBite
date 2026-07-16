"use client";

import { useEffect, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine, CellButton } from "./_shared";
import { shuffle } from "@/lib/brain-gym/utils/shuffle";

function makeQ(diff: string) {
  const max = diff === "easy" ? 12 : diff === "medium" ? 20 : 40;
  const a = 1 + Math.floor(Math.random() * max);
  const b = 1 + Math.floor(Math.random() * max);
  const ops = diff === "hard" ? ["+", "-", "*"] : ["+", "-"];
  const op = ops[Math.floor(Math.random() * ops.length)]!;
  const ans = op === "+" ? a + b : op === "-" ? a - b : a * b;
  if (op === "-" && ans < 0) return makeQ(diff);
  return { text: `${a} ${op === "*" ? "×" : op} ${b}`, ans };
}

export function MathBlitzGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const duration = difficulty === "hard" ? 35 : 45;
  const [left, setLeft] = useState(duration);
  const [q, setQ] = useState(() => makeQ(difficulty));
  const [opts, setOpts] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [start] = useState(() => Date.now());

  const roll = (question = makeQ(difficulty)) => {
    setQ(question);
    const wrong = new Set<number>();
    while (wrong.size < 3) {
      const w = question.ans + Math.floor(Math.random() * 11) - 5;
      if (w !== question.ans) wrong.add(w);
    }
    setOpts(shuffle([question.ans, ...wrong]));
  };

  useEffect(() => {
    roll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (paused) return;
    if (left <= 0) {
      onComplete({
        score,
        won: score >= 100,
        timeMs: Date.now() - start,
        difficulty,
      });
      return;
    }
    const id = window.setTimeout(() => setLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [left, paused, score, start, difficulty, onComplete]);

  const pick = (n: number) => {
    if (paused || left <= 0) return;
    if (n === q.ans) {
      sfx.correct(soundEnabled);
      const c = combo + 1;
      setCombo(c);
      const ns = score + Math.round((10 + c * 2) * difficultyMultiplier(difficulty));
      setScore(ns);
      onScoreChange?.(ns);
      roll();
    } else {
      sfx.wrong(soundEnabled);
      setCombo(0);
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
      <StatusLine>
        ⏱ {left}s · Combo ×{combo} · Score {score}
      </StatusLine>
      <div className="text-center text-4xl sm:text-5xl font-mono font-bold py-8 text-teal">
        {q.text}
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        {opts.map((n, i) => (
          <CellButton key={`${q.text}-${n}-${i}`} onClick={() => pick(n)} className="py-4 text-xl font-mono">
            {n}
          </CellButton>
        ))}
      </div>
    </GameBoard>
  );
}
