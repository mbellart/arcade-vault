// ===== lib/storage.ts — localStorage persistence for mock user/scores =====

export interface User {
  name: string;
}

export interface SavedScore {
  game: string;
  score: number;
  name: string;
  at: number;
}

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";
export const USER_CHANGED_EVENT = "av-user-changed";

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function setUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
  window.dispatchEvent(new Event(USER_CHANGED_EVENT));
}

export function clearUser() {
  setUser(null);
}

export function saveScore(entry: Omit<SavedScore, "at">) {
  if (typeof window === "undefined") return;
  try {
    const all: SavedScore[] = JSON.parse(localStorage.getItem(SCORES_KEY) || "[]");
    all.push({ ...entry, at: Date.now() });
    localStorage.setItem(SCORES_KEY, JSON.stringify(all));
  } catch {
    // ignore malformed storage
  }
}
