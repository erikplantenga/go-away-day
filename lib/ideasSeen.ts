import type { IdeasUser } from "./ideas2027";

export const IDEAS_SESSION_KEY = "ideas2027_session";
export const IDEAS_SEEN_KEY = "ideas2027_seen_ids";

export type IdeasSession = { user: IdeasUser; password: string };

export function loadIdeasSession(): IdeasSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(IDEAS_SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as IdeasSession;
    if ((s.user === "erik" || s.user === "benno") && typeof s.password === "string") return s;
  } catch {}
  return null;
}

export function loadSeenIdeaIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(IDEAS_SEEN_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function saveSeenIdeaIds(ids: Iterable<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(IDEAS_SEEN_KEY, JSON.stringify([...ids]));
  } catch {}
}

/** Mark these idea ids as seen so the popup won't show them again */
export function markIdeasSeen(ids: Iterable<string>) {
  const seen = loadSeenIdeaIds();
  let changed = false;
  for (const id of ids) {
    if (!seen.has(id)) {
      seen.add(id);
      changed = true;
    }
  }
  if (changed) saveSeenIdeaIds(seen);
}
