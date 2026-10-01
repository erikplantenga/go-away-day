"use client";

import { useEffect, useState } from "react";
import { activeCheckIn, CHECK_IN_FEAST_MS, type CheckInLeg } from "@/lib/countdown";

let feastUntil = 0;

export function useCheckInFeast(force: CheckInLeg | false = false) {
  const [party, setParty] = useState(!!force);
  const [leg, setLeg] = useState<CheckInLeg | null>(force || null);

  useEffect(() => {
    if (force) {
      setParty(true);
      setLeg(force);
      return;
    }
    const tick = () => {
      const next = activeCheckIn();
      if (!next) {
        setParty(false);
        setLeg(null);
        return;
      }
      if (feastUntil === 0) feastUntil = Date.now() + CHECK_IN_FEAST_MS;
      const on = Date.now() < feastUntil;
      setParty(on);
      setLeg(on ? next : null);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [force]);

  return { party, leg };
}
