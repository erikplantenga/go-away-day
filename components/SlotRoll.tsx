"use client";

import { useState, useEffect, useRef } from "react";
import { useSpinSound } from "@/lib/useSpinSound";

const CYCLE_MS = 200;
const DEFAULT_PAUSE_BEFORE_MS = 500;
const DEFAULT_PAUSE_AFTER_MS = 2500;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

const SLOT_BG = [
  "border-amber-600/80 bg-amber-50/90 dark:bg-amber-950/30",
  "border-orange-500/80 bg-orange-50/90 dark:bg-orange-950/30",
  "border-yellow-500/80 bg-yellow-50/90 dark:bg-yellow-950/30",
];
const SLOT_TEXT = [
  "text-amber-700 dark:text-amber-400",
  "text-orange-700 dark:text-orange-400",
  "text-yellow-700 dark:text-yellow-600",
];

type Props = {
  run: boolean;
  cities: string[];
  revealDelayMs: number;
  pauseAfterLastMs?: number;
  pauseBeforeRevealMs?: number;
  onComplete: (threeNames: string[]) => void;
  playSound?: boolean;
  compact?: boolean;
};

export function SlotRoll({
  run,
  cities,
  revealDelayMs,
  pauseAfterLastMs = DEFAULT_PAUSE_AFTER_MS,
  pauseBeforeRevealMs = DEFAULT_PAUSE_BEFORE_MS,
  onComplete,
  playSound = true,
  compact = false,
}: Props) {
  const [results, setResults] = useState<(string | null)[]>([null, null, null]);
  const [spinningDisplay, setSpinningDisplay] = useState<(string | null)[]>([null, null, null]);
  const [spinning, setSpinning] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<(ReturnType<typeof setInterval> | undefined)[]>([]);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const soundDurationMs = pauseBeforeRevealMs + revealDelayMs * 3;
  useSpinSound(playSound && spinning, CYCLE_MS, soundDurationMs);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      intervalsRef.current.forEach((i) => i && clearInterval(i));
    };
  }, []);

  useEffect(() => {
    if (!run || cities.length === 0 || completedRef.current) return;
    completedRef.current = true;
    setSpinning(true);
    setResults([null, null, null]);
    setSpinningDisplay([null, null, null]);

    const threeNames = [
      pickRandom(cities),
      pickRandom(cities),
      pickRandom(cities),
    ];
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    intervalsRef.current.forEach((i) => i && clearInterval(i));
    const start = pauseBeforeRevealMs;

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
      }, start + revealDelayMs),
      setTimeout(() => {
        stopRoll(1, threeNames[1]!);
        startRoll(2);
      }, start + revealDelayMs * 2),
      setTimeout(() => {
        stopRoll(2, threeNames[2]!);
      }, start + revealDelayMs * 3),
      setTimeout(() => {
        setSpinningDisplay([null, null, null]);
        setSpinning(false);
        onCompleteRef.current(threeNames);
      }, start + revealDelayMs * 3 + pauseAfterLastMs),
    ];
  }, [run, cities, revealDelayMs, pauseAfterLastMs, pauseBeforeRevealMs]);

  const slotClass = compact ? "min-h-[70px] min-w-[70px] rounded-lg border-2 px-2 py-2 text-sm" : "min-h-[100px] min-w-[100px] sm:min-h-[120px] sm:min-w-[110px] flex-1 max-w-[140px] rounded-xl border-4 px-3 py-4";
  const textClass = compact ? "font-bold" : "text-lg font-bold sm:text-xl";

  return (
    <div className="flex justify-center gap-2 sm:gap-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`flex items-center justify-center text-center shadow-inner ${SLOT_BG[i]} ${slotClass} ${
            spinning ? "animate-pulse" : ""
          }`}
        >
          {results[i] ? (
            <span className={`${textClass} text-foreground`}>{results[i]}</span>
          ) : spinning && spinningDisplay[i] ? (
            <span className={`${textClass} animate-pulse ${SLOT_TEXT[i]}`}>{spinningDisplay[i]}</span>
          ) : spinning ? (
            <span className="animate-spin text-2xl font-bold text-foreground/70">◆</span>
          ) : (
            <span className="text-2xl font-bold text-foreground/40">—</span>
          )}
        </div>
      ))}
    </div>
  );
}
