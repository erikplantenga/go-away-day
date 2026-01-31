"use client";

import { useState } from "react";
import { getPhase } from "@/lib/dates";
import type { UserId } from "@/lib/firestore";
import { CityInputForm } from "@/components/CityInputForm";
import { WegstreepList } from "@/components/WegstreepList";
import { SlotMachine } from "@/components/SlotMachine";
import { Leaderboard } from "@/components/Leaderboard";
import { WinnerScreen } from "@/components/WinnerScreen";

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
              className="rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2 text-sm font-medium text-foreground"
            >
              Demo bekijken
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-center text-sm text-foreground/60">
              Dit is een demo – de echte ronde start 1 februari.
            </p>
            <CityInputForm currentUser={currentUser} />
          </div>
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
