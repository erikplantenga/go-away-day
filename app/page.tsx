import Link from "next/link";
import { ZoWerktHet } from "@/components/ZoWerktHet";
import { StartPaginaFeest } from "@/components/StartPaginaFeest";

export default function Home() {
  return (
    <div className="relative space-y-4">
      <StartPaginaFeest />
      <ZoWerktHet />
      <div className="rounded-lg border border-foreground/10 bg-background p-6 text-center">
        <p className="text-lg text-foreground/90">
          Vanaf 12:00 op 1 februari kunnen we allebei 5 steden opgeven (alleen stad).
        </p>
        <p className="mt-3 text-sm text-foreground/70">
          Open je link: <Link href="/erik" className="font-mono underline">/erik</Link> of{" "}
          <Link href="/benno" className="font-mono underline">/benno</Link>
        </p>
        <p className="mt-2 text-xs text-foreground/60">
          Geen installatie nodig – gewoon openen en testen.
        </p>
      </div>
    </div>
  );
}
