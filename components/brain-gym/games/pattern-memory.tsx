"use client";

import { useEffect, useRef, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { shuffle, range } from "@/lib/brain-gym/utils/shuffle";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine, CellButton } from "./_shared";
import { cn } from "@/lib/utils";
import { usePausableScheduler } from "./_pausable-scheduler";

export function PatternMemoryGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const size = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
  const cells = size * size;
  const count = difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 7;
  const [pattern, setPattern] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [show, setShow] = useState(true);
  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [start] = useState(() => Date.now());
  const completedRef = useRef(false);
  const { schedule } = usePausableScheduler(paused);

  const gen = () => {
    const p = new Set(shuffle(range(cells)).slice(0, count + round - 1));
    setPattern(p);
    setSelected(new Set());
    setShow(true);
    schedule(() => setShow(false), difficulty === "hard" ? 900 : 1400);
  };

  useEffect(() => {
    gen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (i: number) => {
    if (paused || show || completedRef.current) return;
    sfx.tap(soundEnabled);
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };

  const submit = () => {
    if (paused || show) return;
    const ok =
      selected.size === pattern.size &&
      [...selected].every((i) => pattern.has(i));
    if (ok) {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(40 * difficultyMultiplier(difficulty) * round);
      setScore(ns);
      onScoreChange?.(ns);
      if (round >= 5) {
        completedRef.current = true;
        onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
      } else {
        setRound((r) => r + 1);
        schedule(gen, 400);
      }
    } else {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        completedRef.current = true;
        onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
      } else schedule(gen, 400);
    }
  };

  return (
    <GameBoard>
      <StatusLine>
        {show ? "Memorize the pattern!" : "Recreate it"} · Round {round}/5
      </StatusLine>
      <div
        className="grid gap-2 max-w-sm mx-auto"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {range(cells).map((i) => {
          const on = show ? pattern.has(i) : selected.has(i);
          return (
            <CellButton
              key={i}
              onClick={() => toggle(i)}
              className={cn(
                "aspect-square",
                on && "bg-purple border-purple/50 shadow-[0_0_16px_rgba(167,139,250,0.35)]",
              )}
            />
          );
        })}
      </div>
      {!show && (
        <button
          type="button"
          onClick={submit}
          className="mt-4 w-full py-3 rounded-full bg-gradient-to-r from-teal to-blue text-[#04141c] font-display font-bold"
        >
          Check pattern
        </button>
      )}
    </GameBoard>
  );
}
