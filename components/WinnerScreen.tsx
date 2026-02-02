"use client";

import { useState, useEffect, useRef } from "react";
import {
  getConfig,
  getCities,
  getRemoved,
  getSpins,
  computeWinner,
  setWinner,
} from "@/lib/firestore";
import type { SpinEntry, CityEntry, RemovedEntry } from "@/lib/firestore";
import { isAfterRevealTime, getRevealTime, getCeremonyStartTime } from "@/lib/dates";
import { formatDateDisplay } from "@/lib/dates";
import { ConfettiBurst } from "@/components/ConfettiBurst";

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

  const showReveal = isAfterRevealTime();
  const isRealGameReveal = showReveal;
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
        const city = computeWinner(spinList);
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
            onClick={() => setClicked(true)}
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
            <p className="mt-1 text-sm text-foreground/70">tot 20:30 – dan de laatste spin (60 sec)</p>
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

  return (
    <>
      {ceremonyReveal && <ConfettiBurst />}
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
      {isRealGameReveal && (summaryCities.length > 0 || summaryRemoved.length > 0 || sortedSpins.length > 0) && (
        <div className="mt-8 rounded-lg border border-foreground/10 bg-background/50 p-4 text-left">
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
          {sortedSpins.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase text-foreground/70">Dit is er gespind</p>
              <ul className="space-y-2 text-sm text-foreground/90">
                {sortedSpins.map((s, i) => {
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
