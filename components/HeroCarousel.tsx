"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  formatCheckInCountdown,
  formatFlightCountdown,
  msUntilFlight,
  msUntilReturnCheckIn,
  msUntilReturnFlight,
  tripFeast,
  type FeastKind,
} from "@/lib/countdown";

const SLIDES = [
  { src: "/images/go-away-day-hero.jpeg", alt: "Erik & Benno, Malta–Andorra", position: "object-[center_40%]" },
  { src: "/images/malta-ww2-harbour.jpg", alt: "Grand Harbour, Malta in WO2", position: "object-center" },
  { src: "/images/malta-ww2-stelmo.jpg", alt: "Fort St. Elmo in WO2", position: "object-center" },
  { src: "/images/malta-ww2-warrooms.jpg", alt: "War Rooms Malta in WO2", position: "object-center" },
  { src: "/images/malta-ww2-spitfires.jpg", alt: "Spitfires op Malta in WO2", position: "object-center" },
] as const;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [kind, setKind] = useState<FeastKind | null>(() => tripFeast());
  const [flightLeft, setFlightLeft] = useState<string | null>(null);
  const [returnLeft, setReturnLeft] = useState<string | null>(null);
  const [returnCheckInLeft, setReturnCheckInLeft] = useState<string | null>(null);
  const [returnCheckInOpen, setReturnCheckInOpen] = useState(false);

  useEffect(() => {
    const iv = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 3000);
    return () => window.clearInterval(iv);
  }, []);

  useEffect(() => {
    const tick = () => {
      const untilReturnCheckIn = msUntilReturnCheckIn();
      setKind(tripFeast());
      setFlightLeft(formatFlightCountdown(msUntilFlight()));
      setReturnLeft(formatFlightCountdown(msUntilReturnFlight()));
      setReturnCheckInLeft(formatCheckInCountdown(untilReturnCheckIn));
      setReturnCheckInOpen(untilReturnCheckIn <= 0);
    };
    tick();
    const iv = window.setInterval(tick, 1000);
    return () => window.clearInterval(iv);
  }, []);

  return (
    <div className="relative mx-auto mt-3 aspect-[4/3] w-full overflow-hidden rounded-xl bg-foreground/5">
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          className={`object-cover ${slide.position} transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          sizes="100vw"
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-3 pb-3 pt-10">
        {kind === "goede-vlucht" ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="mp-checkin-open text-sm font-black uppercase leading-tight tracking-[0.08em] text-[#c9a227] sm:text-base">
                Goede vlucht!!
              </p>
              <p className="mt-0.5 text-[11px] text-white/65">3 okt · 11:50</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Tot we vliegen</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums tracking-wide text-white sm:text-base">
                {flightLeft ?? "—"}
              </p>
              <p className="text-[11px] text-white/65">3 okt · 11:50 · KM395</p>
            </div>
          </div>
        ) : kind === "veel-plezier" ? (
          <div className="text-center">
            <p className="mp-checkin-open text-base font-black uppercase leading-tight tracking-[0.08em] text-[#c9a227] sm:text-lg">
              Veel plezier op Malta!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              {returnCheckInOpen ? (
                <>
                  <p className="mp-checkin-open text-sm font-black uppercase tracking-[0.12em] text-[#c9a227] sm:text-base">
                    Incheck is open
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/65">6 okt · 07:25</p>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Tot check-in</p>
                  <p className="mt-0.5 text-sm font-bold tabular-nums tracking-wide text-white sm:text-base">
                    {returnCheckInLeft ?? "—"}
                  </p>
                  <p className="text-[11px] text-white/65">6 okt · 07:25</p>
                </>
              )}
            </div>
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Tot terugreis</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums tracking-wide text-white sm:text-base">
                {returnLeft ?? "—"}
              </p>
              <p className="text-[11px] text-white/65">7 okt · 07:25 · KM394</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
