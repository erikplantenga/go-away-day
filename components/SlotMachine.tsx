"use client";

import { useState, useEffect, useRef } from "react";
import type { UserId } from "@/lib/firestore";
import {
  getRemainingCountries,
  addSpin,
  hasUserSpunToday,
} from "@/lib/firestore";
import { getCurrentDateString } from "@/lib/dates";

type Props = { currentUser: UserId };

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function SlotMachine({ currentUser }: Props) {
  const [countries, setCountries] = useState<string[]>([]);
  const [alreadySpun, setAlreadySpun] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dateStr = getCurrentDateString();
  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const list = await getRemainingCountries();
        if (!cancelled) setCountries(list);
        const spun = await hasUserSpunToday(currentUser, dateStr);
        if (!cancelled) setAlreadySpun(spun);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Laden mislukt");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [currentUser, dateStr]);

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, []);

  const handleSpin = () => {
    if (countries.length === 0 || alreadySpun || spinning) return;
    setSpinning(true);
    setError(null);
    setResult(null);
    const chosen = pickRandom(countries);
    spinTimeoutRef.current = setTimeout(() => {
      spinTimeoutRef.current = null;
      setResult(chosen);
      addSpin(currentUser, chosen, dateStr, 1)
        .then(() => setAlreadySpun(true))
        .catch((e) => setError(e instanceof Error ? e.message : "Spin mislukt"))
        .finally(() => setSpinning(false));
    }, 2000);
  };

  if (loading) {
    return <p className="text-center text-foreground/70">Laden...</p>;
  }

  if (countries.length === 0) {
    return (
      <div className="rounded-lg border border-foreground/10 bg-background p-4">
        <p className="text-center text-foreground/70">
          Nog geen 4 steden over. Eerst wegstrepen afronden.
        </p>
      </div>
    );
  }

  if (alreadySpun) {
    return (
      <div className="rounded-lg border border-foreground/10 bg-background p-4">
        <p className="text-center text-foreground/90">Vandaag al gespind.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-foreground/10 bg-background p-4">
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`flex min-h-[72px] min-w-[80px] items-center justify-center rounded-lg border-2 border-foreground/20 bg-foreground/5 px-2 py-3 text-center text-sm font-medium ${
              spinning ? "animate-pulse" : ""
            }`}
          >
            {result ? (
              <span className="text-foreground">{result}</span>
            ) : spinning ? (
              <span className="animate-spin text-foreground/50">◆</span>
            ) : (
              <span className="text-foreground/40">—</span>
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-foreground/70">
        Landen uit de 4 overgebleven steden.
      </p>
      <button
        type="button"
        disabled={spinning}
        onClick={handleSpin}
        className="w-full rounded-lg bg-foreground py-3 font-medium text-background disabled:opacity-50"
      >
        {spinning ? "Bezig..." : "Spin!"}
      </button>
      {error && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
