"use client";

import { useState } from "react";
import Link from "next/link";
import {
  setCitySubmission,
  combineAndDedupeCities,
  type CityEntry,
} from "@/lib/firestore";

/** Eenmalige seed: 10 steden (5 Erik, 5 Benno) – jij hebt ze doorgegeven. */
const ERIK_CITIES: string[] = ["Gdansk", "Boedapest", "Helsinki", "Ljubljana", "Napels"];
const BENNO_CITIES: string[] = ["Malta", "Istanbul", "Sicilië", "Cyprus", "Porto"];

function toEntries(cities: string[], addedBy: "erik" | "benno"): CityEntry[] {
  return cities.map((city) => ({ city, addedBy }));
}

export default function SeedPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const handleSeed = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const erikEntries = toEntries(ERIK_CITIES, "erik");
      const bennoEntries = toEntries(BENNO_CITIES, "benno");
      await setCitySubmission("erik", erikEntries);
      await setCitySubmission("benno", bennoEntries);
      await combineAndDedupeCities();
      setStatus("ok");
      setMessage("De 10 steden zijn ingevuld. Ga naar de site om de lijst + countdown te zien.");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Seed mislukt");
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-xl border border-foreground/10 bg-background p-6">
      <h1 className="text-xl font-bold text-foreground">Eenmalige seed – 10 steden</h1>
      <p className="text-sm text-foreground/80">
        Erik: {ERIK_CITIES.join(", ")}
        <br />
        Benno: {BENNO_CITIES.join(", ")}
      </p>
      <button
        type="button"
        onClick={handleSeed}
        disabled={status === "loading"}
        className="w-full rounded-lg bg-foreground py-3 font-medium text-background disabled:opacity-50"
      >
        {status === "loading" ? "Bezig…" : "Vul deze 10 steden in"}
      </button>
      {status === "ok" && (
        <p className="text-center text-sm text-green-600 dark:text-green-400">{message}</p>
      )}
      {status === "error" && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">{message}</p>
      )}
      <p className="text-center text-xs text-foreground/60">
        <Link href="/" className="underline">
          ← Terug naar home
        </Link>
      </p>
    </div>
  );
}
