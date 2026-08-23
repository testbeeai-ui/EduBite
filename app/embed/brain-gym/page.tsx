"use client";

import { useEffect } from "react";
import { GyanView } from "@/components/views/gyan-view";
import {
  BrainGymEmbedBridge,
  EMBED_GAME_CLOSE_MESSAGE,
  EMBED_GAME_OPEN_MESSAGE,
  EMBED_PROGRESS_MESSAGE,
  postToNativeHost,
} from "@/lib/brain-gym/embed-bridge";

/**
 * Full Brain Gym (hub + GameShell + all 15 games) for the mobile WebView.
 * Design is unchanged — only session bridging + viewport fit.
 */
export default function BrainGymEmbedPage() {
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        postToNativeHost({ type: EMBED_PROGRESS_MESSAGE });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Observe game popup open/close via GameShell backdrop (z-[100] dialog)
    const observer = new MutationObserver(() => {
      const open = Boolean(
        document.querySelector('[role="dialog"][aria-modal="true"]'),
      );
      postToNativeHost({
        type: open ? EMBED_GAME_OPEN_MESSAGE : EMBED_GAME_CLOSE_MESSAGE,
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
    };
  }, []);

  return (
    <BrainGymEmbedBridge>
      <GyanView />
    </BrainGymEmbedBridge>
  );
}
