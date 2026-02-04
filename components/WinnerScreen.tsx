"use client";

import { useState, useEffect, useRef } from "react";
import {
  getConfig,
  getCities,
  getRemoved,
  getSpins,
  getRemainingCities,
  setConfig,
  setWinner,
  addSpin,
} from "@/lib/firestore";
import type { SpinEntry, CityEntry, RemovedEntry } from "@/lib/firestore";
import { isAfterRevealTime, getRevealTime, getCeremonyStartTime, getCurrentDateString } from "@/lib/dates";
import { formatDateDisplay } from "@/lib/dates";
import { SPIN_PHRASES } from "@/lib/spinPhrases";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { FlyingCelebration } from "@/components/FlyingCelebration";
import { Fireworks } from "@/components/Fireworks";
import { SlotRoll } from "@/components/SlotRoll";
import { WinningCityDisplay } from "@/components/WinningCityDisplay";
import { useWinSound } from "@/lib/useWinSound";
import { unlockAudio } from "@/lib/audioContext";

const CEREMONY_SPIN_DURATION_MS = 60_000;

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function WinnerScreen() {
  const [winner, setWinnerState] = useState<string | null>(null);
  const [summaryCities, setSummaryCities] = useState<CityEntry[]>([]);
  const [summaryRemoved, setSummaryRemoved] = useState<RemovedEntry[]>([]);
  const [spins, setSpinsState] = useState<(SpinEntry & { id: string; date?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clicked, setClicked] = useState(false);
  const [countdown, setCountdown] = useState<string>("");
  const [ceremonySpinEnd, setCeremonySpinEnd] = useState<number | null>(null);
  const [ceremonyReveal, setCeremonyReveal] = useState(false);
  const [spinSecLeft, setSpinSecLeft] = useState<number | null>(null);
  const spinStartRef = useRef<number | null>(null);
  const [tieBreakNeeded, setTieBreakNeeded] = useState(false);
  const [tiedCities, setTiedCities] = useState<string[]>([]);
  const [tieBreakSpinning, setTieBreakSpinning] = useState(false);
  const [finaleSpinRunning, setFinaleSpinRunning] = useState(false);
  const [finalePhraseIndex, setFinalePhraseIndex] = useState(0);

  const showReveal = isAfterRevealTime();
  const isRealGameReveal = showReveal;

  useWinSound(winner);
  const ceremonyStart = getCeremonyStartTime().getTime();
  const now = Date.now();
  const isAfterCeremonyStart = now >= ceremonyStart;

  useEffect(() => {
    if (!showReveal && clicked && !isAfterCeremonyStart) {
      const ceremonyAt = getCeremonyStartTime();
      const update = () => {
        const left = ceremonyAt.getTime() - Date.now();
        setCountdown(left <= 0 ? "0:00" : formatCountdown(left));
      };
      update();
      const t = setInterval(update, 1000);
      return () => clearInterval(t);
    }
  }, [showReveal, clicked, isAfterCeremonyStart]);

  useEffect(() => {
    if (!clicked || !isAfterCeremonyStart || ceremonySpinEnd !== null) return;
    spinStartRef.current = Date.now();
    setSpinSecLeft(60);
    const t = setTimeout(() => {
      setCeremonySpinEnd(Date.now());
      setCeremonyReveal(true);
      setSpinSecLeft(0);
    }, CEREMONY_SPIN_DURATION_MS);
    return () => clearTimeout(t);
  }, [clicked, isAfterCeremonyStart, ceremonySpinEnd]);

  useEffect(() => {
    if (spinSecLeft === null || spinSecLeft <= 0) return;
    const iv = setInterval(() => {
      const start = spinStartRef.current;
      if (!start) return;
      const elapsed = Date.now() - start;
      const left = Math.max(0, Math.ceil((CEREMONY_SPIN_DURATION_MS - elapsed) / 1000));
      setSpinSecLeft(left);
    }, 1000);
    return () => clearInterval(iv);
  }, [spinSecLeft]);

  useEffect(() => {
    if (!finaleSpinRunning) return;
    setFinalePhraseIndex(0);
    const iv = setInterval(
      () => setFinalePhraseIndex((i) => (i + 1) % SPIN_PHRASES.length),
      3000
    );
    return () => clearInterval(iv);
  }, [finaleSpinRunning]);

  useEffect(() => {
    if (!showReveal && !(clicked && isAfterCeremonyStart)) return;
    let cancelled = false;
    async function load() {
      try {
        const config = await getConfig();
        if (cancelled) return;
        const savedWinner = config.winnerCity ?? (config as { winnerCountry?: string }).winnerCountry;
        if (config.winnerLocked && savedWinner) {
          setWinnerState(savedWinner);
          const [cities, removed, spinList] = await Promise.all([getCities(), getRemoved(), getSpins()]);
          if (!cancelled) {
            setSummaryCities(cities);
            setSummaryRemoved(removed);
            setSpinsState(spinList as (SpinEntry & { id: string; date?: string })[]);
          }
          setLoading(false);
          return;
        }
        const [cities, removed, spinList] = await Promise.all([getCities(), getRemoved(), getSpins()]);
        if (cancelled) return;
        if (!cancelled) {
          setSummaryCities(cities);
          setSummaryRemoved(removed);
          setSpinsState(spinList as (SpinEntry & { id: string; date?: string })[]);
        }
        const configAgain = await getConfig();
        if (cancelled) return;
        const savedAgain = configAgain.winnerCity ?? (configAgain as { winnerCountry?: string }).winnerCountry;
        if (configAgain.winnerLocked && savedAgain) {
          setWinnerState(savedAgain);
          const [citiesAgain, removedAgain, list] = await Promise.all([getCities(), getRemoved(), getSpins()]);
          if (!cancelled) {
            setSummaryCities(citiesAgain);
            setSummaryRemoved(removedAgain);
            setSpinsState(list as (SpinEntry & { id: string; date?: string })[]);
          }
          setLoading(false);
          return;
        }
        const remaining = await getRemainingCities();
        if (cancelled) return;
        const cityNames = remaining.map((c) => c.city);
        if (cityNames.length < 2) {
          setWinnerState(null);
          setLoading(false);
          return;
        }
        // Echte stand: alleen spins zonder balancing
        const realSpins = (spinList as (SpinEntry & { id?: string; isBalancing?: boolean })[]).filter(
          (s) => !s.isBalancing
        );
        const pointsByCity = new Map<string, number>();
        for (const s of realSpins) {
          if (!cityNames.includes(s.city)) continue;
          pointsByCity.set(s.city, (pointsByCity.get(s.city) ?? 0) + (s.points ?? 1));
        }
        const standings = cityNames
          .map((city) => ({ city, points: pointsByCity.get(city) ?? 0 }))
          .sort((a, b) => b.points - a.points);
        const top1 = standings[0];
        const top2 = standings[1];
        if (!top1 || !top2) {
          setWinnerState(null);
          setLoading(false);
          return;
        }
        // Nummer 1 en 2 gaan altijd als gelijkstand naar de beslissende spin (geen balancing spins)
        const finalists = [top1.city, top2.city];
        await setConfig({ finaleFinalists: finalists });
        if (cancelled) return;
        if (!cancelled) {
          setTieBreakNeeded(true);
          setTiedCities(finalists);
          setLoading(false);
          return;
        }
        setWinnerState(null);
        setLoading(false);
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
  }, [showReveal, clicked, isAfterCeremonyStart]);

  if (!showReveal && !ceremonyReveal) {
    if (clicked && isAfterCeremonyStart && ceremonySpinEnd !== null) {
      return null;
    }
    if (clicked && isAfterCeremonyStart) {
      const secLeft = spinSecLeft ?? 60;
      return (
        <div className="rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-8 text-center">
          <p className="text-lg font-bold text-foreground">De laatste spin!</p>
          <p className="mt-2 text-sm text-foreground/80">Nog even… dan weten we het.</p>
          <p className="mt-6 text-5xl font-mono font-bold tabular-nums text-foreground">
            {secLeft}
          </p>
          <p className="mt-1 text-sm text-foreground/70">seconden</p>
        </div>
      );
    }
    return (
      <div className="rounded-xl border-2 border-foreground/20 bg-foreground/5 p-8 text-center">
        {!clicked ? (
          <button
            type="button"
            onClick={() => {
              unlockAudio();
              setClicked(true);
            }}
            className="rounded-lg bg-foreground px-6 py-3 font-medium text-background"
          >
            Bekijk de uitslag
          </button>
        ) : (
          <div>
            <p className="text-lg font-medium text-foreground">
              Nog even wachten
            </p>
            <p className="mt-4 text-2xl font-mono font-bold tabular-nums text-foreground">
              {countdown}
            </p>
            <p className="mt-1 text-sm text-foreground/70">tot de finale om 20:00 – dan weten we het</p>
          </div>
        )}
      </div>
    );
  }

  const handleFinaleSpinComplete = (threeNames: string[]) => {
    const winnerCity =
      threeNames.filter((c) => c === tiedCities[0]).length >=
      threeNames.filter((c) => c === tiedCities[1]).length
        ? tiedCities[0]!
        : tiedCities[1]!;
    setError(null);
    (async () => {
      try {
        const dateStr = getCurrentDateString();
        await Promise.all(threeNames.map((city) => addSpin("erik", city, dateStr, 1)));
        await setWinner(winnerCity);
        setWinnerState(winnerCity);
        const newSpins = await getSpins();
        setSpinsState(newSpins as (SpinEntry & { id: string; date?: string })[]);
        setTieBreakNeeded(false);
        setTiedCities([]);
        setFinaleSpinRunning(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Beslissende spin mislukt");
        setFinaleSpinRunning(false);
      }
    })();
  };

  if (tieBreakNeeded && tiedCities.length > 0) {
    if (finaleSpinRunning) {
      return (
        <div className="flex flex-col gap-4 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-8 text-center">
          <p className="text-lg font-bold text-foreground">Gelijkstand!</p>
          <p className="text-sm text-foreground/80">
            {tiedCities.join(" en ")} – beslissende spin (15 s per stad)
          </p>
          <p className="text-sm font-medium italic text-amber-700 dark:text-amber-300">
            {SPIN_PHRASES[finalePhraseIndex]}
          </p>
          <div className="flex justify-center">
            <SlotRoll
              run={true}
              cities={tiedCities}
              revealDelayMs={15000}
              pauseAfterLastMs={2500}
              pauseBeforeRevealMs={500}
              onComplete={handleFinaleSpinComplete}
              playSound={true}
            />
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-4 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-8 text-center">
        <p className="text-lg font-bold text-foreground">Gelijkstand!</p>
        <p className="text-sm text-foreground/80">
          {tiedCities.join(" en ")} hebben evenveel punten. Eén beslissende spin.
        </p>
        <button
          type="button"
          disabled={tieBreakSpinning}
          onClick={() => {
            unlockAudio();
            setTieBreakSpinning(true);
            setFinaleSpinRunning(true);
          }}
          className="mt-6 rounded-xl border-4 border-amber-600 bg-amber-500 py-4 px-8 text-xl font-bold text-white shadow-lg transition hover:bg-amber-600 disabled:opacity-50"
        >
          Draai beslissende spin
        </button>
        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
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

  const sortedSpins = [...spins].sort((a, b) => {
    const getTime = (s: (SpinEntry & { id: string; date?: string }) | SpinEntry) => {
      const ts = s.timestamp as { toMillis?: () => number } | undefined;
      if (ts?.toMillis) return ts.toMillis();
      const d = (s as { date?: string }).date;
      if (d) return new Date(d).getTime();
      return 0;
    };
    return getTime(a) - getTime(b);
  });
  const displaySpins = sortedSpins.filter(
    (s) => !(s as SpinEntry & { isBalancing?: boolean }).isBalancing
  );

  return (
    <>
      {ceremonyReveal && <ConfettiBurst />}
      <FlyingCelebration />
      <div className="pointer-events-none fixed inset-0 z-30 opacity-50" aria-hidden>
        <Fireworks fullScreen />
      </div>
      <div className="relative z-50 overflow-hidden rounded-3xl border-4 border-amber-400/80 bg-gradient-to-br from-amber-400/30 via-yellow-500/20 to-orange-500/20 p-8 text-center shadow-2xl shadow-amber-500/30 ring-4 ring-amber-400/20 dark:border-amber-400/70 dark:from-amber-500/30 dark:via-yellow-500/20 dark:to-orange-500/20 dark:shadow-amber-500/25 dark:ring-amber-400/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-amber-200/5 to-transparent dark:via-amber-400/5" aria-hidden />
        <p className="relative mb-3 text-xl font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">
          🎉 Winnaar! 🎉
        </p>
        <p className="relative animate-pulse text-2xl font-bold text-foreground sm:text-3xl">
          Benno en Erik gaan naar <WinningCityDisplay city={displayWinner} />. Wat leuk!
        </p>
        <p className="relative mt-5 text-sm text-foreground/80">
          Heel veel plezier, vergeet je zonnebrand, zwembroek en slippers niet!!
        </p>
        <br />
        <br />
        <p className="relative text-sm italic text-foreground/70">
          En nu maar hopen dat er wifi aan boord is.
        </p>
      {isRealGameReveal && (summaryCities.length > 0 || summaryRemoved.length > 0 || displaySpins.length > 0) && (
        <div className="relative mt-8 rounded-lg border border-foreground/10 bg-background/50 p-4 text-left">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/80">
            Samenvatting
          </p>
          {summaryCities.length > 0 && (
            <div className="mb-4">
              <p className="mb-1.5 text-xs font-medium uppercase text-foreground/70">Dit waren de steden</p>
              <p className="text-sm text-foreground/90">
                {summaryCities.map((c) => (c.country ? `${c.city} (${c.country})` : c.city)).join(", ")}
              </p>
            </div>
          )}
          {summaryRemoved.length > 0 && (
            <div className="mb-4">
              <p className="mb-1.5 text-xs font-medium uppercase text-foreground/70">Dit is er gestreept</p>
              <ul className="space-y-1 text-sm text-foreground/90">
                {summaryRemoved.map((r, i) => {
                  const by = r.removedBy === "erik" ? "Erik" : "Benno";
                  const label = r.country ? `${r.city} (${r.country})` : r.city;
                  return (
                    <li key={i}>
                      {label} – {by} ({r.date ? formatDateDisplay(r.date) : r.date})
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {displaySpins.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase text-foreground/70">Dit is er gespind</p>
              <ul className="space-y-2 text-sm text-foreground/90">
                {displaySpins.map((s, i) => {
                  const dateStr = (s as { date?: string }).date;
                  const dateLabel = dateStr ? formatDateDisplay(dateStr) : "";
                  const name = s.user === "erik" ? "Erik" : "Benno";
                  return (
                    <li key={s.id ?? i} className="flex items-center gap-2">
                      <span className="min-w-[7rem] text-foreground/70">{dateLabel}</span>
                      <span className="font-medium">{name}</span>
                      <span className="text-foreground/80">→ {s.city}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
}
