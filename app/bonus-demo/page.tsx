"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MpQuizBonus } from "@/components/MpQuizBonus";

function isLocalDemoHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

const GOOD = "21 september";
const DATES = ["11 september", "26 september", "21 september", "20 september"];

export default function BonusDemoPage() {
  const router = useRouter();
  const [local, setLocal] = useState(false);
  const [pick, setPick] = useState<number | null>(null);
  const [choices, setChoices] = useState(DATES);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (!isLocalDemoHost()) {
      router.replace("/");
      return;
    }
    setLocal(true);
    setChoices([...DATES].sort(() => Math.random() - 0.5));
  }, [router]);

  if (!local) return null;

  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-[#0b1f3a] text-white" role="dialog" aria-modal="true">
      <div
        className="flex shrink-0 items-center gap-2 px-3 pb-2"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-tap flex min-h-11 items-center rounded-full bg-white/10 px-4 text-sm font-semibold"
        >
          Sluiten
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-[#c9a227]">MP-Quiz</p>
        <span className="inline-tap min-h-11 min-w-16" aria-hidden />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          Lokaal voorbeeld · 26 sep
        </p>
        <MpQuizBonus
          question="Wanneer is Feme Pop jarig?"
          choices={choices}
          pick={pick}
          reveal={reveal}
          correctIndexes={choices.flatMap((choice, i) => (choice === GOOD ? [i] : []))}
          onPick={setPick}
          submitLabel="Klaar, ik heb ’m gezien"
          onSubmit={() => {
            if (reveal) return;
            setReveal(true);
            window.setTimeout(() => router.push("/"), 2000);
          }}
        />
      </div>
    </div>
  );
}
