"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalCard, ModalOverlay } from "@/components/ui/modal";

interface LoginModalProps {
  open: boolean;
  loading: boolean;
  error?: string | null;
  onClose: () => void;
  onGoogle: () => void;
}

export function LoginModal({
  open,
  loading,
  error,
  onClose,
  onGoogle,
}: LoginModalProps) {
  return (
    <ModalOverlay open={open} onClose={onClose}>
      <ModalCard className="bg-[#141824] border border-teal/40 shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative">
        <div className="flex items-center justify-between">
          <div className="text-3xl" aria-hidden>
            🔐
          </div>
          <button
            type="button"
            aria-label="Close login dialog"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="font-mono text-[11px] text-amber-400 font-semibold mt-3 tracking-wider uppercase">
          EDUBITE · SAME ACCOUNT AS EDUBLAST
        </div>

        <h2 className="font-display font-bold text-xl text-white mt-1">
          Sign in to continue
        </h2>

        <p className="text-[13px] text-slate-300 mt-2 leading-relaxed">
          DailyDose, FunBrain, Habits, WA Squad, AI pledges, and more need your Edublast
          Google account. One login — same profile across both apps.
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-pink/40 bg-pink/15 px-3.5 py-2.5 text-[12px] text-pink-300 leading-snug font-medium"
          >
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-2.5 mt-6">
          <Button
            variant="primary"
            block
            disabled={loading}
            onClick={onGoogle}
            className="py-3 text-sm font-bold shadow-lg shadow-teal/20 cursor-pointer"
          >
            {loading ? "Opening Google…" : "Continue with Google"}
          </Button>
          <Button
            variant="ghost"
            block
            onClick={onClose}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            Not now
          </Button>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}
