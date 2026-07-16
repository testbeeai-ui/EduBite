"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { LoginModal } from "@/components/auth/login-modal";
import {
  clearPendingView,
  readPendingView,
  storePendingView,
} from "@/lib/auth/pending-action";

type PendingFn = (() => void) | null;

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** If logged in, runs `fn`. Otherwise opens login modal and runs `fn` after success. */
  requireAuth: (fn?: () => void) => boolean;
  openLogin: (pending?: () => void) => void;
  closeLogin: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function runPending(pendingRef: { current: PendingFn }) {
  const fn = pendingRef.current;
  if (!fn) return;
  pendingRef.current = null;
  queueMicrotask(() => fn());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const pendingRef = useRef<PendingFn>(null);
  const loadingRef = useRef(true);

  useEffect(() => {
    let mounted = true;

    // Clear sticky OAuth error query/hash so HMR / refresh does not keep replaying it.
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let dirty = false;
      if (url.searchParams.has("auth_error")) {
        url.searchParams.delete("auth_error");
        dirty = true;
      }
      if (url.hash.includes("auth_error=oauth_exchange_failed")) {
        url.hash = url.hash
          .replace(/^#?auth_error=oauth_exchange_failed&?/, "")
          .replace(/^#/, "");
        dirty = true;
        console.warn(
          "[auth] Google sign-in failed once (PKCE exchange). Try Continue with Google again.",
        );
      }
      if (dirty) {
        const cleaned =
          url.pathname +
          (url.searchParams.toString() ? `?${url.searchParams}` : "") +
          (url.hash ? `#${url.hash.replace(/^#/, "")}` : "");
        window.history.replaceState(null, "", cleaned || "/");
      }
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      loadingRef.current = false;
      setLoading(false);

      if (data.session?.user) {
        setLoginOpen(false);
        runPending(pendingRef);
      } else if (pendingRef.current) {
        // Click happened during rehydrate with no session → show login as before.
        setLoginOpen(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      loadingRef.current = false;
      setLoading(false);

      if (nextSession?.user) {
        setLoginOpen(false);
        runPending(pendingRef);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const openLogin = useCallback((pending?: () => void) => {
    pendingRef.current = pending ?? null;
    setLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    pendingRef.current = null;
    setLoginOpen(false);
  }, []);

  const requireAuth = useCallback(
    (fn?: () => void) => {
      if (user) {
        fn?.();
        return true;
      }
      // While cookies/session rehydrate, do not flash the login modal.
      if (loadingRef.current || loading) {
        pendingRef.current = fn ?? null;
        return false;
      }
      openLogin(fn);
      return false;
    },
    [user, loading, openLogin],
  );

  const signInWithGoogle = useCallback(async () => {
    setSigningIn(true);
    try {
      const pending = readPendingView();
      if (pending) storePendingView(pending);
      const redirectTo = `${window.location.origin}/auth/callback`;
      // skipBrowserRedirect: flush PKCE code-verifier cookie before leaving the page
      // (prevents oauth_exchange_failed when redirect races cookie write).
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error || !data.url) {
        console.error("signInWithOAuth", error);
        setSigningIn(false);
        return;
      }
      await new Promise((r) => window.setTimeout(r, 80));
      window.location.assign(data.url);
    } catch (err) {
      console.error("signInWithOAuth", err);
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    pendingRef.current = null;
    clearPendingView();
    setLoginOpen(false);
    setUser(null);
    setSession(null);
    await supabase.auth.signOut({ scope: "local" });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      requireAuth,
      openLogin,
      closeLogin,
      signInWithGoogle,
      signOut,
    }),
    [
      user,
      session,
      loading,
      requireAuth,
      openLogin,
      closeLogin,
      signInWithGoogle,
      signOut,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal
        open={loginOpen}
        loading={signingIn}
        onClose={closeLogin}
        onGoogle={signInWithGoogle}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
