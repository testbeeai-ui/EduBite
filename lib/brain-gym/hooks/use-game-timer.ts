"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useGameTimer(opts: {
  enabled: boolean;
  paused?: boolean;
  countdownFrom?: number | null;
  onExpire?: () => void;
}) {
  const { enabled, paused = false, countdownFrom = null, onExpire } = opts;
  const [elapsedMs, setElapsedMs] = useState(0);
  const [remaining, setRemaining] = useState(countdownFrom);
  const startRef = useRef<number | null>(null);
  const accRef = useRef(0);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    if (!enabled || paused) {
      if (paused && startRef.current != null) {
        accRef.current += Date.now() - startRef.current;
        startRef.current = null;
      }
      return;
    }
    startRef.current = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now();
      const total = accRef.current + (startRef.current ? now - startRef.current : 0);
      setElapsedMs(total);
      if (countdownFrom != null) {
        const left = Math.max(0, countdownFrom - Math.floor(total / 1000));
        setRemaining(left);
        if (left <= 0) {
          expireRef.current?.();
        }
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [enabled, paused, countdownFrom]);

  const reset = useCallback(() => {
    accRef.current = 0;
    startRef.current = enabled && !paused ? Date.now() : null;
    setElapsedMs(0);
    setRemaining(countdownFrom);
  }, [enabled, paused, countdownFrom]);

  return { elapsedMs, remaining, reset };
}
