import type { AppView } from "./types";

export const VIEW_TO_PATH: Record<AppView, string> = {
  home: "/",
  dailydose: "/dailydose",
  funbrain: "/funbrain",
  gyan: "/gyan",
  puzzles: "/puzzles",
  wasquad: "/wasquad",
  habits: "/habits",
  achievements: "/achievements",
  inspiration: "/inspiration",
  ai: "/ai",
  challenge: "/challenge",
  profile: "/profile",
};

export const PATH_TO_VIEW: Record<string, AppView> = {
  "/": "home",
  "/dailydose": "dailydose",
  "/funbrain": "funbrain",
  "/gyan": "gyan",
  "/puzzles": "puzzles",
  "/wasquad": "wasquad",
  "/habits": "habits",
  "/achievements": "achievements",
  "/inspiration": "inspiration",
  "/ai": "ai",
  "/challenge": "challenge",
  "/profile": "profile",
};

export function getPathForView(view: AppView): string {
  return VIEW_TO_PATH[view] ?? "/";
}

export function getViewFromPath(pathname: string): AppView {
  return PATH_TO_VIEW[pathname] ?? "home";
}
