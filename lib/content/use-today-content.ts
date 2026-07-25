"use client";

import { useEffect, useState } from "react";
import {
  DAILY_DOSE_QUESTIONS_11,
  DAILY_DOSE_QUESTIONS_12,
  FUNBRAIN_POOL,
} from "@/data/questions";
import {
  FUNBRAIN_QUESTIONS_PER_DAY,
  ensureFunBrainQuestionCount,
  stripFunBrainBankLabel,
} from "@/lib/content/schedule";
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

/** Shared across DailyDose / FunBrain mounts — keyed by App Clock date. */
let cachedToday: TodayContent | null = null;
let inflightKey: string | null = null;
let inflight: Promise<TodayContent> | null = null;

function emptyLoading(dateKey: string): TodayContent {
  return {
    dateKey,
    scheduleDate: dateKey,
    dailydose11: [],
    dailydose12: [],
    funbrain: [],
    doseSource11: "static",
    doseSource12: "static",
    funbrainSource: "static",
    loading: true,
  };
}

async function fetchTodayContent(dateKey: string): Promise<TodayContent> {
  try {
    const res = await fetch(
      `/api/content/today?dateKey=${encodeURIComponent(dateKey)}`,
      { credentials: "include" },
    );
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
          ? ensureFunBrainQuestionCount(
              data.funbrain.questions,
              mapStaticFunBrain(),
              FUNBRAIN_QUESTIONS_PER_DAY,
            )
          : mapStaticFunBrain(),
      doseSource11: data.dailydose11.source,
      doseSource12: data.dailydose12.source,
      funbrainSource: data.funbrain.source,
      loading: false,
    };
  } catch {
    return {
      dateKey,
      scheduleDate: dateKey,
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

function loadTodayContent(dateKey: string): Promise<TodayContent> {
  if (cachedToday && !cachedToday.loading && cachedToday.dateKey === dateKey) {
    return Promise.resolve(cachedToday);
  }
  if (inflight && inflightKey === dateKey) {
    return inflight;
  }
  inflightKey = dateKey;
  inflight = fetchTodayContent(dateKey).then((next) => {
    cachedToday = next;
    inflight = null;
    inflightKey = null;
    return next;
  });
  return inflight;
}

export function useTodayContent(): TodayContent {
  const dateKey = todayKey();
  const [state, setState] = useState<TodayContent>(() => {
    if (cachedToday && cachedToday.dateKey === dateKey) return cachedToday;
    return emptyLoading(dateKey);
  });

  useEffect(() => {
    let cancelled = false;
    if (cachedToday && !cachedToday.loading && cachedToday.dateKey === dateKey) {
      setState(cachedToday);
      return;
    }
    setState(emptyLoading(dateKey));
    void loadTodayContent(dateKey).then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [dateKey]);

  return state;
}
