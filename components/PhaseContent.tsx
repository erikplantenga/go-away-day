"use client";

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

  if (phase === "countdown") {
    return (
      <p className="text-center text-foreground/70">
        Wacht tot 1 februari om steden in te voeren.
      </p>
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
