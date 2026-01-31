/**
 * Lokale opslag – gebruikt wanneer Firebase niet is geconfigureerd.
 * Alles gaat in localStorage, werkt direct zonder backend.
 */

import type { UserId } from "./firestore";
import type { CityEntry, RemovedEntry, SpinEntry, GameConfig } from "./firestore";
import { Timestamp } from "firebase/firestore";

const KEY_CITIES = "goaway_cities";
const KEY_SUBMISSION_ERIK = "goaway_submission_erik";
const KEY_SUBMISSION_BENNO = "goaway_submission_benno";
const KEY_REMOVED = "goaway_removed";
const KEY_SPINS = "goaway_spins";
const KEY_CONFIG = "goaway_config";
const EVENT_SPINS = "goaway_spins_change";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function dispatchSpinsChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT_SPINS));
}

export async function getCities(): Promise<CityEntry[]> {
  return Promise.resolve(readJson<CityEntry[]>(KEY_CITIES, []));
}

export async function setCities(cities: CityEntry[]): Promise<void> {
  writeJson(KEY_CITIES, cities);
  return Promise.resolve();
}

export async function setCitySubmission(
  user: UserId,
  cities: CityEntry[]
): Promise<void> {
  writeJson(user === "erik" ? KEY_SUBMISSION_ERIK : KEY_SUBMISSION_BENNO, cities);
  return Promise.resolve();
}

export async function getCitySubmission(
  user: UserId
): Promise<CityEntry[] | null> {
  const key = user === "erik" ? KEY_SUBMISSION_ERIK : KEY_SUBMISSION_BENNO;
  const data = readJson<CityEntry[] | null>(key, null);
  return Promise.resolve(data);
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
    const key = `${c.city.toLowerCase()}|${c.country.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(c);
    }
  }
  await setCities(deduped);
  return deduped;
}

export async function getRemoved(): Promise<RemovedEntry[]> {
  return Promise.resolve(readJson<RemovedEntry[]>(KEY_REMOVED, []));
}

export async function addRemoved(
  city: string,
  country: string | undefined,
  removedBy: UserId,
  date: string
): Promise<void> {
  const list = readJson<RemovedEntry[]>(KEY_REMOVED, []);
  list.push({ city, country, removedBy, date });
  writeJson(KEY_REMOVED, list);
  return Promise.resolve();
}

export async function hasUserStruckToday(
  user: UserId,
  dateStr: string
): Promise<boolean> {
  const list = await getRemoved();
  return Promise.resolve(
    list.some((r) => r.removedBy === user && r.date === dateStr)
  );
}

export async function getStrikeCount(user: UserId): Promise<number> {
  const list = await getRemoved();
  return Promise.resolve(list.filter((r) => r.removedBy === user).length);
}

export async function getStrikeCountForDate(user: UserId, dateStr: string): Promise<number> {
  const list = await getRemoved();
  return Promise.resolve(list.filter((r) => r.removedBy === user && r.date === dateStr).length);
}

interface StoredSpin {
  user: UserId;
  city: string;
  date: string;
  points: number;
  timestamp: string;
}

export async function getSpins(): Promise<SpinEntry[]> {
  const list = readJson<StoredSpin[]>(KEY_SPINS, []);
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
  const list = readJson<StoredSpin[]>(KEY_SPINS, []);
  list.push({
    user,
    city,
    date: dateStr,
    points,
    timestamp: new Date().toISOString(),
  });
  writeJson(KEY_SPINS, list);
  dispatchSpinsChange();
  return Promise.resolve();
}

export async function hasUserSpunToday(
  user: UserId,
  dateStr: string
): Promise<boolean> {
  const list = readJson<StoredSpin[]>(KEY_SPINS, []);
  return Promise.resolve(
    list.some((s) => s.user === user && s.date === dateStr)
  );
}

export async function getRemainingCities(): Promise<CityEntry[]> {
  const [allCities, removedList] = await Promise.all([
    getCities(),
    getRemoved(),
  ]);
  const removedSet = new Set(
    removedList.map((r) => `${r.city}|${r.country ?? ""}`)
  );
  return allCities.filter(
    (c) => !removedSet.has(`${c.city}|${c.country}`)
  );
}

export function subscribeSpins(
  callback: (spins: (SpinEntry & { id: string })[]) => void
): () => void {
  const handler = async () => {
    const list = await getSpins();
    callback(
      list.map((s, i) => ({
        id: String(i),
        ...s,
      }))
    );
  };
  handler();
  window.addEventListener(EVENT_SPINS, handler);
  return () => window.removeEventListener(EVENT_SPINS, handler);
}

export async function getConfig(): Promise<GameConfig> {
  return Promise.resolve(readJson<GameConfig>(KEY_CONFIG, {}));
}

export async function setConfig(updates: Partial<GameConfig>): Promise<void> {
  const current = readJson<GameConfig>(KEY_CONFIG, {});
  writeJson(KEY_CONFIG, { ...current, ...updates });
  return Promise.resolve();
}

export async function setWinner(city: string): Promise<void> {
  return setConfig({ winnerLocked: true, winnerCity: city });
}
