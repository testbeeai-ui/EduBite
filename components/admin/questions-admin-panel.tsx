"use client";

import { useCallback, useEffect, useState } from "react";
import type { ContentDomain, ContentQuestionRow } from "@/lib/content/types";
import {
  dailyDoseScheduleDateFor,
  funBrainScheduleDateFor,
} from "@/lib/content/schedule";
import { Card } from "@/components/ui/card";
import { addDaysToKey, todayKey, cn } from "@/lib/utils";

type Props = {
  domain: ContentDomain;
  title: string;
  showTag: boolean;
};

export function QuestionsAdminPanel({ domain, title, showTag }: Props) {
  const today = todayKey();
  const [rows, setRows] = useState<ContentQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspectDate, setInspectDate] = useState(today);

  const scheduleDate =
    domain === "funbrain"
      ? funBrainScheduleDateFor(inspectDate)
      : dailyDoseScheduleDateFor(inspectDate);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/questions?domain=${domain}&from=${scheduleDate}&to=${scheduleDate}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to load questions");
      const data = (await res.json()) as { questions: ContentQuestionRow[] };
      setRows(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [domain, scheduleDate]);

  useEffect(() => {
    void load();
  }, [load]);

  const adjustDate = (days: number) => {
    setInspectDate((prev) => addDaysToKey(prev, days));
  };

  const renderQuestionList = (
    classLevel: "11" | "12" | "funbrain",
    titleLabel: string,
  ) => {
    const list = rows
      .filter((r) =>
        classLevel === "funbrain"
          ? r.domain === "funbrain"
          : r.classLevel === classLevel,
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return (
      <Card className="space-y-4 border border-white/[0.04]">
        <div className="flex justify-between items-center pb-2 border-b border-[var(--line)]">
          <div>
            <div className="text-xs font-mono text-[var(--text-dim)] uppercase">
              {titleLabel}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Calendar {inspectDate} · Bank day {scheduleDate}
            </div>
          </div>
          <span
            className={cn(
              "text-[9px] font-mono uppercase px-2 py-0.5 rounded-full",
              list.length > 0
                ? "bg-teal/15 text-teal border border-teal/20"
                : "bg-slate-800 text-slate-400 border border-white/[0.04]",
            )}
          >
            {list.length > 0
              ? `${list.length} from Supabase`
              : "No questions for this day"}
          </span>
        </div>

        <div className="space-y-3">
          {list.length === 0 ? (
            <p className="text-sm text-[var(--text-dim)] py-4 text-center">
              No published questions for this schedule day.
            </p>
          ) : (
            list.map((q, idx) => (
              <div
                key={q.id}
                className="text-xs border border-white/[0.02] bg-slate-900/40 p-2.5 rounded-xl space-y-1.5"
              >
                <div className="font-mono text-[9px] text-teal/80">
                  Q{idx + 1}
                  {showTag && q.tag ? ` · ${q.tag}` : ""}
                </div>
                <div className="font-semibold text-slate-200 leading-snug">
                  {q.q}
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 font-mono pl-1">
                  {q.opts.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={cn(
                        "truncate",
                        oIdx === q.correct && "text-teal font-extrabold",
                      )}
                    >
                      {oIdx + 1}. {opt} {oIdx === q.correct ? "✓" : ""}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-xl">{title}</h2>
        <p className="text-sm text-[var(--text-dim)] mt-1">
          {domain === "dailydose"
            ? "Read-only view of Class 11 & 12 PCM questions from Supabase."
            : "Read-only view of FunBrain questions from Supabase."}
        </p>
      </div>

      <Card className="flex flex-wrap items-center gap-4 p-4 border border-white/[0.04] bg-slate-900/40 rounded-2xl shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
            Inspect Date:
          </span>
          <div className="flex items-center bg-[var(--surface-2)] border border-[var(--line)] rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => adjustDate(-1)}
              className="px-2.5 py-1.5 hover:bg-slate-800 text-xs font-mono text-slate-300 transition-colors border-r border-[var(--line)] cursor-pointer"
              title="Previous Day"
            >
              ◀
            </button>
            <input
              type="date"
              value={inspectDate}
              onChange={(e) => setInspectDate(e.target.value || today)}
              className="bg-transparent px-3 py-1.5 text-xs text-[var(--text)] font-mono focus:border-teal outline-none border-none"
            />
            <button
              type="button"
              onClick={() => adjustDate(1)}
              className="px-2.5 py-1.5 hover:bg-slate-800 text-xs font-mono text-slate-300 transition-colors border-l border-[var(--line)] cursor-pointer"
              title="Next Day"
            >
              ▶
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setInspectDate(today)}
          className="px-3 py-1.5 rounded-lg border border-[var(--line)] hover:border-teal/40 hover:bg-slate-800 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
        >
          Today
        </button>
        {inspectDate === today && (
          <span className="text-[10px] bg-teal/10 border border-teal/20 text-teal font-mono px-2 py-0.5 rounded-full uppercase shrink-0">
            Viewing Live Today
          </span>
        )}
      </Card>

      {error && (
        <div className="text-sm text-pink border border-pink/30 bg-pink/10 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="py-10 text-center text-sm text-[var(--text-dim)]">
          Loading scheduled questions...
        </Card>
      ) : domain === "dailydose" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-blue/20 pb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <h3 className="font-display font-extrabold text-base text-blue-300">
                Class 11th PCM
              </h3>
            </div>
            {renderQuestionList(
              "11",
              inspectDate === today ? "Today's DailyDose" : "Selected Date",
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-purple/20 pb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <h3 className="font-display font-extrabold text-base text-purple-300">
                Class 12th PCM
              </h3>
            </div>
            {renderQuestionList(
              "12",
              inspectDate === today ? "Today's DailyDose" : "Selected Date",
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-2 border-b border-teal/20 pb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <h3 className="font-display font-extrabold text-base text-teal-300">
              {inspectDate === today
                ? "Today's FunBrain"
                : "Selected Date FunBrain"}
            </h3>
          </div>
          {renderQuestionList("funbrain", "Challenge Questions")}
        </div>
      )}
    </div>
  );
}
