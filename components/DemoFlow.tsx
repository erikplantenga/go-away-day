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
import { ensureDemoCitiesFilled, ensureDemoOtherUserStruckThree, ensureFruitMachineDemoData } from "@/lib/demoStorage";
import { getFactForDate } from "@/lib/dailyFacts";
import { getCurrentDateString } from "@/lib/dates";

type DemoStep = "cities" | "wegstreep" | "fruitautomaat" | "finale";

type Props = { currentUser: UserId };

export function DemoFlow({ currentUser }: Props) {
  const [step, setStep] = useState<DemoStep>("cities");

  useEffect(() => {
    setDemoMode(true);
    ensureDemoCitiesFilled();
    return () => setDemoMode(false);
  }, []);

  const goToWegstreep = async () => {
    await ensureDemoCitiesFilled();
    const other = currentUser === "erik" ? "benno" : "erik";
    await ensureDemoOtherUserStruckThree(other);
    setStep("wegstreep");
  };
  const goToFruitautomaat = async () => {
    await ensureFruitMachineDemoData();
    setStep("fruitautomaat");
  };
  const goToFinale = async () => {
    try {
      await setWinner("Frankrijk");
    } catch {
      // demo: toon uitslag ook als backend faalt
    }
    setStep("finale");
  };

  if (step === "cities") {
    const fact = getFactForDate(getCurrentDateString());
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-center text-sm italic text-foreground/90">
          {fact}
        </p>
        <CityInputForm
          currentUser={currentUser}
          demoOnGoToWegstreep={() => goToWegstreep()}
        />
      </div>
    );
  }

  if (step === "wegstreep") {
    return (
      <div className="space-y-4">
        <p className="text-center text-sm text-foreground/70">🎊 Wegstrepen – feest gaat door!</p>
        <p className="text-center text-xs text-foreground/60">Klik op een stad om die echt weg te strepen, net als in het echte spel.</p>
        <WegstreepList currentUser={currentUser} onVolgende={goToFruitautomaat} />
      </div>
    );
  }

  if (step === "fruitautomaat") {
    return (
      <div className="space-y-6">
        <p className="text-center text-sm text-foreground/70">🎰 Fruitautomaat – bijna uitslag!</p>
        <p className="text-center text-xs text-foreground/60">Zelfde scherm als in het echte spel.</p>
        <SlotMachine currentUser={currentUser} onRevealComplete={goToFinale} />
        <Leaderboard />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-foreground/70">🏆 Het feest is rond – winnaar!</p>
      <WinnerScreen demoWinner="Frankrijk" demoWinnerCity="Parijs" />
    </div>
  );
}
