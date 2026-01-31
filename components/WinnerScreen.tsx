"use client";

import { useState, useEffect } from "react";
import {
  getConfig,
  getSpins,
  computeWinner,
  setWinner,
} from "@/lib/firestore";

export function WinnerScreen() {
  const [winner, setWinnerState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const config = await getConfig();
        if (cancelled) return;
        if (config.winnerLocked && config.winnerCountry) {
          setWinnerState(config.winnerCountry);
          setLoading(false);
          return;
        }
        const spins = await getSpins();
        if (cancelled) return;
        const configAgain = await getConfig();
        if (cancelled) return;
        if (configAgain.winnerLocked && configAgain.winnerCountry) {
          setWinnerState(configAgain.winnerCountry);
          setLoading(false);
          return;
        }
        const country = computeWinner(spins);
        if (!country) {
          setWinnerState(null);
          setLoading(false);
          return;
        }
        await setWinner(country);
        if (!cancelled) setWinnerState(country);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Laden mislukt");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-center text-foreground/70">Laden...</p>;
  }

  if (error) {
    return (
      <p className="text-center text-red-600 dark:text-red-400">{error}</p>
    );
  }

  if (!winner) {
    return (
      <div className="rounded-lg border border-foreground/10 bg-background p-6 text-center">
        <p className="text-foreground/70">Nog geen winnaar (geen spins).</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-foreground/20 bg-foreground/5 p-8 text-center">
      <p className="mb-2 text-sm font-medium uppercase tracking-wider text-foreground/70">
        Winnaar
      </p>
      <p className="animate-pulse text-3xl font-bold text-foreground">
        WINNAAR: {winner}
      </p>
      <p className="mt-4 text-sm text-foreground/70">
        Daar gaan we heen in oktober 2026!
      </p>
    </div>
  );
}
