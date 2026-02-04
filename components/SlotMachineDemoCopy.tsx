"use client";

/**
 * Kopie van de originele SlotMachine-spin voor lokaal testen.
 * Zelfde timing en UI als het echte spel; geen Firebase.
 */
import { useState, useEffect, useRef } from "react";
import { SPIN_PHRASES } from "@/lib/spinPhrases";
import { useSpinSound } from "@/lib/useSpinSound";
import { unlockAudio } from "@/lib/audioContext";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { FlyingCelebration } from "@/components/FlyingCelebration";
import { Fireworks } from "@/components/Fireworks";

// Zelfde als SlotMachine.tsx – niet aanpassen in origineel
const REVEAL_DELAY_MS = 5000;
const PAUSE_AFTER_LAST_MS = 5000;
const PAUSE_BEFORE_REVEAL_MS = 500;
const CYCLE_MS = 200;

const DEMO_CITIES = ["Malta", "Boedapest", "Helsinki", "Napels"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function SlotMachineDemoCopy() {
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<(string | null)[]>([null, null, null]);
  const [spinningDisplay, setSpinningDisplay] = useState<(string | null)[]>([null, null, null]);
  const [fireworksKey, setFireworksKey] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [updatingStand, setUpdatingStand] = useState(false);
  const [spinPhraseIndex, setSpinPhraseIndex] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<(ReturnType<typeof setInterval> | undefined)[]>([]);

  const spinSoundDurationMs = PAUSE_BEFORE_REVEAL_MS + REVEAL_DELAY_MS * 3;
  useSpinSound(spinning, CYCLE_MS, spinSoundDurationMs);

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
    unlockAudio();
    setSpinning(true);
    setResults([null, null, null]);
    setSpinningDisplay([null, null, null]);
    const threeNames = [
      pickRandom(DEMO_CITIES),
      pickRandom(DEMO_CITIES),
      pickRandom(DEMO_CITIES),
    ];
    const cities = DEMO_CITIES;
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
        setUpdatingStand(true);
      }, start + REVEAL_DELAY_MS * 3),
      setTimeout(() => {
        setUpdatingStand(false);
        setSpinningDisplay([null, null, null]);
        setSpinning(false);
      }, start + REVEAL_DELAY_MS * 3 + PAUSE_AFTER_LAST_MS),
    ];
  };

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
        {updatingStand && (
          <p className="text-center text-sm font-medium text-foreground/80">
            Tussenstand bijwerken…
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
      </div>
    </>
  );
}
