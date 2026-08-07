"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { AppHeader } from "@/components/layout/app-header";
import { ModalHost } from "@/components/modals/modal-host";
import { HomeView } from "@/components/views/home-view";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/auth-provider";
import { useGame } from "@/lib/store/game-provider";
import type { AppView } from "@/lib/types";

const DailyDoseView = dynamic(
  () => import("@/components/views/dailydose-view").then((mod) => mod.DailyDoseView),
  { loading: () => <PageSkeleton /> }
);
const FunBrainView = dynamic(
  () => import("@/components/views/funbrain-view").then((mod) => mod.FunBrainView),
  { loading: () => <PageSkeleton /> }
);
const GyanView = dynamic(
  () => import("@/components/views/gyan-view").then((mod) => mod.GyanView),
  { ssr: false, loading: () => <PageSkeleton /> }
);
const PuzzlesView = dynamic(
  () => import("@/components/views/puzzles-view").then((mod) => mod.PuzzlesView),
  { loading: () => <PageSkeleton /> }
);
const WASquadView = dynamic(
  () => import("@/components/views/wasquad-view").then((mod) => mod.WASquadView),
  { loading: () => <PageSkeleton /> }
);
const HabitsView = dynamic(
  () => import("@/components/views/habits-view").then((mod) => mod.HabitsView),
  { loading: () => <PageSkeleton /> }
);
const AchievementsView = dynamic(
  () => import("@/components/views/achievements-view").then((mod) => mod.AchievementsView),
  { loading: () => <PageSkeleton /> }
);
const InspirationView = dynamic(
  () => import("@/components/views/inspiration-view").then((mod) => mod.InspirationView),
  { loading: () => <PageSkeleton /> }
);
const AIView = dynamic(
  () => import("@/components/views/ai-view").then((mod) => mod.AIView),
  { loading: () => <PageSkeleton /> }
);
const MonthlyChallengeView = dynamic(
  () => import("@/components/views/monthly-challenge-view").then((mod) => mod.MonthlyChallengeView),
  { loading: () => <PageSkeleton /> }
);
const ProfileView = dynamic(
  () => import("@/components/views/profile-view").then((mod) => mod.ProfileView),
  { loading: () => <PageSkeleton /> }
);

const VIEW_MAP: Record<AppView, React.ComponentType> = {
  home: HomeView,
  dailydose: DailyDoseView,
  funbrain: FunBrainView,
  gyan: GyanView,
  puzzles: PuzzlesView,
  wasquad: WASquadView,
  habits: HabitsView,
  achievements: AchievementsView,
  inspiration: InspirationView,
  ai: AIView,
  challenge: MonthlyChallengeView,
  profile: ProfileView,
};

const PUBLIC_VIEWS = new Set<AppView>(["home"]);

export function AppShell() {
  const [mounted, setMounted] = useState(false);
  const { activeView, hydrated, setActiveView } = useGame();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user && !PUBLIC_VIEWS.has(activeView)) {
      setActiveView("home");
    }
  }, [user, authLoading, activeView, setActiveView]);

  const safeView =
    !authLoading && !user && !PUBLIC_VIEWS.has(activeView)
      ? "home"
      : activeView;
  const ViewComponent = VIEW_MAP[safeView];

  return (
    <>
      <AppHeader />
      <main
        className="mx-auto w-full max-w-[1280px] px-4 py-4 sm:px-6 sm:py-5 pb-6 sm:pb-8"
        suppressHydrationWarning
      >
        {!mounted || !hydrated ? (
          <PageSkeleton />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={safeView}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              <ViewComponent />
            </motion.div>
          </AnimatePresence>
        )}
      </main>
      <ModalHost />
    </>
  );
}
