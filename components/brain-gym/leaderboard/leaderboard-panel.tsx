"use client";

import { GAMES, GAME_MAP } from "@/data/brain-gym/registry";
import { useBrainGym } from "@/lib/brain-gym/hooks/use-brain-gym";
import { Card } from "@/components/ui/card";
import { formatRdm } from "@/lib/utils";

/** Local mock leaderboard — no backend. Blends your scores with seeded NPCs. */

const NPCS = [
  { name: "Aarav", emoji: "🦊" },
  { name: "Mia", emoji: "🐼" },
  { name: "Kai", emoji: "🐯" },
  { name: "Zara", emoji: "🦄" },
  { name: "Leo", emoji: "🐺" },
  { name: "Nova", emoji: "🐙" },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function LeaderboardPanel() {
  const { progress } = useBrainGym();
  const youScore = Object.values(progress.games).reduce(
    (s, g) => s + (g?.bestScore ?? 0),
    0,
  );
  const youDaily = progress.dailyChallenge?.score ?? 0;
  const dailyId = progress.dailyChallenge?.gameId;

  const global = [
    { name: "You", emoji: "⭐", score: youScore, you: true },
    ...NPCS.map((n) => ({
      ...n,
      score: 800 + (hash(n.name + "global") % 4200),
      you: false,
    })),
  ].sort((a, b) => b.score - a.score);

  const daily = [
    { name: "You", emoji: "⭐", score: youDaily, you: true },
    ...NPCS.map((n) => ({
      ...n,
      score: 50 + (hash(n.name + (dailyId ?? "") + progress.dailyChallenge?.date) % 900),
      you: false,
    })),
  ].sort((a, b) => b.score - a.score);

  const friends = [
    { name: "You", emoji: "⭐", score: youScore, you: true },
    { name: "Bestie", emoji: "💫", score: Math.max(0, youScore - 120), you: false },
    { name: "StudyBuddy", emoji: "📚", score: Math.max(0, youScore + 80), you: false },
    { name: "SquadLead", emoji: "👑", score: Math.max(200, youScore + 340), you: false },
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--text-dim)]">
        Preview ranks powered by your local scores. Real multiplayer boards
        ship with the backend.
      </p>

      <Board title="Local leaderboard" rows={global} />
      <Board
        title={`Daily · ${dailyId ? GAME_MAP[dailyId].name : "Challenge"}`}
        rows={daily}
      />
      <Board title="Friends (placeholder)" rows={friends} />

      <Card className="!p-4">
        <h3 className="font-display font-bold mb-2">Category kings</h3>
        <ul className="space-y-2 text-sm">
          {(["memory", "logic", "visual", "speed"] as const).map(
            (cat) => {
              const best = GAMES.filter((g) => g.category === cat)
                .map((g) => ({
                  g,
                  s: progress.games[g.id]?.bestScore ?? 0,
                }))
                .sort((a, b) => b.s - a.s)[0];
              return (
                <li
                  key={cat}
                  className="flex justify-between border-b border-[var(--line)] pb-2 capitalize"
                >
                  <span className="text-[var(--text-dim)]">{cat}</span>
                  <span>
                    {best && best.s > 0
                      ? `${best.g.emoji} ${formatRdm(best.s)}`
                      : "—"}
                  </span>
                </li>
              );
            },
          )}
        </ul>
      </Card>
    </div>
  );
}

function Board({
  title,
  rows,
}: {
  title: string;
  rows: { name: string; emoji: string; score: number; you?: boolean }[];
}) {
  return (
    <Card className="!p-4">
      <h3 className="font-display font-bold mb-3">{title}</h3>
      <ol className="space-y-1.5">
        {rows.slice(0, 7).map((r, i) => (
          <li
            key={r.name + i}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
              r.you
                ? "bg-teal/10 border border-teal/25"
                : "border border-transparent"
            }`}
          >
            <span className="font-mono text-[var(--text-dim)] w-5">
              {i + 1}
            </span>
            <span>{r.emoji}</span>
            <span className="flex-1 font-display font-bold">
              {r.name}
              {r.you ? " (you)" : ""}
            </span>
            <span className="font-mono text-teal">{formatRdm(r.score)}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
