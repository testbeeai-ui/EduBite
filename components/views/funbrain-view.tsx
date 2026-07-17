"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ViewHeader } from "@/components/ui/modal";
import { EDUBLAST_URL } from "@/data/config";
import {
  FUNBRAIN_QUESTIONS_PER_DAY,
} from "@/lib/content/schedule";
import { useTodayContent } from "@/lib/content/use-today-content";
import { useGame } from "@/lib/store/game-provider";
import { cn } from "@/lib/utils";

export function FunBrainView() {
  const { state, startFunbrain, answerFunbrain } = useGame();
  const content = useTodayContent();
  // Today's fixed set only (6 Q) — never the full 1080 bank in a loop.
  const pool = content.funbrain.slice(0, FUNBRAIN_QUESTIONS_PER_DAY);
  const [selected, setSelected] = useState<number | null>(null);
  const fb = state.funbrain;
  const doneForToday = fb.completed || fb.finished;

  if (content.loading) {
    return (
      <div>
        <ViewHeader
          eyebrow="Function 02"
          title="FunBrain"
          subtitle="60-second daily sprint — six questions, one pass."
        />
        <Card className="text-center py-10 text-sm text-[var(--text-dim)]">
          Loading today&apos;s sprint…
        </Card>
      </div>
    );
  }

  if (doneForToday && !fb.running) {
    return (
      <div>
        <ViewHeader
          eyebrow="Function 02"
          title="FunBrain"
          subtitle="Sprint complete — RDM added to your balance."
        />
        <Card className="text-center py-10 px-5">
          <div className="font-display font-extrabold text-3xl text-teal">
            Score: {fb.score}
          </div>
          <p className="text-[var(--text-dim)] text-sm mt-2">
            One FunBrain sprint per day. Come back tomorrow for the next set.
          </p>
          <p className="text-[var(--text-dim)] mt-5 text-sm leading-relaxed max-w-md mx-auto">
            For more practice, go to{" "}
            <a
              href={EDUBLAST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal font-semibold hover:underline"
            >
              edublast.in
            </a>
            .
          </p>
          <Button
            className="mt-4"
            onClick={() =>
              window.open(EDUBLAST_URL, "_blank", "noopener,noreferrer")
            }
          >
            Continue on edublast.in →
          </Button>
        </Card>
      </div>
    );
  }

  if (!fb.running && !doneForToday) {
    return (
      <div>
        <ViewHeader
          eyebrow="Function 02"
          title="FunBrain"
          subtitle="60-second rapid-fire rounds with combos — the dopamine layer that makes revision feel like a game."
        />
        <Card className="text-center py-[50px] px-5">
          <h2 className="font-display font-bold text-[22px]">60-second sprint</h2>
          {fb.highScore > 0 && (
            <p className="font-mono text-xs text-amber mt-4">
              Personal best: {fb.highScore} pts
            </p>
          )}
          <Button
            className="mt-8"
            onClick={startFunbrain}
            disabled={pool.length < FUNBRAIN_QUESTIONS_PER_DAY}
          >
            Start sprint →
          </Button>
        </Card>
      </div>
    );
  }

  const qIndex = fb.currentQuestionIndex;
  const q = pool[qIndex];
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
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <div className="font-mono text-[13px] text-amber">
            Score: {fb.score} {fb.combo > 1 && `· ${fb.combo}x combo`}
          </div>
          <div className="font-mono text-[11px] text-[var(--text-dim)]">
            {qIndex + 1}/{FUNBRAIN_QUESTIONS_PER_DAY}
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
              key={`${qIndex}-${opt}-${i}`}
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
