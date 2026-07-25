"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EDUBLAST_URL, DOSE_DURATION_SEC } from "@/data/config";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ViewHeader } from "@/components/ui/modal";
import { useTodayContent } from "@/lib/content/use-today-content";
import { useRdmRewards } from "@/lib/rdm/rdm-rewards-provider";
import { useGame } from "@/lib/store/game-provider";
import { cn, formatTime } from "@/lib/utils";

export function DailyDoseView() {
  const { state, answerDose, nextDose, resetDose, startDose, selectDoseClass } =
    useGame();
  const content = useTodayContent();
  const { getAmount } = useRdmRewards();
  const rdmPerCorrect = getAmount("dose.per_correct");
  const [selected, setSelected] = useState<number | null>(null);

  const dose = state.dose;
  const currentClass = dose.currentClass || "11";
  const questions =
    currentClass === "12" ? content.dailydose12 : content.dailydose11;
  const doseMinutes = Math.round(DOSE_DURATION_SEC / 60);

  // Wait for Supabase (or fallback) — never flash static day-1 banks while loading.
  if (content.loading) {
    return (
      <div>
        <ViewHeader
          eyebrow="Function 01"
          title={
            <div className="flex items-center">
              <span>DailyDose</span>
            </div>
          }
          subtitle={`${doseMinutes}-minute timer · five bite-sized questions, one concept at a time.`}
        />
        <Card className="text-center py-10 text-sm text-[var(--text-dim)]">
          Loading today&apos;s questions…
        </Card>
      </div>
    );
  }

  const toggleSelector = (
    <div className="inline-flex p-1 bg-slate-900/90 border border-white/[0.12] rounded-full text-xs font-mono select-none pointer-events-auto ml-5 shrink-0 align-middle shadow-lg">
      <button
        type="button"
        disabled={dose.running}
        onClick={() => {
          if (dose.running) return;
          selectDoseClass("11");
          setSelected(null);
        }}
        className={cn(
          "relative px-5 py-2 rounded-full font-display font-black tracking-wide transition-colors text-xs",
          dose.running ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          currentClass === "11" ? "text-white font-black" : "text-slate-300 hover:text-white"
        )}
      >
        {currentClass === "11" && (
          <motion.div
            layoutId="activeClassDose"
            className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full -z-10 shadow-[0_2px_10px_rgba(45,212,191,0.3)]"
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        )}
        Class 11th
      </button>
      <button
        type="button"
        disabled={dose.running}
        onClick={() => {
          if (dose.running) return;
          selectDoseClass("12");
          setSelected(null);
        }}
        className={cn(
          "relative px-5 py-2 rounded-full font-display font-black tracking-wide transition-colors text-xs",
          dose.running ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          currentClass === "12" ? "text-white font-black" : "text-slate-300 hover:text-white"
        )}
      >
        {currentClass === "12" && (
          <motion.div
            layoutId="activeClassDose"
            className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full -z-10 shadow-[0_2px_10px_rgba(45,212,191,0.3)]"
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        )}
        Class 12th
      </button>
    </div>
  );

  const headerTitle = (
    <div className="flex items-center">
      <span>DailyDose</span>
      {toggleSelector}
    </div>
  );

  if (dose.completed) {
    const earned = dose.correct * rdmPerCorrect;
    const userAnswers = currentClass === "12" ? (dose.answers12 || []) : (dose.answers11 || []);
    const timedOut = dose.timeLeft <= 0 && userAnswers.length < questions.length;

    return (
      <div className="space-y-6 pb-8">
        <ViewHeader
          eyebrow="Function 01"
          title={headerTitle}
          subtitle={
            timedOut
              ? "Time’s up — DailyDose ended. Unanswered questions count as skipped."
              : `${doseMinutes}-minute DailyDose complete.`
          }
        />
        <Card className="text-center py-8 px-5 border border-white/[0.04]">
          <div className="font-display font-extrabold text-[30px] text-teal">
            {earned} RDM earned today
          </div>
          <p className="text-[var(--text-dim)] mt-2 text-sm">
            {dose.correct} of {questions.length} correct today. Finish Fun Brain,
            Puzzles, Habits, and Pledge too to count today toward your streak.
          </p>
          <p className="text-[var(--text-dim)] mt-5 text-sm leading-relaxed max-w-md mx-auto">
            For more DailyDose practice, go to{" "}
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
                resetDose();
                startDose();
              }}
            >
              Replay DailyDose
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

        <div className="space-y-4">
          <h3 className="font-display font-bold text-base text-slate-300 px-1">
            Review Answers
          </h3>
          <div className="space-y-3">
            {questions.map((item, idx) => {
              const selectedIdx = userAnswers[idx];
              const isCorrect = selectedIdx === item.correct;

              return (
                <Card
                  key={idx}
                  className="border border-white/[0.04] p-4 bg-slate-900/40 space-y-3"
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[var(--text-dim)] text-[10px]">
                      Question {idx + 1} {item.tag ? `· ${item.tag}` : ""}
                    </span>
                    {selectedIdx === undefined || selectedIdx === null ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-slate-800 text-slate-400 border border-white/[0.04]">
                        Unanswered
                      </span>
                    ) : isCorrect ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-teal/10 text-teal border border-teal/20">
                        Correct
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-pink/10 text-pink border border-pink/20">
                        Incorrect
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                    {item.q}
                  </h4>

                  <div className="space-y-2 text-xs">
                    {item.opts.map((opt, oIdx) => {
                      const isUserSelection = selectedIdx === oIdx;
                      const isCorrectOption = oIdx === item.correct;

                      return (
                        <div
                          key={oIdx}
                          className={cn(
                            "flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-colors",
                            isCorrectOption
                              ? "border-teal/30 bg-teal/5 text-teal"
                              : isUserSelection && !isCorrect
                                ? "border-pink/30 bg-pink/5 text-pink"
                                : "border-white/[0.02] bg-slate-900/20 text-slate-400"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] opacity-65">
                              {oIdx + 1}.
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isCorrectOption && (
                            <span className="text-[10px] font-bold text-teal font-mono">Correct ✓</span>
                          )}
                          {isUserSelection && !isCorrect && (
                            <span className="text-[10px] font-bold text-pink font-mono">Your Pick ✗</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!dose.running) {
    return (
      <div>
        <ViewHeader
          eyebrow="Function 01"
          title={headerTitle}
          subtitle={`${doseMinutes}-minute timer · five bite-sized questions, one concept at a time.`}
        />
        <Card className="text-center py-[50px] px-5">
          <h2 className="font-display font-bold text-[22px]">DailyDose</h2>
          <p className="text-[var(--text-dim)] text-sm mt-2">
            {doseMinutes}-minute timer · {questions.length || 5} questions · Class{" "}
            {currentClass}
          </p>
          <p className="text-[var(--text-dim)] text-xs mt-3 max-w-sm mx-auto leading-relaxed">
            When the timer hits zero, the exam stops. Replay anytime — RDM is
            credited once per day.
          </p>
          <Button
            className="mt-8"
            onClick={() => {
              setSelected(null);
              startDose();
            }}
            disabled={questions.length === 0}
          >
            Start DailyDose →
          </Button>
        </Card>
      </div>
    );
  }

  const q = questions[dose.index];
  if (!q) {
    return (
      <div>
        <ViewHeader
          eyebrow="Function 01"
          title={headerTitle}
          subtitle="Loading today&apos;s questions…"
        />
        <Card className="text-center py-10 text-sm text-[var(--text-dim)]">
          {content.loading ? "Loading…" : `No questions available for Class ${currentClass} today.`}
        </Card>
      </div>
    );
  }

  const progress = (dose.index / questions.length) * 100;
  const timerUrgent = dose.timeLeft <= 30;

  const handleAnswer = (i: number) => {
    if (dose.locked || !dose.running) return;
    setSelected(i);
    answerDose(i, q.correct);
  };

  const handleNext = () => {
    setSelected(null);
    nextDose(questions.length);
  };

  const feedback =
    dose.locked && selected !== null
      ? selected === q.correct
        ? { text: `Correct! +${rdmPerCorrect} RDM`, color: "text-teal" }
        : { text: "Not quite — review and move on.", color: "text-pink" }
      : null;

  return (
    <div>
      <ViewHeader
        eyebrow="Function 01"
        title={headerTitle}
        subtitle="DailyDose in progress — finish before the timer ends."
      />
      <Card key={`dose-${currentClass}-${dose.index}`}>
        <div className="flex items-center gap-3.5 mb-5">
          <span className="font-mono text-[11px] text-[var(--text-dim)]">
            {dose.index + 1}/{questions.length}
          </span>
          <ProgressBar value={progress} className="flex-1 h-2" />
          <motion.div
            key={dose.timeLeft}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            className={cn(
              "font-mono font-bold text-xl tabular-nums shrink-0",
              timerUrgent ? "text-pink" : "text-teal",
            )}
          >
            {formatTime(dose.timeLeft)}
          </motion.div>
        </div>
        {q.tag ? (
          <div className="font-mono text-[11px] text-teal tracking-wide">{q.tag}</div>
        ) : null}
        <h2 className="font-display font-semibold text-xl mt-3 leading-snug">{q.q}</h2>

        <div className="mt-3">
          {q.opts.map((opt, i) => (
            <motion.button
              key={`${currentClass}-${dose.index}-${i}-${opt}`}
              type="button"
              whileHover={!dose.locked ? { scale: 1.01 } : undefined}
              disabled={dose.locked}
              onClick={() => handleAnswer(i)}
              className={cn(
                "block w-full text-left border border-[var(--line)] rounded-xl px-4 py-3.5 text-sm mt-2.5 bg-[var(--surface-2)] text-[var(--text)] transition-colors",
                !dose.locked && "hover:border-teal",
                dose.locked && i === q.correct && "border-teal text-teal bg-teal/10",
                dose.locked && selected === i && i !== q.correct && "border-pink text-pink bg-pink/[0.08]",
                dose.locked && selected === i && i === q.correct && "border-teal",
              )}
            >
              {opt}
            </motion.button>
          ))}
        </div>

        <div className="flex justify-between items-center mt-[22px]">
          <div className={cn("font-display font-bold text-sm min-h-5", feedback?.color)}>
            {feedback?.text ?? ""}
          </div>
          {dose.locked && (
            <Button onClick={handleNext}>
              {dose.index + 1 >= questions.length ? "Finish dose →" : "Next question →"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
