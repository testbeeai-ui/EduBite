"use client";

import { Button } from "@/components/ui/button";
import { ModalCard, ModalOverlay } from "@/components/ui/modal";

interface LoginModalProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onGoogle: () => void;
}

export function LoginModal({ open, loading, onClose, onGoogle }: LoginModalProps) {
  return (
    <ModalOverlay open={open} onClose={onClose}>
      <ModalCard>
        <div className="text-[28px]" aria-hidden>
          🔐
        </div>
        <div className="font-mono text-[11px] text-[var(--text-dim)] mt-2.5 tracking-wide">
          EDUBITE · SAME ACCOUNT AS EDUBLAST
        </div>
        <h2 className="font-display font-bold text-lg mt-1.5">Sign in to continue</h2>
        <p className="text-[13px] text-[var(--text-dim)] mt-2 leading-relaxed">
          DailyDose, FunBrain, Habits, WA Squad, AI pledges, and more need your Edublast
          Google account. One login — same profile across both apps.
        </p>
        <div className="flex flex-col gap-2 mt-5">
          <Button variant="primary" block disabled={loading} onClick={onGoogle}>
            {loading ? "Opening Google…" : "Continue with Google"}
          </Button>
          <Button variant="ghost" block onClick={onClose} disabled={loading}>
            Not now
          </Button>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}
