"use client";

import { useState, useEffect } from "react";
import {
  getConfig,
  getSpins,
  computeWinner,
  setWinner,
} from "@/lib/firestore";
import { isAfterRevealTime, getRevealTime } from "@/lib/dates";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

type WinnerScreenProps = {
  /** Demo: toon direct deze winnaar (stad) zonder laden */
  demoWinner?: string;
};

export function WinnerScreen({ demoWinner }: WinnerScreenProps = {}) {
  const [winner, setWinnerState] = useState<string | null>(demoWinner ?? null);
  const [loading, setLoading] = useState(!demoWinner);
  const [error, setError] = useState<string | null>(null);
  const [clicked, setClicked] = useState(false);
  const [countdown, setCountdown] = useState<string>("");

  const showReveal = !!demoWinner || isAfterRevealTime();

  useEffect(() => {
    if (!showReveal && clicked) {
      const revealAt = getRevealTime();
      const update = () => {
        const left = revealAt.getTime() - Date.now();
        setCountdown(left <= 0 ? "0:00" : formatCountdown(left));
      };
      update();
      const t = setInterval(update, 1000);
      return () => clearInterval(t);
    }
  }, [showReveal, clicked]);

  useEffect(() => {
    if (!showReveal || demoWinner) return;
    let cancelled = false;
    async function load() {
      try {
        const config = await getConfig();
        if (cancelled) return;
        const savedWinner = config.winnerCity ?? (config as { winnerCountry?: string }).winnerCountry;
        if (config.winnerLocked && savedWinner) {
          setWinnerState(savedWinner);
          setLoading(false);
          return;
        }
        const spins = await getSpins();
        if (cancelled) return;
        const configAgain = await getConfig();
        if (cancelled) return;
        const savedAgain = configAgain.winnerCity ?? (configAgain as { winnerCountry?: string }).winnerCountry;
        if (configAgain.winnerLocked && savedAgain) {
          setWinnerState(savedAgain);
          setLoading(false);
          return;
        }
        const city = computeWinner(spins);
        if (!city) {
          setWinnerState(null);
          setLoading(false);
          return;
        }
        await setWinner(city);
        if (!cancelled) setWinnerState(city);
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
  }, [showReveal, demoWinner]);

  if (!showReveal) {
    return (
      <div className="rounded-xl border-2 border-foreground/20 bg-foreground/5 p-8 text-center">
        {!clicked ? (
          <button
            type="button"
            onClick={() => setClicked(true)}
            className="rounded-lg bg-foreground px-6 py-3 font-medium text-background"
          >
            Klik hier voor uitslag
          </button>
        ) : (
          <div>
            <p className="text-lg font-medium text-foreground">
              De uitslag komt om 20:30, spannend he?
            </p>
            <p className="mt-4 text-2xl font-mono font-bold tabular-nums text-foreground">
              {countdown}
            </p>
            <p className="mt-1 text-sm text-foreground/70">nog te gaan</p>
          </div>
        )}
      </div>
    );
  }

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

  const displayWinner = winner ?? "";

  return (
    <div className="rounded-xl border-2 border-foreground/20 bg-foreground/5 p-8 text-center">
      <p className="mb-2 text-sm font-medium uppercase tracking-wider text-foreground/70">
        Winnaar
      </p>
      <p className="animate-pulse text-3xl font-bold text-foreground">
        WINNAAR: {displayWinner}
      </p>
      <p className="mt-4 text-sm text-foreground/70">
        Daar gaan we heen in oktober 2026!
      </p>
    </div>
  );
}
