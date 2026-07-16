"use client";

import { BADGE_DEFS, GAMES, GAME_MAP } from "@/data/brain-gym/registry";
import { useBrainGym } from "@/lib/brain-gym/hooks/use-brain-gym";
import { Card } from "@/components/ui/card";
import { cn, formatRdm } from "@/lib/utils";

export function ProgressPanel() {
  const { progress, openGame } = useBrainGym();
  const winRate =
    progress.totalPlays > 0
      ? Math.round((progress.totalWins / progress.totalPlays) * 100)
      : 0;

  const favorites = GAMES.filter((g) => progress.games[g.id]?.favorite);
  const topScores = GAMES.map((g) => ({
    id: g.id,
    best: progress.games[g.id]?.bestScore ?? 0,
  }))
    .filter((x) => x.best > 0)
    .sort((a, b) => b.best - a.best)
    .slice(0, 8);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Played" value={String(progress.totalPlays)} />
        <StatCard label="Wins" value={String(progress.totalWins)} />
        <StatCard label="Win rate" value={`${winRate}%`} />
        <StatCard label="Streak" value={`${progress.streak}d`} />
      </div>

      <Card className="!p-4">
        <h3 className="font-display font-bold mb-3">Streak calendar</h3>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 28 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (27 - i));
            const key = d.toISOString().slice(0, 10);
            const active = progress.playDates.includes(key);
            return (
              <div
                key={key}
                title={key}
                className={cn(
                  "w-6 h-6 rounded-md border text-[9px] flex items-center justify-center font-mono",
                  active
                    ? "bg-teal/25 border-teal/40 text-teal"
                    : "border-[var(--line)] text-[var(--text-dim)]/40",
                )}
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="!p-4">
        <h3 className="font-display font-bold mb-3">Highest scores</h3>
        {topScores.length === 0 ? (
          <p className="text-sm text-[var(--text-dim)]">
            Play games to fill your scoreboard.
          </p>
        ) : (
          <ul className="space-y-2">
            {topScores.map((s) => {
              const g = GAME_MAP[s.id];
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => openGame(s.id)}
                    className="w-full flex items-center justify-between gap-2 rounded-xl border border-[var(--line)] px-3 py-2 hover:border-teal/30 text-left"
                  >
                    <span className="text-sm">
                      {g.emoji} {g.name}
                    </span>
                    <span className="font-mono text-sm text-teal">
                      {formatRdm(s.best)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="!p-4">
        <h3 className="font-display font-bold mb-3">Favorites</h3>
        {favorites.length === 0 ? (
          <p className="text-sm text-[var(--text-dim)]">
            Star games on the hub to pin them here.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {favorites.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => openGame(g.id)}
                className="px-3 py-1.5 rounded-full border border-[var(--line)] text-xs font-display font-bold"
              >
                {g.emoji} {g.shortName}
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="!p-4">
        <h3 className="font-display font-bold mb-3">Badges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BADGE_DEFS.map((b) => {
            const unlocked = progress.badges.includes(b.id);
            return (
              <div
                key={b.id}
                className={cn(
                  "rounded-xl border p-3",
                  unlocked
                    ? "border-amber/30 bg-amber/10"
                    : "border-[var(--line)] opacity-40",
                )}
              >
                <div className="text-xl">{b.icon}</div>
                <div className="text-xs font-display font-bold mt-1">
                  {b.title}
                </div>
                <div className="text-[10px] text-[var(--text-dim)] mt-0.5">
                  {b.desc}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <p className="text-xs text-[var(--text-dim)] text-center">
        Lifetime Brain Gym RDM earned: {formatRdm(progress.rdmEarned)}
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-center">
      <div className="font-mono font-bold text-xl">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-[var(--text-dim)] mt-1">
        {label}
      </div>
    </div>
  );
}
