"use client";

import { useCallback, useEffect, useRef } from "react";

type Cancel = () => void;

export function usePausableScheduler(paused: boolean): {
  schedule: (callback: () => void, delayMs: number) => Cancel;
  clearAll: () => void;
} {
  const pausedRef = useRef(paused);
  const timersRef = useRef(new Set<number>());

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const clearAll = useCallback(() => {
    for (const timer of timersRef.current) window.clearTimeout(timer);
    timersRef.current.clear();
  }, []);

  const schedule = useCallback((callback: () => void, delayMs: number) => {
    let remaining = Math.max(0, delayMs);
    let lastTick = performance.now();
    let cancelled = false;
    let timer = 0;

    const cancel = () => {
      cancelled = true;
      window.clearTimeout(timer);
      timersRef.current.delete(timer);
    };

    const tick = () => {
      timersRef.current.delete(timer);
      if (cancelled) return;
      const now = performance.now();
      if (!pausedRef.current) remaining -= now - lastTick;
      lastTick = now;
      if (remaining <= 0) {
        callback();
        return;
      }
      timer = window.setTimeout(tick, Math.min(remaining, 50));
      timersRef.current.add(timer);
    };

    timer = window.setTimeout(tick, Math.min(remaining, 50));
    timersRef.current.add(timer);
    return cancel;
  }, []);

  useEffect(() => clearAll, [clearAll]);

  return { schedule, clearAll };
}
