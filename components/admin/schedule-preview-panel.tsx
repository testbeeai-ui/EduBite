"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { todayKey } from "@/lib/utils";

type SchedulePayload = {
  dateKey: string;
  bucket: string;
  dailydose: {
    scheduleDate: string;
    class11: {
      source: string;
      questions: { tag: string; q: string; opts: string[]; correct: number }[];
    };
    class12: {
      source: string;
      questions: { tag: string; q: string; opts: string[]; correct: number }[];
    };
  };
  funbrain: {
    source: string;
    questions: { q: string; opts: string[]; correct: number }[];
  };
  puzzles: {
    today: {
      dateKey: string;
      answerUnlocked: boolean;
      puzzle: {
        number: number;
        grade: string;
        title: string;
        prompt: string;
        hint: string;
        answer: string;
        topic: string;
      };
    };
    yesterday: {
      dateKey: string;
      answerUnlocked: boolean;
      puzzle: { number: number; title: string; answer: string };
    };
    upcoming: {
      dateKey: string;
      number: number;
      title: string;
      grade: string;
      topic: string;
    }[];
  };
  inspiration: {
    totals: { quotes: number; phenomena: number; roleModels: number };
    quote: {
      contentKey: string;
      category: string;
      quote: string;
    };
    roleModel: {
      contentKey: string;
      volume: number;
      number: number;
      index: string;
      avatar: string;
      name: string;
      tag: string;
      quote: string;
      bio: string;
      inspireWhy: string;
      pcmConnections: string;
    };
    phenomenon: {
      contentKey: string;
      volume: number;
      number: number;
      subject: string;
      icon: string;
      badge: string;
      question: string;
      explanation: string;
      linkedConcepts: string;
      followUpQuestion: string;
      source: string;
    };
    upcoming: {
      dateKey: string;
      quote: { contentKey: string; category: string; quote: string };
      phenomenon: {
        contentKey: string;
        volume: number;
        number: number;
        subject: string;
        badge: string;
        question: string;
      };
      roleModel: {
        contentKey: string;
        index: string;
        name: string;
        tag: string;
        quote: string;
      };
    }[];
  };
  pledges: {
    am: { title: string; quote: string; time: string };
    pm: { title: string; quote: string; time: string };
    joinedDate: string;
    previewDay: number;
    totalReelDays: number;
    reel: {
      day: number;
      theme: string;
      slides: {
        icon: string;
        headline: string;
        emphasisWord: string;
        caption: string;
      }[];
    };
  };
};

type Mode = "pledges" | "puzzles" | "inspiration";

const MODE_COPY: Record<
  Mode,
  { title: string; subtitle: string }
> = {
  pledges: {
    title: "AI Pledges",
    subtitle:
      "Preview which reel day and slides show for a calendar date and join date. Content is file-driven (not editable here).",
  },
  puzzles: {
    title: "Puzzles",
    subtitle:
      "Preview the shared daily puzzle for any date (UTC-day rotation). Answers unlock the next calendar day.",
  },
  inspiration: {
    title: "Inspiration",
    subtitle:
      "Preview Quote of the Day, Role Model of the Day, and Natural Phenomena for any date. All three use deterministic cycles from the Supabase catalogs (185 quotes · 90 role models · 180 phenomena).",
  },
};

export function SchedulePreviewPanel({ mode }: { mode: Mode }) {
  const [dateKey, setDateKey] = useState(todayKey());
  const [joinedDate, setJoinedDate] = useState(todayKey());
  const [data, setData] = useState<SchedulePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        date: dateKey,
        joinedDate,
      });
      const res = await fetch(`/api/admin/schedule?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load schedule");
      setData((await res.json()) as SchedulePayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [dateKey, joinedDate]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-xl">
          {MODE_COPY[mode].title}
        </h2>
        <p className="text-sm text-[var(--text-dim)] mt-1">
          {MODE_COPY[mode].subtitle}
        </p>
      </div>

      <Card className="flex flex-wrap gap-4 items-end">
        <label className="text-xs text-[var(--text-dim)]">
          Preview date
          <input
            type="date"
            value={dateKey}
            onChange={(e) => setDateKey(e.target.value)}
            className="mt-1 block rounded-lg bg-[var(--surface-2)] border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]"
          />
        </label>
        {mode === "pledges" && (
          <label className="text-xs text-[var(--text-dim)]">
            Sample joined date
            <input
              type="date"
              value={joinedDate}
              onChange={(e) => setJoinedDate(e.target.value)}
              className="mt-1 block rounded-lg bg-[var(--surface-2)] border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]"
            />
          </label>
        )}
        <div className="font-mono text-[11px] text-teal pb-2">
          Bucket: {data?.bucket ?? "—"}
        </div>
      </Card>

      {error && (
        <div className="text-sm text-pink border border-pink/30 bg-pink/10 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {loading || !data ? (
        <p className="text-sm text-[var(--text-dim)]">Loading schedule…</p>
      ) : mode === "pledges" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <div className="font-mono text-[10px] text-amber">
                {data.pledges.am.time}
              </div>
              <h3 className="font-display font-bold mt-1">
                {data.pledges.am.title}
              </h3>
              <p className="text-sm text-[var(--text-dim)] italic mt-2 leading-relaxed">
                &ldquo;{data.pledges.am.quote}&rdquo;
              </p>
            </Card>
            <Card>
              <div className="font-mono text-[10px] text-purple">
                {data.pledges.pm.time}
              </div>
              <h3 className="font-display font-bold mt-1">
                {data.pledges.pm.title}
              </h3>
              <p className="text-sm text-[var(--text-dim)] italic mt-2 leading-relaxed">
                &ldquo;{data.pledges.pm.quote}&rdquo;
              </p>
            </Card>
          </div>

          <Card>
            <div className="font-mono text-[11px] text-teal">
              Reel day {data.pledges.previewDay} / {data.pledges.totalReelDays} ·{" "}
              {data.pledges.reel.theme}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {data.pledges.reel.slides.map((slide, i) => (
                <div
                  key={i}
                  className="border border-[var(--line)] rounded-xl p-3 bg-[var(--surface-2)]"
                >
                  <div className="text-2xl">{slide.icon}</div>
                  <div className="font-display font-bold text-sm mt-2">
                    {slide.headline}
                  </div>
                  <p className="text-[12px] text-[var(--text-dim)] mt-1 leading-relaxed">
                    {slide.caption}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="font-mono text-[11px] text-[var(--text-dim)] mb-2">
              Content sources for {data.dateKey}
            </div>
            <div className="text-xs text-[var(--text-dim)] space-y-1.5 font-mono">
              <div>
                Class 11 PCM:{" "}
                <span className="text-teal font-semibold">
                  {data.dailydose.class11.source}
                </span>{" "}
                ({data.dailydose.class11.questions.length} Qs)
              </div>
              <div>
                Class 12 PCM:{" "}
                <span className="text-teal font-semibold">
                  {data.dailydose.class12.source}
                </span>{" "}
                ({data.dailydose.class12.questions.length} Qs)
              </div>
              <div>
                FunBrain:{" "}
                <span className="text-teal font-semibold">
                  {data.funbrain.source}
                </span>{" "}
                ({data.funbrain.questions.length} Qs)
              </div>
            </div>
          </Card>
        </div>
      ) : mode === "puzzles" ? (
        <div className="space-y-4">
          <Card>
            <div className="font-mono text-[11px] text-teal">
              Puzzle for {data.puzzles.today.dateKey} · #
              {data.puzzles.today.puzzle.number} ·{" "}
              {data.puzzles.today.puzzle.grade} ·{" "}
              {data.puzzles.today.puzzle.topic}
            </div>
            <h3 className="font-display font-bold text-lg mt-2">
              {data.puzzles.today.puzzle.title}
            </h3>
            <p className="text-sm mt-3 leading-relaxed">
              {data.puzzles.today.puzzle.prompt}
            </p>
            <p className="text-[12px] text-[var(--text-dim)] mt-2">
              Hint: {data.puzzles.today.puzzle.hint}
            </p>
            <p className="text-sm text-teal mt-3">
              Answer: {data.puzzles.today.puzzle.answer}
              {data.puzzles.today.answerUnlocked
                ? " (unlocked for students)"
                : " (locked for students until tomorrow)"}
            </p>
          </Card>

          <Card>
            <div className="font-mono text-[11px] text-[var(--text-dim)]">
              Yesterday ({data.puzzles.yesterday.dateKey})
            </div>
            <div className="text-sm mt-1">
              #{data.puzzles.yesterday.puzzle.number}{" "}
              {data.puzzles.yesterday.puzzle.title}
            </div>
            <div className="text-sm text-teal mt-1">
              {data.puzzles.yesterday.puzzle.answer}
              {data.puzzles.yesterday.answerUnlocked
                ? " · unlocked"
                : " · still locked"}
            </div>
          </Card>

          <Card>
            <div className="font-mono text-[11px] text-[var(--text-dim)] mb-3">
              Next 7 days from preview date
            </div>
            <ul className="space-y-2">
              {data.puzzles.upcoming.map((p) => (
                <li
                  key={p.dateKey}
                  className="flex flex-wrap gap-2 justify-between text-sm border-b border-[var(--line)] pb-2"
                >
                  <span className="font-mono text-[11px] text-teal">
                    {p.dateKey}
                  </span>
                  <span className="flex-1">
                    #{p.number} {p.title}
                  </span>
                  <span className="text-[var(--text-dim)] text-[11px]">
                    {p.grade} · {p.topic}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <div className="font-mono text-[11px] text-amber">
              Catalog · {data.inspiration.totals.quotes} quotes ·{" "}
              {data.inspiration.totals.roleModels} role models ·{" "}
              {data.inspiration.totals.phenomena} phenomena
            </div>
          </Card>

          <Card className="text-center py-8 px-6 bg-gradient-to-br from-[rgba(232,196,104,0.1)] to-[var(--surface)] border-[rgba(232,196,104,0.25)]">
            <div className="font-mono text-[11px] text-[var(--text-dim)]">
              Quote of the day · {data.inspiration.quote.category} ·{" "}
              {data.inspiration.quote.contentKey}
            </div>
            <p className="font-display font-semibold text-[18px] leading-snug mt-3 max-w-2xl mx-auto">
              {data.inspiration.quote.quote}
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-[rgba(232,196,104,0.08)] to-[var(--surface)] border-[rgba(232,196,104,0.3)]">
            <div className="flex gap-3.5 items-start">
              <span className="text-2xl" aria-hidden="true">
                {data.inspiration.roleModel.avatar}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] text-amber tracking-wider">
                  Role model of the day · #{data.inspiration.roleModel.index} ·
                  v{data.inspiration.roleModel.volume} ·{" "}
                  {data.inspiration.roleModel.contentKey}
                </div>
                <h3 className="font-display font-bold text-[18px] mt-1.5 leading-snug">
                  {data.inspiration.roleModel.name}
                </h3>
                <p className="text-[12px] text-[var(--text-dim)] mt-1">
                  {data.inspiration.roleModel.tag}
                </p>
                <p className="font-display italic text-[14px] mt-3 leading-snug text-[var(--text)]">
                  “{data.inspiration.roleModel.quote}”
                </p>
              </div>
            </div>
            <div className="mt-[18px] bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-4 space-y-3">
              <div>
                <div className="font-display font-bold text-[12.5px] text-amber">
                  Bio
                </div>
                <p className="whitespace-pre-line text-[13px] text-[var(--text-dim)] mt-1.5 leading-relaxed">
                  {data.inspiration.roleModel.bio}
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--line)] space-y-3">
                <p className="text-[12.5px] leading-relaxed text-[var(--text-dim)]">
                  <span className="font-display font-bold text-[var(--text)]">
                    Why this inspires ·{" "}
                  </span>
                  {data.inspiration.roleModel.inspireWhy}
                </p>
                <div className="rounded-xl border border-amber/20 bg-amber/5 px-3.5 py-3">
                  <p className="text-[12.5px] leading-relaxed text-[var(--text-dim)]">
                    <span className="font-display font-bold text-amber">
                      PCM connections ·{" "}
                    </span>
                    {data.inspiration.roleModel.pcmConnections}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue/10 to-[var(--surface)] border-blue/25">
            <div className="flex gap-3.5 items-start">
              <span className="text-2xl" aria-hidden="true">
                {data.inspiration.phenomenon.icon}
              </span>
              <div>
                <div className="font-mono text-[10px] text-blue tracking-wider">
                  {data.inspiration.phenomenon.badge} ·{" "}
                  {data.inspiration.phenomenon.subject} · v
                  {data.inspiration.phenomenon.volume}
                </div>
                <h3 className="font-display font-bold text-[16.5px] mt-1.5 leading-snug">
                  {data.inspiration.phenomenon.question}
                </h3>
              </div>
            </div>
            <div className="mt-[18px] bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-4 space-y-3">
              <div>
                <div className="font-display font-bold text-[12.5px] text-amber">
                  Answer
                </div>
                <p className="whitespace-pre-line text-[13px] text-[var(--text-dim)] mt-1.5 leading-relaxed">
                  {data.inspiration.phenomenon.explanation}
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--line)] space-y-3">
                <p className="text-[12.5px] leading-relaxed text-[var(--text-dim)]">
                  <span className="font-display font-bold text-[var(--text)]">
                    Linked concepts:{" "}
                  </span>
                  {data.inspiration.phenomenon.linkedConcepts}
                </p>
                <div className="rounded-xl border border-blue/20 bg-blue/5 px-3.5 py-3">
                  <p className="text-[12.5px] leading-relaxed text-[var(--text-dim)]">
                    <span className="font-display font-bold text-blue">
                      Follow-up question:{" "}
                    </span>
                    {data.inspiration.phenomenon.followUpQuestion}
                  </p>
                </div>
              </div>
            </div>
            <div className="font-mono text-[10px] text-[var(--text-dim)] mt-3">
              {data.inspiration.phenomenon.contentKey} ·{" "}
              {data.inspiration.phenomenon.source}
            </div>
          </Card>

          <Card>
            <div className="font-mono text-[11px] text-[var(--text-dim)] mb-3">
              Next 14 days from preview date
            </div>
            <ul className="space-y-3">
              {data.inspiration.upcoming.map((day) => (
                <li
                  key={day.dateKey}
                  className="border-b border-[var(--line)] pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="font-mono text-[11px] text-teal">
                    {day.dateKey}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-[var(--text-dim)]">Quote · </span>
                    {day.quote.category}: {day.quote.quote}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-[var(--text-dim)]">
                      Role model · #{day.roleModel.index} ·{" "}
                    </span>
                    {day.roleModel.name} — {day.roleModel.tag}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-[var(--text-dim)]">
                      Phenomena · {day.phenomenon.subject} ·{" "}
                      {day.phenomenon.badge} ·{" "}
                    </span>
                    {day.phenomenon.question}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
