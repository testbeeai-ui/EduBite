"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { isAdminEmail } from "@/lib/admin/allowlist";

type AdminMe = {
  email: string | null;
  allowed: boolean;
};

type DenyReason = "allowlist" | "session" | "network" | null;

type AdminGateContextValue = {
  email: string | null;
  allowed: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AdminGateContext = createContext<AdminGateContextValue | null>(null);

const CHECK_TIMEOUT_MS = 12000;

function AdminGateShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 py-12 text-center bg-[#0b0d12] text-[#f6f7fb] font-sans">
      <div className="w-full max-w-md rounded-2xl border border-[#272e3e] bg-[#161a23] px-6 py-8 shadow-xl">
        <p className="font-mono text-[11px] uppercase tracking-wider text-amber-400 mb-2 font-bold">
          Restricted · Admin only
        </p>
        <h1 className="font-display font-bold text-2xl text-[#f6f7fb]">
          {title}
        </h1>
        <div className="mt-4 space-y-4">{children}</div>
      </div>
      <Link href="/" className="text-sm font-medium text-teal-400 hover:text-teal-300 hover:underline transition-colors">
        ← Back to Edubite
      </Link>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, openLogin, signOut } = useAuth();
  const [me, setMe] = useState<AdminMe | null>(null);
  const [checking, setChecking] = useState(true);
  const [denyReason, setDenyReason] = useState<DenyReason>(null);

  const refresh = useCallback(async () => {
    setChecking(true);
    setDenyReason(null);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
    try {
      const res = await fetch("/api/admin/me", {
        credentials: "include",
        signal: controller.signal,
        cache: "no-store",
      });
      if (res.status === 401) {
        // Cookie session missing — not the same as “not on allowlist”.
        setMe({ email: user?.email ?? null, allowed: false });
        setDenyReason("session");
        return;
      }
      if (res.status === 403) {
        const data = (await res.json().catch(() => null)) as AdminMe | null;
        setMe({
          email: data?.email ?? user?.email ?? null,
          allowed: false,
        });
        setDenyReason("allowlist");
        return;
      }
      if (!res.ok) {
        setMe({ email: user?.email ?? null, allowed: false });
        setDenyReason("network");
        return;
      }
      const data = (await res.json()) as AdminMe;
      setMe({ email: data.email, allowed: !!data.allowed });
      setDenyReason(data.allowed ? null : "allowlist");
    } catch {
      // Timeout / network — for known allowlisted emails, keep retryable state.
      const email = user?.email ?? null;
      if (email && isAdminEmail(email)) {
        setMe({ email, allowed: false });
        setDenyReason("network");
      } else {
        setMe({ email, allowed: false });
        setDenyReason("allowlist");
      }
    } finally {
      window.clearTimeout(timer);
      setChecking(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setMe({ email: null, allowed: false });
      setDenyReason(null);
      setChecking(false);
      return;
    }

    // Always ask the server — client allowlist is only a hint for messaging.
    void refresh();
  }, [authLoading, user, refresh]);

  // Soft ceiling: stop spinner, but do not permanently deny allowlisted accounts.
  useEffect(() => {
    if (!authLoading && !checking) return;
    const timer = window.setTimeout(() => {
      setChecking(false);
      setMe((prev) => {
        if (prev) return prev;
        const email = user?.email ?? null;
        if (email && isAdminEmail(email)) {
          setDenyReason("network");
          return { email, allowed: false };
        }
        setDenyReason(email ? "allowlist" : null);
        return { email, allowed: false };
      });
    }, CHECK_TIMEOUT_MS + 2000);
    return () => window.clearTimeout(timer);
  }, [authLoading, checking, user?.email]);

  const value = useMemo<AdminGateContextValue>(
    () => ({
      email: me?.email ?? user?.email ?? null,
      allowed: !!me?.allowed,
      loading: authLoading || checking,
      refresh,
    }),
    [me, user, authLoading, checking, refresh],
  );

  if (value.loading) {
    return (
      <AdminGateShell title="Checking admin access">
        <div className="flex justify-center py-2">
          <div className="w-7 h-7 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin" />
        </div>
        <p className="text-slate-400 text-sm leading-relaxed m-0">
          Verifying that this account is on the admin allowlist. If you are not
          authorized, you will be blocked from this area.
        </p>
        <p className="font-mono text-[11px] text-slate-500 m-0">
          This usually takes a second…
        </p>
      </AdminGateShell>
    );
  }

  if (!user) {
    return (
      <AdminGateShell title="Sign in required">
        <p className="text-[var(--text-dim)] text-sm leading-relaxed">
          This console is restricted to allowlisted admin accounts. Sign in with
          Google to continue — unauthorized accounts are denied.
        </p>
        <Button className="w-full" onClick={() => openLogin()}>
          Sign in with Google
        </Button>
      </AdminGateShell>
    );
  }

  if (!value.allowed) {
    const isSession = denyReason === "session";
    const isNetwork = denyReason === "network";
    const title = isSession
      ? "Session not ready"
      : isNetwork
        ? "Couldn’t verify access"
        : "Access denied";

    return (
      <AdminGateShell title={title}>
        {isSession ? (
          <p className="text-[var(--text-dim)] text-sm leading-relaxed">
            You appear signed in as{" "}
            <span className="text-[var(--text)] font-medium">
              {value.email ?? "this account"}
            </span>
            , but the admin API did not receive a valid session cookie. Sign out
            and sign back in on{" "}
            <span className="font-mono text-[11px]">http://localhost:3000</span>
            .
          </p>
        ) : isNetwork ? (
          <p className="text-[var(--text-dim)] text-sm leading-relaxed">
            Timed out verifying{" "}
            <span className="text-[var(--text)] font-medium">
              {value.email ?? "this account"}
            </span>
            . This account is on the built-in allowlist — retry the check.
          </p>
        ) : (
          <p className="text-[var(--text-dim)] text-sm leading-relaxed">
            <span className="text-[var(--text)] font-medium">
              {value.email ?? "This account"}
            </span>{" "}
            is not authorized to open Edubite Admin. Content tools stay locked
            outside the allowlist.
          </p>
        )}
        <p className="font-mono text-[11px] text-amber">
          {isSession
            ? "HTTP 401 · Session cookie"
            : isNetwork
              ? "Network / timeout"
              : "HTTP 403 · Admin allowlist only"}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
          {(isSession || isNetwork) && (
            <Button onClick={() => void refresh()}>Try again</Button>
          )}
          <Button variant="ghost" onClick={() => void signOut()}>
            Sign out
          </Button>
          <Link href="/">
            <Button className="w-full sm:w-auto" variant="ghost">
              Back to app
            </Button>
          </Link>
        </div>
      </AdminGateShell>
    );
  }

  return (
    <AdminGateContext.Provider value={value}>
      <div className="min-h-screen">
        <header className="border-b border-[var(--line)] bg-[var(--surface)]/80 backdrop-blur sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] text-teal tracking-wide uppercase">
                Edubite · Content console
              </div>
              <h1 className="font-display font-bold text-lg">Admin</h1>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[var(--text-dim)] font-mono text-[11px] hidden sm:inline">
                {value.email}
              </span>
              <Link href="/" className="text-teal hover:underline text-sm">
                App
              </Link>
              <Button variant="ghost" onClick={() => void signOut()}>
                Sign out
              </Button>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </div>
    </AdminGateContext.Provider>
  );
}
