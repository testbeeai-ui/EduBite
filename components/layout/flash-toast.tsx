"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/lib/store/game-provider";
import type { Notification } from "@/lib/types";

/**
 * Floating toast for challenge enroll — only mounted on the Monthly Challenge page.
 */
export function FlashToast() {
  const { state, clearNotification } = useGame();
  const latest = state.notifications[0] ?? null;
  const [visible, setVisible] = useState<Notification | null>(null);

  useEffect(() => {
    if (!latest) return;
    if (
      latest.id !== "challenge-enroll" &&
      !latest.id.startsWith("challenge-")
    ) {
      return;
    }
    setVisible(latest);
    const hide = window.setTimeout(() => {
      setVisible(null);
      clearNotification(latest.id);
    }, 4200);
    return () => window.clearTimeout(hide);
  }, [latest, clearNotification]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[80] w-[min(420px,calc(100%-2rem))] -translate-x-1/2 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-2xl border border-purple-500/40 bg-[#141724]/95 px-4 py-3 shadow-2xl shadow-purple-900/40 backdrop-blur-md text-sm text-white flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <span className="text-base shrink-0" aria-hidden>
          {visible.icon}
        </span>
        <p className="m-0 leading-snug font-medium text-[13px]">{visible.text}</p>
      </div>
    </div>
  );
}
