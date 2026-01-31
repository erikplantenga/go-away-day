/**
 * Supabase backend – 2 env vars: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Werkt op jouw én Benno's telefoon (zelfde data).
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { UserId } from "./firestore";
import type { CityEntry, RemovedEntry, SpinEntry, GameConfig } from "./firestore";
import { Timestamp } from "firebase/firestore";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) client = createClient(url, key);
  return client;
}

export function isSupabaseConfigured(): boolean {
  return !!(url && key);
}

const TABLE = "store";

async function getValue<K>(keyName: string): Promise<K | null> {
  const { data } = await getClient()
    .from(TABLE)
    .select("value")
    .eq("key", keyName)
    .single();
  return (data?.value as K) ?? null;
}

async function setValue(keyName: string, value: unknown): Promise<void> {
  await getClient().from(TABLE).upsert({ key: keyName, value }, { onConflict: "key" });
}

// --- Cities ---
export async function getCities(): Promise<CityEntry[]> {
  const v = await getValue<CityEntry[]>("cities");
  return v ?? [];
}

export async function setCities(cities: CityEntry[]): Promise<void> {
  await setValue("cities", cities);
}

// --- City submissions ---
export async function setCitySubmission(
  user: UserId,
  cities: CityEntry[]
): Promise<void> {
  await setValue(`submission_${user}`, cities);
}

export async function getCitySubmission(
  user: UserId
): Promise<CityEntry[] | null> {
  return getValue<CityEntry[]>(`submission_${user}`);
}

export async function hasBothSubmitted(): Promise<boolean> {
  const [e, b] = await Promise.all([
    getCitySubmission("erik"),
    getCitySubmission("benno"),
  ]);
  return e !== null && b !== null;
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
    const k = `${c.city.toLowerCase()}|${c.country.toLowerCase()}`;
    if (!seen.has(k)) {
      seen.add(k);
      deduped.push(c);
    }
  }
  await setCities(deduped);
  return deduped;
}

// --- Removed ---
export async function getRemoved(): Promise<RemovedEntry[]> {
  const v = await getValue<RemovedEntry[]>("removed");
  return v ?? [];
}

export async function addRemoved(
  city: string,
  country: string | undefined,
  removedBy: UserId,
  date: string
): Promise<void> {
  const list = await getRemoved();
  list.push({ city, country, removedBy, date });
  await setValue("removed", list);
}

export async function hasUserStruckToday(
  user: UserId,
  dateStr: string
): Promise<boolean> {
  const list = await getRemoved();
  return list.some((r) => r.removedBy === user && r.date === dateStr);
}

export async function getStrikeCount(user: UserId): Promise<number> {
  const list = await getRemoved();
  return list.filter((r) => r.removedBy === user).length;
}

export async function getStrikeCountForDate(user: UserId, dateStr: string): Promise<number> {
  const list = await getRemoved();
  return list.filter((r) => r.removedBy === user && r.date === dateStr).length;
}

// --- Spins ---
interface StoredSpin {
  user: UserId;
  city: string;
  date: string;
  points: number;
  timestamp: string;
}

export async function getSpins(): Promise<SpinEntry[]> {
  const list = (await getValue<StoredSpin[]>("spins")) ?? [];
  return list.map((s) => ({
    user: s.user,
    city: (s as StoredSpin & { country?: string }).city ?? (s as StoredSpin & { country?: string }).country ?? "",
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
  const list = (await getValue<StoredSpin[]>("spins")) ?? [];
  list.push({
    user,
    city,
    date: dateStr,
    points,
    timestamp: new Date().toISOString(),
  });
  await setValue("spins", list);
}

export async function hasUserSpunToday(
  user: UserId,
  dateStr: string
): Promise<boolean> {
  const list = (await getValue<StoredSpin[]>("spins")) ?? [];
  return list.some((s) => s.user === user && s.date === dateStr);
}

export async function getRemainingCities(): Promise<CityEntry[]> {
  const [cities, removed] = await Promise.all([getCities(), getRemoved()]);
  const set = new Set(removed.map((r) => `${r.city}|${r.country ?? ""}`));
  return cities.filter((c) => !set.has(`${c.city}|${c.country}`));
}

type Unsubscribe = () => void;

export function subscribeSpins(
  callback: (spins: (SpinEntry & { id: string })[]) => void
): Unsubscribe {
  let cancelled = false;
  const run = async () => {
    const list = await getSpins();
    if (cancelled) return;
    callback(
      list.map((s, i) => ({ id: String(i), ...s }))
    );
  };
  run();
  const interval = setInterval(run, 2000);
  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}

// --- Config ---
export async function getConfig(): Promise<GameConfig> {
  const v = await getValue<GameConfig>("config");
  return v ?? {};
}

export async function setConfig(updates: Partial<GameConfig>): Promise<void> {
  const current = await getConfig();
  await setValue("config", { ...current, ...updates });
}

export async function setWinner(city: string): Promise<void> {
  await setConfig({ winnerLocked: true, winnerCity: city });
}
