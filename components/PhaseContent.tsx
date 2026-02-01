"use client";

import { useState, useEffect } from "react";
import { getPhase, getSpinOpenTime, getCityInputOpenTime } from "@/lib/dates";
import type { UserId } from "@/lib/firestore";
import { CityInputForm } from "@/components/CityInputForm";
import { WegstreepList } from "@/components/WegstreepList";
import { SlotMachine } from "@/components/SlotMachine";
import { Leaderboard } from "@/components/Leaderboard";
import { WinnerScreen } from "@/components/WinnerScreen";

type Props = { currentUser: UserId };

export function PhaseContent({ currentUser }: Props) {
  const phase = getPhase();

  if (phase === "countdown") {
    return <CountdownToCityInput />;
  }

  if (phase === "city_input") {
    return <CityInputForm currentUser={currentUser} />;
  }

  if (phase === "wegstreep") {
    return <WegstreepList currentUser={currentUser} />;
  }

  if (phase === "countdown_spin") {
    return <CountdownToSpin />;
  }

  if (phase === "fruitautomaat") {
    return (
      <div className="space-y-6">
        <SlotMachine currentUser={currentUser} />
        <Leaderboard />
      </div>
    );
  }

  if (phase === "finale") {
    return <WinnerScreen />;
  }

  return null;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function formatCountdownLong(ms: number): { days: number; hours: number; min: number } {
  if (ms <= 0) return { days: 0, hours: 0, min: 0 };
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const rest = totalSec % 86400;
  const hours = Math.floor(rest / 3600);
  const min = Math.floor((rest % 3600) / 60);
  return { days, hours, min };
}

function CountdownToCityInput() {
  const [countdown, setCountdown] = useState("");
  const [long, setLong] = useState<{ days: number; hours: number; min: number } | null>(null);
  useEffect(() => {
    const update = () => {
      const openAt = getCityInputOpenTime();
      const left = Math.max(0, openAt.getTime() - Date.now());
      setCountdown(formatCountdown(left));
      setLong(formatCountdownLong(left));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-8 text-center">
      <p className="text-lg font-semibold text-foreground">
        Steden invullen vanaf 12:00 op 1 februari
      </p>
      <p className="text-3xl font-mono font-bold tabular-nums text-foreground">
        {countdown}
      </p>
      {long && (long.days > 0 || long.hours > 0 || long.min > 0) && (
        <p className="text-sm text-foreground/70">
          nog {long.days > 0 ? `${long.days}d ` : ""}{long.hours}u {long.min}m te gaan
        </p>
      )}
    </div>
  );
}

function CountdownToSpin() {
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    const update = () => {
      const openAt = getSpinOpenTime();
      const left = Math.max(0, openAt.getTime() - Date.now());
      setCountdown(formatCountdown(left));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-8 text-center">
      <p className="text-lg font-semibold text-foreground">
        Je mag spinnen vanaf 4 februari om 10:00
      </p>
      <p className="text-3xl font-mono font-bold tabular-nums text-foreground">
        {countdown}
      </p>
      <p className="text-sm text-foreground/70">nog te gaan</p>
    </div>
  );
}
