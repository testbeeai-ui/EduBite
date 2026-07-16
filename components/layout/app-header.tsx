"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { AuthHeaderActions } from "@/components/layout/auth-header";
import { BurgerPanel } from "@/components/layout/burger-panel";
import { TopNav } from "@/components/layout/top-nav";
import { useGame } from "@/lib/store/game-provider";
import type { AppView } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { state, activeView, setActiveView } = useGame();
  const [burgerOpen, setBurgerOpen] = useState(false);

  const navigate = (view: AppView) => {
    setActiveView(view);
    setBurgerOpen(false);
  };

  useEffect(() => {
    if (!burgerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBurgerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [burgerOpen]);

  return (
    <header className="sticky top-0 z-50 bg-[rgba(11,13,18,0.9)] backdrop-blur-[14px] border-b border-[var(--line)]">
      <div
        className={cn(
          "max-w-[1400px] mx-auto flex items-center gap-2 sm:gap-3",
          "px-3 sm:px-5 lg:px-6 py-2.5 sm:py-[11px]",
        )}
      >
        <button
          type="button"
          aria-label={burgerOpen ? "Close menu" : "Open menu"}
          aria-expanded={burgerOpen}
          onClick={() => setBurgerOpen((o) => !o)}
          className={cn(
            "w-9 h-9 rounded-[10px] bg-[var(--surface)] border border-[var(--line)]",
            "flex items-center justify-center shrink-0 transition-colors",
            "hover:border-teal",
            // Always available — primary nav on phone; overflow/account on desktop
            burgerOpen && "border-teal/40 ring-1 ring-teal/20",
          )}
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => navigate("home")}
          className="font-display font-extrabold text-[16px] sm:text-[16.5px] tracking-tight shrink-0 bg-gradient-to-r from-[#F6F7FB] from-55% to-teal bg-clip-text text-transparent"
        >
          Edu<span className="text-teal">bite</span>
        </button>

        <TopNav activeView={activeView} onNavigate={navigate} />

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <AuthHeaderActions streak={state.streak} />
        </div>
      </div>

      <BurgerPanel
        open={burgerOpen}
        onClose={() => setBurgerOpen(false)}
        activeView={activeView}
        onNavigate={navigate}
      />
    </header>
  );
}
