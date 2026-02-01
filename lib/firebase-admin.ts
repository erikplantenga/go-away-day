/**
 * Firebase Admin op de server – 1 env var: FIREBASE_SERVICE_ACCOUNT_JSON.
 * Plak de hele JSON van Firebase Console → Service accounts → Generate key.
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { CityEntry, RemovedEntry, GameConfig } from "./firestore";

let app: App | null = null;

function getApp(): App | null {
  if (app) return app;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;
  try {
    const key = JSON.parse(json);
    if (getApps().length === 0) {
      app = initializeApp({ credential: cert(key) });
      return app;
    }
    app = getApps()[0] as App;
    return app;
  } catch {
    return null;
  }
}

export function isFirebaseAdminConfigured(): boolean {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
}

function db() {
  const a = getApp();
  if (!a) return null;
  return getFirestore(a);
}

export async function getCities(): Promise<CityEntry[]> {
  const d = db();
  if (!d) return [];
  const snap = await d.collection("cities").doc("combined").get();
  const data = snap.data();
  return (data?.cities ?? []) as CityEntry[];
}

export async function setCities(cities: CityEntry[]): Promise<void> {
  const d = db();
  if (!d) return;
  await d.collection("cities").doc("combined").set({ cities });
}

export async function getCitySubmission(user: string): Promise<CityEntry[] | null> {
  const d = db();
  if (!d) return null;
  const snap = await d.collection("citySubmissions").doc(user).get();
  const data = snap.data();
  return (data?.cities ?? null) as CityEntry[] | null;
}

export async function setCitySubmission(user: string, cities: CityEntry[]): Promise<void> {
  const d = db();
  if (!d) return;
  await d.collection("citySubmissions").doc(user).set({ cities });
}

export async function hasBothSubmitted(): Promise<boolean> {
  const [e, b] = await Promise.all([
    getCitySubmission("erik"),
    getCitySubmission("benno"),
  ]);
  return e !== null && b !== null;
}

export async function getRemoved(): Promise<RemovedEntry[]> {
  const d = db();
  if (!d) return [];
  const snap = await d.collection("removed").get();
  return snap.docs.map((doc) => doc.data() as RemovedEntry);
}

export async function addRemoved(entry: {
  city: string;
  country?: string;
  removedBy: string;
  date: string;
}): Promise<void> {
  const d = db();
  if (!d) return;
  await d.collection("removed").add(entry);
}

export async function getSpins(): Promise<{ user: string; city: string; date: string; points: number; timestamp: string }[]> {
  const d = db();
  if (!d) return [];
  const snap = await d.collection("spins").orderBy("timestamp", "asc").get();
  return snap.docs.map((doc) => {
    const data = doc.data();
    const ts = data?.timestamp;
    const iso =
      typeof ts?.toDate === "function"
        ? ts.toDate().toISOString()
        : typeof ts === "string"
          ? ts
          : new Date().toISOString();
    return {
      id: doc.id,
      user: data?.user ?? "",
      city: (data?.city ?? data?.country ?? "") as string,
      date: data?.date ?? "",
      points: data?.points ?? 1,
      timestamp: iso,
    };
  });
}

export async function addSpin(entry: {
  user: string;
  city: string;
  date: string;
  points: number;
}): Promise<void> {
  const d = db();
  if (!d) return;
  await d.collection("spins").add({
    ...entry,
    timestamp: new Date(),
  });
}

export async function getConfig(): Promise<GameConfig> {
  const d = db();
  if (!d) return {};
  const snap = await d.collection("config").doc("game").get();
  return (snap.data() ?? {}) as GameConfig;
}

export async function setConfig(updates: Partial<GameConfig>): Promise<void> {
  const d = db();
  if (!d) return;
  const ref = d.collection("config").doc("game");
  const current = (await ref.get()).data() ?? {};
  await ref.set({ ...current, ...updates });
}

export async function setWinner(city: string): Promise<void> {
  await setConfig({ winnerLocked: true, winnerCity: city });
}

export async function hasUserStruckToday(user: string, dateStr: string): Promise<boolean> {
  const list = await getRemoved();
  return list.some((r) => r.removedBy === user && r.date === dateStr);
}

export async function getStrikeCount(user: string): Promise<number> {
  const list = await getRemoved();
  return list.filter((r) => r.removedBy === user).length;
}

export async function getStrikeCountForDate(user: string, dateStr: string): Promise<number> {
  const list = await getRemoved();
  return list.filter((r) => r.removedBy === user && r.date === dateStr).length;
}

export async function hasUserSpunToday(user: string, dateStr: string): Promise<boolean> {
  const d = db();
  if (!d) return false;
  const snap = await d
    .collection("spins")
    .where("user", "==", user)
    .where("date", "==", dateStr)
    .limit(1)
    .get();
  return !snap.empty;
}

export async function getRemainingCities(): Promise<CityEntry[]> {
  const [cities, removed] = await Promise.all([getCities(), getRemoved()]);
  const set = new Set(removed.map((r) => `${r.city}|${r.country ?? ""}`));
  return cities.filter((c) => !set.has(`${c.city}|${c.country ?? ""}`));
}

export async function combineAndDedupeCities(): Promise<CityEntry[]> {
  const [erik, benno] = await Promise.all([
    getCitySubmission("erik"),
    getCitySubmission("benno"),
  ]);
  const all: CityEntry[] = [...(erik ?? []), ...(benno ?? [])];
  const seen = new Set<string>();
  const deduped: CityEntry[] = [];
  for (const c of all) {
    const k = `${c.city.toLowerCase()}|${(c.country ?? "").toLowerCase()}`;
    if (!seen.has(k)) {
      seen.add(k);
      deduped.push(c);
    }
  }
  await setCities(deduped);
  return deduped;
}
