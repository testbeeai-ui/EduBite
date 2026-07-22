"use client";

import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Flame,
  Globe,
  LogOut,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth/auth-provider";
import { useGame } from "@/lib/store/game-provider";
import { formatRdm, formatShortDate } from "@/lib/utils";

export function ProfileView() {
  const { user, signOut } = useAuth();
  const { state, levelInfo, habitsStats, achievements, setActiveView } = useGame();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Student";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initial = (displayName[0] ?? "?").toUpperCase();

  const joinedFormatted = state.joinedDate
    ? formatShortDate(state.joinedDate)
    : "Recently";

  const unlockedAchievementsCount = Object.values(achievements).filter(
    (a) => a.unlocked,
  ).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveView("home")}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--text-dim)] hover:text-white px-3 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--line)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <span className="font-mono text-xs uppercase tracking-widest text-[var(--text-dim)]">
          User Profile
        </span>
      </div>

      {/* Main Profile Header Card */}
      <Card className="p-6 sm:p-8 border-[var(--line)] bg-gradient-to-br from-purple/[0.12] via-slate-900/90 to-teal/[0.08] relative overflow-hidden shadow-2xl">
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-teal/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-teal/40 shadow-xl"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-purple to-pink flex items-center justify-center font-display font-extrabold text-3xl sm:text-4xl text-white border-2 border-teal/40 shadow-xl">
                {initial}
              </div>
            )}
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal text-slate-950 shadow-md">
              Lv.{levelInfo.current.level}
            </span>
          </div>

          {/* User Details */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--text)] tracking-tight">
                  {displayName}
                </h1>
                <p className="text-xs sm:text-sm font-mono text-[var(--text-dim)] mt-0.5 truncate">
                  {user?.email ?? "Guest Learner"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void signOut()}
                className="self-center sm:self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-teal/15 text-teal border border-teal/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Edublast Connected
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-purple/15 text-purple-300 border border-purple/30">
                <Sparkles className="w-3.5 h-3.5" />
                {levelInfo.current.name}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono text-[var(--text-dim)] bg-white/[0.04] border border-white/10">
                <Globe className="w-3.5 h-3.5" />
                Joined {joinedFormatted}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Level & RDM Progress Section */}
      <Card className="p-5 sm:p-6 border-[var(--line)] bg-[var(--surface)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl">
              🪙
            </div>
            <div>
              <div className="font-display font-bold text-lg text-[var(--text)]">
                {formatRdm(state.rdm)} RDM Earned
              </div>
              <p className="text-xs text-[var(--text-dim)]">
                Level {levelInfo.current.level} • {levelInfo.current.name}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono text-xs font-bold text-teal">
              {Math.round(levelInfo.progress)}% to Lv{levelInfo.next.level}
            </div>
            <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
              {levelInfo.rdmToNext > 0
                ? `${formatRdm(levelInfo.rdmToNext)} RDM needed`
                : "Max Level Reached"}
            </p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/10 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-teal via-indigo-400 to-purple-400 rounded-full transition-all duration-500"
            style={{ width: `${levelInfo.progress}%` }}
          />
        </div>
      </Card>

      {/* Stats Grid */}
      <div>
        <SectionTitle className="mb-3">Learning Statistics</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Streak */}
          <Card className="p-4 border-[var(--line)] bg-[var(--surface)] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-[var(--text)]">
                {state.streak}
              </div>
              <div className="text-xs text-[var(--text-dim)] font-mono">
                Day Streak
              </div>
            </div>
          </Card>

          {/* FunBrain */}
          <Card className="p-4 border-[var(--line)] bg-[var(--surface)] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-[var(--text)]">
                {state.funbrain.highScore}
              </div>
              <div className="text-xs text-[var(--text-dim)] font-mono">
                FunBrain Best
              </div>
            </div>
          </Card>

          {/* Habits */}
          <Card className="p-4 border-[var(--line)] bg-[var(--surface)] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-[var(--text)]">
                {habitsStats.done}/{habitsStats.total}
              </div>
              <div className="text-xs text-[var(--text-dim)] font-mono">
                Habits Today
              </div>
            </div>
          </Card>

          {/* Achievements */}
          <Card className="p-4 border-[var(--line)] bg-[var(--surface)] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal/15 border border-teal/30 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-teal" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-[var(--text)]">
                {unlockedAchievementsCount}
              </div>
              <div className="text-xs text-[var(--text-dim)] font-mono">
                Achievements
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setActiveView("achievements")}
          className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] hover:border-teal/40 transition-colors text-left space-y-1 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-mono font-bold text-teal">
            <span>ACHIEVEMENTS</span>
            <Award className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-[var(--text-dim)]">
            View unlocked badges & rewards
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("habits")}
          className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] hover:border-teal/40 transition-colors text-left space-y-1 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
            <span>HABITS</span>
            <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-[var(--text-dim)]">
            Check off daily study goals
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("gyan")}
          className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] hover:border-teal/40 transition-colors text-left space-y-1 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-400">
            <span>GYAN CARDS</span>
            <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-[var(--text-dim)]">
            Read AI concepts & key formulas
          </p>
        </button>
      </div>
    </div>
  );
}
