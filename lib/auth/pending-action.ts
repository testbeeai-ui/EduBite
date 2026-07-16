const PENDING_VIEW_KEY = "edubite_auth_pending_view";
const PENDING_PATH_KEY = "edubite_auth_redirect";

export function storePendingView(view: string): void {
  try {
    sessionStorage.setItem(PENDING_VIEW_KEY, view);
    sessionStorage.setItem(PENDING_PATH_KEY, `/#${view}`);
  } catch {
    /* ignore */
  }
}

export function readPendingView(): string | null {
  try {
    return sessionStorage.getItem(PENDING_VIEW_KEY);
  } catch {
    return null;
  }
}

export function clearPendingView(): void {
  try {
    sessionStorage.removeItem(PENDING_VIEW_KEY);
    sessionStorage.removeItem(PENDING_PATH_KEY);
  } catch {
    /* ignore */
  }
}
