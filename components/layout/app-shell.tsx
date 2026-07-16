"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppHeader } from "@/components/layout/app-header";
import { ModalHost } from "@/components/modals/modal-host";
import { BrainGymHub } from "@/components/brain-gym/hub/brain-gym-hub";
import { AchievementsView } from "@/components/views/achievements-view";
import { AIView } from "@/components/views/ai-view";
import { DailyDoseView } from "@/components/views/dailydose-view";
import { FunBrainView } from "@/components/views/funbrain-view";
import { HabitsView } from "@/components/views/habits-view";
import { HomeView } from "@/components/views/home-view";
import { InspirationView } from "@/components/views/inspiration-view";
import { PuzzlesView } from "@/components/views/puzzles-view";
import { WASquadView } from "@/components/views/wasquad-view";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/auth-provider";
import { useGame } from "@/lib/store/game-provider";
import { BrainGymProvider } from "@/lib/brain-gym/hooks/use-brain-gym";
import type { AppView } from "@/lib/types";

function GyanView() {
  return (
    <BrainGymProvider>
      <BrainGymHub />
    </BrainGymProvider>
  );
}

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
};

const PUBLIC_VIEWS = new Set<AppView>(["home"]);

export function AppShell() {
  const { activeView, hydrated, setActiveView } = useGame();
  const { user, loading: authLoading } = useAuth();

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
      <main className="max-w-[1180px] w-full mx-auto px-4 sm:px-7 py-5 sm:py-9 pb-16 sm:pb-[90px]">
        {!hydrated || authLoading ? (
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
