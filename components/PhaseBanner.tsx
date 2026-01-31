"use client";

import { getPhase, getCurrentDateString, getStrikeLimitForDate } from "@/lib/dates";

export function PhaseBanner() {
  const phase = getPhase();

  if (phase === "countdown") {
    return (
      <p className="text-center text-lg text-foreground/90">
        Morgen (1 februari) moeten we allebei 5 steden opgeven.
      </p>
    );
  }

  if (phase === "city_input") {
    return (
      <p className="text-center text-lg text-foreground/90">
        Geef vandaag elk 5 steden op.
      </p>
    );
  }

  if (phase === "wegstreep") {
    const dateStr = getCurrentDateString();
    const limit = getStrikeLimitForDate(dateStr);
    const text = limit === 1 ? "Streep vandaag elk 1 stad weg." : "Streep vandaag elk 2 steden weg.";
    return (
      <p className="text-center text-lg text-foreground/90">
        {text}
      </p>
    );
  }

  if (phase === "fruitautomaat") {
    return (
      <>
        <p className="text-center text-lg text-foreground/90">
          Je mag vandaag 1 spin doen.
        </p>
        <p className="mt-2 text-center text-sm text-foreground/70">
          Op 7 februari om 20:30 weten we waar we heen gaan.
        </p>
      </>
    );
  }

  if (phase === "finale") {
    return (
      <p className="text-center text-lg text-foreground/90">
        De winnaar is bekend!
      </p>
    );
  }

  return null;
}
