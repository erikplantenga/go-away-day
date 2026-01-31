/**
 * Demo-opslag – kopie van het echte spel, alleen voor de demo.
 * Gebruikt localStorage met prefix "go-away-day-demo-" zodat echte data onaangeroerd blijft.
 */

import type { UserId } from "./firestore";
import type { CityEntry, RemovedEntry, SpinEntry, GameConfig } from "./firestore";
import { Timestamp } from "firebase/firestore";

const PREFIX = "go-away-day-demo-";
export const DEMO_STORAGE_PREFIX = PREFIX;

const KEY_CITIES = PREFIX + "cities";
const KEY_SUBMISSION_ERIK = PREFIX + "submission_erik";
const KEY_SUBMISSION_BENNO = PREFIX + "submission_benno";
const KEY_REMOVED = PREFIX + "removed";
const KEY_SPINS = PREFIX + "spins";
const KEY_CONFIG = PREFIX + "config";
const EVENT_SPINS = PREFIX + "spins_change";

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

/** Voorg invulde steden voor de demo: 10 steden in Europa. */
const DEMO_CITIES_ERIK: CityEntry[] = [
  { city: "Amsterdam", country: "Nederland", addedBy: "erik" },
  { city: "Barcelona", country: "Spanje", addedBy: "erik" },
  { city: "Rome", country: "Italië", addedBy: "erik" },
  { city: "Wenen", country: "Oostenrijk", addedBy: "erik" },
  { city: "Prague", country: "Tsjechië", addedBy: "erik" },
];
const DEMO_CITIES_BENNO: CityEntry[] = [
  { city: "Parijs", country: "Frankrijk", addedBy: "benno" },
  { city: "Berlijn", country: "Duitsland", addedBy: "benno" },
  { city: "Lissabon", country: "Portugal", addedBy: "benno" },
  { city: "Brussel", country: "België", addedBy: "benno" },
  { city: "Kopenhagen", country: "Denemarken", addedBy: "benno" },
];

export async function ensureDemoCitiesFilled(): Promise<void> {
  const [erik, benno] = await Promise.all([
    getCitySubmission("erik"),
    getCitySubmission("benno"),
  ]);
  if (!erik || erik.length < 5) await setCitySubmission("erik", DEMO_CITIES_ERIK);
  if (!benno || benno.length < 5) await setCitySubmission("benno", DEMO_CITIES_BENNO);
  await combineAndDedupeCities();
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Zorg dat de andere speler in de demo ook 3 willekeurige weggestreept heeft (automatisch). */
export async function ensureDemoOtherUserStruckThree(otherUser: UserId): Promise<void> {
  const [cities, removedList] = await Promise.all([getCities(), getRemoved()]);
  const removedSet = new Set(
    removedList.map((r) => `${r.city}|${r.country ?? ""}`)
  );
  const otherCount = removedList.filter((r) => r.removedBy === otherUser).length;
  if (otherCount >= 3) return;
  const remaining = cities.filter(
    (c) => !removedSet.has(`${c.city}|${c.country}`)
  );
  const toStrike = shuffle(remaining).slice(0, 3 - otherCount);
  const dateStr = new Date().toISOString().slice(0, 10);
  for (const c of toStrike) {
    await addRemoved(c.city, c.country, otherUser, dateStr);
  }
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

/** Aantal keer dat deze gebruiker een stad heeft weggestreept (max 3 nodig om verder te kunnen). */
export async function getStrikeCount(user: UserId): Promise<number> {
  const list = await getRemoved();
  return Promise.resolve(list.filter((r) => r.removedBy === user).length);
}

/** Aantal keer dat deze gebruiker vandaag (of op dateStr) heeft weggestreept. */
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
  const list = readJson<(StoredSpin & { country?: string })[]>(KEY_SPINS, []);
  return list.map((s) => ({
    user: s.user,
    city: s.city ?? s.country ?? "",
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

/** Overgebleven steden (voor demo: tonen bij spinnen). */
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

/** Zorg dat de fruitautomaat in de demo altijd steden heeft om te tonen (zelfde Europese demo-lijst). */
export async function ensureFruitMachineDemoData(): Promise<void> {
  const remaining = await getRemainingCities();
  if (remaining.length >= 3) return;
  await ensureDemoCitiesFilled();
  const [cities, removedList] = await Promise.all([getCities(), getRemoved()]);
  if (cities.length >= 10 && removedList.length >= 6) return;
  const other: UserId = "benno";
  await ensureDemoOtherUserStruckThree(other);
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
  if (typeof window !== "undefined") {
    window.addEventListener(EVENT_SPINS, handler);
    return () => window.removeEventListener(EVENT_SPINS, handler);
  }
  return () => {};
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

/** Wis alle demo-data zodat je de demo opnieuw kunt doen. Echte speldata blijft onaangeroerd. */
export function clearDemoStorage(): void {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(DEMO_STORAGE_PREFIX)) keys.push(key);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}
