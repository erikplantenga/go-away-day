/**
 * Client die de Vercel API aanroept (Upstash Redis op de server).
 * Gebruikt wanneer je de Upstash-integratie in Vercel hebt toegevoegd – geen keys kopiëren.
 */

import type { UserId } from "./firestore";
import type { CityEntry, RemovedEntry, SpinEntry, GameConfig } from "./firestore";
import { Timestamp } from "firebase/firestore";

const API = "/api/data";

async function post(op: string, params: Record<string, unknown> = {}): Promise<{ data?: unknown; ok?: boolean }> {
  const r = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op, ...params }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getCities(): Promise<CityEntry[]> {
  const res = await post("getCities");
  return (res.data ?? []) as CityEntry[];
}

export async function setCities(cities: CityEntry[]): Promise<void> {
  await post("setCities", { cities });
}

export async function setCitySubmission(user: UserId, cities: CityEntry[]): Promise<void> {
  await post("setCitySubmission", { user, cities });
}

export async function getCitySubmission(user: UserId): Promise<CityEntry[] | null> {
  const res = await post("getCitySubmission", { user });
  return res.data as CityEntry[] | null;
}

export async function hasBothSubmitted(): Promise<boolean> {
  const res = await post("hasBothSubmitted");
  return (res.data ?? false) as boolean;
}

export async function combineAndDedupeCities(): Promise<CityEntry[]> {
  const res = await post("combineAndDedupeCities");
  return (res.data ?? []) as CityEntry[];
}

export async function getRemoved(): Promise<RemovedEntry[]> {
  const res = await post("getRemoved");
  return (res.data ?? []) as RemovedEntry[];
}

export async function addRemoved(
  city: string,
  country: string | undefined,
  removedBy: UserId,
  date: string
): Promise<void> {
  await post("addRemoved", { city, country, removedBy, date });
}

export async function hasUserStruckToday(user: UserId, dateStr: string): Promise<boolean> {
  const res = await post("hasUserStruckToday", { user, dateStr });
  return (res.data ?? false) as boolean;
}

export async function getStrikeCount(user: UserId): Promise<number> {
  const res = await post("getStrikeCount", { user });
  return (res.data ?? 0) as number;
}

export async function getStrikeCountForDate(user: UserId, dateStr: string): Promise<number> {
  const res = await post("getStrikeCountForDate", { user, dateStr });
  return (res.data ?? 0) as number;
}

interface StoredSpin {
  user: UserId;
  city: string;
  date: string;
  points: number;
  timestamp: string;
}

export async function getSpins(): Promise<SpinEntry[]> {
  const res = await post("getSpins");
  const list = (res.data ?? []) as (StoredSpin & { country?: string })[];
  return list.map((s) => ({
    user: s.user,
    city: s.city ?? (s as StoredSpin & { country?: string }).country ?? "",
    points: s.points,
    timestamp: Timestamp.fromDate(new Date(s.timestamp)),
  }));
}

export async function addSpin(
  user: UserId,
  city: string,
  dateStr: string,
  points: number = 1
): Promise<void> {
  await post("addSpin", { user, city, dateStr, points });
}

export async function hasUserSpunToday(user: UserId, dateStr: string): Promise<boolean> {
  const res = await post("hasUserSpunToday", { user, dateStr });
  return (res.data ?? false) as boolean;
}

export async function getRemainingCities(): Promise<import("./firestore").CityEntry[]> {
  const res = await post("getRemainingCities");
  return (res.data ?? []) as import("./firestore").CityEntry[];
}

export function subscribeSpins(
  callback: (spins: (SpinEntry & { id: string })[]) => void
): () => void {
  const run = async () => {
    try {
      const list = await getSpins();
      callback(list.map((s, i) => ({ id: String(i), ...s })));
    } catch {}
  };
  run();
  const interval = setInterval(run, 2000);
  return () => clearInterval(interval);
}

export async function getConfig(): Promise<GameConfig> {
  const res = await post("getConfig");
  return (res.data ?? {}) as GameConfig;
}

export async function setConfig(updates: Partial<GameConfig>): Promise<void> {
  await post("setConfig", { updates });
}

export async function setWinner(city: string): Promise<void> {
  await post("setWinner", { city });
}
