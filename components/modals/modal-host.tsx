"use client";

import { useEffect, useState } from "react";
import { PLEDGE_AM, PLEDGE_PM } from "@/data/pledges";
import { REEL_DURATION_SEC } from "@/data/config";
import { Button } from "@/components/ui/button";
import { ModalCard, ModalOverlay } from "@/components/ui/modal";
import { useGame } from "@/lib/store/game-provider";
import type { PledgeType } from "@/lib/types";
import { formatTime } from "@/lib/utils";

type PledgeReelSlide = {
  icon: string;
  headline: string;
  emphasisWord: string;
  caption: string;
};

type PledgeReelDay = {
  day: number;
  theme: string;
  slides: PledgeReelSlide[];
};

const pledgeReelCache = new Map<string, PledgeReelDay>();

function pledgeCacheKey(joinedDate: string, slot: "am" | "pm"): string {
  return `${joinedDate}:${slot}`;
}

function renderPledgeHeadline(
  headline: string,
  emphasisWord: string,
): { before: string; emphasis: string; after: string } {
  if (!emphasisWord) {
    return { before: headline, emphasis: "", after: "" };
  }
  const lowerHeadline = headline.toLowerCase();
  const lowerWord = emphasisWord.toLowerCase();
  const idx = lowerHeadline.indexOf(lowerWord);
  if (idx === -1) {
    return { before: headline, emphasis: "", after: "" };
  }
  return {
    before: headline.slice(0, idx),
    emphasis: headline.slice(idx, idx + emphasisWord.length),
    after: headline.slice(idx + emphasisWord.length),
  };
}

export function ModalHost() {
  const {
    modal,
    closePledgeModal,
    openReel,
    closeReel,
    completePledge,
  } = useGame();

  return (
    <>
      <PledgeSignModal
        type="am"
        open={modal.pledge === "am"}
        onClose={closePledgeModal}
        onConfirm={() => {
          // Open reel in one step — do not call completePledge here
          // (it was clearing reel: null and racing openReel).
          openReel("am");
        }}
      />
      <PledgeSignModal
        type="pm"
        open={modal.pledge === "pm"}
        onClose={closePledgeModal}
        onConfirm={() => {
          openReel("pm");
        }}
      />
      <IntegrityReelModal
        type={modal.reel}
        open={modal.reel !== null}
        onClose={closeReel}
        onComplete={() => {
          if (modal.reel) completePledge(modal.reel);
        }}
        onSignWithoutReel={() => {
          if (modal.reel) completePledge(modal.reel);
        }}
      />
    </>
  );
}

function PledgeSignModal({
  type,
  open,
  onClose,
  onConfirm,
}: {
  type: PledgeType;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [checked, setChecked] = useState(true);
  const config = type === "am" ? PLEDGE_AM : PLEDGE_PM;

  useEffect(() => {
    if (open) setChecked(true);
  }, [open]);

  const handleSignClick = () => {
    if (!checked) setChecked(true);
    onConfirm();
  };

  return (
    <ModalOverlay open={open} onClose={onClose}>
      <ModalCard accent={type}>
        <div className="text-[30px]">{type === "am" ? "🌅" : "🌙"}</div>
        <div className="font-mono text-[11px] text-[var(--text-dim)] mt-2.5 tracking-wide">
          {type === "am" ? "8:00 AM · DAILY PLEDGE" : "10:00 PM · DAILY PLEDGE"}
        </div>
        <h2 className="font-display font-bold text-lg mt-1.5">{config.modalTitle}</h2>
        <blockquote
          className={`mt-4 text-[13.5px] leading-relaxed italic bg-[var(--surface-2)] border border-[var(--line)] rounded-[10px] px-3.5 py-3.5 border-l-[3px] ${type === "am" ? "border-l-amber" : "border-l-purple"}`}
        >
          &ldquo;{config.quote}&rdquo;
        </blockquote>
        <label className="flex items-center gap-2.5 mt-4 text-[12.5px] text-[var(--text-dim)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className={`w-[17px] h-[17px] cursor-pointer ${type === "am" ? "accent-amber" : "accent-purple"}`}
          />
          I have read and mean this pledge
        </label>
        <div className="flex flex-col gap-2 mt-5">
          <Button variant={type} onClick={handleSignClick}>
            {config.buttonLabel}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Not now
          </Button>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}

function IntegrityReelModal({
  type,
  open,
  onClose,
  onComplete,
  onSignWithoutReel,
}: {
  type: PledgeType | null;
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSignWithoutReel: () => void;
}) {
  const { state } = useGame();
  const slot = type === "am" ? "am" : "pm";
  const [elapsed, setElapsed] = useState(0);
  const [reelDay, setReelDay] = useState<PledgeReelDay | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const total = REEL_DURATION_SEC;

  useEffect(() => {
    if (!open || !type) {
      setElapsed(0);
      setReelDay(null);
      setLoadFailed(false);
      return;
    }

    setElapsed(0);
    setReelDay(null);
    setLoadFailed(false);
    let cancelled = false;

    const cacheKey = pledgeCacheKey(state.joinedDate, slot);
    const cached = pledgeReelCache.get(cacheKey);
    if (cached?.slides?.length === 4) {
      setReelDay(cached);
      return;
    }

    void (async () => {
      try {
        const res = await fetch(
          `/api/content/pledge-reel?joinedDate=${encodeURIComponent(state.joinedDate)}&slot=${slot}`,
          { credentials: "include" },
        );
        if (!res.ok) throw new Error("Pledge reel request failed");
        const data = (await res.json()) as { reel?: PledgeReelDay };
        if (!cancelled && data.reel?.slides?.length === 4) {
          pledgeReelCache.set(cacheKey, data.reel);
          setReelDay(data.reel);
          return;
        }
        if (!cancelled) setLoadFailed(true);
      } catch {
        if (!cancelled) setLoadFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, type, state.joinedDate, slot]);

  useEffect(() => {
    if (!open || !reelDay) return;

    const id = window.setInterval(() => {
      setElapsed((e) => Math.min(total, e + 1));
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [open, reelDay, total]);

  if (!type) return null;

  if (!reelDay) {
    return (
      <ModalOverlay open={open} onClose={onClose}>
        <div className="w-full max-w-[340px] mx-auto rounded-[22px] overflow-hidden bg-gradient-to-b from-[#1a1030] to-[#05070B] border border-[var(--line)]">
          <div className="min-h-[300px] flex flex-col items-center justify-center px-8 text-center">
            <h2 className="font-display font-extrabold text-[21px]">
              {loadFailed ? "Couldn’t load today’s pledge" : "Loading today’s pledge…"}
            </h2>
            <p className="text-[12.5px] text-[var(--text-dim)] mt-3 leading-relaxed">
              {loadFailed
                ? "You can still sign the pledge, or close and try again."
                : "Getting the correct day for you."}
            </p>
            {loadFailed && (
              <div className="flex flex-col gap-2 mt-5 w-full">
                <Button variant={type} onClick={onSignWithoutReel}>
                  Sign pledge anyway →
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      </ModalOverlay>
    );
  }

  const segmentSec = total / 4;
  const done = elapsed >= total;
  const slideIndex = Math.min(3, Math.floor(elapsed / segmentSec));
  const slide = reelDay.slides[slideIndex] ?? reelDay.slides[0]!;
  const headline = renderPledgeHeadline(slide.headline, slide.emphasisWord);
  const pct = elapsed / total;
  const segFill = (idx: number) => {
    const segIndex = Math.min(3, Math.floor(pct * 4));
    const fill = (pct * 4 - segIndex) * 100;
    if (idx < segIndex) return 100;
    if (idx === segIndex) return fill;
    return 0;
  };

  return (
    <ModalOverlay open={open} onClose={onClose}>
      <div className="w-full max-w-[340px] mx-auto rounded-[22px] overflow-hidden bg-gradient-to-b from-[#1a1030] to-[#05070B] border border-[var(--line)]">
        <div className="flex gap-1 px-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 h-[3px] rounded-sm bg-white/20 overflow-hidden">
              <div
                className="h-full bg-[var(--text)] transition-[width] duration-200 linear"
                style={{ width: `${segFill(i)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center px-4 pt-3 font-mono text-[10.5px] text-[var(--text-dim)]">
          <span>
            🔇 Day {reelDay.day} · {reelDay.theme}
          </span>
          <span>{total - elapsed}</span>
        </div>
        <div className="px-8 pt-[60px] pb-5 text-center">
          <div className="text-[42px]">{slide.icon}</div>
          <h2 className="font-display font-extrabold text-[21px] mt-4 leading-snug">
            {headline.emphasis ? (
              <>
                {headline.before}
                <em className="text-pink not-italic">{headline.emphasis}</em>
                {headline.after}
              </>
            ) : (
              headline.before
            )}
          </h2>
          <p className="text-[12.5px] text-[var(--text-dim)] mt-3 leading-relaxed">
            {slide.caption}
          </p>
        </div>
        <div className="text-center font-mono text-xs text-[var(--text-dim)]">
          {formatTime(elapsed)} / 0:60
        </div>
        <div className="p-4">
          <Button
            variant="ghost"
            block
            disabled={!done}
            onClick={onComplete}
          >
            {done ? "Continue → mark pledge signed" : "Skip locked — keep watching"}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
}
