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
  getStrikeCountForDate,
} from "@/lib/firestore";
import { getCurrentDateString, getStrikeLimitForDate, getWegstreepDay2StartTime, getSpinOpenTime } from "@/lib/dates";
import { WhoMustStrikeBanner } from "@/components/WhoMustStrikeBanner";

const DEMO_REQUIRED_STRIKES = 3;

type Props = {
  currentUser: UserId;
  /** Demo: toon Volgende / Ga door alleen als beide 3 hebben weggestreept */
  onVolgende?: () => void;
};

function cityKey(c: CityEntry): string {
  return `${c.city}|${c.country ?? ""}`;
}

export function WegstreepList({ currentUser, onVolgende }: Props) {
  const [cities, setCities] = useState<CityEntry[]>([]);
  const [removed, setRemoved] = useState<RemovedEntry[]>([]);
  const [strikeCountErik, setStrikeCountErik] = useState(0);
  const [strikeCountBenno, setStrikeCountBenno] = useState(0);
  const [loading, setLoading] = useState(true);
  const [striking, setStriking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmStrikeKey, setConfirmStrikeKey] = useState<string | null>(null);
  const [nextCountdown, setNextCountdown] = useState("");
  const dateStr = getCurrentDateString();

  const isDemo = !!onVolgende;

  useEffect(() => {
    if (isDemo) return;
    const update = () => {
      const mmdd = dateStr.slice(5);
      const target = mmdd === "02-02" ? getWegstreepDay2StartTime() : getSpinOpenTime();
      const left = Math.max(0, target.getTime() - Date.now());
      const sec = Math.floor(left / 1000);
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);
      setNextCountdown(d > 0 ? `${d}d ${h}u ${m}m` : `${h}u ${m}m`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [dateStr, isDemo]);
  const requiredToday = isDemo ? DEMO_REQUIRED_STRIKES : getStrikeLimitForDate(dateStr);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [allCities, removedList, erikCount, bennoCount] = await Promise.all([
          getCities(),
          getRemoved(),
          isDemo ? getStrikeCount("erik") : getStrikeCountForDate("erik", dateStr),
          isDemo ? getStrikeCount("benno") : getStrikeCountForDate("benno", dateStr),
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
  }, [dateStr, isDemo]);

  const removedSet = new Set(
    removed.map((r) => `${r.city}|${r.country ?? ""}`)
  );
  const strikeCountCurrent = currentUser === "erik" ? strikeCountErik : strikeCountBenno;
  const canStrike = requiredToday > 0 && strikeCountCurrent < requiredToday;

  const handleStrikeClick = (city: CityEntry) => {
    if (!canStrike || removedSet.has(cityKey(city))) return;
    setConfirmStrikeKey(cityKey(city));
  };

  const handleStrike = async (city: CityEntry) => {
    if (!canStrike || removedSet.has(cityKey(city))) return;
    setConfirmStrikeKey(null);
    setStriking(cityKey(city));
    setError(null);
    try {
      await addRemoved(city.city, city.country ?? undefined, currentUser, dateStr);
      setRemoved((prev) => [
        ...prev,
        { city: city.city, country: city.country ?? undefined, removedBy: currentUser, date: dateStr },
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

  const bothDone = isDemo && strikeCountErik >= DEMO_REQUIRED_STRIKES && strikeCountBenno >= DEMO_REQUIRED_STRIKES;
  const stillNeeded = requiredToday - strikeCountCurrent;
  const mmdd = dateStr.slice(5);
  const nextLabel = mmdd === "02-02" ? "2 februari – 2 steden wegstrepen" : "4 februari 10:00 – spinnen";

  return (
    <div className="space-y-4 rounded-lg border border-foreground/10 bg-background p-4">
      {!isDemo && (
        <div className="rounded-lg border-2 border-red-500/50 bg-red-500/10 px-3 py-2 text-center text-sm font-semibold text-red-700 dark:text-red-400">
          Wegstrepen is definitief – dit kun je niet herstellen!
        </div>
      )}
      {confirmStrikeKey && (() => {
        const city = cities.find((c) => cityKey(c) === confirmStrikeKey);
        if (!city) return null;
        return (
          <div className="rounded-lg border-2 border-amber-500/60 bg-amber-500/15 p-4 text-center">
            <p className="font-medium text-foreground">
              Weet je het zeker? Je kunt niet meer terug.
            </p>
            <p className="mt-1 text-sm text-foreground/80">
              {city.country ? `${city.city}, ${city.country}` : city.city} wordt {isDemo ? "weggestreept" : "definitief weggestreept"}.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmStrikeKey(null)}
                className="flex-1 rounded-lg border border-foreground/30 bg-foreground/10 py-2 text-sm font-medium text-foreground"
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={() => handleStrike(city)}
                disabled={striking !== null}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {striking === confirmStrikeKey ? "Bezig..." : "Ja, wegstrepen"}
              </button>
            </div>
          </div>
        );
      })()}
      <WhoMustStrikeBanner
        erikCount={strikeCountErik}
        bennoCount={strikeCountBenno}
        required={requiredToday}
      />
      <p className="text-sm text-foreground/70">
        {isDemo
          ? `Kies 1 stad om weg te strepen. Je moet er ${DEMO_REQUIRED_STRIKES} wegestreept hebben om verder te kunnen.`
          : `Vandaag mag je ${requiredToday} ${requiredToday === 1 ? "stad" : "steden"} wegstrepen (eenmalig).`}
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
                {c.country ? `${c.city}, ${c.country}` : c.city}
              </span>
              {!isRemoved && (
                <button
                  type="button"
                  disabled={!canStrike || striking !== null}
                  onClick={() => handleStrikeClick(c)}
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
      {!isDemo && nextCountdown && (
        <div className="rounded border border-foreground/10 bg-foreground/5 px-3 py-2 text-center text-sm text-foreground/80">
          Volgende opdracht: {nextLabel} – nog {nextCountdown}
        </div>
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
            {bothDone ? "🎰 Demo: ga door naar fruitautomaat →" : `Eerst ${DEMO_REQUIRED_STRIKES} steden wegstrepen`}
          </button>
        </div>
      )}
    </div>
  );
}
