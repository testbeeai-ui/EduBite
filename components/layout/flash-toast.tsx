"use client";

import { useEffect, useRef, useState } from "react";
import { resolveNotificationTarget } from "@/lib/notifications";
import { useGame } from "@/lib/store/game-provider";
import type { Notification } from "@/lib/types";

function notificationKey(note: Pick<Notification, "id" | "createdAt">): string {
  return `${note.id}|${note.createdAt ?? ""}`;
}

/**
 * Global floating toast for new inbox notifications.
 * Hides after a few seconds but keeps the item in the burger inbox.
 * Tap opens the linked view (when present).
 */
export function FlashToast() {
  const { state, hydrated, setActiveView, markNotificationRead } = useGame();
  const latest = state.notifications[0] ?? null;
  const [visible, setVisible] = useState<Notification | null>(null);
  /** Keys present right after hydrate finishes — never toast those on reload. */
  const seenAtHydrateRef = useRef<Set<string> | null>(null);
  const toastedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Wait for GameProvider hydrate so we snapshot the real inbox, not [].
    if (!hydrated) {
      seenAtHydrateRef.current = null;
      setVisible(null);
      return;
    }

    const currentKeys = new Set(
      state.notifications.map((note) => notificationKey(note)),
    );

    // First observation after hydrate: snapshot inbox; do not toast persisted items.
    if (seenAtHydrateRef.current === null) {
      seenAtHydrateRef.current = currentKeys;
      for (const key of currentKeys) toastedIdsRef.current.add(key);
      return;
    }

    if (!latest) return;
    // Seeded welcome stays in the burger inbox only — never as a floating toast.
    if (latest.id === "welcome") return;
    if (latest.read) return;

    const toastKey = notificationKey(latest);
    if (toastedIdsRef.current.has(toastKey)) return;
    if (seenAtHydrateRef.current.has(toastKey)) return;

    toastedIdsRef.current.add(toastKey);
    seenAtHydrateRef.current.add(toastKey);
    setVisible(latest);
    const hide = window.setTimeout(() => {
      setVisible((current) => (current?.id === latest.id ? null : current));
    }, 4200);
    return () => window.clearTimeout(hide);
  }, [latest, state.notifications, hydrated]);

  if (!visible || visible.id === "welcome") return null;

  const openLinked = () => {
    const target = resolveNotificationTarget(visible);
    if (target) setActiveView(target);
    markNotificationRead(visible.id);
    setVisible(null);
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[80] w-[min(420px,calc(100%-2rem))] -translate-x-1/2"
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={openLinked}
        className="w-full rounded-2xl border border-purple-500/40 bg-[#141724]/95 px-4 py-3 shadow-2xl shadow-purple-900/40 backdrop-blur-md text-sm text-white flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 text-left cursor-pointer hover:border-teal/50 transition-colors"
      >
        <span className="text-base shrink-0" aria-hidden>
          {visible.icon}
        </span>
        <p className="m-0 leading-snug font-medium text-[13px]">{visible.text}</p>
      </button>
    </div>
  );
}
