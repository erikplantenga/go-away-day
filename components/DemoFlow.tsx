"use client";

import { useState, useEffect } from "react";
import type { UserId } from "@/lib/firestore";

function setDemoMode(on: boolean) {
  if (typeof window === "undefined") return;
  (window as unknown as { __GO_AWAY_DAY_DEMO__?: boolean }).__GO_AWAY_DAY_DEMO__ = on;
}
import { CityInputForm } from "@/components/CityInputForm";
import { WegstreepList } from "@/components/WegstreepList";
import { SlotMachine } from "@/components/SlotMachine";
import { Leaderboard } from "@/components/Leaderboard";
import { WinnerScreen } from "@/components/WinnerScreen";
import { setWinner } from "@/lib/firestore";

type DemoStep = "cities" | "wegstreep" | "fruitautomaat" | "finale";

type Props = { currentUser: UserId };

export function DemoFlow({ currentUser }: Props) {
  const [step, setStep] = useState<DemoStep>("cities");

  useEffect(() => {
    setDemoMode(true);
    return () => setDemoMode(false);
  }, []);

  const goToWegstreep = () => setStep("wegstreep");
  const goToFruitautomaat = () => setStep("fruitautomaat");
  const goToFinale = async () => {
    try {
      await setWinner("Frankrijk");
    } catch {
      // demo: toon uitslag ook als backend faalt
    }
    setStep("finale");
  };

  if (step === "cities") {
    return (
      <CityInputForm
        currentUser={currentUser}
        demoOnGoToWegstreep={goToWegstreep}
      />
    );
  }

  if (step === "wegstreep") {
    return (
      <div className="space-y-4">
        <p className="text-center text-sm text-foreground/70">🎊 Wegstrepen – feest gaat door!</p>
        <WegstreepList currentUser={currentUser} />
        <div className="flex flex-col items-center gap-2">
          <p className="text-center text-xs text-foreground/60">Volgende feestje?</p>
          <button
            type="button"
            onClick={goToFruitautomaat}
            className="rounded-lg border-2 border-amber-500/50 bg-amber-500/20 px-4 py-2 text-sm font-medium text-foreground"
          >
            🎰 Demo: ga door naar fruitautomaat →
          </button>
        </div>
      </div>
    );
  }

  if (step === "fruitautomaat") {
    return (
      <div className="space-y-6">
        <p className="text-center text-sm text-foreground/70">🎰 Fruitautomaat – bijna uitslag!</p>
        <SlotMachine currentUser={currentUser} />
        <Leaderboard />
        <div className="flex flex-col items-center gap-2">
          <p className="text-center text-xs text-foreground/60">Het grote moment?</p>
          <button
            type="button"
            onClick={goToFinale}
            className="rounded-lg border-2 border-amber-500/50 bg-amber-500/20 px-4 py-2 text-sm font-medium text-foreground"
          >
            🏆 Demo: ga naar uitslag →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-foreground/70">🏆 Het feest is rond – winnaar!</p>
      <WinnerScreen demoWinner="Frankrijk" />
    </div>
  );
}
