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

/** Voorg invulde steden voor de demo: start met "dit zijn je gekozen steden". */
const DEMO_CITIES_ERIK: CityEntry[] = [
  { city: "Amsterdam", country: "Nederland", addedBy: "erik" },
  { city: "Rotterdam", country: "Nederland", addedBy: "erik" },
  { city: "Den Haag", country: "Nederland", addedBy: "erik" },
  { city: "Utrecht", country: "Nederland", addedBy: "erik" },
  { city: "Eindhoven", country: "Nederland", addedBy: "erik" },
];
const DEMO_CITIES_BENNO: CityEntry[] = [
  { city: "Parijs", country: "Frankrijk", addedBy: "benno" },
  { city: "Lyon", country: "Frankrijk", addedBy: "benno" },
  { city: "Marseille", country: "Frankrijk", addedBy: "benno" },
  { city: "Bordeaux", country: "Frankrijk", addedBy: "benno" },
  { city: "Nice", country: "Frankrijk", addedBy: "benno" },
];

export async function ensureDemoCitiesFilled(): Promise<void> {
  const [erik, benno] = await Promise.all([
    getCitySubmission("erik"),
    getCitySubmission("benno"),
  ]);
  if (erik && erik.length >= 5 && benno && benno.length >= 5) return;
  await setCitySubmission("erik", DEMO_CITIES_ERIK);
  await setCitySubmission("benno", DEMO_CITIES_BENNO);
  await combineAndDedupeCities();
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

interface StoredSpin {
  user: UserId;
  country: string;
  date: string;
  points: number;
  timestamp: string;
}

export async function getSpins(): Promise<SpinEntry[]> {
  const list = readJson<StoredSpin[]>(KEY_SPINS, []);
  return list.map((s) => ({
    user: s.user,
    country: s.country,
    points: s.points,
    timestamp: Timestamp.fromDate(new Date(s.timestamp)),
  }));
}

export async function addSpin(
  user: UserId,
  country: string,
  dateStr: string,
  points: number = 1
): Promise<void> {
  const list = readJson<StoredSpin[]>(KEY_SPINS, []);
  list.push({
    user,
    country,
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

export async function getRemainingCountries(): Promise<string[]> {
  const [allCities, removedList] = await Promise.all([
    getCities(),
    getRemoved(),
  ]);
  const removedSet = new Set(
    removedList.map((r) => `${r.city}|${r.country ?? ""}`)
  );
  const remaining = allCities.filter(
    (c) => !removedSet.has(`${c.city}|${c.country}`)
  );
  return [...new Set(remaining.map((c) => c.country))];
}

/** Zorg dat de fruitautomaat in de demo altijd landen heeft om te tonen (zelfde beeld als in het echte spel). */
const DEMO_FRUIT_CITIES: CityEntry[] = [
  { city: "Amsterdam", country: "Nederland", addedBy: "erik" },
  { city: "Parijs", country: "Frankrijk", addedBy: "erik" },
  { city: "Berlijn", country: "Duitsland", addedBy: "benno" },
  { city: "Madrid", country: "Spanje", addedBy: "benno" },
];

export async function ensureFruitMachineDemoData(): Promise<void> {
  const countries = await getRemainingCountries();
  if (countries.length >= 4) return;
  await setCities(DEMO_FRUIT_CITIES);
  writeJson(KEY_REMOVED, []);
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

export async function setWinner(country: string): Promise<void> {
  return setConfig({ winnerLocked: true, winnerCountry: country });
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
