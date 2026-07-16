"use client";

import {
  createContext,
  useCallback,
  useContext,
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, openLogin, signOut } = useAuth();
  const [me, setMe] = useState<AdminMe | null>(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/admin/me", { credentials: "include" });
      if (res.status === 401) {
        setMe({ email: null, allowed: false });
        return;
      }
      const data = (await res.json()) as AdminMe;
      setMe({ email: data.email, allowed: !!data.allowed });
    } catch {
      setMe({ email: null, allowed: false });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setMe({ email: null, allowed: false });
      setChecking(false);
      return;
    }
    // Fast client check; still verify via API.
    if (!isAdminEmail(user.email)) {
      setMe({ email: user.email ?? null, allowed: false });
      setChecking(false);
      return;
    }
    void refresh();
  }, [authLoading, user, refresh]);

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
      <div className="min-h-screen flex items-center justify-center text-[var(--text-dim)] text-sm">
        Checking admin access…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display font-bold text-2xl">Edubite Admin</h1>
        <p className="text-[var(--text-dim)] text-sm max-w-md">
          Sign in with an allowlisted Google account to manage content.
        </p>
        <Button onClick={() => openLogin()}>Sign in with Google</Button>
        <Link href="/" className="text-sm text-teal hover:underline">
          ← Back to app
        </Link>
      </div>
    );
  }

  if (!value.allowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display font-bold text-2xl">Access denied</h1>
        <p className="text-[var(--text-dim)] text-sm max-w-md">
          {value.email ?? "This account"} is not on the Edubite admin allowlist.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => void signOut()}>
            Sign out
          </Button>
          <Link href="/">
            <Button>Back to app</Button>
          </Link>
        </div>
      </div>
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
