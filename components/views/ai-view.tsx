"use client";

import { AI_RESOURCES, PLEDGE_AM, PLEDGE_PM } from "@/data/pledges";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionTitle, ViewHeader } from "@/components/ui/modal";
import { useGame } from "@/lib/store/game-provider";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

export function AIView() {
  const { state, openPledgeModal, openReel, withAuth } = useGame();

  return (
    <div>
      <ViewHeader
        eyebrow="Integrity layer"
        title="AI — Use It to Learn, Not to Skip Learning"
        subtitle="Morning and night pledges — open either anytime. Each plays a 60-second reel for today."
      />

      <Card className="flex gap-4 items-start mb-2">
        <span className="text-[26px]">🤖</span>
        <p className="text-[13.5px] text-[var(--text-dim)] leading-relaxed">
          AI can explain a concept beautifully — but if it&apos;s doing the thinking{" "}
          <em>for</em> you, the exam is where that gap shows up. Growing research links
          heavy AI reliance to weaker independent reasoning, especially in students. The
          two pledges below are a daily checkpoint, not a restriction: use AI to understand,
          never to skip the struggle that builds the skill.
        </p>
      </Card>

      <SectionTitle>Today&apos;s pledges</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
        <PledgeCard
          type="am"
          emoji="🌅"
          meta={PLEDGE_AM.time}
          title={PLEDGE_AM.title}
          quote={PLEDGE_AM.quote}
          signed={state.pledgeAM}
          buttonLabel={PLEDGE_AM.buttonLabel}
          onSign={() => openPledgeModal("am")}
          onWatchReel={() => openReel("am")}
        />
        <PledgeCard
          type="pm"
          emoji="🌙"
          meta={PLEDGE_PM.time}
          title={PLEDGE_PM.title}
          quote={PLEDGE_PM.quote}
          signed={state.pledgePM}
          buttonLabel={PLEDGE_PM.buttonLabel}
          onSign={() => openPledgeModal("pm")}
          onWatchReel={() => openReel("pm")}
        />
      </div>

      <SectionTitle>The research on AI overuse</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
        {AI_RESOURCES.map((r) => (
          <button
            key={r.url}
            type="button"
            onClick={() =>
              withAuth(() => window.open(r.url, "_blank", "noopener,noreferrer"))
            }
            className="group text-left w-full"
          >
            <Card className="flex gap-3.5 items-start h-full hover:border-teal/30 transition-colors">
              <div className="w-[38px] h-[38px] rounded-[11px] bg-[var(--surface-2)] flex items-center justify-center text-base shrink-0">
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-[13.5px]">{r.title}</div>
                <div className="font-mono text-[10px] text-teal mt-0.5 uppercase">
                  {r.src}
                </div>
                <p className="text-[11.5px] text-[var(--text-dim)] mt-1 leading-relaxed">
                  {r.desc}
                </p>
              </div>
              <span className="text-[var(--text-dim)] group-hover:text-teal shrink-0">↗</span>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

function PledgeCard({
  type,
  emoji,
  meta,
  title,
  quote,
  signed,
  buttonLabel,
  onSign,
  onWatchReel,
}: {
  type: "am" | "pm";
  emoji: string;
  meta: string;
  title: string;
  quote: string;
  signed: boolean;
  buttonLabel: string;
  onSign: () => void;
  onWatchReel: () => void;
}) {
  const { resetPledge } = useGame();

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        type === "am" && "border-amber/30",
        type === "pm" && "border-purple/30",
      )}
    >
      {signed && (
        <button
          type="button"
          onClick={() => resetPledge(type)}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--surface-2)] text-[var(--text-dim)] hover:text-red-400 transition-colors cursor-pointer z-10"
          title="Reset Pledge"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="text-[26px]">{emoji}</div>
      <div className="font-mono text-[10.5px] text-[var(--text-dim)] mt-2 tracking-wide">
        {meta}
      </div>
      <div className="font-mono text-[10px] text-teal mt-1 tracking-wide">
        Available anytime · today&apos;s reel
      </div>
      <div className="font-display font-bold text-[15.5px] mt-1">{title}</div>
      <blockquote
        className={cn(
          "mt-3 text-[12.5px] leading-relaxed italic bg-[var(--surface-2)] border border-[var(--line)] rounded-[10px] px-3 py-3 border-l-[3px]",
          type === "am" && "border-l-amber",
          type === "pm" && "border-l-purple",
        )}
      >
        &ldquo;{quote}&rdquo;
      </blockquote>
      {!signed ? (
        <Button variant={type} block className="mt-4" onClick={onSign}>
          {buttonLabel}
        </Button>
      ) : (
        <div className="flex flex-col gap-2 mt-4">
          <div className="font-mono text-[11px] text-teal">✓ Signed for today</div>
          <Button variant={type} block onClick={onWatchReel}>
            Watch today&apos;s reel →
          </Button>
        </div>
      )}
    </Card>
  );
}
