"use client";

import { useState, useEffect } from "react";
import type { UserId } from "@/lib/firestore";
import type { CityEntry } from "@/lib/firestore";
import type { RemovedEntry } from "@/lib/firestore";
import {
  getCities,
  getRemoved,
  addRemoved,
  hasUserStruckToday,
} from "@/lib/firestore";
import { getCurrentDateString } from "@/lib/dates";
import { WhoMustStrikeBanner } from "@/components/WhoMustStrikeBanner";

type Props = { currentUser: UserId };

function cityKey(c: CityEntry): string {
  return `${c.city}|${c.country}`;
}

export function WegstreepList({ currentUser }: Props) {
  const [cities, setCities] = useState<CityEntry[]>([]);
  const [removed, setRemoved] = useState<RemovedEntry[]>([]);
  const [erikStruck, setErikStruck] = useState(false);
  const [bennoStruck, setBennoStruck] = useState(false);
  const [loading, setLoading] = useState(true);
  const [striking, setStriking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dateStr = getCurrentDateString();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [allCities, removedList] = await Promise.all([
          getCities(),
          getRemoved(),
        ]);
        if (cancelled) return;
        setCities(allCities);
        setRemoved(removedList);
        const [erik, benno] = await Promise.all([
          hasUserStruckToday("erik", dateStr),
          hasUserStruckToday("benno", dateStr),
        ]);
        if (!cancelled) {
          setErikStruck(erik);
          setBennoStruck(benno);
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
  }, [dateStr]);

  const removedTodayOrEarlier = removed.filter((r) => r.date <= dateStr);
  const removedSet = new Set(
    removedTodayOrEarlier.map((r) => `${r.city}|${r.country ?? ""}`)
  );
  const remaining = cities.filter((c) => !removedSet.has(cityKey(c)));

  const canStrike = currentUser === "erik" ? !erikStruck : !bennoStruck;

  const handleStrike = async (city: CityEntry) => {
    if (!canStrike) return;
    setStriking(cityKey(city));
    setError(null);
    try {
      await addRemoved(city.city, city.country, currentUser, dateStr);
      setRemoved((prev) => [
        ...prev,
        { city: city.city, country: city.country, removedBy: currentUser, date: dateStr },
      ]);
      if (currentUser === "erik") setErikStruck(true);
      else setBennoStruck(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wegstrepen mislukt");
    } finally {
      setStriking(null);
    }
  };

  if (loading) {
    return <p className="text-center text-foreground/70">Laden...</p>;
  }

  return (
    <div className="space-y-4 rounded-lg border border-foreground/10 bg-background p-4">
      <WhoMustStrikeBanner erikDone={erikStruck} bennoDone={bennoStruck} />
      <p className="text-sm text-foreground/70">
        Kies 1 stad om vandaag weg te strepen.
      </p>
      <ul className="space-y-2">
        {remaining.map((c) => (
          <li
            key={cityKey(c)}
            className="flex items-center justify-between gap-2 rounded border border-foreground/10 bg-background px-3 py-2"
          >
            <span className="font-medium">
              {c.city}, {c.country}
            </span>
            <button
              type="button"
              disabled={!canStrike || striking !== null}
              onClick={() => handleStrike(c)}
              className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {striking === cityKey(c) ? "Bezig..." : "Wegstrepen"}
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {remaining.length === 0 && (
        <p className="text-center text-foreground/70">
          Alle steden zijn weggestreept voor vandaag.
        </p>
      )}
    </div>
  );
}
