"use client";

import { useEffect, useState } from "react";
import { QUOTES, ROLE_MODEL, DID_YOU_KNOW } from "@/data/inspiration";
import { Card } from "@/components/ui/card";
import { SectionTitle, ViewHeader } from "@/components/ui/modal";
import { getDayOfYearQuoteIndex } from "@/lib/utils";

type InspirationState = {
  quote: string;
  roleModel: typeof ROLE_MODEL;
  didYouKnow: typeof DID_YOU_KNOW;
};

export function InspirationView() {
  const [data, setData] = useState<InspirationState>({
    quote: QUOTES[getDayOfYearQuoteIndex(QUOTES.length)] ?? QUOTES[0]!,
    roleModel: ROLE_MODEL,
    didYouKnow: DID_YOU_KNOW,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/content/inspiration", {
          credentials: "include",
        });
        if (!res.ok) return;
        const json = (await res.json()) as InspirationState & {
          source?: string;
        };
        if (cancelled || !json.quote) return;
        setData({
          quote: json.quote,
          roleModel: json.roleModel ?? ROLE_MODEL,
          didYouKnow: json.didYouKnow ?? DID_YOU_KNOW,
        });
      } catch {
        // keep static
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <ViewHeader
        eyebrow="Fuel for the streak"
        title="Inspiration"
        subtitle='A quote, a role model, and one "did you know" a day — the why behind the daily bite.'
      />

      <Card className="text-center py-10 px-8 bg-gradient-to-br from-[rgba(232,196,104,0.1)] to-[var(--surface)] border-[rgba(232,196,104,0.25)]">
        <div className="font-display text-[40px] text-[var(--gold)] leading-none">&ldquo;</div>
        <p className="font-display font-semibold text-[19px] leading-snug mt-2 max-w-lg mx-auto">
          {data.quote}
        </p>
        <div className="font-mono text-[11px] text-[var(--text-dim)] mt-4 tracking-wide">
          QUOTE OF THE DAY
        </div>
      </Card>

      <SectionTitle>Inspiring role model</SectionTitle>
      <Card className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
        <div className="w-[78px] h-[78px] rounded-[20px] shrink-0 text-[32px] bg-gradient-to-br from-purple to-blue flex items-center justify-center">
          {data.roleModel.avatar}
        </div>
        <div className="text-center sm:text-left">
          <div className="font-display font-bold text-[17px]">{data.roleModel.name}</div>
          <div className="font-mono text-[10.5px] text-teal mt-0.5">{data.roleModel.tag}</div>
          <p className="text-[12.5px] text-[var(--text-dim)] mt-2 leading-relaxed">
            {data.roleModel.bio}
          </p>
        </div>
      </Card>

      <SectionTitle>Why study science &amp; math</SectionTitle>
      <Card className="bg-gradient-to-br from-blue/10 to-[var(--surface)] border-blue/25">
        <div className="flex gap-3.5 items-start">
          <span className="text-2xl">{data.didYouKnow.icon}</span>
          <div>
            <div className="font-mono text-[10px] text-blue tracking-wider">
              {data.didYouKnow.badge}
            </div>
            <h3 className="font-display font-bold text-[16.5px] mt-1.5 leading-snug">
              {data.didYouKnow.question}
            </h3>
          </div>
        </div>
        <div className="flex gap-3 mt-[18px] bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-4">
          <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-amber to-pink flex items-center justify-center text-[17px] shrink-0">
            🥧
          </div>
          <div>
            <div className="font-display font-bold text-[12.5px] text-amber">
              Prof Pi explains
            </div>
            <p className="text-[13px] text-[var(--text-dim)] mt-1 leading-relaxed">
              {data.didYouKnow.explanation}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
