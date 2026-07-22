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
  const { state, startFunbrain, answerFunbrain, resetFunbrain } = useGame();
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
    const answeredCorrect = pool.filter(
      (item, idx) => fb.answers[idx] === item.correct,
    ).length;

    return (
      <div className="space-y-5 pb-8">
        <ViewHeader
          eyebrow="Function 02"
          title="FunBrain"
          subtitle="Sprint complete — RDM added to your balance."
        />
        <Card className="text-center py-10 px-5">
          <div className="font-display font-extrabold text-3xl text-teal">
            Score: {fb.score}
          </div>
          {pool.length > 0 && (
            <p className="text-[var(--text-dim)] text-sm mt-1.5">
              {answeredCorrect} of {pool.length} correct
            </p>
          )}
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
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setSelected(null);
                resetFunbrain();
                startFunbrain();
              }}
            >
              Replay sprint
            </Button>
            <Button
              onClick={() =>
                window.open(EDUBLAST_URL, "_blank", "noopener,noreferrer")
              }
            >
              Continue on edublast.in →
            </Button>
          </div>
        </Card>

        {pool.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-display font-bold text-base text-[var(--text)] px-1">
              Review answers
            </h3>
            {pool.map((item, idx) => {
              const selectedIdx = fb.answers[idx];
              const hasAnswer =
                selectedIdx !== undefined && selectedIdx !== null;
              const isCorrect = hasAnswer && selectedIdx === item.correct;

              return (
                <Card
                  key={`funbrain-review-${idx}`}
                  className="border border-[var(--line)] p-4 space-y-3"
                >
                  <div className="flex justify-between items-center gap-2 text-xs font-mono">
                    <span className="text-[var(--text-dim)] text-[10px]">
                      Question {idx + 1}
                      {item.tag ? ` · ${item.tag}` : ""}
                    </span>
                    {!hasAnswer ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider bg-[var(--surface-2)] text-[var(--text-dim)] border border-[var(--line)]">
                        Unanswered
                      </span>
                    ) : isCorrect ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider bg-teal/10 text-teal border border-teal/20">
                        Correct
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider bg-pink/10 text-pink border border-pink/20">
                        Incorrect
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-[var(--text)] leading-snug">
                    {item.q}
                  </h4>

                  <div className="space-y-2 text-xs">
                    {item.opts.map((opt, oIdx) => {
                      const isUserSelection = selectedIdx === oIdx;
                      const isCorrectOption = oIdx === item.correct;

                      return (
                        <div
                          key={`${idx}-${oIdx}`}
                          className={cn(
                            "flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border",
                            isCorrectOption
                              ? "border-teal/30 bg-teal/5 text-teal"
                              : isUserSelection && !isCorrect
                                ? "border-pink/30 bg-pink/5 text-pink"
                                : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-dim)]",
                          )}
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="font-mono text-[10px] opacity-65 shrink-0">
                              {oIdx + 1}.
                            </span>
                            <span className="leading-snug">{opt}</span>
                          </div>
                          {isCorrectOption ? (
                            <span className="shrink-0 text-[10px] font-bold text-teal font-mono">
                              Correct
                            </span>
                          ) : null}
                          {isUserSelection && !isCorrect ? (
                            <span className="shrink-0 text-[10px] font-bold text-pink font-mono">
                              Your pick
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
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
