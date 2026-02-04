"use client";

import Link from "next/link";
import { SlotMachineDemoCopy } from "@/components/SlotMachineDemoCopy";

/**
 * Demo: exacte kopie van de originele spin (SlotMachine) voor lokaal testen.
 * Zelfde timing (5 s per slot, 5 s "Tussenstand bijwerken"), geen Firebase.
 */
export default function DemoSpinOrigPage() {
  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-foreground/60">
        Demo – kopie van originele spin (lokaal testen).{" "}
        <Link href="/" className="underline">Terug</Link>
      </p>
      <SlotMachineDemoCopy />
    </div>
  );
}
