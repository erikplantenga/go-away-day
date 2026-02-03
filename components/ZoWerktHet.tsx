"use client";

import { useState } from "react";

export function ZoWerktHet() {
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
              <strong>1 februari 12:00</strong> – Vul elk 5 steden in (alleen stad). Geen dubbelen: heeft
              de ander een stad al ingevuld, dan moet jij een andere invullen. De lijsten worden gecombineerd.
            </li>
            <li>
              <strong>2 februari</strong> – Iedereen streep 1 stad weg. <strong>3 februari</strong> – iedereen streep 2 steden weg. Na 3 dagen blijven 4 steden over.
            </li>
            <li>
              <strong>4 t/m 7 februari</strong> – Fruitautomaat: elke dag 1 spin (vanaf 10:00). De 3 steden in de spin krijgen elk <strong>1 punt</strong> (3 punten per spinronde; na jou en de ander 6 punten verdeeld). De <strong>tussentand</strong> zie je live – na elke spin van jou of de ander wordt de stand bijgewerkt; op 7 februari om 20:00 volgt de finale.
            </li>
            <li>
              <strong>7 februari 20:00</strong> – Druk op “Bekijk de uitslag”. Nog even wachten tot 20:30, dan de laatste spin (60 sec) – en dan weten we het. Daar gaan we heen!
            </li>
          </ol>
          <p className="mt-3 rounded border border-foreground/15 bg-foreground/5 px-3 py-2 text-xs italic text-foreground/80">
            <strong>Eerlijk spel:</strong> Erik en Benno hebben allebei dezelfde rechten. Niemand kan de uitslag sturen: jullie kiezen elk je eigen steden, strepen elk je eigen keuzes weg, en de fruitautomaat kiest willekeurig. Met 1 punt per getoonde stad (3 per spinronde) en 4 spins per persoon blijft de race spannend; een stad kan wel eerder mathematisch niet meer ingehaald worden, maar tot de laatste spin is er van alles mogelijk.
          </p>
        </div>
      )}
    </div>
  );
}
