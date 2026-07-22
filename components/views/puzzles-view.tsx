"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  Flame,
  Lightbulb,
  Lock,
  ScrollText,
  Sparkles,
  Unlock,
} from "lucide-react";
import { FEATURES } from "@/data/config";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-provider";
import { useGame } from "@/lib/store/game-provider";
import {
  formatCountdown,
  msUntilTomorrow,
  puzzleForDate,
  yesterdayPuzzle,
  yesterdayKey,
} from "@/lib/puzzles/daily";
import type { PuzzleProgress } from "@/lib/puzzles/types";
import {
  loadPuzzleProgress,
  recordAttempt,
  savePuzzleAttempt,
} from "@/lib/puzzles/storage";
import { formatShortDate, todayKey } from "@/lib/utils";

export function PuzzlesView() {
  const { user } = useAuth();
  const { withAuth, markPuzzleCompleted } = useGame();
  const [progress, setProgress] = useState<PuzzleProgress | null>(null);
  const [note, setNote] = useState("");
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );
  const [showHint, setShowHint] = useState(false);
  const [countdown, setCountdown] = useState(msUntilTomorrow());
  const [justSaved, setJustSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const today = todayKey();
  const yKey = yesterdayKey(today);
  const puzzle = useMemo(() => puzzleForDate(today), [today]);
  const yPuzzle = useMemo(() => yesterdayPuzzle(today), [today]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next = await loadPuzzleProgress(user?.id ?? null);
      if (cancelled) return;
      setProgress(next);
      const existing = next.attempts[today];
      if (existing?.puzzleId === puzzle.id) {
        setNote(existing.note);
        setSelectedOptionIndex(existing.selectedOptionIndex);
      } else {
        setNote("");
        setSelectedOptionIndex(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, today, puzzle.id]);

  useEffect(() => {
    const id = window.setInterval(() => setCountdown(msUntilTomorrow()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const attempt = progress?.attempts[today];
  const hasAttempt = Boolean(attempt && attempt.puzzleId === puzzle.id);
  const yesterdayAttempt = progress?.attempts[yKey];

  useEffect(() => {
    if (hasAttempt) markPuzzleCompleted();
  }, [hasAttempt, markPuzzleCompleted]);

  const submitAttempt = useCallback(() => {
    withAuth(() => {
      if (!user || !progress) return;
      const next = recordAttempt(
        progress,
        puzzle.id,
        note,
        puzzle.kind === "mcq" ? selectedOptionIndex : null,
      );
      const lockedAttempt = next.attempts[today];
      if (!lockedAttempt) return;
      setProgress(next);
      markPuzzleCompleted();
      setSaving(true);
      setSaveError(null);
      setJustSaved(false);
      void savePuzzleAttempt(user.id, {
        puzzleId: lockedAttempt.puzzleId,
        dateKey: lockedAttempt.dateKey,
        responseType: lockedAttempt.responseType,
        note: lockedAttempt.note,
        selectedOptionIndex: lockedAttempt.selectedOptionIndex,
      }).then((result) => {
        setSaving(false);
        if (result.ok) {
          setProgress(result.progress);
          markPuzzleCompleted();
          setJustSaved(true);
          window.setTimeout(() => setJustSaved(false), 2200);
          return;
        }
        setProgress(progress);
        setSaveError("Could not save yet. Please try again.");
      });
    });
  }, [
    withAuth,
    user,
    progress,
    puzzle,
    note,
    selectedOptionIndex,
    today,
    markPuzzleCompleted,
  ]);

  const attemptedCount = progress
    ? Object.keys(progress.attempts).length
    : 0;

  return (
    <div className="space-y-8">
      {/* Hero — one composition */}
      <section className="relative overflow-hidden rounded-3xl border border-gold/25 min-h-[220px]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 80% at 12% 20%, rgba(232,196,104,0.22), transparent 55%), radial-gradient(55% 60% at 88% 10%, rgba(251,191,36,0.12), transparent 50%), linear-gradient(160deg, #12151d 0%, #0b0d12 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e8c468' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative z-10 p-6 sm:p-9 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold mb-2">
              {FEATURES.puzzles.eyebrow} · {FEATURES.puzzles.tagline}
            </p>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--text)] tracking-tight">
              {FEATURES.puzzles.label}
            </h1>
            <p className="mt-3 max-w-md text-sm sm:text-[15px] text-[var(--text-dim)] leading-relaxed">
              One Class XI / XII brain-bender each day. Work it out today —
              the official answer opens tomorrow.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatChip
              icon={<Flame className="w-3.5 h-3.5 text-amber" />}
              label={`${progress?.streak ?? 0}d streak`}
            />
            <StatChip
              icon={<ScrollText className="w-3.5 h-3.5 text-gold" />}
              label={`${attemptedCount} solved days`}
            />
            <StatChip
              icon={<CalendarDays className="w-3.5 h-3.5 text-teal" />}
              label={formatShortDate(today)}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        {/* Today's puzzle */}
        <motion.section
          layout
          className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/80 p-5 sm:p-7"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 text-gold px-3 py-1 text-[11px] font-mono uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Today&apos;s puzzle
            </span>
            <span className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] font-mono text-[var(--text-dim)]">
              {puzzle.grade === "Competitive"
                ? "Competitive"
                : `Class ${puzzle.grade}`}
            </span>
            <span className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] font-mono text-[var(--text-dim)]">
              {puzzle.topic}
            </span>
            <span className="ml-auto font-mono text-[11px] text-[var(--text-dim)]">
              #{String(puzzle.number).padStart(2, "0")}
            </span>
          </div>

          <h2 className="font-display font-bold text-2xl sm:text-[28px] leading-tight">
            {puzzle.title}
          </h2>
          <p className="mt-4 text-[15px] sm:text-base leading-relaxed text-[var(--text)]/90 whitespace-pre-wrap">
            {puzzle.prompt}
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="inline-flex items-center gap-2 text-sm text-amber hover:text-gold transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              {showHint ? "Hide hint" : "Peek a hint"}
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-sm text-[var(--text-dim)] leading-relaxed overflow-hidden"
                >
                  {puzzle.hint}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {puzzle.kind === "mcq" ? (
            <fieldset className="mt-7" disabled={hasAttempt || saving}>
              <legend className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-dim)]">
                Choose one answer
              </legend>
              <div className="mt-3 grid gap-3">
                {puzzle.options.map((option, index) => {
                  const selected = selectedOptionIndex === index;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedOptionIndex(index)}
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                        selected
                          ? "border-gold bg-gold/15 text-[var(--text)]"
                          : "border-[var(--line)] bg-[var(--bg)]/60 text-[var(--text-dim)] hover:border-gold/50"
                      } disabled:cursor-not-allowed disabled:opacity-75`}
                    >
                      <span className="mr-2 font-mono text-xs text-gold">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
              {hasAttempt && (
                <p className="mt-3 text-xs font-mono text-teal">
                  Your choice is locked. The correct answer opens tomorrow.
                </p>
              )}
            </fieldset>
          ) : (
            <label className="mt-7 block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-dim)]">
                Your working &amp; answer
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={hasAttempt || saving}
                rows={5}
                placeholder="Scratch your reasoning here… official answer unlocks tomorrow."
                className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)]/60 px-4 py-3 text-sm leading-relaxed text-[var(--text)] placeholder:text-[var(--text-dim)]/70 focus:outline-none focus:ring-2 focus:ring-gold/40 resize-y min-h-[120px] disabled:cursor-not-allowed disabled:opacity-75"
              />
            </label>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              variant="am"
              onClick={submitAttempt}
              disabled={
                saving ||
                hasAttempt ||
                (puzzle.kind === "mcq"
                  ? selectedOptionIndex === null
                  : !note.trim())
              }
            >
              {saving
                ? "Saving..."
                : hasAttempt
                  ? "Attempt locked"
                  : "Lock in attempt"}
            </Button>
            {hasAttempt && (
              <span className="text-xs text-teal font-mono">
                Saved · answer still sealed until tomorrow
              </span>
            )}
            {justSaved && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-gold"
              >
                Attempt locked in.
              </motion.span>
            )}
            {saveError && (
              <span className="text-xs text-pink font-mono">
                {saveError}
              </span>
            )}
          </div>
        </motion.section>

        {/* Sealed answer + yesterday reveal */}
        <div className="space-y-6">
          <motion.section
            className="rounded-2xl border border-gold/20 bg-gradient-to-b from-gold/10 to-transparent p-5 sm:p-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.05 }}
          >
            <div className="flex items-center gap-2 text-gold mb-3">
              <Lock className="w-4 h-4" />
              <h3 className="font-display font-bold text-lg">Answer vault</h3>
            </div>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              Today&apos;s official solution stays locked. Come back after
              midnight to compare your attempt with the reveal.
            </p>
            <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--bg)]/50 px-4 py-5 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-dim)] mb-2">
                Unlocks in
              </p>
              <p className="font-display font-extrabold text-3xl text-gold tabular-nums flex items-center justify-center gap-2">
                <Clock3 className="w-5 h-5" />
                {formatCountdown(countdown)}
              </p>
            </div>
            <div
              aria-hidden
              className="mt-4 rounded-xl border border-dashed border-[var(--line)] px-4 py-6 text-center select-none"
            >
              <p className="font-mono text-xs text-[var(--text-dim)] blur-sm">
                {puzzle.answer.slice(0, 72)}…
              </p>
              <p className="mt-2 text-[11px] text-gold/80 uppercase tracking-wider font-mono">
                Sealed until {formatShortDate(today)} ends
              </p>
            </div>
          </motion.section>

          <motion.section
            className="rounded-2xl border border-teal/20 bg-[var(--surface)]/80 p-5 sm:p-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 text-teal mb-3">
              <Unlock className="w-4 h-4" />
              <h3 className="font-display font-bold text-lg">
                Yesterday&apos;s reveal
              </h3>
            </div>
            <p className="font-mono text-[11px] text-[var(--text-dim)] mb-1">
              {formatShortDate(yKey)} ·{" "}
              {yPuzzle.grade === "Competitive"
                ? "Competitive"
                : `Class ${yPuzzle.grade}`}{" "}
              · {yPuzzle.topic}
            </p>
            <h4 className="font-display font-semibold text-lg">{yPuzzle.title}</h4>
            <p className="mt-2 text-sm text-[var(--text-dim)] leading-relaxed line-clamp-3 whitespace-pre-wrap">
              {yPuzzle.prompt}
            </p>
            <div className="mt-4 rounded-xl bg-teal/10 border border-teal/20 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-teal mb-1.5">
                Official answer
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {yPuzzle.kind === "mcq"
                  ? `${String.fromCharCode(65 + yPuzzle.correctOptionIndex)}. ${yPuzzle.options[yPuzzle.correctOptionIndex]}\n\n${yPuzzle.answer}`
                  : yPuzzle.answer}
              </p>
            </div>
            {yesterdayAttempt ? (
              <div className="mt-3 rounded-xl border border-[var(--line)] px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5">
                  Your attempt
                </p>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed whitespace-pre-wrap">
                  {yesterdayAttempt.responseType === "mcq" &&
                  yPuzzle.kind === "mcq" &&
                  yesterdayAttempt.selectedOptionIndex !== null
                    ? `${String.fromCharCode(65 + yesterdayAttempt.selectedOptionIndex)}. ${yPuzzle.options[yesterdayAttempt.selectedOptionIndex]}`
                    : yesterdayAttempt.note}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-[var(--text-dim)]">
                You didn&apos;t lock an attempt yesterday — still handy to read
                the solution.
              </p>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
}

function StatChip({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--bg)]/40 px-3 py-1.5 text-xs text-[var(--text)]">
      {icon}
      {label}
    </span>
  );
}
