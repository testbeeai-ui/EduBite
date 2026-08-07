"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, X } from "lucide-react";
import { useGame } from "@/lib/store/game-provider";
import { resolveNotificationTarget } from "@/lib/notifications";
import type { AppView } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
}

export function NotificationsPanel({
  open,
  onClose,
  onNavigate,
}: NotificationsPanelProps) {
  const { state, markNotificationRead, clearNotification } = useGame();
  const notes = state.notifications;
  const unreadCount = notes.filter((n) => !n.read).length;

  const openNote = (id: string, targetView?: AppView) => {
    markNotificationRead(id);
    onClose();
    if (targetView) {
      onNavigate(targetView);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-[210] bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
            className={cn(
              "fixed z-[220] flex flex-col",
              "top-0 right-0 h-dvh w-[min(380px,92vw)]",
              "bg-[var(--surface)] border-l border-[var(--line)]",
              "shadow-[0_24px_60px_rgba(0,0,0,0.55)]",
            )}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-[var(--line)]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal/15 text-teal">
                  <Bell className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="font-display font-bold text-sm">
                    Notifications
                  </div>
                  <div className="text-[11px] text-[var(--text-dim)]">
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : notes.length > 0
                        ? "All caught up"
                        : "Nothing new yet"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close notifications"
                onClick={onClose}
                className="w-8 h-8 rounded-[9px] border border-[var(--line)] bg-[var(--bg)]/40 flex items-center justify-center hover:border-teal transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notes.length === 0 ? (
                <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)]/30 px-4 py-8 text-center">
                  <p className="m-0 text-[13px] text-[var(--text-dim)]">
                    No notifications yet. Study activity and challenge updates
                    will show up here.
                  </p>
                </div>
              ) : (
                notes.map((n) => {
                  const target = resolveNotificationTarget(n);
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        "rounded-xl border overflow-hidden",
                        n.read
                          ? "border-[var(--line)] bg-[var(--bg)]/20"
                          : "border-teal/30 bg-teal/[0.08]",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => openNote(n.id, target)}
                        className="w-full text-left px-3.5 py-3 hover:bg-white/[0.04] transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-base shrink-0 mt-0.5" aria-hidden>
                            {n.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "m-0 text-[13px] leading-snug font-medium",
                                n.read
                                  ? "text-[var(--text-dim)]"
                                  : "text-[var(--text)]",
                              )}
                            >
                              {n.text}
                            </p>
                            <span className="mt-1.5 inline-flex text-[10px] font-mono uppercase tracking-[0.08em] text-teal">
                              {target ? "Tap to open →" : "Mark as read"}
                            </span>
                          </div>
                          {!n.read ? (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-pink" />
                          ) : null}
                        </div>
                      </button>
                      <div className="flex border-t border-[var(--line)]">
                        <button
                          type="button"
                          onClick={() => openNote(n.id, target)}
                          className="flex-1 px-3 py-2 text-[11px] font-semibold text-teal hover:bg-teal/[0.08]"
                        >
                          {target ? "Open" : "Mark as read"}
                        </button>
                        <button
                          type="button"
                          onClick={() => clearNotification(n.id)}
                          className="flex-1 px-3 py-2 text-[11px] font-semibold text-[var(--text-dim)] hover:text-pink hover:bg-pink/[0.08] border-l border-[var(--line)]"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
