import { ZoWerktHet } from "@/components/ZoWerktHet";
import { StartPaginaFeest } from "@/components/StartPaginaFeest";

export default function Home() {
  return (
    <div className="relative space-y-4">
      <StartPaginaFeest />
      <ZoWerktHet />
      <div className="rounded-lg border border-foreground/10 bg-background p-6 text-center">
        <p className="text-lg text-foreground/90">
          Morgen (1 februari) moeten we allebei 5 steden opgeven.
        </p>
        <p className="mt-3 text-sm text-foreground/70">
          Open je link:{" "}
          <a href="/erik?token=test" className="font-mono underline">/erik?token=test</a>
          {" "}of{" "}
          <a href="/benno?token=test" className="font-mono underline">/benno?token=test</a>
        </p>
        <p className="mt-2 text-xs text-foreground/60">
          Geen installatie nodig – gewoon openen en testen.
        </p>
      </div>
    </div>
  );
}
