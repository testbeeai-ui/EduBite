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

type AdminGateContextValue = {
  email: string | null;
  allowed: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AdminGateContext = createContext<AdminGateContextValue | null>(null);

const CHECK_TIMEOUT_MS = 4000;

function AdminGateShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 py-12 text-center bg-[var(--bg)]">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-8 shadow-sm">
        <p className="font-mono text-[10px] uppercase tracking-wide text-amber mb-2">
          Restricted · Admin only
        </p>
        <h1 className="font-display font-bold text-2xl text-[var(--text)]">
          {title}
        </h1>
        <div className="mt-4 space-y-4">{children}</div>
      </div>
      <Link href="/" className="text-sm text-teal hover:underline">
        ← Back to Edubite
      </Link>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, openLogin, signOut } = useAuth();
  const [me, setMe] = useState<AdminMe | null>(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    setChecking(true);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
    try {
      const res = await fetch("/api/admin/me", {
        credentials: "include",
        signal: controller.signal,
      });
      if (res.status === 401 || res.status === 403) {
        setMe({ email: user?.email ?? null, allowed: false });
        return;
      }
      if (!res.ok) {
        setMe({ email: user?.email ?? null, allowed: false });
        return;
      }
      const data = (await res.json()) as AdminMe;
      setMe({ email: data.email, allowed: !!data.allowed });
    } catch {
      // Timeout / network — never leave a blank gate open.
      setMe({ email: user?.email ?? null, allowed: false });
    } finally {
      window.clearTimeout(timer);
      setChecking(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setMe({ email: null, allowed: false });
      setChecking(false);
      return;
    }

    // Fast deny: unsigned allowlist miss → no admin UI, no lingering spinner.
    if (!isAdminEmail(user.email)) {
      setMe({ email: user.email ?? null, allowed: false });
      setChecking(false);
      return;
    }

    // Candidate only — server allowlist is the source of truth.
    void refresh();
  }, [authLoading, user, refresh]);

  // Hard ceiling so auth hang never leaves a blank "Checking…" forever.
  useEffect(() => {
    if (!authLoading && !checking) return;
    const timer = window.setTimeout(() => {
      setChecking(false);
      setMe((prev) => prev ?? { email: user?.email ?? null, allowed: false });
    }, CHECK_TIMEOUT_MS + 1000);
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
        <p className="text-[var(--text-dim)] text-sm leading-relaxed">
          Verifying that this account is on the admin allowlist. If you are not
          authorized, you will be blocked from this area.
        </p>
        <p className="font-mono text-[11px] text-[var(--text-dim)]">
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
    return (
      <AdminGateShell title="Access denied">
        <p className="text-[var(--text-dim)] text-sm leading-relaxed">
          <span className="text-[var(--text)] font-medium">
            {value.email ?? "This account"}
          </span>{" "}
          is not authorized to open Edubite Admin. Content tools stay locked
          outside the allowlist.
        </p>
        <p className="font-mono text-[11px] text-amber">
          HTTP 403 · Admin allowlist only
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
          <Button variant="ghost" onClick={() => void signOut()}>
            Sign out
          </Button>
          <Link href="/">
            <Button className="w-full sm:w-auto">Back to app</Button>
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
