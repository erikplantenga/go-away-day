"use client";

import { getPhase } from "@/lib/dates";

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
    return (
      <p className="text-center text-lg text-foreground/90">
        Streep vandaag elk 1 stad weg.
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
          Op 7 februari om 20:00 weten we waar we heen gaan.
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
