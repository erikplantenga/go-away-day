"use client";

import { useState, useEffect } from "react";
import { getPhase, getSpinOpenTime } from "@/lib/dates";
import type { UserId } from "@/lib/firestore";
import { CityInputForm } from "@/components/CityInputForm";
import { WegstreepList } from "@/components/WegstreepList";
import { SlotMachine } from "@/components/SlotMachine";
import { Leaderboard } from "@/components/Leaderboard";
import { WinnerScreen } from "@/components/WinnerScreen";
import { DemoFeest } from "@/components/DemoFeest";
import { DemoFlow } from "@/components/DemoFlow";

type Props = { currentUser: UserId };

export function PhaseContent({ currentUser }: Props) {
  const phase = getPhase();
  const [showDemo, setShowDemo] = useState(false);

  if (phase === "countdown") {
    return (
      <div className="space-y-4">
        <p className="text-center text-foreground/70">
          Wacht tot 1 februari om steden in te voeren.
        </p>
        {!showDemo ? (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowDemo(true)}
              className="rounded-xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-6 py-3 text-base font-semibold text-foreground shadow-lg shadow-amber-500/20 transition hover:from-amber-500/30 hover:to-orange-500/30"
            >
              🎉 Demo bekijken – feest! 🎉
            </button>
          </div>
        ) : (
          <DemoFeest>
            <DemoFlow currentUser={currentUser} />
          </DemoFeest>
        )}
      </div>
    );
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
