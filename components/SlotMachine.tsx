"use client";

import { useState, useEffect, useRef } from "react";
import type { UserId, CityEntry } from "@/lib/firestore";
import {
  getRemainingCities,
  addSpin,
  hasUserSpunToday,
} from "@/lib/firestore";
import { getCurrentDateString, getRevealTime, getSpinOpenTime, isSpinOpenToday } from "@/lib/dates";
import { SPIN_PHRASES } from "@/lib/spinPhrases";
import { useSpinSound } from "@/lib/useSpinSound";
import { unlockAudio } from "@/lib/audioContext";
import { WinnerScreen } from "@/components/WinnerScreen";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { FlyingCelebration } from "@/components/FlyingCelebration";
import { Fireworks } from "@/components/Fireworks";

// Elk slot draait 5 seconden (cycled door steden), dan stopt het op de eindstad
const REVEAL_DELAY_MS = 5000;
const PAUSE_AFTER_LAST_MS = 2500;
const PAUSE_BEFORE_REVEAL_MS = 500;
const CYCLE_MS = 200; // hoe vaak de naam wisselt tijdens het draaien

type Props = { currentUser: UserId };

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function SpinCountdownTo10() {
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    const update = () => {
      const openAt = getSpinOpenTime();
      const left = Math.max(0, openAt.getTime() - Date.now());
      setCountdown(formatCountdown(left));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4 rounded-2xl border-4 border-amber-500/60 bg-gradient-to-b from-amber-500/20 to-amber-600/10 p-6 shadow-xl shadow-amber-500/20 text-center">
      <p className="text-lg font-bold text-foreground">Je mag vandaag 1× spinnen vanaf 10:00</p>
      <p className="text-3xl font-mono font-bold tabular-nums text-foreground">{countdown}</p>
      <p className="text-sm text-foreground/70">nog tot 10:00</p>
    </div>
  );
}

export function SlotMachine({ currentUser }: Props) {
  const [remainingCities, setRemainingCities] = useState<CityEntry[]>([]);
  const [alreadySpun, setAlreadySpun] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<(string | null)[]>([null, null, null]);
  const [spinningDisplay, setSpinningDisplay] = useState<(string | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealRequested, setRevealRequested] = useState(false);
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const [fireworksKey, setFireworksKey] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [spinPhraseIndex, setSpinPhraseIndex] = useState(0);
  const dateStr = getCurrentDateString();
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<(ReturnType<typeof setInterval> | undefined)[]>([]);

  const spinSoundDurationMs = PAUSE_BEFORE_REVEAL_MS + REVEAL_DELAY_MS * 3;
  useSpinSound(spinning, CYCLE_MS, spinSoundDurationMs);

  const canSpin = !alreadySpun && !spinning;
  const itemsCount = remainingCities.length;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const cities = await getRemainingCities();
        if (!cancelled) setRemainingCities(cities);
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
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      intervalsRef.current.forEach((i) => i != null && clearInterval(i));
    };
  }, []);

  useEffect(() => {
    if (!showFireworks) return;
    const t = setTimeout(() => setShowFireworks(false), 6000);
    return () => clearTimeout(t);
  }, [showFireworks]);

  useEffect(() => {
    if (!spinning) return;
    setSpinPhraseIndex(0);
    const iv = setInterval(
      () => setSpinPhraseIndex((i) => (i + 1) % SPIN_PHRASES.length),
      3000
    );
    return () => clearInterval(iv);
  }, [spinning]);

  const handleSpin = () => {
    if (itemsCount === 0 || !canSpin) return;
    unlockAudio();
    setSpinning(true);
    setError(null);
    setResults([null, null, null]);
    setSpinningDisplay([null, null, null]);
    const three: CityEntry[] = [
      pickRandom(remainingCities),
      pickRandom(remainingCities),
      pickRandom(remainingCities),
    ];
    const threeNames = three.map((c) => c.city);
    const cities = remainingCities.map((c) => c.city);
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    intervalsRef.current.forEach((i) => i != null && clearInterval(i));
    const start = PAUSE_BEFORE_REVEAL_MS;

    function startRoll(slotIndex: number) {
      setSpinningDisplay((prev) => {
        const next = [...prev];
        next[slotIndex] = cities[Math.floor(Math.random() * cities.length)] ?? null;
        return next;
      });
      const id = setInterval(() => {
        setSpinningDisplay((prev) => {
          const next = [...prev];
          next[slotIndex] = cities[Math.floor(Math.random() * cities.length)] ?? next[slotIndex];
          return next;
        });
      }, CYCLE_MS);
      intervalsRef.current[slotIndex] = id;
    }

    function stopRoll(slotIndex: number, finalCity: string) {
      if (intervalsRef.current[slotIndex]) {
        clearInterval(intervalsRef.current[slotIndex]!);
        intervalsRef.current[slotIndex] = undefined;
      }
      setSpinningDisplay((prev) => {
        const next = [...prev];
        next[slotIndex] = null;
        return next;
      });
      setResults((r) => {
        const next = [...r];
        next[slotIndex] = finalCity;
        return next;
      });
    }

    timeoutsRef.current = [
      setTimeout(() => startRoll(0), start),
      setTimeout(() => {
        stopRoll(0, threeNames[0]!);
        startRoll(1);
      }, start + REVEAL_DELAY_MS),
      setTimeout(() => {
        stopRoll(1, threeNames[1]!);
        startRoll(2);
      }, start + REVEAL_DELAY_MS * 2),
      setTimeout(() => {
        stopRoll(2, threeNames[2]!);
        setFireworksKey((k) => k + 1);
        setShowFireworks(true);
      }, start + REVEAL_DELAY_MS * 3),
      setTimeout(() => {
        setSpinningDisplay([null, null, null]);
        Promise.all(
          threeNames.map((city) => addSpin(currentUser, city, dateStr, 1))
        )
          .then(() => setAlreadySpun(true))
          .catch((e) => setError(e instanceof Error ? e.message : "Spin mislukt"))
          .finally(() => setSpinning(false));
      }, start + REVEAL_DELAY_MS * 3 + PAUSE_AFTER_LAST_MS),
    ];
  };

  useEffect(() => {
    if (!revealRequested || !alreadySpun) return;
    const update = () => {
      const revealAt = getRevealTime();
      const left = Math.max(0, Math.ceil((revealAt.getTime() - Date.now()) / 1000));
      setCountdownSec(left);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [revealRequested, alreadySpun]);

  if (loading) {
    return <p className="text-center text-foreground/70">Laden...</p>;
  }

  if (itemsCount === 0) {
    return (
      <div className="rounded-lg border border-foreground/10 bg-background p-4">
        <p className="text-center text-foreground/70">
          Nog geen steden over. Eerst wegstrepen afronden.
        </p>
      </div>
    );
  }

  if (!isSpinOpenToday()) {
    return <SpinCountdownTo10 />;
  }

  if (alreadySpun && revealRequested && countdownSec !== null) {
    if (countdownSec <= 0) {
      return (
        <div className="space-y-4">
          <p className="text-center text-sm text-foreground/70">De uitslag!</p>
          <WinnerScreen />
        </div>
      );
    }
    return (
      <div className="rounded-lg border border-foreground/10 bg-background p-4 text-center">
        <p className="text-sm text-foreground/80">Uitslag om 20:00. Nog</p>
        <p className="mt-2 text-3xl font-mono font-bold tabular-nums text-foreground">
          {countdownSec}
        </p>
        <p className="text-sm text-foreground/70">seconden tot 20:00</p>
      </div>
    );
  }

  if (alreadySpun) {
    return (
      <div className="relative overflow-hidden space-y-5 rounded-2xl border-4 border-amber-400/80 bg-gradient-to-br from-amber-400/25 via-yellow-500/15 to-orange-500/20 p-6 shadow-xl shadow-amber-500/25 ring-2 ring-amber-400/30 dark:border-amber-500/60 dark:from-amber-500/20 dark:via-yellow-500/15 dark:to-orange-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-amber-200/5 to-transparent dark:via-amber-400/5" aria-hidden />
        <p className="relative text-center text-lg font-bold text-foreground">🎉 Je hebt gespind!</p>
        <p className="relative text-center text-sm text-foreground/80">
          Morgen om 10:00 mag je nog een keer.
        </p>
        <button
          type="button"
          onClick={() => setRevealRequested(true)}
          className="relative w-full rounded-xl border-2 border-amber-600 bg-amber-500 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-amber-600"
        >
          Bekijk de uitslag
        </button>
      </div>
    );
  }

  return (
    <>
      {fireworksKey > 0 && <ConfettiBurst key={fireworksKey} />}
      {showFireworks && (
        <>
          <FlyingCelebration />
          <div className="pointer-events-none fixed inset-0 z-40 h-full w-full opacity-70">
            <Fireworks fullScreen />
          </div>
        </>
      )}
      <div className="relative z-50 space-y-6 rounded-2xl border-4 border-amber-500/60 bg-gradient-to-b from-amber-500/20 to-amber-600/10 p-6 shadow-xl shadow-amber-500/20">
        <p className="text-center text-xl font-bold uppercase tracking-wide text-foreground">
          🎰 Fruitautomaat
        </p>
        {showFireworks && (
          <p className="text-center text-lg font-bold text-amber-700 dark:text-amber-300">
            🎉 Mooie spin! 🎉
          </p>
        )}
      <div className="flex justify-center gap-3 sm:gap-4">
        {[0, 1, 2].map((i) => {
          const slotBg = [
            "border-amber-600/80 bg-amber-50/90 dark:bg-amber-950/30",
            "border-orange-500/80 bg-orange-50/90 dark:bg-orange-950/30",
            "border-yellow-500/80 bg-yellow-50/90 dark:bg-yellow-950/30",
          ][i]!;
          const slotText = [
            "text-amber-700 dark:text-amber-400",
            "text-orange-700 dark:text-orange-400",
            "text-yellow-700 dark:text-yellow-600",
          ][i]!;
          return (
            <div
              key={i}
              className={`flex min-h-[100px] min-w-[100px] sm:min-h-[120px] sm:min-w-[110px] flex-1 max-w-[140px] items-center justify-center rounded-xl border-4 px-3 py-4 text-center shadow-inner ${slotBg} ${
                spinning ? "animate-pulse" : ""
              }`}
            >
              {results[i] ? (
                <span className="text-lg font-bold sm:text-xl text-foreground">{results[i]}</span>
              ) : spinning && spinningDisplay[i] ? (
                <span className={`text-lg font-bold sm:text-xl animate-pulse ${slotText}`}>{spinningDisplay[i]}</span>
              ) : spinning ? (
                <span className="animate-spin text-2xl font-bold text-foreground/70">◆</span>
              ) : (
                <span className="text-2xl font-bold text-foreground/40">—</span>
              )}
            </div>
          );
        })}
      </div>
      {spinning && (
        <p className="text-center text-sm font-medium italic text-amber-700 dark:text-amber-300">
          {SPIN_PHRASES[spinPhraseIndex]}
        </p>
      )}
      <p className="text-center text-sm font-medium text-foreground/80">
        De 4 overgebleven steden.
      </p>
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
    </>
  );
}
