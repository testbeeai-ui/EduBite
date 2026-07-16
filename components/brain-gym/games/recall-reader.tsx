"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameComponentProps, GameSessionResult } from "@/lib/brain-gym/types";
import {
  RECALL_READER_MAX_LIVES,
  RECALL_READER_READING_MS,
  RECALL_READER_ROUNDS,
  createRecallReaderSession,
  scoreRecallReaderAnswer,
} from "@/lib/brain-gym/recall-reader-content";
import type { RecallReaderItem } from "@/lib/brain-gym/recall-reader-content";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { cn } from "@/lib/utils";
import { ChoiceButton, ChoiceGrid, GameBoard, StatusLine } from "./_shared";

type Phase = "reading" | "question" | "feedback";

type Feedback = {
  correct: boolean;
  message: string;
};

function sessionSeed(restartKey: number): number {
  return (Date.now() ^ Math.imul(restartKey + 1, 1_103_515_245)) >>> 0;
}

function formatSeconds(ms: number): string {
  return Math.ceil(ms / 1000).toString();
}

export function RecallReaderGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
  restartKey,
}: GameComponentProps) {
  const [items, setItems] = useState<RecallReaderItem[]>(() =>
    createRecallReaderSession(sessionSeed(restartKey), difficulty),
  );
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("reading");
  const [readingMsLeft, setReadingMsLeft] = useState(RECALL_READER_READING_MS);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [answerStartedAt, setAnswerStartedAt] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(RECALL_READER_MAX_LIVES);
  const [correctCount, setCorrectCount] = useState(0);

  const startRef = useRef(Date.now());
  const completedRef = useRef(false);
  const scoreRef = useRef(0);
  const livesRef = useRef(RECALL_READER_MAX_LIVES);
  const correctCountRef = useRef(0);
  const feedbackTimeoutRef = useRef<number | null>(null);

  const current = items[roundIndex] ?? items[0];
  const multiplier = difficultyMultiplier(difficulty);

  const clearFeedbackTimeout = useCallback(() => {
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
  }, []);

  const finish = useCallback(
    (result: Omit<GameSessionResult, "timeMs" | "difficulty">) => {
      if (completedRef.current) return;
      completedRef.current = true;
      clearFeedbackTimeout();
      onComplete({
        ...result,
        timeMs: Date.now() - startRef.current,
        difficulty,
      });
    },
    [clearFeedbackTimeout, difficulty, onComplete],
  );

  const resetGame = useCallback(() => {
    clearFeedbackTimeout();
    completedRef.current = false;
    startRef.current = Date.now();
    scoreRef.current = 0;
    livesRef.current = RECALL_READER_MAX_LIVES;
    correctCountRef.current = 0;
    setItems(createRecallReaderSession(sessionSeed(restartKey), difficulty));
    setRoundIndex(0);
    setPhase("reading");
    setReadingMsLeft(RECALL_READER_READING_MS);
    setSelectedIndex(null);
    setFeedback(null);
    setAnswerStartedAt(0);
    setScore(0);
    setLives(RECALL_READER_MAX_LIVES);
    setCorrectCount(0);
    onScoreChange?.(0);
    onLivesChange?.(RECALL_READER_MAX_LIVES);
  }, [clearFeedbackTimeout, difficulty, onLivesChange, onScoreChange, restartKey]);

  useEffect(() => {
    resetGame();
    return clearFeedbackTimeout;
  }, [resetGame, clearFeedbackTimeout]);

  useEffect(() => {
    if (phase !== "reading" || paused || completedRef.current) return;

    let lastTick = Date.now();
    const interval = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTick;
      lastTick = now;

      setReadingMsLeft((prev) => {
        if (prev <= 0) return 0;
        const next = Math.max(0, prev - elapsed);
        if (next === 0) {
          setPhase("question");
          setAnswerStartedAt(Date.now());
          sfx.tick(soundEnabled);
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [paused, phase, soundEnabled]);

  const moveToNextRound = useCallback(() => {
    clearFeedbackTimeout();
    if (roundIndex >= RECALL_READER_ROUNDS - 1) {
      finish({
        score: scoreRef.current,
        won: true,
        accuracy: correctCountRef.current / RECALL_READER_ROUNDS,
      });
      return;
    }

    setRoundIndex((prev) => prev + 1);
    setPhase("reading");
    setReadingMsLeft(RECALL_READER_READING_MS);
    setSelectedIndex(null);
    setFeedback(null);
    setAnswerStartedAt(0);
  }, [clearFeedbackTimeout, finish, roundIndex]);

  const scheduleAfterFeedback = useCallback(
    (callback: () => void) => {
      clearFeedbackTimeout();
      feedbackTimeoutRef.current = window.setTimeout(() => {
        feedbackTimeoutRef.current = null;
        callback();
      }, 1_200);
    },
    [clearFeedbackTimeout],
  );

  const chooseAnswer = useCallback(
    (optionIndex: number) => {
      if (
        paused ||
        completedRef.current ||
        phase !== "question" ||
        selectedIndex !== null ||
        !current
      ) {
        return;
      }

      const correct = optionIndex === current.correctIndex;
      setSelectedIndex(optionIndex);
      setPhase("feedback");

      if (correct) {
        sfx.correct(soundEnabled);
        const gained = scoreRecallReaderAnswer(
          difficulty,
          roundIndex + 1,
          Math.max(0, Date.now() - answerStartedAt),
          multiplier,
        );
        const nextScore = scoreRef.current + gained;
        const nextCorrect = correctCountRef.current + 1;
        scoreRef.current = nextScore;
        correctCountRef.current = nextCorrect;
        setScore(nextScore);
        setCorrectCount(nextCorrect);
        onScoreChange?.(nextScore);
        setFeedback({
          correct: true,
          message: `Correct. ${current.explanation}`,
        });
        scheduleAfterFeedback(moveToNextRound);
        return;
      }

      sfx.wrong(soundEnabled);
      const nextLives = livesRef.current - 1;
      livesRef.current = nextLives;
      setLives(nextLives);
      onLivesChange?.(nextLives);
      setFeedback({
        correct: false,
        message: `Not quite. ${current.explanation}`,
      });

      if (nextLives <= 0) {
        scheduleAfterFeedback(() =>
          finish({
            score: scoreRef.current,
            won: false,
            accuracy: correctCountRef.current / RECALL_READER_ROUNDS,
          }),
        );
      } else {
        scheduleAfterFeedback(moveToNextRound);
      }
    },
    [
      answerStartedAt,
      current,
      difficulty,
      finish,
      moveToNextRound,
      multiplier,
      onLivesChange,
      onScoreChange,
      paused,
      phase,
      roundIndex,
      scheduleAfterFeedback,
      selectedIndex,
      soundEnabled,
    ],
  );

  const progressPct = Math.max(
    0,
    Math.min(100, (readingMsLeft / RECALL_READER_READING_MS) * 100),
  );

  if (!current) return null;

  return (
    <GameBoard className="max-w-3xl mx-auto">
      <StatusLine>
        Round {roundIndex + 1}/{RECALL_READER_ROUNDS} · Lives {lives} · Score {score}
      </StatusLine>

      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3 text-xs font-display font-bold text-[var(--text-dim)]">
            <span>{phase === "reading" ? "Read carefully" : "Answer from memory"}</span>
            <span aria-live="polite">
              {phase === "reading" ? `${formatSeconds(readingMsLeft)}s` : "Passage hidden"}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal to-blue transition-[width] duration-100"
              style={{ width: `${phase === "reading" ? progressPct : 0}%` }}
            />
          </div>
        </div>

        {phase === "reading" ? (
          <div
            aria-live="polite"
            className="min-h-[190px] rounded-2xl border border-teal/20 bg-teal/10 p-5 sm:p-6 flex items-center"
          >
            <p className="text-base sm:text-lg leading-8 text-[var(--text)]">
              {current.paragraph}
            </p>
          </div>
        ) : (
          <div className="min-h-[190px] rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-5 sm:p-6">
            <p className="font-display text-lg sm:text-xl font-bold text-[var(--text)]">
              {current.question}
            </p>
            <ChoiceGrid cols={2}>
              {current.options.map((option, index) => {
                const isCorrect = phase === "feedback" && index === current.correctIndex;
                const isWrong =
                  phase === "feedback" && selectedIndex === index && index !== current.correctIndex;

                return (
                  <ChoiceButton
                    key={option}
                    onClick={() => chooseAnswer(index)}
                    disabled={paused || phase !== "question"}
                    selected={selectedIndex === index}
                    className={cn(
                      "mt-3 min-h-[64px] text-left justify-start",
                      isCorrect && "border-emerald-400 bg-emerald-500/15 text-emerald-200",
                      isWrong && "border-red-400 bg-red-500/15 text-red-200",
                    )}
                  >
                    <span className="block w-full">{option}</span>
                  </ChoiceButton>
                );
              })}
            </ChoiceGrid>
          </div>
        )}

        <div
          aria-live="polite"
          className={cn(
            "min-h-[56px] rounded-xl border px-4 py-3 text-sm font-display font-bold",
            feedback
              ? feedback.correct
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                : "border-red-400/40 bg-red-500/10 text-red-200"
              : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-dim)]",
          )}
        >
          {feedback
            ? feedback.message
            : phase === "reading"
              ? "The passage will disappear completely when the timer ends."
              : "Choose the answer using only what you remember."}
        </div>
      </div>
    </GameBoard>
  );
}
