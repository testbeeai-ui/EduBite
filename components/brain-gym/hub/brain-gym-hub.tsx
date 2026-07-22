"use client";

import { AnimatePresence } from "framer-motion";
import { Search, Star, Trophy, Flame, LayoutGrid } from "lucide-react";
import { useMemo, useState } from "react";
import {
  BADGE_DEFS,
  CATEGORY_META,
  GAME_MAP,
  GAMES,
} from "@/data/brain-gym/registry";
import { useBrainGym } from "@/lib/brain-gym/hooks/use-brain-gym";
import type { GameCategory, GameId } from "@/lib/brain-gym/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatRdm } from "@/lib/utils";
import { useGame } from "@/lib/store/game-provider";
import { FEATURES, GYAN_STREAK_GOAL_MS } from "@/data/config";
import { GameShell } from "@/components/brain-gym/shell/game-shell";
import { GAME_COMPONENTS } from "@/components/brain-gym/games";
import { ProgressPanel } from "@/components/brain-gym/profile/progress-panel";
import { LeaderboardPanel } from "@/components/brain-gym/leaderboard/leaderboard-panel";
import { BrainGymScene3D } from "@/components/brain-gym/hub/brain-gym-scene-3d";

const CATS: Array<GameCategory | "all"> = [
  "all",
  "memory",
  "logic",
  "visual",
  "speed",
];

export function BrainGymHub() {
  const {
    progress,
    openGame,
    activeGameId,
    hubTab,
    setHubTab,
    toggleFav,
  } = useBrainGym();
  const { state } = useGame();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<GameCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES.filter((g) => {
      if (cat !== "all" && g.category !== cat) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        g.tags.some((t) => t.includes(q)) ||
        g.description.toLowerCase().includes(q)
      );
    });
  }, [query, cat]);

  const featured = useMemo(() => {
    return [...GAMES]
      .sort(
        (a, b) =>
          (progress.games[b.id]?.plays ?? 0) -
          (progress.games[a.id]?.plays ?? 0),
      )
      .slice(0, 4);
  }, [progress.games]);

  const dailyId = progress.dailyChallenge?.gameId ?? GAMES[0]!.id;
  const dailyMeta = GAME_MAP[dailyId];
  const gyanMins = Math.floor(state.gyanTimeMs / 60000);
  const gyanGoal = Math.floor(GYAN_STREAK_GOAL_MS / 60000);

  const ActiveGame = activeGameId ? GAME_COMPONENTS[activeGameId] : null;

  return (
    <>
      <div className="space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-purple/20 min-h-[200px] sm:min-h-[220px]">
          {/* Unmount 3D when playing — drei <Html> portals leak above GameShell otherwise */}
          {!activeGameId && <BrainGymScene3D />}
          <div className="relative z-10 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-purple mb-1">
                {FEATURES.gyan.eyebrow} · {FEATURES.gyan.tagline}
              </p>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl">
                {FEATURES.gyan.label}
              </h1>
              <p className="text-sm text-[var(--text-dim)] mt-2 max-w-lg leading-relaxed">
                {GAMES.length} mini-games — memory, logic, visual & speed. Short sessions.
                Real gains. Earn RDM while you train.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Pill icon={<Flame className="w-3.5 h-3.5 text-amber" />} label={`${progress.streak}d streak`} />
              <Pill icon={<Trophy className="w-3.5 h-3.5 text-gold" />} label={`${progress.totalWins} wins`} />
              <Pill
                icon={<span className="text-xs">⏱️</span>}
                label={`${gyanMins}/${gyanGoal} min today`}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-5 border-b border-[var(--line)] pb-0">
            {(
              [
                ["hub", "Games", LayoutGrid],
                ["progress", "Progress", Star],
                ["leaderboard", "Ranks", Trophy],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setHubTab(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-display font-bold border-b-2 -mb-px transition-colors",
                  hubTab === id
                    ? "border-teal text-[var(--text)]"
                    : "border-transparent text-[var(--text-dim)]",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
          </div>
        </div>

        {hubTab === "hub" && (
          <div className="space-y-6">
            {/* Daily challenge */}
            <Card className="!p-4 sm:!p-5 border-amber/25 bg-gradient-to-r from-amber/10 to-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-amber mb-1">
                    Daily challenge
                  </p>
                  <p className="font-display font-bold text-lg">
                    {dailyMeta.emoji} {dailyMeta.name}
                  </p>
                  <p className="text-xs text-[var(--text-dim)] mt-1">
                    {progress.dailyChallenge?.completed
                      ? `Done · best ${progress.dailyChallenge.score} pts · +RDM bonus`
                      : "Complete today for streak + bonus RDM"}
                  </p>
                </div>
                <Button onClick={() => openGame(dailyId, true)}>
                  {progress.dailyChallenge?.completed ? "Play again" : "Start daily"}
                </Button>
              </div>
            </Card>

            <Section title="Featured">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {featured.map((g) => (
                  <GameTile
                    key={g.id}
                    id={g.id}
                    fav={!!progress.games[g.id]?.favorite}
                    best={progress.games[g.id]?.bestScore ?? 0}
                    onOpen={() => openGame(g.id)}
                    onFav={() => toggleFav(g.id)}
                  />
                ))}
              </div>
            </Section>

            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search games…"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm outline-none focus:border-teal/50"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {CATS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCat(c)}
                    className={cn(
                      "shrink-0 px-3 py-2 rounded-full text-xs font-display font-bold border capitalize",
                      cat === c
                        ? "border-teal bg-teal/15 text-teal"
                        : "border-[var(--line)] text-[var(--text-dim)]",
                    )}
                  >
                    {c === "all"
                      ? "All"
                      : `${CATEGORY_META[c].emoji} ${CATEGORY_META[c].label}`}
                  </button>
                ))}
              </div>
            </div>

            <Section title={`All games (${filtered.length})`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((g) => (
                  <div key={g.id}>
                    <GameTile
                      id={g.id}
                      fav={!!progress.games[g.id]?.favorite}
                      best={progress.games[g.id]?.bestScore ?? 0}
                      onOpen={() => openGame(g.id)}
                      onFav={() => toggleFav(g.id)}
                      detailed
                    />
                  </div>
                ))}
              </div>
            </Section>

            {/* Badges strip */}
            <Section title="Achievements">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {BADGE_DEFS.map((b) => {
                  const unlocked = progress.badges.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      className={cn(
                        "shrink-0 w-[120px] rounded-xl border p-3 text-center",
                        unlocked
                          ? "border-amber/30 bg-amber/10"
                          : "border-[var(--line)] bg-[var(--surface)] opacity-45",
                      )}
                    >
                      <div className="text-2xl">{b.icon}</div>
                      <div className="text-[11px] font-display font-bold mt-1">
                        {b.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>
        )}

        {hubTab === "progress" && <ProgressPanel />}
        {hubTab === "leaderboard" && <LeaderboardPanel />}
      </div>

      <AnimatePresence>
        {activeGameId && ActiveGame && <GameShell Game={ActiveGame} />}
      </AnimatePresence>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display font-bold text-sm text-[var(--text-dim)] uppercase tracking-wide mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Pill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 text-xs font-mono">
      {icon}
      {label}
    </div>
  );
}

function GameTile({
  id,
  fav,
  best,
  onOpen,
  onFav,
  detailed,
}: {
  id: GameId;
  fav: boolean;
  best: number;
  onOpen: () => void;
  onFav: () => void;
  detailed?: boolean;
}) {
  const g = GAME_MAP[id];
  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 hover-lift transition-shadow hover:border-white/10",
        detailed && "flex gap-3 items-start",
      )}
    >
      <button type="button" onClick={onOpen} className="text-left flex-1 min-w-0 w-full">
        <div className={cn("flex items-start gap-3", !detailed && "flex-col")}>
          <span
            className="text-2xl sm:text-3xl shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border border-[var(--line)]"
            style={{ background: `${g.color}22` }}
          >
            {g.emoji}
          </span>
          <div className="min-w-0">
            <div className="font-display font-bold text-sm sm:text-base truncate">
              {g.name}
            </div>
            {detailed ? (
              <p className="text-xs text-[var(--text-dim)] mt-0.5 line-clamp-2">
                {g.description}
              </p>
            ) : (
              <p className="text-[10px] text-[var(--text-dim)] mt-0.5 capitalize">
                {g.category}
              </p>
            )}
            <p className="text-[10px] font-mono text-[var(--text-dim)] mt-1">
              Best {formatRdm(best)} · ~{Math.round(g.estimatedSeconds / 60)}m
            </p>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onFav();
        }}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-[var(--surface-2)]"
        aria-label="Favorite"
      >
        <Star
          className={cn(
            "w-3.5 h-3.5",
            fav ? "fill-amber text-amber" : "text-[var(--text-dim)]",
          )}
        />
      </button>
    </div>
  );
}
