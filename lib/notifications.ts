import type { AppView, Notification } from "@/lib/types";
import { isAppView } from "@/lib/types";

/** Default destinations for known notification ids / prefixes. */
export function resolveNotificationTarget(
  note: Pick<Notification, "id" | "targetView">,
): AppView | undefined {
  if (note.targetView && isAppView(note.targetView)) return note.targetView;
  if (note.id === "welcome") return "dailydose";
  if (note.id === "gyan-unlock") return "gyan";
  if (note.id === "challenge-enroll" || note.id.startsWith("challenge-")) {
    return "challenge";
  }
  return undefined;
}

export function withResolvedNotificationTarget(
  note: Notification,
): Notification {
  const targetView = resolveNotificationTarget(note);
  if (!targetView || note.targetView === targetView) return note;
  return { ...note, targetView };
}
