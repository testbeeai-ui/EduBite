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
import { usePathname, useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
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
  signingIn: boolean;
  /** Last sign-in failure message (shown on /login). */
  authError: string | null;
  clearAuthError: () => void;
  /** If logged in, runs `fn`. Otherwise goes to /login and runs `fn` after success. */
  requireAuth: (fn?: () => void) => boolean;
  openLogin: (pending?: () => void) => void;
  closeLogin: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const GET_SESSION_TIMEOUT_MS = 4000;
const OAUTH_FAIL_MESSAGE =
  "Google sign-in did not finish for Edubite. Use http://localhost:3000 only, and add http://localhost:3000/auth/callback in Supabase → Authentication → Redirect URLs. Edubite does not need waitlist approval (that is EduBlast only).";

const AuthContext = createContext<AuthContextValue | null>(null);

function runPending(pendingRef: { current: PendingFn }) {
  const fn = pendingRef.current;
  if (!fn) return;
  pendingRef.current = null;
  queueMicrotask(() => fn());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const pendingRef = useRef<PendingFn>(null);
  const loadingRef = useRef(true);

  useEffect(() => {
    let mounted = true;

    const finishLoading = () => {
      if (!mounted || !loadingRef.current) return;
      loadingRef.current = false;
      setLoading(false);
    };

    // Clear sticky OAuth error query/hash so HMR / refresh does not keep replaying it.
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let dirty = false;
      let oauthFailed = false;
      if (url.searchParams.has("auth_error")) {
        url.searchParams.delete("auth_error");
        dirty = true;
        oauthFailed = true;
      }
      if (url.hash.includes("auth_error=oauth_exchange_failed")) {
        url.hash = url.hash
          .replace(/^#?auth_error=oauth_exchange_failed&?/, "")
          .replace(/^#/, "");
        dirty = true;
        oauthFailed = true;
      }
      if (dirty) {
        const cleaned =
          url.pathname +
          (url.searchParams.toString() ? `?${url.searchParams}` : "") +
          (url.hash ? `#${url.hash.replace(/^#/, "")}` : "");
        window.history.replaceState(null, "", cleaned || "/");
      }
      if (oauthFailed) {
        console.warn(
          "[auth] Google sign-in failed once (PKCE exchange). Try Continue with Google again.",
        );
        setAuthError(OAUTH_FAIL_MESSAGE);
        if (url.pathname !== "/login") {
          router.replace("/login");
        }
      }
    }

    // Never leave the shell stuck on skeleton if Supabase session probe hangs.
    const timeoutId = window.setTimeout(() => {
      if (!mounted || !loadingRef.current) return;
      console.warn("[auth] getSession timed out — continuing as guest");
      finishLoading();
      if (pendingRef.current) router.push("/login");
    }, GET_SESSION_TIMEOUT_MS);

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error("[auth] getSession", error);
        }
        setSession(data.session);
        setUser(data.session?.user ?? null);
        finishLoading();

        if (data.session?.user) {
          setAuthError(null);
          runPending(pendingRef);
          if (window.location.pathname === "/login") {
            router.replace("/");
          }
        } else if (pendingRef.current) {
          router.push("/login");
        }
      })
      .catch((err) => {
        console.error("[auth] getSession threw", err);
        if (!mounted) return;
        finishLoading();
        if (pendingRef.current) router.push("/login");
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      finishLoading();

      if (nextSession?.user) {
        setAuthError(null);
        setSigningIn(false);
        runPending(pendingRef);
        if (window.location.pathname === "/login") {
          router.replace("/");
        }
      }
    });

    return () => {
      mounted = false;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [router]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const openLogin = useCallback(
    (pending?: () => void) => {
      pendingRef.current = pending ?? null;
      if (pathname !== "/login") {
        router.push("/login");
      }
    },
    [pathname, router],
  );

  const closeLogin = useCallback(() => {
    pendingRef.current = null;
    setAuthError(null);
    if (pathname === "/login") {
      router.push("/");
    }
  }, [pathname, router]);

  const requireAuth = useCallback(
    (fn?: () => void) => {
      if (user) {
        fn?.();
        return true;
      }
      openLogin(fn);
      return false;
    },
    [user, openLogin],
  );

  const signInWithGoogle = useCallback(async () => {
    setSigningIn(true);
    setAuthError(null);
    try {
      const pending = readPendingView();
      if (pending) storePendingView(pending);
      const origin = window.location.origin;
      if (
        origin.includes("127.0.0.1") ||
        /^https?:\/\/\d+\.\d+\.\d+\.\d+/.test(origin)
      ) {
        setAuthError(
          "Open the app at http://localhost:3000 before signing in (IP / 127.0.0.1 breaks Google cookies).",
        );
        setSigningIn(false);
        return;
      }
      // Exact path only — query strings often fail Supabase allowlist and
      // fall back to Site URL (www.edublast.in), which is EduBlast + whitelist.
      const redirectTo = `${origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) {
        console.error("signInWithOAuth error:", error);
        setAuthError(
          error?.message ??
            "Could not start Google sign-in. Please try again.",
        );
        setSigningIn(false);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("signInWithOAuth error:", err);
      setAuthError("Could not start Google sign-in. Please try again.");
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    pendingRef.current = null;
    clearPendingView();
    setUser(null);
    setSession(null);
    await supabase.auth.signOut({ scope: "local" });
    if (pathname === "/login") {
      router.push("/");
    }
  }, [pathname, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      signingIn,
      authError,
      clearAuthError,
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
      signingIn,
      authError,
      clearAuthError,
      requireAuth,
      openLogin,
      closeLogin,
      signInWithGoogle,
      signOut,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
