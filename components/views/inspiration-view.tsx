"use client";

import { RoleModelProfile } from "@/components/inspiration/role-model-profile";
import { Card } from "@/components/ui/card";
import { SectionTitle, ViewHeader } from "@/components/ui/modal";
import { useInspirationContent } from "@/lib/content/use-inspiration-content";

export function InspirationView() {
  const data = useInspirationContent();

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
      <RoleModelProfile roleModel={data.roleModel} />

      <SectionTitle>Why study science &amp; math</SectionTitle>
      <Card className="bg-gradient-to-br from-blue/10 to-[var(--surface)] border-blue/25">
        <div className="flex gap-3.5 items-start">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue/10 text-2xl"
            aria-hidden="true"
          >
            {data.didYouKnow.icon}
          </span>
          <div>
            <div className="font-mono text-[10px] text-blue tracking-wider">
              {data.didYouKnow.badge}
            </div>
            <h3 className="font-display font-bold text-[16.5px] mt-1.5 leading-snug">
              {data.didYouKnow.question}
            </h3>
          </div>
        </div>
        <div className="mt-[18px] bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-4 sm:p-5">
          <div className="flex gap-3">
            <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-amber to-pink flex items-center justify-center text-[17px] shrink-0">
              🥧
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-[12.5px] text-amber">
                Answer
              </div>
              <div className="mt-1.5 space-y-1.5 text-[13px] leading-snug text-[var(--text-dim)]">
                {data.didYouKnow.explanation
                  .split(/\n\s*\n/)
                  .map((paragraph) => paragraph.trim())
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index} className="whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--line)] space-y-3">
            <p className="text-[12.5px] leading-relaxed text-[var(--text-dim)]">
              <span className="font-display font-bold text-[var(--text)]">
                Linked concepts:{" "}
              </span>
              {data.didYouKnow.linkedConcepts}
            </p>
            <div className="rounded-xl border border-blue/20 bg-blue/5 px-3.5 py-3">
              <p className="text-[12.5px] leading-relaxed text-[var(--text-dim)]">
                <span className="font-display font-bold text-blue">
                  Follow-up question:{" "}
                </span>
                {data.didYouKnow.followUpQuestion}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
