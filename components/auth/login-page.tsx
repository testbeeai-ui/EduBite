"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-provider";

/**
 * Full-viewport /login page — portaled to document.body so it cannot
 * sit under AppShell content or inherit a transformed containing block.
 */
export function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user, loading, authError, signingIn, signInWithGoogle, clearAuthError } =
    useAuth();

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const goHome = () => {
    clearAuthError();
    router.push("/");
  };

  if (!mounted) return null;

  return createPortal(
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(5, 7, 11, 0.92)",
      }}
    >
      <button
        type="button"
        aria-label="Back to home"
        onClick={goHome}
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
      />

      <div
        role="main"
        aria-labelledby="edubite-login-title"
        className="relative w-full max-w-[400px] rounded-[22px] border border-teal/40 bg-[#121624] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.95)]"
        style={{ zIndex: 1 }}
      >
        <div className="flex items-center justify-between">
          <div className="text-3xl" aria-hidden>
            🔐
          </div>
          <button
            type="button"
            aria-label="Close login"
            onClick={goHome}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-400">
          EDUBITE · SAME ACCOUNT AS EDUBLAST
        </div>

        <h1
          id="edubite-login-title"
          className="mt-1 font-display text-xl font-bold text-white"
        >
          Sign in to continue
        </h1>

        <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
          DailyDose, FunBrain, Habits, WA Squad, AI pledges, and more need your
          Google account. Same login as Edublast — but Edubite does not require
          waitlist approval.
        </p>

        {authError ? (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-pink/40 bg-pink/15 px-3.5 py-2.5 text-[12px] font-medium leading-snug text-pink-300"
          >
            {authError}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            variant="primary"
            block
            disabled={signingIn || loading}
            onClick={() => void signInWithGoogle()}
            className="cursor-pointer py-3 text-sm font-bold shadow-lg shadow-teal/20"
          >
            {signingIn ? "Opening Google…" : "Continue with Google"}
          </Button>
          <Button
            variant="ghost"
            block
            onClick={goHome}
            disabled={signingIn}
            className="cursor-pointer text-xs text-slate-400 hover:text-white"
          >
            Not now
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
