"use client";

import { useEffect, useRef, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine } from "./_shared";
import { usePausableScheduler } from "./_pausable-scheduler";

export function NumberFlashGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const len = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;
  const [seq, setSeq] = useState<number[]>([]);
  const [display, setDisplay] = useState<string>("");
  const [phase, setPhase] = useState<"flash" | "input">("flash");
  const [answer, setAnswer] = useState("");
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [start] = useState(() => Date.now());
  const completedRef = useRef(false);
  const { schedule } = usePausableScheduler(paused);

  const flash = (s: number[]) => {
    setPhase("flash");
    setAnswer("");
    let i = 0;
    setDisplay(String(s[0]));
    const nextDigit = () => {
      schedule(() => {
        i++;
        if (i >= s.length) {
          setDisplay("?");
          setPhase("input");
          return;
        }
        setDisplay(String(s[i]));
        sfx.tick(soundEnabled);
        nextDigit();
      }, difficulty === "hard" ? 450 : 700);
    };
    nextDigit();
  };

  useEffect(() => {
    const s = Array.from({ length: len }, () => Math.floor(Math.random() * 10));
    setSeq(s);
    flash(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    if (paused || phase !== "input" || completedRef.current) return;
    const target = seq.join("");
    if (answer.replace(/\s/g, "") === target) {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(50 * difficultyMultiplier(difficulty) * round);
      setScore(ns);
      onScoreChange?.(ns);
      if (round >= 5) {
        completedRef.current = true;
        onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
        return;
      }
      const nextLen = len + (round >= 3 ? 1 : 0);
      const s = Array.from({ length: nextLen }, () => Math.floor(Math.random() * 10));
      setSeq(s);
      setRound((r) => r + 1);
      schedule(() => flash(s), 300);
    } else {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        completedRef.current = true;
        onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
      } else schedule(() => flash(seq), 300);
    }
  };

  return (
    <GameBoard>
      <StatusLine>
        Round {round}/5 · Remember the digits
      </StatusLine>
      <div className="text-center text-5xl sm:text-6xl font-mono font-bold tracking-[0.3em] py-10 text-teal">
        {display}
      </div>
      {phase === "input" && (
        <div className="space-y-3 max-w-sm mx-auto">
          <input
            inputMode="numeric"
            value={answer}
            onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Type the sequence"
            className="w-full text-center text-xl font-mono rounded-xl border border-[var(--line)] bg-[var(--surface-2)] py-3 outline-none focus:border-teal/50"
            autoFocus
          />
          <button
            type="button"
            onClick={submit}
            className="w-full py-3 rounded-full bg-gradient-to-r from-teal to-blue text-[#04141c] font-display font-bold"
          >
            Submit
          </button>
        </div>
      )}
    </GameBoard>
  );
}
