/* eslint-disable react-hooks/rules-of-hooks -- useBackend/useApiBackend are plain functions, not React hooks */
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import * as local from "./localStorage";
import * as supabase from "./supabase";
import * as apiClient from "./apiClient";
import * as previewStorage from "./previewStorage";

/** Preview-modus: echte flow met vooringevulde data (?preview=echt). */
export function isPreviewMode(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as { __GO_AWAY_DAY_PREVIEW__?: boolean }).__GO_AWAY_DAY_PREVIEW__;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Supabase = 2 env vars, werkt op beide telefoons. */
export function isSupabaseConfigured(): boolean {
  return supabase.isSupabaseConfigured();
}

/** Firebase = voor als je dat later wilt. */
export function isFirebaseConfigured(): boolean {
  return !!(
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

function useBackend(): "supabase" | "firebase" | "local" {
  if (supabase.isSupabaseConfigured()) return "supabase";
  if (isFirebaseConfigured()) return "firebase";
  return "local";
}

/** Welke backend de app nu gebruikt (voor in de UI). */
export function getBackendLabel(): "Supabase" | "Firebase" | "Lokaal" {
  const b = useBackend();
  if (b === "supabase") return "Supabase";
  if (b === "firebase") return "Firebase";
  return "Lokaal";
}

let apiBackendPromise: Promise<boolean> | null = null;
async function useApiBackend(): Promise<boolean> {
  if (apiBackendPromise === null) {
    apiBackendPromise = fetch("/api/backend")
      .then((r) => r.ok)
      .catch(() => false);
  }
  return apiBackendPromise;
}

function getApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0] as FirebaseApp;
}

export function getDb(): Firestore {
  return getFirestore(getApp());
}

// --- Types ---
export type UserId = "erik" | "benno";

export interface CityEntry {
  city: string;
  country?: string;
  addedBy: UserId;
}

export interface RemovedEntry {
  city: string;
  country?: string;
  removedBy: UserId;
  date: string;
}

export interface SpinEntry {
  user: UserId;
  city: string;
  timestamp: Timestamp;
  points: number;
  /** Alleen voor weergave: balancing-spins niet in samenvatting tonen. */
  isBalancing?: boolean;
}

export interface GameConfig {
  winnerLocked?: boolean;
  winnerCity?: string;
  /** Bij de finale: 2 willekeurige steden voor de beslissende spin (niemand weet vooraf welke). */
  finaleFinalists?: string[];
  phaseOverride?: string;
}

// --- Cities (combined list after 1 feb) ---
const CITIES_DOC = "combined";

export async function getCities(): Promise<CityEntry[]> {
  if (isPreviewMode()) return previewStorage.getCities();
  if (useBackend() === "supabase") return supabase.getCities();
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.getCities();
    return local.getCities();
  }
  const db = getDb();
  const ref = doc(db, "cities", CITIES_DOC);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  const data = snap.data();
  return (data?.cities ?? []) as CityEntry[];
}

export async function setCities(cities: CityEntry[]): Promise<void> {
  if (isPreviewMode()) return previewStorage.setCities(cities);
  if (useBackend() === "supabase") return supabase.setCities(cities);
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.setCities(cities);
    return local.setCities(cities);
  }
  const db = getDb();
  await setDoc(doc(db, "cities", CITIES_DOC), { cities });
}

// --- City submissions (per user, before combine) ---
export async function setCitySubmission(
  user: UserId,
  cities: CityEntry[]
): Promise<void> {
  if (isPreviewMode()) return previewStorage.setCitySubmission(user, cities);
  if (useBackend() === "supabase") return supabase.setCitySubmission(user, cities);
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.setCitySubmission(user, cities);
    return local.setCitySubmission(user, cities);
  }
  const db = getDb();
  await setDoc(doc(db, "citySubmissions", user), {
    cities,
    submittedAt: serverTimestamp(),
  });
}

export async function getCitySubmission(
  user: UserId
): Promise<CityEntry[] | null> {
  if (isPreviewMode()) return previewStorage.getCitySubmission(user);
  if (useBackend() === "supabase") return supabase.getCitySubmission(user);
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.getCitySubmission(user);
    return local.getCitySubmission(user);
  }
  const db = getDb();
  const snap = await getDoc(doc(db, "citySubmissions", user));
  if (!snap.exists()) return null;
  return (snap.data()?.cities ?? null) as CityEntry[];
}

export async function hasBothSubmitted(): Promise<boolean> {
  if (isPreviewMode()) return previewStorage.hasBothSubmitted();
  if (useBackend() === "supabase") return supabase.hasBothSubmitted();
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.hasBothSubmitted();
    return local.hasBothSubmitted();
  }
  const [erik, benno] = await Promise.all([
    getCitySubmission("erik"),
    getCitySubmission("benno"),
  ]);
  return erik !== null && benno !== null;
}

export async function combineAndDedupeCities(): Promise<CityEntry[]> {
  if (isPreviewMode()) return previewStorage.combineAndDedupeCities();
  if (useBackend() === "supabase") return supabase.combineAndDedupeCities();
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.combineAndDedupeCities();
    return local.combineAndDedupeCities();
  }
  const [erik, benno] = await Promise.all([
    getCitySubmission("erik"),
    getCitySubmission("benno"),
  ]);
  const all: CityEntry[] = [...(erik ?? []), ...(benno ?? [])];
  const seen = new Set<string>();
  const deduped: CityEntry[] = [];
  for (const c of all) {
    const key = `${c.city.toLowerCase()}|${(c.country ?? "").toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(c);
    }
  }
  await setCities(deduped);
  return deduped;
}

// --- Removed (wegstreep) ---
export async function getRemoved(): Promise<RemovedEntry[]> {
  if (isPreviewMode()) return previewStorage.getRemoved();
  if (useBackend() === "supabase") return supabase.getRemoved();
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.getRemoved();
    return local.getRemoved();
  }
  const db = getDb();
  const snap = await getDocs(collection(db, "removed"));
  return snap.docs.map((d) => d.data() as RemovedEntry);
}

export async function addRemoved(
  city: string,
  country: string | undefined,
  removedBy: UserId,
  date: string
): Promise<void> {
  if (isPreviewMode()) return previewStorage.addRemoved(city, country, removedBy, date);
  if (useBackend() === "supabase")
    return supabase.addRemoved(city, country, removedBy, date);
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.addRemoved(city, country, removedBy, date);
    return local.addRemoved(city, country, removedBy, date);
  }
  const db = getDb();
  await addDoc(collection(db, "removed"), {
    city,
    country: country ?? null,
    removedBy,
    date,
    removedAt: serverTimestamp(),
  });
}

export async function hasUserStruckToday(
  user: UserId,
  dateStr: string
): Promise<boolean> {
  if (isPreviewMode()) return previewStorage.hasUserStruckToday(user, dateStr);
  if (useBackend() === "supabase")
    return supabase.hasUserStruckToday(user, dateStr);
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.hasUserStruckToday(user, dateStr);
    return local.hasUserStruckToday(user, dateStr);
  }
  const db = getDb();
  const q = query(
    collection(db, "removed"),
    where("removedBy", "==", user),
    where("date", "==", dateStr)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

/** Aantal keer dat deze gebruiker een stad heeft weggestreept (je moet er 3 doen om verder te kunnen). */
export async function getStrikeCount(user: UserId): Promise<number> {
  if (isPreviewMode()) return previewStorage.getStrikeCount(user);
  if (useBackend() === "supabase") return supabase.getStrikeCount(user);
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.getStrikeCount(user);
    return local.getStrikeCount(user);
  }
  const db = getDb();
  const q = query(collection(db, "removed"), where("removedBy", "==", user));
  const snap = await getDocs(q);
  return snap.size;
}

/** Aantal keer dat deze gebruiker op dateStr heeft weggestreept (2 feb max 1, 3 feb max 2). */
export async function getStrikeCountForDate(user: UserId, dateStr: string): Promise<number> {
  if (isPreviewMode()) return previewStorage.getStrikeCountForDate(user, dateStr);
  if (useBackend() === "supabase") return supabase.getStrikeCountForDate(user, dateStr);
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.getStrikeCountForDate(user, dateStr);
    return local.getStrikeCountForDate(user, dateStr);
  }
  const db = getDb();
  const q = query(
    collection(db, "removed"),
    where("removedBy", "==", user),
    where("date", "==", dateStr)
  );
  const snap = await getDocs(q);
  return snap.size;
}

// --- Spins ---
export async function getSpins(): Promise<SpinEntry[]> {
  if (isPreviewMode()) return previewStorage.getSpins();
  if (useBackend() === "supabase") return supabase.getSpins();
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.getSpins();
    return local.getSpins();
  }
  const db = getDb();
  const q = query(
    collection(db, "spins"),
    orderBy("timestamp", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SpinEntry & { id: string }));
}

export async function addSpin(
  user: UserId,
  city: string,
  dateStr: string,
  points: number = 1
): Promise<void> {
  if (isPreviewMode()) return previewStorage.addSpin(user, city, dateStr, points);
  if (useBackend() === "supabase")
    return supabase.addSpin(user, city, dateStr, points);
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.addSpin(user, city, dateStr, points);
    return local.addSpin(user, city, dateStr, points);
  }
  const db = getDb();
  await addDoc(collection(db, "spins"), {
    user,
    city,
    date: dateStr,
    timestamp: serverTimestamp(),
    points,
  });
}

/**
 * Voegt "balancing"-spins toe zodat de nummer 2 evenveel punten krijgt als nummer 1.
 * Deze spins tellen mee voor de stand maar worden niet in de samenvatting getoond.
 */
export async function addBalancingSpins(
  city: string,
  pointsToAdd: number,
  dateStr: string
): Promise<void> {
  if (isPreviewMode()) return;
  if (useBackend() === "supabase") return;
  if (useBackend() === "local") return;
  const db = getDb();
  for (let i = 0; i < pointsToAdd; i++) {
    await addDoc(collection(db, "spins"), {
      user: "erik",
      city,
      date: dateStr,
      timestamp: serverTimestamp(),
      points: 1,
      isBalancing: true,
    });
  }
}

export async function hasUserSpunToday(
  user: UserId,
  dateStr: string
): Promise<boolean> {
  if (isPreviewMode()) return previewStorage.hasUserSpunToday(user, dateStr);
  if (useBackend() === "supabase")
    return supabase.hasUserSpunToday(user, dateStr);
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.hasUserSpunToday(user, dateStr);
    return local.hasUserSpunToday(user, dateStr);
  }
  const db = getDb();
  const q = query(
    collection(db, "spins"),
    where("user", "==", user),
    where("date", "==", dateStr)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

/** Overgebleven steden na wegstrepen – alleen steden, gebruikt voor spin en winnaar. */
export async function getRemainingCities(): Promise<CityEntry[]> {
  if (isPreviewMode()) return previewStorage.getRemainingCities();
  if (useBackend() === "supabase") return supabase.getRemainingCities();
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.getRemainingCities();
    return local.getRemainingCities();
  }
  const [allCities, removedList] = await Promise.all([
    getCities(),
    getRemoved(),
  ]);
  const removedSet = new Set(
    removedList.map((r) => `${r.city}|${r.country ?? ""}`)
  );
  return allCities.filter(
    (c) => !removedSet.has(`${c.city}|${c.country ?? ""}`)
  );
}

export function subscribeSpins(
  callback: (spins: (SpinEntry & { id: string })[]) => void
): Unsubscribe {
  if (isPreviewMode()) return previewStorage.subscribeSpins(callback);
  if (useBackend() === "supabase") return supabase.subscribeSpins(callback);
  if (useBackend() === "local") {
    let unsub: (() => void) | null = null;
    if (typeof window !== "undefined") {
      useApiBackend().then((ok) => {
        unsub = ok ? apiClient.subscribeSpins(callback) : local.subscribeSpins(callback);
      });
      return () => {
        unsub?.();
      };
    }
    return local.subscribeSpins(callback);
  }
  const db = getDb();
  const q = query(
    collection(db, "spins"),
    orderBy("timestamp", "asc")
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as (SpinEntry & { id: string })[];
    callback(list);
  });
}

// --- Config ---
const CONFIG_DOC = "game";

export async function getConfig(): Promise<GameConfig> {
  if (isPreviewMode()) return previewStorage.getConfig();
  if (useBackend() === "supabase") return supabase.getConfig();
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.getConfig();
    return local.getConfig();
  }
  const db = getDb();
  const snap = await getDoc(doc(db, "config", CONFIG_DOC));
  if (!snap.exists()) return {};
  return snap.data() as GameConfig;
}

export async function setConfig(updates: Partial<GameConfig>): Promise<void> {
  if (isPreviewMode()) return previewStorage.setConfig(updates);
  if (useBackend() === "supabase") return supabase.setConfig(updates);
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.setConfig(updates);
    return local.setConfig(updates);
  }
  const db = getDb();
  const ref = doc(db, "config", CONFIG_DOC);
  const current = (await getDoc(ref)).data() ?? {};
  await setDoc(ref, { ...current, ...updates });
}

export async function setWinner(city: string): Promise<void> {
  if (isPreviewMode()) return previewStorage.setWinner(city);
  if (useBackend() === "supabase") return supabase.setWinner(city);
  if (useBackend() === "local") {
    if (await useApiBackend()) return apiClient.setWinner(city);
    return local.setWinner(city);
  }
  await setConfig({ winnerLocked: true, winnerCity: city });
}

/** Steden met de hoogste punten (meerdere bij gelijkstand). */
export function getTiedCities(spins: (SpinEntry & { id?: string })[]): string[] {
  const pointsByCity = new Map<string, number>();
  for (const s of spins) {
    const city = s.city;
    if (!city) continue;
    pointsByCity.set(city, (pointsByCity.get(city) ?? 0) + (s.points ?? 1));
  }
  const entries = Array.from(pointsByCity.entries()).sort(
    (a, b) => b[1]! - a[1]!
  );
  if (entries.length === 0) return [];
  const maxPoints = entries[0]![1]!;
  return entries.filter((e) => e[1] === maxPoints).map((e) => e[0]!);
}

/** Winnaar uit spins: meeste punten per stad; bij gelijkstand meeste spins op die stad; anders alfabetisch eerste. */
export function computeWinner(
  spins: (SpinEntry & { id?: string })[]
): string {
  const pointsByCity = new Map<string, number>();
  const spinCountByCity = new Map<string, number>();
  for (const s of spins) {
    const city = s.city;
    if (!city) continue;
    pointsByCity.set(city, (pointsByCity.get(city) ?? 0) + (s.points ?? 1));
    spinCountByCity.set(city, (spinCountByCity.get(city) ?? 0) + 1);
  }
  const entries = Array.from(pointsByCity.entries()).sort(
    (a, b) => b[1]! - a[1]!
  );
  if (entries.length === 0) return "";
  const maxPoints = entries[0]![1]!;
  const tied = entries.filter((e) => e[1] === maxPoints).map((e) => e[0]!);
  if (tied.length === 1) return tied[0]!;
  const bySpins = tied
    .map((c) => ({ city: c, count: spinCountByCity.get(c) ?? 0 }))
    .sort((a, b) => b.count - a.count);
  if (bySpins[0]!.count > (bySpins[1]?.count ?? 0)) return bySpins[0]!.city;
  const stillTied = bySpins.filter((x) => x.count === (bySpins[0]?.count ?? 0)).map((x) => x.city);
  stillTied.sort((a, b) => a.localeCompare(b));
  return stillTied[0] ?? "";
}
