"use client";

import { useState, useEffect } from "react";
import type { UserId } from "@/lib/firestore";
import type { CityEntry } from "@/lib/firestore";
import type { RemovedEntry } from "@/lib/firestore";
import {
  getCities,
  getRemoved,
  addRemoved,
  getStrikeCount,
} from "@/lib/firestore";
import { getCurrentDateString } from "@/lib/dates";
import { WhoMustStrikeBanner } from "@/components/WhoMustStrikeBanner";

const REQUIRED_STRIKES = 3;

type Props = {
  currentUser: UserId;
  /** Demo: toon Volgende / Ga door alleen als beide 3 hebben weggestreept */
  onVolgende?: () => void;
};

function cityKey(c: CityEntry): string {
  return `${c.city}|${c.country}`;
}

export function WegstreepList({ currentUser, onVolgende }: Props) {
  const [cities, setCities] = useState<CityEntry[]>([]);
  const [removed, setRemoved] = useState<RemovedEntry[]>([]);
  const [strikeCountErik, setStrikeCountErik] = useState(0);
  const [strikeCountBenno, setStrikeCountBenno] = useState(0);
  const [loading, setLoading] = useState(true);
  const [striking, setStriking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dateStr = getCurrentDateString();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [allCities, removedList, erikCount, bennoCount] = await Promise.all([
          getCities(),
          getRemoved(),
          getStrikeCount("erik"),
          getStrikeCount("benno"),
        ]);
        if (cancelled) return;
        setCities(allCities);
        setRemoved(removedList);
        setStrikeCountErik(erikCount);
        setStrikeCountBenno(bennoCount);
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
  }, [dateStr]);

  const removedTodayOrEarlier = removed.filter((r) => r.date <= dateStr);
  const removedSet = new Set(
    removedTodayOrEarlier.map((r) => `${r.city}|${r.country ?? ""}`)
  );
  const strikeCountCurrent = currentUser === "erik" ? strikeCountErik : strikeCountBenno;
  const canStrike = strikeCountCurrent < REQUIRED_STRIKES;

  const handleStrike = async (city: CityEntry) => {
    if (!canStrike || removedSet.has(cityKey(city))) return;
    setStriking(cityKey(city));
    setError(null);
    try {
      await addRemoved(city.city, city.country, currentUser, dateStr);
      setRemoved((prev) => [
        ...prev,
        { city: city.city, country: city.country, removedBy: currentUser, date: dateStr },
      ]);
      if (currentUser === "erik") setStrikeCountErik((n) => n + 1);
      else setStrikeCountBenno((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wegstrepen mislukt");
    } finally {
      setStriking(null);
    }
  };

  if (loading) {
    return <p className="text-center text-foreground/70">Laden...</p>;
  }

  if (cities.length === 0) {
    return (
      <div className="rounded-lg border border-foreground/10 bg-background p-4">
        <p className="text-center text-foreground/90">
          Er is nog geen gezamenlijke lijst. Beide moeten op 1 februari 5 steden opgeven.
        </p>
      </div>
    );
  }

  const bothDone = strikeCountErik >= REQUIRED_STRIKES && strikeCountBenno >= REQUIRED_STRIKES;
  const stillNeeded = REQUIRED_STRIKES - strikeCountCurrent;

  return (
    <div className="space-y-4 rounded-lg border border-foreground/10 bg-background p-4">
      <WhoMustStrikeBanner
        erikCount={strikeCountErik}
        bennoCount={strikeCountBenno}
        required={REQUIRED_STRIKES}
      />
      <p className="text-sm text-foreground/70">
        Kies 1 stad om weg te strepen. Je moet er {REQUIRED_STRIKES} wegestreept hebben om verder te kunnen.
      </p>
      <ul className="space-y-2">
        {cities.map((c) => {
          const isRemoved = removedSet.has(cityKey(c));
          return (
            <li
              key={cityKey(c)}
              className="flex items-center justify-between gap-2 rounded border border-foreground/10 bg-background px-3 py-2"
            >
              <span
                className={`font-medium ${isRemoved ? "line-through text-foreground/60" : ""}`}
              >
                {c.city}, {c.country}
              </span>
              {!isRemoved && (
                <button
                  type="button"
                  disabled={!canStrike || striking !== null}
                  onClick={() => handleStrike(c)}
                  className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {striking === cityKey(c) ? "Bezig..." : "Wegstrepen"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {onVolgende && (
        <div className="flex flex-col items-center gap-2 border-t border-foreground/10 pt-4">
          {!bothDone ? (
            <p className="text-center text-sm font-medium text-foreground/90">
              Je moet nog {stillNeeded} {stillNeeded === 1 ? "stad" : "steden"} wegstrepen om verder te kunnen.
            </p>
          ) : null}
          <button
            type="button"
            onClick={onVolgende}
            disabled={!bothDone}
            className="rounded-lg border-2 border-amber-500/50 bg-amber-500/20 px-4 py-2 text-sm font-medium text-foreground disabled:opacity-50"
          >
            {bothDone ? "🎰 Demo: ga door naar fruitautomaat →" : "Eerst 3 steden wegstrepen"}
          </button>
        </div>
      )}
    </div>
  );
}
