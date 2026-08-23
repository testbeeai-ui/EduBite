"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export const EMBED_SESSION_MESSAGE = "edubite-embed-session" as const;
export const EMBED_READY_MESSAGE = "edubite-embed-ready" as const;
export const EMBED_PROGRESS_MESSAGE = "edubite-embed-progress" as const;
export const EMBED_CLOSE_MESSAGE = "edubite-brain-gym-close" as const;
export const EMBED_GAME_OPEN_MESSAGE = "edubite-brain-gym-game-open" as const;
export const EMBED_GAME_CLOSE_MESSAGE = "edubite-brain-gym-game-close" as const;

type EmbedSessionPayload = {
  type: typeof EMBED_SESSION_MESSAGE;
  access_token: string;
  refresh_token: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSessionPayload(raw: unknown): EmbedSessionPayload | null {
  let data: unknown = raw;
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!isRecord(data) || data.type !== EMBED_SESSION_MESSAGE) return null;
  if (
    typeof data.access_token !== "string" ||
    typeof data.refresh_token !== "string" ||
    !data.access_token ||
    !data.refresh_token
  ) {
    return null;
  }
  return {
    type: EMBED_SESSION_MESSAGE,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  };
}

/** Notify the React Native WebView host (no-op in regular browsers). */
export function postToNativeHost(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const rn = (
    window as Window & {
      ReactNativeWebView?: { postMessage: (msg: string) => void };
    }
  ).ReactNativeWebView;
  if (!rn?.postMessage) return;
  try {
    rn.postMessage(JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

async function applyEmbedSession(
  accessToken: string,
  refreshToken: string,
): Promise<boolean> {
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) {
    console.warn("[embed-bridge] setSession failed", error.message);
    return false;
  }
  return true;
}

/**
 * Hydrates Supabase auth inside the mobile WebView embed so cookie-backed
 * `/api/progress/brain-gym` calls resolve the same user as the native app.
 */
export function BrainGymEmbedBridge({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const handlePayload = useCallback(async (raw: unknown) => {
    const payload = parseSessionPayload(raw);
    if (!payload) return;
    setSessionError(null);
    const ok = await applyEmbedSession(
      payload.access_token,
      payload.refresh_token,
    );
    if (!ok) {
      setSessionError("Could not apply mobile session. Sign in again on the app.");
      return;
    }
    setReady(true);
    postToNativeHost({ type: EMBED_READY_MESSAGE });
  }, []);

  useEffect(() => {
    const onWindowMessage = (event: MessageEvent) => {
      void handlePayload(event.data);
    };
    const onDocumentMessage = (event: Event) => {
      const custom = event as MessageEvent;
      void handlePayload(custom.data);
    };

    window.addEventListener("message", onWindowMessage);
    document.addEventListener("message", onDocumentMessage as EventListener);

    // RN injectJavaScript entrypoint
    (
      window as Window & {
        __EDUBITE_EMBED_SET_SESSION__?: (payload: unknown) => void;
      }
    ).__EDUBITE_EMBED_SET_SESSION__ = (payload: unknown) => {
      void handlePayload(payload);
    };

    // Already signed in (e.g. cookies from a prior embed visit)
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) {
        setReady(true);
        postToNativeHost({ type: EMBED_READY_MESSAGE });
      }
    });

    return () => {
      window.removeEventListener("message", onWindowMessage);
      document.removeEventListener(
        "message",
        onDocumentMessage as EventListener,
      );
      delete (
        window as Window & {
          __EDUBITE_EMBED_SET_SESSION__?: (payload: unknown) => void;
        }
      ).__EDUBITE_EMBED_SET_SESSION__;
    };
  }, [handlePayload]);

  return (
    <div className="edubite-brain-gym-embed min-h-[100dvh] bg-[var(--bg)] text-[var(--text)]">
      {!ready && (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-[var(--text-dim)]">
            Connecting Brain Gym…
          </p>
          {sessionError ? (
            <p className="text-sm text-[var(--pink)]">{sessionError}</p>
          ) : null}
        </div>
      )}
      <div className={ready ? "block" : "hidden"} aria-hidden={!ready}>
        {children}
      </div>
    </div>
  );
}
