"use client";

import { useEffect, useState } from "react";
import { CHECK_IN_FEAST_MS, tripFeast, type FeastKind } from "@/lib/countdown";

let returnFeastUntil = 0;

export function useCheckInFeast(force: FeastKind | false = false) {
  const [party, setParty] = useState(!!force);
  const [kind, setKind] = useState<FeastKind | null>(force || null);

  useEffect(() => {
    if (force) {
      setParty(true);
      setKind(force);
      return;
    }
    const tick = () => {
      const next = tripFeast();
      if (!next) {
        setParty(false);
        setKind(null);
        return;
      }
      if (next === "return-checkin") {
        if (returnFeastUntil === 0) returnFeastUntil = Date.now() + CHECK_IN_FEAST_MS;
        const on = Date.now() < returnFeastUntil;
        setParty(on);
        setKind(on ? next : null);
        return;
      }
      setParty(true);
      setKind(next);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [force]);

  const leg = kind === "return-checkin" ? "terug" : kind ? "heen" : null;
  return { party, kind, leg };
}
