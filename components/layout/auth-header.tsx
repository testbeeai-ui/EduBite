"use client";

import { useEffect, useRef, useState } from "react";
import { LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";

interface AuthHeaderActionsProps {
  streak: number;
}

export function AuthHeaderActions({ streak }: AuthHeaderActionsProps) {
  const { user, loading, openLogin, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const signedIn = Boolean(user);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Student";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initial = (displayName[0] ?? "?").toUpperCase();

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [menuOpen]);

  return (
    <div ref={rootRef} className="flex items-center gap-2 sm:gap-2.5 shrink-0">
      <StreakChip streak={streak} />

      {loading ? (
        <div className="w-[72px] h-9 rounded-full bg-[var(--surface)] border border-[var(--line)] animate-pulse" />
      ) : signedIn ? (
        <div className="relative">
          <button
            type="button"
            aria-label="Account menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className={cn(
              "flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border transition-colors",
              "bg-[var(--surface)] border-[var(--line)] hover:border-teal/40",
              menuOpen && "border-teal/40 ring-1 ring-teal/20",
            )}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
            ) : (
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-purple to-pink flex items-center justify-center font-display font-bold text-[11px] shrink-0">
                {initial}
              </span>
            )}
            <span className="hidden md:inline font-display font-semibold text-xs max-w-[72px] lg:max-w-[100px] truncate">
              {displayName}
            </span>
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[200px] rounded-[14px] border border-[var(--line)] bg-[var(--surface)] shadow-[0_20px_50px_rgba(0,0,0,0.45)] p-1.5 z-[70]">
              <div className="px-3 py-2.5 border-b border-[var(--line)] mb-1">
                <div className="font-display font-bold text-sm truncate">{displayName}</div>
                <div className="text-[11px] text-[var(--text-dim)] truncate mt-0.5">
                  {user?.email}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void signOut();
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 rounded-[10px] text-[13px] font-semibold text-pink hover:bg-pink/[0.08] transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => openLogin()}
          className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-teal/30 bg-teal/[0.08] hover:bg-teal/[0.14] hover:border-teal/45 transition-colors"
        >
          <span className="w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-[var(--text-dim)]" />
          </span>
          <span className="hidden sm:inline font-display font-bold text-xs text-teal">
            Login
          </span>
          <span className="sm:hidden font-display font-bold text-[11px] text-teal">
            Login
          </span>
          <LogIn className="w-3.5 h-3.5 text-teal sm:hidden" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function StreakChip({ streak }: { streak: number }) {
  return (
    <div
      className="flex items-center gap-[5px] font-mono text-[11px] font-semibold bg-[var(--surface)] border border-amber/30 px-2 sm:px-2.5 py-[6px] rounded-full text-amber shrink-0 shadow-[0_0_12px_rgba(251,191,36,0.12)]"
      title={`${streak} day streak`}
    >
      <span className="text-sm leading-none" aria-hidden>
        🔥
      </span>
      <span className="tabular-nums">{streak}</span>
      <span className="hidden sm:inline whitespace-nowrap">day streak</span>
    </div>
  );
}
