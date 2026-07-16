"use client";

import { WA_SQUAD } from "@/data/config";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ViewHeader } from "@/components/ui/modal";
import { useGame } from "@/lib/store/game-provider";

const PERKS = [
  { icon: "💡", title: "Daily tips & tricks", desc: "exam shortcuts shared every morning" },
  { icon: "🎓", title: "Free courses & strategies", desc: "drops from top rankers, no cost" },
  { icon: "🏆", title: "Challenge jackpots", desc: "weekly cash & badge prize pools" },
];

export function WASquadView() {
  const { withAuth } = useGame();

  return (
    <div>
      <ViewHeader
        eyebrow="Function 04"
        title="WhatsApp Squad"
        subtitle="The habit's home outside the app — tips, free courses, and weekly challenge jackpots."
      />

      <Card className="text-center py-9 px-5 bg-gradient-to-br from-[rgba(37,211,102,0.2)] to-[var(--surface)]">
        <div className="font-mono text-[11px] text-[var(--wa)]">
          THIS WEEK&apos;S CHALLENGE JACKPOT
        </div>
        <div className="font-mono font-bold text-[40px] text-[var(--wa)] mt-2">
          {WA_SQUAD.jackpotAmount}
        </div>
        <p className="text-[12.5px] text-[var(--text-dim)] mt-1.5">
          Top streak in the group wins the pot Sunday 9PM
        </p>
      </Card>

      <Card className="mt-4">
        {PERKS.map((p) => (
          <div key={p.title} className="flex gap-2.5 items-start text-[13.5px] text-[var(--text-dim)] mt-3 first:mt-0">
            <span>{p.icon}</span>
            <span>
              <b className="text-[var(--text)] font-semibold">{p.title}</b> — {p.desc}
            </span>
          </div>
        ))}
      </Card>

      <Button
        variant="wa"
        block
        className="mt-[18px]"
        onClick={() =>
          withAuth(() => window.open(WA_SQUAD.joinUrl, "_blank", "noopener,noreferrer"))
        }
      >
        Join the WhatsApp squad →
      </Button>

      <p className="text-[11px] text-[var(--text-dim)] mt-3 text-center">
        Backend integration placeholder — group invite will sync with your account later.
      </p>
    </div>
  );
}
