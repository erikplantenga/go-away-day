"use client";

import { useState, useEffect, useRef } from "react";
import type { UserId } from "@/lib/firestore";
import {
  getRemainingCountries,
  addSpin,
  hasUserSpunToday,
  isDemoMode,
} from "@/lib/firestore";
import { getCurrentDateString } from "@/lib/dates";
import { getRevealTime } from "@/lib/dates";
import { WinnerScreen } from "@/components/WinnerScreen";

const REVEAL_DELAY_MS = 1400;
const PAUSE_AFTER_LAST_MS = 1800;
const DEMO_SPINS_REQUIRED = 3;

type Props = {
  currentUser: UserId;
  /** Demo: na countdown callback om naar finale te gaan */
  onRevealComplete?: () => void;
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function SlotMachine({ currentUser, onRevealComplete }: Props) {
  const [countries, setCountries] = useState<string[]>([]);
  const [alreadySpun, setAlreadySpun] = useState(false);
  const [demoSpinCount, setDemoSpinCount] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<(string | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealRequested, setRevealRequested] = useState(false);
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const dateStr = getCurrentDateString();
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isDemo = typeof window !== "undefined" && isDemoMode();
  const demoDone = isDemo && demoSpinCount >= DEMO_SPINS_REQUIRED;
  const canSpin = isDemo ? !demoDone && !spinning : !alreadySpun && !spinning;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const list = await getRemainingCountries();
        if (!cancelled) setCountries(list);
        if (!isDemo) {
          const spun = await hasUserSpunToday(currentUser, dateStr);
          if (!cancelled) setAlreadySpun(spun);
        }
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
  }, [currentUser, dateStr, isDemo]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const handleSpin = () => {
    if (countries.length === 0 || !canSpin) return;
    setSpinning(true);
    setError(null);
    setResults([null, null, null]);
    const three: string[] = [
      pickRandom(countries),
      pickRandom(countries),
      pickRandom(countries),
    ];
    const chosen = three[1]!; // middelste telt voor de spin
    const isLastDemoSpin = isDemo && demoSpinCount + 1 >= DEMO_SPINS_REQUIRED;
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [
      setTimeout(() => setResults((r) => [three[0]!, r[1], r[2]]), REVEAL_DELAY_MS),
      setTimeout(() => setResults((r) => [r[0], three[1]!, r[2]]), REVEAL_DELAY_MS * 2),
      setTimeout(() => setResults([three[0]!, three[1]!, three[2]!]), REVEAL_DELAY_MS * 3),
      setTimeout(() => {
        addSpin(currentUser, chosen, dateStr, 1)
          .then(() => {
            if (isDemo) {
              setDemoSpinCount((n) => n + 1);
              if (isLastDemoSpin) setAlreadySpun(true);
            } else {
              setAlreadySpun(true);
            }
          })
          .catch((e) => setError(e instanceof Error ? e.message : "Spin mislukt"))
          .finally(() => setSpinning(false));
      }, REVEAL_DELAY_MS * 3 + PAUSE_AFTER_LAST_MS),
    ];
  };

  useEffect(() => {
    if (!revealRequested || (!alreadySpun && !demoDone)) return;
    if (isDemo) {
      let sec = 10;
      setCountdownSec(sec);
      const t = setInterval(() => {
        sec -= 1;
        setCountdownSec(sec);
        if (sec <= 0) {
          clearInterval(t);
          onRevealComplete?.();
        }
      }, 1000);
      return () => clearInterval(t);
    }
    const update = () => {
      const revealAt = getRevealTime();
      const left = Math.max(0, Math.ceil((revealAt.getTime() - Date.now()) / 1000));
      setCountdownSec(left);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [revealRequested, alreadySpun, demoDone, isDemo, onRevealComplete]);

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

  if (alreadySpun && revealRequested && countdownSec !== null) {
    if (isDemo && countdownSec <= 0) return null;
    if (!isDemo && countdownSec <= 0) {
      return (
        <div className="space-y-4">
          <p className="text-center text-sm text-foreground/70">De uitslag!</p>
          <WinnerScreen />
        </div>
      );
    }
    return (
      <div className="rounded-lg border border-foreground/10 bg-background p-4 text-center">
        <p className="text-sm text-foreground/80">
          {isDemo ? "Uitslag over" : "Uitslag om 20:30. Nog"}
        </p>
        <p className="mt-2 text-3xl font-mono font-bold tabular-nums text-foreground">
          {countdownSec}
        </p>
        <p className="text-sm text-foreground/70">{isDemo ? "seconden" : "seconden tot 20:30"}</p>
      </div>
    );
  }

  if (alreadySpun || demoDone) {
    return (
      <div className="space-y-5 rounded-2xl border-4 border-amber-500/60 bg-gradient-to-b from-amber-500/20 to-amber-600/10 p-6 shadow-xl shadow-amber-500/20">
        <p className="text-center text-lg font-bold text-foreground">
          {isDemo ? `Je hebt ${DEMO_SPINS_REQUIRED}× gespind.` : "Je hebt gespind."}
        </p>
        {isDemo && (
          <p className="text-center text-sm italic text-foreground/80">
            {currentUser === "erik" ? "Benno" : "Erik"} heeft ook gespind.
          </p>
        )}
        <button
          type="button"
          onClick={() => setRevealRequested(true)}
          className="w-full rounded-xl border-2 border-amber-600 bg-amber-500 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-amber-600"
        >
          Bekijk de uitslag
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border-4 border-amber-500/60 bg-gradient-to-b from-amber-500/20 to-amber-600/10 p-6 shadow-xl shadow-amber-500/20">
      <p className="text-center text-xl font-bold uppercase tracking-wide text-foreground">
        🎰 Fruitautomaat
      </p>
      <div className="flex justify-center gap-3 sm:gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`flex min-h-[100px] min-w-[100px] sm:min-h-[120px] sm:min-w-[110px] flex-1 max-w-[140px] items-center justify-center rounded-xl border-4 border-amber-600/80 bg-amber-50/90 px-3 py-4 text-center shadow-inner dark:bg-amber-950/30 ${
              spinning ? "animate-pulse" : ""
            }`}
          >
            {results[i] ? (
              <span className="text-lg font-bold sm:text-xl text-foreground">{results[i]}</span>
            ) : spinning ? (
              <span className="animate-spin text-2xl font-bold text-amber-600">◆</span>
            ) : (
              <span className="text-2xl font-bold text-foreground/40">—</span>
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-sm font-medium text-foreground/80">
        Landen uit de 4 overgebleven steden.
        {isDemo && (
          <span className="block mt-1 text-foreground/70">
            Demo: {demoSpinCount}/{DEMO_SPINS_REQUIRED} spins
          </span>
        )}
      </p>
      {isDemo && demoSpinCount > 0 && (
        <p className="text-center text-sm italic text-foreground/80">
          {currentUser === "erik" ? "Benno" : "Erik"} heeft ook gespind.
        </p>
      )}
      <button
        type="button"
        disabled={spinning}
        onClick={handleSpin}
        className="w-full rounded-xl border-4 border-amber-600 bg-amber-500 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-amber-600 disabled:opacity-50"
      >
        {spinning ? "Bezig..." : "SPIN!"}
      </button>
      {error && (
        <p className="text-center text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
