"use client";

import { useEffect, useState } from "react";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { Fireworks } from "@/components/Fireworks";
import { unlockAudio } from "@/lib/audioContext";
import { BoardingPassSheet } from "@/components/BoardingPassSheet";
import { useCheckInFeast } from "@/lib/useCheckInFeast";
import { useWinSound } from "@/lib/useWinSound";
import type { FeastKind } from "@/lib/countdown";
import { FLIGHTS } from "@/lib/maltaTrip";

const FLYING = ["✈️", "🎫", "🎉", "🥳", "✈️", "🍾", "🍻", "🌟", "🎫", "✈️", "🎊", "✨", "✈️", "🎉", "🥳", "🎫"];

const COPY: Record<
  FeastKind,
  { title: string; flight: string; when: string; note: string; action: "boarding" | "checkin"; href?: string }
> = {
  "goede-vlucht": {
    title: "Goede vlucht!!",
    flight: "KM395 · AMS → MLA",
    when: "za 3 okt · 11:50",
    note: "Boardingpass klaar. Kies wie je bent.",
    action: "boarding",
  },
  "veel-plezier": {
    title: "Veel plezier op Malta!",
    flight: "Sliema · Valletta · het eiland",
    when: "3–7 oktober",
    note: "Proost, en tot vanavond. Daarna tellen we af naar huis.",
    action: "boarding",
  },
  "return-checkin": {
    title: "Incheck is open",
    flight: "KM394 · MLA → AMS",
    when: "di 6 okt · 07:25",
    note: "Tijd om in te checken voor de terugreis.",
    action: "checkin",
    href: "https://www.kmmaltaairlines.com",
  },
};

type Props = {
  preview?: boolean | FeastKind;
  onClose?: () => void;
};

export function CheckInOpenFeest({ preview = false, onClose }: Props) {
  const forced = preview === true ? "goede-vlucht" : preview;
  const { party, kind } = useCheckInFeast(forced || false);
  const [dismissed, setDismissed] = useState(false);
  const [boarding, setBoarding] = useState(false);
  const show = (preview || party) && !dismissed;
  const which = kind ?? (forced || "goede-vlucht");
  const copy = COPY[which];
  const passes = FLIGHTS.outbound.boardingPasses;

  useWinSound(show ? copy.title : null);

  useEffect(() => {
    if (show) unlockAudio();
  }, [show]);

  if (!show) return null;

  const close = () => {
    setDismissed(true);
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-[#070d18] text-white"
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
    >
      <Fireworks fullScreen />
      <ConfettiBurst zIndex={101} />
      <style>{`
        @keyframes mp-checkin-fly-left {
          0% { transform: translateX(110vw) rotate(-8deg); opacity: 0.95; }
          100% { transform: translateX(-140px) rotate(8deg); opacity: 0.95; }
        }
        @keyframes mp-checkin-fly-right {
          0% { transform: translateX(-140px) rotate(8deg); opacity: 0.95; }
          100% { transform: translateX(110vw) rotate(-8deg); opacity: 0.95; }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {FLYING.map((emoji, i) => (
          <div
            key={`${emoji}-${i}`}
            className="absolute will-change-transform"
            style={{
              top: i % 2 === 0 ? `${4 + ((i * 3) % 14)}%` : `${78 + ((i * 2) % 16)}%`,
              left: 0,
              fontSize: `${26 + (i % 4) * 10}px`,
              animation:
                i % 2 === 0
                  ? `mp-checkin-fly-left ${10 + (i % 5)}s linear ${i * 0.35}s infinite`
                  : `mp-checkin-fly-right ${11 + (i % 4)}s linear ${i * 0.4}s infinite`,
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
      <div
        className="relative z-[102] flex h-full flex-col items-center justify-center px-5 text-center"
        style={{
          paddingTop: "max(1.25rem, env(safe-area-inset-top))",
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="w-full max-w-sm rounded-[2rem] bg-[#0b1220]/90 px-5 py-7 shadow-[0_0_90px_rgba(201,162,39,0.4)] backdrop-blur-md">
          {preview ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
              Lokaal voorbeeld
            </p>
          ) : null}
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c9a227]">
            Go Away Day
          </p>
          <p className="mp-checkin-open mt-4 text-4xl font-black uppercase leading-[0.9] tracking-[0.04em] text-[#c9a227] sm:text-5xl">
            {copy.title}
          </p>
          <p className="mt-3 text-3xl" aria-hidden>
            ✈️🎫🥳
          </p>
          <p className="mt-4 text-lg font-bold text-white">{copy.flight}</p>
          <p className="mt-1 text-sm text-white/70">{copy.when}</p>
          <p className="mt-4 text-sm font-semibold leading-snug text-[#c9a227]">{copy.note}</p>
          {copy.action === "boarding" && passes ? (
            <button
              type="button"
              onClick={() => {
                unlockAudio();
                setBoarding(true);
              }}
              className="mt-8 flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#c9a227] text-base font-bold text-[#0b1f3a]"
            >
              Boardingpass
            </button>
          ) : copy.action === "checkin" && copy.href ? (
            <a
              href={copy.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => unlockAudio()}
              className="mt-8 flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#c9a227] text-base font-bold text-[#0b1f3a]"
            >
              Naar check-in
            </a>
          ) : (
            <div className="mt-8" />
          )}
          <button
            type="button"
            onClick={close}
            className="mt-3 flex min-h-12 w-full items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold"
          >
            Feest, sluiten
          </button>
        </div>
      </div>
      {boarding && passes ? (
        <BoardingPassSheet passes={passes} zIndex={110} onClose={() => setBoarding(false)} />
      ) : null}
    </div>
  );
}
