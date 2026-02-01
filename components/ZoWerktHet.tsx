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
              <strong>1 februari 12:00</strong> – Vul elk 5 steden in (alleen stad). De lijsten worden
              gecombineerd en dubbelen gaan eraf.
            </li>
            <li>
              <strong>2 februari</strong> – Iedereen streep 1 stad weg. <strong>3 februari</strong> – iedereen streep 2 steden weg. Na 3 dagen blijven 4 steden over.
            </li>
            <li>
              <strong>4 t/m 7 februari</strong> – Fruitautomaat: elke dag 1 spin (vanaf 10:00). De gekozen stad krijgt punten. Stand wordt live bijgewerkt.
            </li>
            <li>
              <strong>7 februari 20:00</strong> – De stad met de meeste punten wint. Daar gaan we heen!
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
