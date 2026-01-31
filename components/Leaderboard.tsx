"use client";

import { useState, useEffect } from "react";
import { subscribeSpins } from "@/lib/firestore";
import type { SpinEntry } from "@/lib/firestore";
import { isAfterRevealTime } from "@/lib/dates";

function aggregateByCity(
  spins: (SpinEntry & { id: string })[]
): { city: string; points: number }[] {
  const map = new Map<string, number>();
  for (const s of spins) {
    const n = (map.get(s.city) ?? 0) + (s.points ?? 1);
    map.set(s.city, n);
  }
  return Array.from(map.entries())
    .map(([city, points]) => ({ city, points }))
    .sort((a, b) => b.points - a.points);
}

export function Leaderboard() {
  const [spins, setSpins] = useState<(SpinEntry & { id: string })[]>([]);

  useEffect(() => {
    const unsub = subscribeSpins(setSpins);
    return () => unsub();
  }, []);

  const standings = aggregateByCity(spins);
  const showStand = isAfterRevealTime();

  return (
    <div className="rounded-lg border border-foreground/10 bg-background p-4">
      <h2 className="mb-3 font-semibold text-foreground">Stand</h2>
      {!showStand ? (
        <p className="text-sm text-foreground/70">
          De stand wordt op 7 februari om 20:00 bekend.
        </p>
      ) : standings.length === 0 ? (
        <p className="text-sm text-foreground/70">Nog geen spins.</p>
      ) : (
        <ul className="space-y-2">
          {standings.map(({ city, points }, i) => (
            <li
              key={city}
              className="flex items-center justify-between rounded border border-foreground/10 px-3 py-2"
            >
              <span className="font-medium">
                {i + 1}. {city}
              </span>
              <span className="text-foreground/80">{points} pt</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
