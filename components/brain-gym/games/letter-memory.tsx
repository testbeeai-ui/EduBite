"use client";

import { useEffect, useRef, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { shuffle } from "@/lib/brain-gym/utils/shuffle";
import { GameBoard, StatusLine } from "./_shared";
import { usePausableScheduler } from "./_pausable-scheduler";

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

export function LetterMemoryGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const len = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;
  const [seq, setSeq] = useState<string[]>([]);
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState<"flash" | "input">("flash");
  const [flashPosition, setFlashPosition] = useState(0);
  const [answer, setAnswer] = useState("");
  const [replaysLeft, setReplaysLeft] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [start] = useState(() => Date.now());
  const completedRef = useRef(false);
  const { schedule } = usePausableScheduler(paused);

  const make = (n: number) => shuffle([...LETTERS]).slice(0, n);

  const flash = (s: string[]) => {
    setPhase("flash");
    setAnswer("");
    let i = 0;
    const showNextLetter = () => {
      setFlashPosition(i);
      setDisplay(s[i]!);
      sfx.tick(soundEnabled);
      schedule(() => {
        setDisplay("");
        schedule(() => {
          i++;
          if (i >= s.length) {
            setDisplay("?");
            setPhase("input");
            return;
          }
          showNextLetter();
        }, 300);
      }, difficulty === "easy" ? 1_000 : difficulty === "medium" ? 850 : 650);
    };
    showNextLetter();
  };

  useEffect(() => {
    const s = make(len);
    setSeq(s);
    flash(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    if (paused || phase !== "input" || completedRef.current) return;
    if (answer.toUpperCase().replace(/\s/g, "") === seq.join("")) {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(50 * difficultyMultiplier(difficulty) * round);
      setScore(ns);
      onScoreChange?.(ns);
      if (round >= 5) {
        completedRef.current = true;
        onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
        return;
      }
      const s = make(len + (round >= 3 ? 1 : 0));
      setSeq(s);
      setReplaysLeft(1);
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
        Round {round}/5 ·{" "}
        {phase === "flash"
          ? `Letter ${flashPosition + 1} of ${seq.length}`
          : `Enter all ${seq.length} letters`}
      </StatusLine>
      <div className="text-center text-5xl sm:text-6xl font-mono font-bold tracking-[0.35em] py-10 text-blue">
        {display || (phase === "flash" ? "•" : "?")}
      </div>
      {phase === "input" && (
        <div className="space-y-3 max-w-sm mx-auto">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Type the letters"
            className="w-full text-center text-xl font-mono rounded-xl border border-[var(--line)] bg-[var(--surface-2)] py-3 outline-none focus:border-blue/50"
            autoFocus
          />
          <button
            type="button"
            onClick={submit}
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue to-purple text-white font-display font-bold"
          >
            Submit
          </button>
          <button
            type="button"
            disabled={replaysLeft <= 0}
            onClick={() => {
              if (replaysLeft <= 0) return;
              setReplaysLeft(0);
              flash(seq);
            }}
            className="w-full py-2.5 rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-sm font-display font-semibold disabled:opacity-40"
          >
            {replaysLeft > 0 ? "Replay letters once" : "Replay used"}
          </button>
        </div>
      )}
    </GameBoard>
  );
}
