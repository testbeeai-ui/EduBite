"use client";

import { useEffect, useState } from "react";
import {
  DAILY_DOSE_QUESTIONS_11,
  DAILY_DOSE_QUESTIONS_12,
  FUNBRAIN_POOL,
} from "@/data/questions";
import { FUNBRAIN_QUESTIONS_PER_DAY, stripFunBrainBankLabel } from "@/lib/content/schedule";
import type { Question } from "@/lib/types";
import { todayKey } from "@/lib/utils";

function mapStaticFunBrain(): Question[] {
  return FUNBRAIN_POOL.map((q) => ({
    ...q,
    tag: "",
    q: stripFunBrainBankLabel(q.q),
  })).slice(0, FUNBRAIN_QUESTIONS_PER_DAY);
}

export type TodayContent = {
  dateKey: string;
  scheduleDate: string;
  dailydose11: Question[];
  dailydose12: Question[];
  funbrain: Question[];
  doseSource11: "db" | "static";
  doseSource12: "db" | "static";
  funbrainSource: "db" | "static";
  loading: boolean;
};

/** Shared across DailyDose / FunBrain mounts so class switches & view hops never flash static banks. */
let cachedToday: TodayContent | null = null;
let inflight: Promise<TodayContent> | null = null;

const emptyLoading: TodayContent = {
  dateKey: todayKey(),
  scheduleDate: todayKey(),
  dailydose11: [],
  dailydose12: [],
  funbrain: [],
  doseSource11: "static",
  doseSource12: "static",
  funbrainSource: "static",
  loading: true,
};

async function fetchTodayContent(): Promise<TodayContent> {
  try {
    const res = await fetch("/api/content/today", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("content fetch failed");
    const data = (await res.json()) as {
      dateKey: string;
      scheduleDate?: string;
      dailydose11: { source: "db" | "static"; questions: Question[] };
      dailydose12: { source: "db" | "static"; questions: Question[] };
      funbrain: { source: "db" | "static"; questions: Question[] };
    };

    return {
      dateKey: data.dateKey,
      scheduleDate: data.scheduleDate ?? data.dateKey,
      dailydose11:
        data.dailydose11.questions.length > 0
          ? data.dailydose11.questions
          : DAILY_DOSE_QUESTIONS_11,
      dailydose12:
        data.dailydose12.questions.length > 0
          ? data.dailydose12.questions
          : DAILY_DOSE_QUESTIONS_12,
      funbrain:
        data.funbrain.questions.length > 0
          ? data.funbrain.questions.slice(0, FUNBRAIN_QUESTIONS_PER_DAY)
          : mapStaticFunBrain(),
      doseSource11: data.dailydose11.source,
      doseSource12: data.dailydose12.source,
      funbrainSource: data.funbrain.source,
      loading: false,
    };
  } catch {
    return {
      dateKey: todayKey(),
      scheduleDate: todayKey(),
      dailydose11: DAILY_DOSE_QUESTIONS_11,
      dailydose12: DAILY_DOSE_QUESTIONS_12,
      funbrain: mapStaticFunBrain(),
      doseSource11: "static",
      doseSource12: "static",
      funbrainSource: "static",
      loading: false,
    };
  }
}

function loadTodayContent(): Promise<TodayContent> {
  if (cachedToday && !cachedToday.loading) {
    return Promise.resolve(cachedToday);
  }
  if (!inflight) {
    inflight = fetchTodayContent().then((next) => {
      cachedToday = next;
      inflight = null;
      return next;
    });
  }
  return inflight;
}

export function useTodayContent(): TodayContent {
  const [state, setState] = useState<TodayContent>(
    () => cachedToday ?? emptyLoading,
  );

  useEffect(() => {
    let cancelled = false;
    if (cachedToday && !cachedToday.loading) {
      setState(cachedToday);
      return;
    }
    void loadTodayContent().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
