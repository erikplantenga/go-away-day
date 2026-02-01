/**
 * Eenmalige server-seed: vult de 10 steden (Erik 5, Benno 5) in Firebase.
 * Roep eenmalig aan: GET of POST https://go-away-day.vercel.app/api/seed
 * Werkt alleen als FIREBASE_SERVICE_ACCOUNT_JSON in Vercel staat.
 */

import { NextResponse } from "next/server";
import * as admin from "@/lib/firebase-admin";
import type { CityEntry } from "@/lib/firestore";

const ERIK_CITIES: string[] = ["Malta", "Istanbul", "Sicilië", "Cyprus", "Porto"];
const BENNO_CITIES: string[] = ["Gdansk", "Boedapest", "Helsinki", "Ljubljana", "Napels"];

function toEntries(cities: string[], addedBy: "erik" | "benno"): CityEntry[] {
  return cities.map((city) => ({ city, addedBy }));
}

function mergeAndDedupe(erik: CityEntry[], benno: CityEntry[]): CityEntry[] {
  const seen = new Set<string>();
  const out: CityEntry[] = [];
  for (const c of [...erik, ...benno]) {
    const key = `${c.city.toLowerCase()}|${(c.country ?? "").toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(c);
    }
  }
  return out;
}

export async function GET() {
  return runSeed();
}

export async function POST() {
  return runSeed();
}

async function runSeed() {
  if (!admin.isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Firebase niet geconfigureerd. Zet FIREBASE_SERVICE_ACCOUNT_JSON in Vercel." },
      { status: 503 }
    );
  }
  try {
    const erikEntries = toEntries(ERIK_CITIES, "erik");
    const bennoEntries = toEntries(BENNO_CITIES, "benno");
    await admin.setCitySubmission("erik", erikEntries);
    await admin.setCitySubmission("benno", bennoEntries);
    const merged = mergeAndDedupe(erikEntries, bennoEntries);
    await admin.setCities(merged);
    return NextResponse.json({
      ok: true,
      message: "De 10 steden zijn ingevuld. Erik en Benno zien nu allebei dezelfde lijst.",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Seed mislukt" },
      { status: 500 }
    );
  }
}
