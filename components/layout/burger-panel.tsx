"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { NAV_ITEMS } from "@/data/config";
import { NavEmoji } from "@/components/layout/top-nav";
import { useAuth } from "@/lib/auth/auth-provider";
import { useGame } from "@/lib/store/game-provider";
import type { AppView } from "@/lib/types";
import { cn, formatRdm } from "@/lib/utils";

interface BurgerPanelProps {
  open: boolean;
  onClose: () => void;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

export function BurgerPanel({
  open,
  onClose,
  activeView,
  onNavigate,
}: BurgerPanelProps) {
  const { state, levelInfo } = useGame();
  const { user, loading, openLogin, signOut } = useAuth();
  const signedIn = Boolean(user);
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    levelInfo.current.name;
  const initial = (displayName[0] ?? "?").toUpperCase();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[55] bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className={cn(
              "fixed z-[60] flex flex-col",
              "top-0 left-0 h-dvh w-[min(320px,88vw)]",
              "bg-[var(--surface)] border-r border-[var(--line)]",
              "shadow-[0_24px_60px_rgba(0,0,0,0.55)]",
            )}
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-[var(--line)]">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-pink flex items-center justify-center font-display font-bold text-[15px] shrink-0",
                    !signedIn && "opacity-50",
                  )}
                >
                  {signedIn ? initial : "?"}
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-sm truncate">
                    {loading ? "…" : signedIn ? displayName : "Signed out"}
                  </div>
                  <div className="text-[11px] text-[var(--text-dim)] mt-px">
                    Edubite · Level {levelInfo.current.level}
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="w-8 h-8 rounded-[9px] border border-[var(--line)] bg-[var(--bg)]/40 flex items-center justify-center hover:border-teal transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav
              aria-label="App sections"
              className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5"
            >
              <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
                Navigate
              </p>
              {NAV_ITEMS.map((item) => {
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => onNavigate(item.id as AppView)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                      active
                        ? "bg-teal/[0.1] border border-teal/25 text-[var(--text)]"
                        : "border border-transparent text-[var(--text-dim)] hover:bg-white/[0.04] hover:text-[var(--text)]",
                    )}
                  >
                    <NavEmoji
                      emoji={item.emoji}
                      accent={item.accent}
                      active={active}
                      size="sm"
                    />
                    <span className="font-display font-semibold text-sm">
                      {item.label}
                    </span>
                    {active ? (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal" />
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-[var(--line)] p-2 space-y-0.5">
              <div className="flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl">
                <div className="flex items-center gap-2.5 text-[13px] font-semibold">
                  <span>◆</span> RDM balance
                </div>
                <div className="font-mono font-bold text-teal text-sm">
                  {formatRdm(state.rdm)}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl">
                <div className="flex items-center gap-2.5 text-[13px] font-semibold">
                  <span>🔔</span> Notifications
                </div>
                <span className="bg-pink text-white font-mono text-[10px] font-bold px-[7px] py-0.5 rounded-full">
                  {state.notifications.length}
                </span>
              </div>

              {state.notifications.length > 0 ? (
                <div className="px-3 pb-1 max-h-28 overflow-y-auto">
                  {state.notifications.map((n) => (
                    <div
                      key={n.id}
                      className="text-[11.5px] text-[var(--text-dim)] py-[7px] border-t border-[var(--line)] first:border-t-0"
                    >
                      {n.icon} {n.text}
                    </div>
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  if (signedIn) {
                    void signOut();
                    onClose();
                    return;
                  }
                  openLogin();
                  onClose();
                }}
                className="w-full text-left px-3 py-3 rounded-xl text-[13px] font-semibold text-pink hover:bg-pink/[0.08]"
              >
                {signedIn ? "Sign out" : "Sign in"}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
