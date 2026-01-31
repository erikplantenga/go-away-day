"use client";

import { useState } from "react";

type Props = {
  /** Optional: show demo hint only when we're in city_input and have demo buttons */
  showDemoHint?: boolean;
};

export function ZoWerktHet({ showDemoHint = false }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4 rounded-lg border border-foreground/10 bg-background/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-foreground"
      >
        <span>Zo werkt het</span>
        <span className="text-foreground/60">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-foreground/10 px-4 py-3 text-sm text-foreground/90">
          <ol className="list-decimal space-y-2 pl-4">
            <li>
              <strong>1 februari</strong> – Vul elk 5 steden in (stad + land). De lijsten worden
              gecombineerd en dubbelen gaan eraf.
            </li>
            <li>
              <strong>1 t/m 3 februari</strong> – Elke dag mag iedereen 1 stad wegstrepen. Na 3
              dagen blijven 4 steden over.
            </li>
            <li>
              <strong>4 t/m 7 februari</strong> – Fruitautomaat: elke dag 1 spin. Het gekozen land
              krijgt punten. Stand wordt live bijgewerkt.
            </li>
            <li>
              <strong>7 februari 20:00</strong> – Het land met de meeste punten wint. Daar gaan we
              heen!
            </li>
          </ol>
          {showDemoHint && (
            <p className="mt-3 rounded bg-foreground/5 p-2 text-foreground/80">
              <strong>Demo:</strong> Bij het formulier hieronder kun je op &quot;Vul voorbeeld
              in&quot; klikken om 5 voorbeeldsteden in te vullen. Klik daarna op &quot;Vul ook de
              andere 5 in (demo)&quot; om de andere persoon te simuleren. Tot slot &quot;Steden
              opgeven&quot; – zo zie je hoe de gecombineerde lijst ontstaat.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
