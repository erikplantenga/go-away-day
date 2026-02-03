"use client";

import { useState, useEffect, useRef } from "react";
import { Fireworks } from "@/components/Fireworks";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { useSpinSound } from "@/lib/useSpinSound";

// Zelfde als origineel: 10 seconden per stad, ~32 s totaal
const REVEAL_DELAY_MS = 10000;
const PAUSE_AFTER_LAST_MS = 2500;
const PAUSE_BEFORE_REVEAL_MS = 500;
const CYCLE_MS = 200;

const DEMO_CITIES = ["Malta", "Boedapest", "Helsinki", "Napels"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function DemoSpin() {
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<(string | null)[]>([null, null, null]);
  const [spinningDisplay, setSpinningDisplay] = useState<(string | null)[]>([null, null, null]);
  const [showFireworks, setShowFireworks] = useState(false);
  const [fireworksKey, setFireworksKey] = useState(0);
  const [done, setDone] = useState(false);
  const [stand, setStand] = useState<Map<string, number>>(new Map());
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<(ReturnType<typeof setInterval> | undefined)[]>([]);

  useSpinSound(spinning, CYCLE_MS);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      intervalsRef.current.forEach((i) => i && clearInterval(i));
    };
  }, []);

  useEffect(() => {
    if (!showFireworks) return;
    const t = setTimeout(() => setShowFireworks(false), 6000);
    return () => clearTimeout(t);
  }, [showFireworks]);

  const handleSpin = () => {
    setSpinning(true);
    setDone(false);
    setResults([null, null, null]);
    setSpinningDisplay([null, null, null]);
    const threeNames = [
      pickRandom(DEMO_CITIES),
      pickRandom(DEMO_CITIES),
      pickRandom(DEMO_CITIES),
    ];
    const cities = DEMO_CITIES;
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    intervalsRef.current.forEach((i) => i && clearInterval(i));
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

    // Eerste slot direct laten draaien
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
        setStand((prev) => {
          const next = new Map(prev);
          for (const city of threeNames) {
            next.set(city, (next.get(city) ?? 0) + 1);
          }
          return next;
        });
        setSpinning(false);
        setDone(true);
      }, start + REVEAL_DELAY_MS * 3 + PAUSE_AFTER_LAST_MS),
    ];
  };

  const reset = () => {
    setResults([null, null, null]);
    setSpinningDisplay([null, null, null]);
    setDone(false);
  };

  const standEntries = Array.from(stand.entries())
    .map(([city, points]) => ({ city, points }))
    .sort((a, b) => b.points - a.points);

  return (
    <>
      {fireworksKey > 0 && <ConfettiBurst key={fireworksKey} />}
      {showFireworks && (
        <div className="pointer-events-none fixed inset-0 z-40 h-full w-full opacity-70">
          <Fireworks fullScreen />
        </div>
      )}
      <div className="space-y-6 rounded-2xl border-4 border-amber-500/60 bg-gradient-to-b from-amber-500/20 to-amber-600/10 p-6 shadow-xl shadow-amber-500/20">
        <p className="text-center text-sm font-medium text-foreground/70">
          Zelfde als in het echt: 10 s per stad, ~32 s totaal. Klik op SPIN!
        </p>
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
                <span className="text-lg font-bold sm:text-xl text-foreground">
                  {results[i]}
                </span>
              ) : spinning && spinningDisplay[i] ? (
                <span className="text-lg font-bold sm:text-xl animate-pulse text-amber-700 dark:text-amber-400">
                  {spinningDisplay[i]}
                </span>
              ) : spinning ? (
                <span className="animate-spin text-2xl font-bold text-amber-600">◆</span>
              ) : (
                <span className="text-2xl font-bold text-foreground/40">—</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm font-medium text-foreground/80">
          Steden: {DEMO_CITIES.join(", ")}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={spinning}
            onClick={handleSpin}
            className="flex-1 rounded-xl border-4 border-amber-600 bg-amber-500 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-amber-600 disabled:opacity-50"
          >
            {spinning ? "Draait… (~32 s)" : "SPIN!"}
          </button>
          {done && (
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border-2 border-foreground/30 bg-foreground/10 px-4 py-2 text-sm font-medium text-foreground"
            >
              Opnieuw
            </button>
          )}
        </div>
        {standEntries.length > 0 && (
          <div className="rounded-lg border border-foreground/10 bg-background/80 p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">
              Tussentand (demo)
            </h3>
            <ul className="space-y-1.5">
              {standEntries.map(({ city, points }, i) => (
                <li
                  key={city}
                  className="flex items-center justify-between rounded border border-foreground/10 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{i + 1}. {city}</span>
                  <span className="text-foreground/80">{points} pt</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setStand(new Map())}
              className="mt-2 w-full rounded border border-foreground/20 py-1.5 text-xs text-foreground/70 hover:bg-foreground/5"
            >
              Stand leegmaken
            </button>
          </div>
        )}
      </div>
    </>
  );
}
