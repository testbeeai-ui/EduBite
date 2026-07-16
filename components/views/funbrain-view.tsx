"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ViewHeader } from "@/components/ui/modal";
import { useTodayContent } from "@/lib/content/use-today-content";
import { useGame } from "@/lib/store/game-provider";
import { cn } from "@/lib/utils";

export function FunBrainView() {
  const { state, startFunbrain, answerFunbrain, resetFunbrain } = useGame();
  const content = useTodayContent();
  const pool = content.funbrain;
  const [selected, setSelected] = useState<number | null>(null);
  const fb = state.funbrain;

  if (content.loading) {
    return (
      <div>
        <ViewHeader
          eyebrow="Function 02"
          title="FunBrain"
          subtitle="60-second rapid-fire rounds with combos — the dopamine layer that makes revision feel like a game."
        />
        <Card className="text-center py-10 text-sm text-[var(--text-dim)]">
          Loading today&apos;s sprint…
        </Card>
      </div>
    );
  }

  if (!fb.running && !fb.finished) {
    return (
      <div>
        <ViewHeader
          eyebrow="Function 02"
          title="FunBrain"
          subtitle='60-second rapid-fire rounds with combos — the dopamine layer that makes revision feel like a game.'
        />
        <Card className="text-center py-[50px] px-5">
          <h2 className="font-display font-bold text-[22px]">60-second sprint</h2>
          <p className="text-[var(--text-dim)] text-sm mt-3 max-w-md mx-auto leading-relaxed">
            Answer as many as you can before the clock hits zero. Combos multiply your RDM.
          </p>
          {fb.highScore > 0 && (
            <p className="font-mono text-xs text-amber mt-4">
              Personal best: {fb.highScore} pts
            </p>
          )}
          <Button className="mt-8" onClick={startFunbrain} disabled={pool.length === 0}>
            Start sprint →
          </Button>
        </Card>
      </div>
    );
  }

  if (fb.finished) {
    return (
      <div>
        <ViewHeader
          eyebrow="Function 02"
          title="FunBrain"
          subtitle="Sprint complete — RDM added to your balance."
        />
        <Card className="text-center py-10">
          <div className="font-display font-extrabold text-3xl text-teal">
            Score: {fb.score}
          </div>
          <p className="text-[var(--text-dim)] text-sm mt-2">
            {fb.score >= 100 ? "High scorer territory!" : "Beat your score next round."}
            {" "}RDM is credited up to your best FunBrain score today.
          </p>
          <Button className="mt-6" onClick={() => { resetFunbrain(); setSelected(null); }}>
            Play again →
          </Button>
        </Card>
      </div>
    );
  }

  const q = pool[fb.currentQuestionIndex % Math.max(pool.length, 1)];
  if (!q) {
    return (
      <div>
        <ViewHeader eyebrow="Function 02" title="FunBrain" subtitle="Loading…" />
        <Card className="text-center py-10 text-sm text-[var(--text-dim)]">
          No FunBrain questions available.
        </Card>
      </div>
    );
  }

  return (
    <div>
      <ViewHeader
        eyebrow="Function 02"
        title="FunBrain"
        subtitle="60-second sprint in progress"
      />
      <Card>
        <div className="flex justify-between items-center">
          <div className="font-mono text-[13px] text-amber">
            Score: {fb.score} {fb.combo > 1 && `· ${fb.combo}x combo`}
          </div>
          <motion.div
            key={fb.timeLeft}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="font-mono font-bold text-[26px] text-pink"
          >
            {fb.timeLeft}s
          </motion.div>
        </div>

        <h2 className="font-display font-bold text-[22px] text-center my-8">{q.q}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.opts.map((opt, i) => (
            <button
              key={`${opt}-${i}`}
              type="button"
              onClick={() => {
                setSelected(i);
                answerFunbrain(i, q.correct, pool.length);
                setTimeout(() => setSelected(null), 200);
              }}
              className={cn(
                "bg-[var(--surface-2)] border border-[var(--line)] rounded-[14px] py-5 px-2.5 text-center text-sm transition-colors hover:border-blue",
                selected === i && "border-blue bg-blue/10",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
