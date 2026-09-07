// ===== lib/storage.ts — localStorage persistence for mock user/scores =====

import { useSyncExternalStore } from "react";

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

let cachedUserRaw: string | null = null;
let cachedUser: User | null = null;

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (raw === cachedUserRaw) return cachedUser;
  cachedUserRaw = raw;
  try {
    cachedUser = raw ? JSON.parse(raw) : null;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
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

function subscribeUser(callback: () => void) {
  window.addEventListener(USER_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(USER_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useUser(): User | null {
  return useSyncExternalStore(subscribeUser, getUser, () => null);
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
