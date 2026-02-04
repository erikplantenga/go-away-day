"use client";

import { useState, useEffect, useRef } from "react";
import { Fireworks } from "@/components/Fireworks";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { FlyingCelebration } from "@/components/FlyingCelebration";
import { WinningCityDisplay } from "@/components/WinningCityDisplay";
import { SPIN_PHRASES } from "@/lib/spinPhrases";
import { useSpinSound } from "@/lib/useSpinSound";
import { useWinSound } from "@/lib/useWinSound";
import { unlockAudio } from "@/lib/audioContext";

// Demo: 1 s per slot voor snelle test; echte spel blijft 5 s
const REVEAL_DELAY_MS = 1000;
const PAUSE_AFTER_LAST_MS = 2500;
const PAUSE_BEFORE_REVEAL_MS = 500;
const CYCLE_MS = 200;
const FINALE_REVEAL_DELAY_MS = 1000; // demo finale ook 1 s om winnaar snel te zien

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
  const [spinCount, setSpinCount] = useState(0);
  const [showFinalePopup, setShowFinalePopup] = useState(false);
  const [finaleFinalists, setFinaleFinalists] = useState<string[]>([]);
  const [finaleSpinning, setFinaleSpinning] = useState(false);
  const [demoWinner, setDemoWinner] = useState<string | null>(null);
  const [finaleSpinInProgress, setFinaleSpinInProgress] = useState(false);
  const [finaleSpinResults, setFinaleSpinResults] = useState<(string | null)[]>([null, null, null]);
  const [finaleSpinDisplay, setFinaleSpinDisplay] = useState<(string | null)[]>([null, null, null]);
  const [spinPhraseIndex, setSpinPhraseIndex] = useState(0);
  const [finalePhraseIndex, setFinalePhraseIndex] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<(ReturnType<typeof setInterval> | undefined)[]>([]);
  const finaleTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finaleIntervalsRef = useRef<(ReturnType<typeof setInterval> | undefined)[]>([]);

  const spinSoundDurationMs = PAUSE_BEFORE_REVEAL_MS + REVEAL_DELAY_MS * 3;
  const finaleSoundDurationMs = PAUSE_BEFORE_REVEAL_MS + FINALE_REVEAL_DELAY_MS * 3;
  useSpinSound(spinning, CYCLE_MS, spinSoundDurationMs);
  useSpinSound(finaleSpinInProgress, CYCLE_MS, finaleSoundDurationMs);
  useWinSound(demoWinner);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      intervalsRef.current.forEach((i) => i && clearInterval(i));
      finaleTimeoutsRef.current.forEach((t) => clearTimeout(t));
      finaleIntervalsRef.current.forEach((i) => i && clearInterval(i));
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

  useEffect(() => {
    if (!finaleSpinInProgress) return;
    setFinalePhraseIndex(0);
    const iv = setInterval(
      () => setFinalePhraseIndex((i) => (i + 1) % SPIN_PHRASES.length),
      3000
    );
    return () => clearInterval(iv);
  }, [finaleSpinInProgress]);

  const handleSpin = () => {
    unlockAudio();
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
        setSpinCount((c) => {
          const next = c + 1;
          if (next >= 3) {
            const shuffled = [...DEMO_CITIES].sort(() => Math.random() - 0.5);
            setFinaleFinalists([shuffled[0]!, shuffled[1]!]);
            setShowFinalePopup(true);
          }
          return next;
        });
      }, start + REVEAL_DELAY_MS * 3 + PAUSE_AFTER_LAST_MS),
    ];
  };

  const reset = () => {
    setResults([null, null, null]);
    setSpinningDisplay([null, null, null]);
    setDone(false);
    setSpinCount(0);
    setShowFinalePopup(false);
    setFinaleFinalists([]);
    setDemoWinner(null);
    setFinaleSpinInProgress(false);
    setFinaleSpinResults([null, null, null]);
    setFinaleSpinDisplay([null, null, null]);
    finaleTimeoutsRef.current.forEach((t) => clearTimeout(t));
    finaleIntervalsRef.current.forEach((i) => i && clearInterval(i));
  };

  const runFinaleSpin = () => {
    if (finaleFinalists.length !== 2 || finaleSpinning || finaleSpinInProgress) return;
    unlockAudio();
    setFinaleSpinning(true);
    setFinaleSpinInProgress(true);
    setFinaleSpinResults([null, null, null]);
    setFinaleSpinDisplay([null, null, null]);

    const cities = finaleFinalists;
    const threeNames = [
      pickRandom(cities),
      pickRandom(cities),
      pickRandom(cities),
    ];
    finaleTimeoutsRef.current.forEach((t) => clearTimeout(t));
    finaleIntervalsRef.current.forEach((i) => i && clearInterval(i));
    const start = PAUSE_BEFORE_REVEAL_MS;

    function startRoll(slotIndex: number) {
      setFinaleSpinDisplay((prev) => {
        const next = [...prev];
        next[slotIndex] = cities[Math.floor(Math.random() * cities.length)] ?? null;
        return next;
      });
      const id = setInterval(() => {
        setFinaleSpinDisplay((prev) => {
          const next = [...prev];
          next[slotIndex] = cities[Math.floor(Math.random() * cities.length)] ?? next[slotIndex];
          return next;
        });
      }, CYCLE_MS);
      finaleIntervalsRef.current[slotIndex] = id;
    }

    function stopRoll(slotIndex: number, finalCity: string) {
      if (finaleIntervalsRef.current[slotIndex]) {
        clearInterval(finaleIntervalsRef.current[slotIndex]!);
        finaleIntervalsRef.current[slotIndex] = undefined;
      }
      setFinaleSpinDisplay((prev) => {
        const next = [...prev];
        next[slotIndex] = null;
        return next;
      });
      setFinaleSpinResults((r) => {
        const next = [...r];
        next[slotIndex] = finalCity;
        return next;
      });
    }

    finaleTimeoutsRef.current = [
      setTimeout(() => startRoll(0), start),
      setTimeout(() => {
        stopRoll(0, threeNames[0]!);
        startRoll(1);
      }, start + FINALE_REVEAL_DELAY_MS),
      setTimeout(() => {
        stopRoll(1, threeNames[1]!);
        startRoll(2);
      }, start + FINALE_REVEAL_DELAY_MS * 2),
      setTimeout(() => {
        stopRoll(2, threeNames[2]!);
      }, start + FINALE_REVEAL_DELAY_MS * 3),
      setTimeout(() => {
        setFinaleSpinDisplay([null, null, null]);
        const countA = threeNames.filter((c) => c === finaleFinalists[0]).length;
        const countB = threeNames.filter((c) => c === finaleFinalists[1]).length;
        const winner = countA >= countB ? finaleFinalists[0]! : finaleFinalists[1]!;
        setDemoWinner(winner);
        setFireworksKey((k) => k + 1);
        setShowFireworks(true);
        setFinaleSpinInProgress(false);
        setFinaleSpinning(false);
      }, start + FINALE_REVEAL_DELAY_MS * 3 + PAUSE_AFTER_LAST_MS),
    ];
  };

  const closeFinalePopup = () => {
    finaleTimeoutsRef.current.forEach((t) => clearTimeout(t));
    finaleIntervalsRef.current.forEach((i) => i && clearInterval(i));
    setShowFinalePopup(false);
    setFinaleFinalists([]);
    setDemoWinner(null);
    setFinaleSpinInProgress(false);
    setFinaleSpinning(false);
    setFinaleSpinResults([null, null, null]);
    setFinaleSpinDisplay([null, null, null]);
  };

  const standEntries = Array.from(stand.entries())
    .map(([city, points]) => ({ city, points }))
    .sort((a, b) => b.points - a.points);

  return (
    <>
      {fireworksKey > 0 && <ConfettiBurst key={fireworksKey} />}
      {demoWinner && (
        <>
          <FlyingCelebration />
          <div className="pointer-events-none fixed inset-0 z-40 h-full w-full opacity-60" aria-hidden>
            <Fireworks fullScreen />
          </div>
        </>
      )}
      {showFinalePopup && finaleFinalists.length === 2 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="relative z-[100] flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-2xl border-2 border-amber-500/60 bg-background p-6 shadow-xl">
            {demoWinner ? (
              <div className="relative overflow-hidden rounded-3xl border-4 border-amber-400/80 bg-gradient-to-br from-amber-400/30 via-yellow-500/20 to-orange-500/20 p-8 text-center shadow-2xl shadow-amber-500/30 ring-4 ring-amber-400/20 dark:border-amber-400/70 dark:from-amber-500/30 dark:via-yellow-500/20 dark:to-orange-500/20 dark:shadow-amber-500/25 dark:ring-amber-400/10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-amber-200/5 to-transparent dark:via-amber-400/5" aria-hidden />
                <p className="relative mb-3 text-xl font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">
                  🎉 Winnaar! 🎉
                </p>
                <p className="relative animate-pulse text-2xl font-bold text-foreground sm:text-3xl">
                  Benno en Erik gaan naar <WinningCityDisplay city={demoWinner} />. Wat leuk!
                </p>
                <p className="relative mt-5 text-sm text-foreground/80">
                  Heel veel plezier, vergeet je zonnebrand, zwembroek en slippers niet!!
                </p>
                <br />
                <br />
                <p className="relative text-sm italic text-foreground/70">
                  En nu maar hopen dat er wifi aan boord is.
                </p>
                <button
                  type="button"
                  onClick={closeFinalePopup}
                  className="relative mt-6 w-full rounded-xl border-2 border-amber-500/50 bg-amber-500/20 py-3 text-sm font-medium text-foreground"
                >
                  Sluiten
                </button>
              </div>
            ) : finaleSpinInProgress ? (
              <div className="flex flex-col gap-4">
                <p className="text-center text-sm italic text-amber-700 dark:text-amber-300">
                  {SPIN_PHRASES[finalePhraseIndex]}
                </p>
                <div className="flex justify-center gap-2 sm:gap-4">
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
                          finaleSpinInProgress ? "animate-pulse" : ""
                        }`}
                      >
                        {finaleSpinResults[i] ? (
                          <span className="text-lg font-bold sm:text-xl text-foreground">{finaleSpinResults[i]}</span>
                        ) : finaleSpinDisplay[i] ? (
                          <span className={`text-lg font-bold sm:text-xl animate-pulse ${slotText}`}>{finaleSpinDisplay[i]}</span>
                        ) : (
                          <span className="animate-spin text-2xl font-bold text-foreground/70">◆</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <p className="text-center text-2xl font-bold uppercase tracking-wide text-foreground">
                  Gelijkstand!
                </p>
                <button
                  type="button"
                  disabled={finaleSpinning}
                  onClick={runFinaleSpin}
                  className="w-full rounded-xl border-4 border-amber-600 bg-amber-500 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-amber-600 disabled:opacity-50"
                >
                  {finaleSpinning ? "Bezig…" : "Draai beslissende spin"}
                </button>
                {standEntries.length > 0 && (
                  <div className="rounded-lg border border-foreground/10 bg-background/80 p-4">
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">
                      Tussenstand
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
                      onClick={() => {
                        setStand(new Map());
                        setSpinCount(0);
                        setShowFinalePopup(false);
                        setFinaleFinalists([]);
                        setDemoWinner(null);
                      }}
                      className="mt-2 w-full rounded border border-foreground/20 py-1.5 text-xs text-foreground/70 hover:bg-foreground/5"
                    >
                      Stand leegmaken
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {showFireworks && (
        <div className="pointer-events-none fixed inset-0 z-40 h-full w-full opacity-70">
          <Fireworks fullScreen />
        </div>
      )}
      {!showFinalePopup && (
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
          {done && (
            <button
              type="button"
              onClick={reset}
              className="w-full rounded-xl border-2 border-foreground/30 bg-foreground/10 py-2 text-sm font-medium text-foreground"
            >
              Opnieuw
            </button>
          )}
          {standEntries.length > 0 && (
            <div className="rounded-lg border border-foreground/10 bg-background/80 p-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">
                Tussenstand
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
                onClick={() => {
                  setStand(new Map());
                  setSpinCount(0);
                  setShowFinalePopup(false);
                  setFinaleFinalists([]);
                  setDemoWinner(null);
                }}
                className="mt-2 w-full rounded border border-foreground/20 py-1.5 text-xs text-foreground/70 hover:bg-foreground/5"
              >
                Stand leegmaken
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
