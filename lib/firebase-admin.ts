/**
 * Firebase Admin op de server – 1 env var: FIREBASE_SERVICE_ACCOUNT_JSON.
 * Plak de hele JSON van Firebase Console → Service accounts → Generate key.
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { CityEntry, RemovedEntry, GameConfig } from "./firestore";
import type { QuizMiss, QuizPlayer } from "./mpQuiz";

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

export type MpQuizTotals = { erik: number; benno: number };

export type MpQuizPlay = {
  user: QuizPlayer;
  date: string;
  correct: number;
  spinResults: number[];
  spinScore: number | null;
  misses: QuizMiss[];
};

type QuizMem = {
  totals: MpQuizTotals;
  plays: Map<string, MpQuizPlay>;
};

function quizMem(): QuizMem {
  const g = globalThis as unknown as { __mpQuiz?: QuizMem };
  if (!g.__mpQuiz || !(g.__mpQuiz.plays instanceof Map)) {
    const prev = g.__mpQuiz?.totals;
    g.__mpQuiz = {
      totals: prev ?? { erik: 0, benno: 0 },
      plays: new Map(),
    };
  }
  return g.__mpQuiz;
}

function playKey(user: QuizPlayer, date: string) {
  return `${user}_${date}`;
}

function readMisses(data: Record<string, unknown>, date: string): QuizMiss[] {
  if (!Array.isArray(data.misses)) return [];
  return data.misses
    .map((item) => {
      const row = item as Partial<QuizMiss>;
      const question = String(row.question ?? "").trim();
      if (!question) return null;
      return {
        date: String(row.date ?? date),
        question,
        answer: String(row.answer ?? ""),
        picked: String(row.picked ?? ""),
      };
    })
    .filter((row): row is QuizMiss => row != null);
}

export async function getMpQuizTotals(): Promise<MpQuizTotals> {
  const d = db();
  if (!d) return quizMem().totals;
  const snap = await d.collection("mpQuiz").doc("totals").get();
  const data = snap.data() ?? {};
  return {
    erik: Number(data.erik ?? 0),
    benno: Number(data.benno ?? 0),
  };
}

export async function getMpQuizPlay(
  user: QuizPlayer,
  date: string,
): Promise<MpQuizPlay | null> {
  const d = db();
  const key = playKey(user, date);
  if (!d) return quizMem().plays.get(key) ?? null;
  const snap = await d.collection("mpQuiz").doc(`play_${key}`).get();
  if (!snap.exists) return null;
  const data = (snap.data() ?? {}) as Record<string, unknown>;
  return {
    user,
    date,
    correct: Number(data.correct ?? data.points ?? 0),
    spinResults: Array.isArray(data.spinResults) ? data.spinResults.map((n: number) => Number(n)) : [],
    spinScore: data.spinScore == null ? null : Number(data.spinScore),
    misses: readMisses(data, date),
  };
}

export async function hasMpQuizPlayed(user: "erik" | "benno", date: string): Promise<boolean> {
  const play = await getMpQuizPlay(user, date);
  return play != null && play.spinScore != null;
}

export async function hasMpQuizStarted(user: "erik" | "benno", date: string): Promise<boolean> {
  return (await getMpQuizPlay(user, date)) != null;
}

export async function beginMpQuizPlay(
  user: QuizPlayer,
  date: string,
  correct: number,
  misses: QuizMiss[] = [],
): Promise<MpQuizPlay> {
  const existing = await getMpQuizPlay(user, date);
  if (existing) return existing;
  const play: MpQuizPlay = {
    user,
    date,
    correct: Math.max(0, Math.min(5, Math.round(correct))),
    spinResults: [],
    spinScore: Math.max(0, Math.min(5, Math.round(correct))) === 0 ? 0 : null,
    misses,
  };
  const d = db();
  if (!d) {
    quizMem().plays.set(playKey(user, date), play);
    return play;
  }
  await d.collection("mpQuiz").doc(`play_${playKey(user, date)}`).set({
    ...play,
    at: new Date().toISOString(),
  });
  return play;
}

export async function recordMpQuizSpin(
  user: "erik" | "benno",
  date: string,
  spinPoints: number,
): Promise<{ play: MpQuizPlay; totals: MpQuizTotals; added: boolean }> {
  const pts = Math.max(0, Math.min(15, Math.round(spinPoints)));
  const d = db();
  const key = playKey(user, date);

  if (!d) {
    const mem = quizMem();
    const play = mem.plays.get(key);
    if (!play) throw new Error("Geen quizronde");
    if (play.spinScore != null) return { play, totals: mem.totals, added: false };
    if (play.spinResults.length >= play.correct) {
      play.spinScore = play.spinResults.reduce((a, b) => a + b, 0);
      mem.totals[user] += play.spinScore;
      return { play, totals: mem.totals, added: true };
    }
    play.spinResults = [...play.spinResults, pts];
    if (play.spinResults.length >= play.correct) {
      play.spinScore = play.spinResults.reduce((a, b) => a + b, 0);
      mem.totals[user] += play.spinScore;
      return { play, totals: mem.totals, added: true };
    }
    return { play, totals: mem.totals, added: false };
  }

  const playRef = d.collection("mpQuiz").doc(`play_${key}`);
  const totRef = d.collection("mpQuiz").doc("totals");
  let out: MpQuizPlay | null = null;
  let added = false;
  await d.runTransaction(async (tx) => {
    const snap = await tx.get(playRef);
    if (!snap.exists) throw new Error("Geen quizronde");
    const data = snap.data() ?? {};
    const play: MpQuizPlay = {
      user,
      date,
      correct: Number(data.correct ?? 0),
      spinResults: Array.isArray(data.spinResults) ? data.spinResults.map((n: number) => Number(n)) : [],
      spinScore: data.spinScore == null ? null : Number(data.spinScore),
      misses: readMisses(data as Record<string, unknown>, date),
    };
    if (play.spinScore != null) {
      out = play;
      return;
    }
    if (play.spinResults.length < play.correct) {
      play.spinResults = [...play.spinResults, pts];
    }
    if (play.spinResults.length >= play.correct) {
      play.spinScore = play.spinResults.reduce((a, b) => a + b, 0);
      const tot = await tx.get(totRef);
      const t = tot.data() ?? {};
      const next = {
        erik: Number(t.erik ?? 0),
        benno: Number(t.benno ?? 0),
        [user]: Number(t[user] ?? 0) + play.spinScore,
        updatedAt: new Date().toISOString(),
      };
      tx.set(totRef, next, { merge: true });
      added = true;
    }
    tx.set(playRef, { ...play, at: new Date().toISOString() }, { merge: true });
    out = play;
  });
  return { play: out!, totals: await getMpQuizTotals(), added };
}
