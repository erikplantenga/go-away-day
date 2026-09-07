"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatFlightCountdown, msUntilFlight } from "@/lib/countdown";

const SLIDES = [
  { src: "/images/go-away-day-hero.jpeg", alt: "Erik & Benno", position: "object-[center_15%]" },
  { src: "/images/malta-ww2-harbour.jpg", alt: "Grand Harbour, Malta in WO2", position: "object-center" },
  { src: "/images/malta-ww2-stelmo.jpg", alt: "Fort St. Elmo in WO2", position: "object-center" },
  { src: "/images/malta-ww2-warrooms.jpg", alt: "War Rooms Malta in WO2", position: "object-center" },
  { src: "/images/malta-ww2-spitfires.jpg", alt: "Spitfires op Malta in WO2", position: "object-center" },
] as const;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState<string | null>(null);

  useEffect(() => {
    const iv = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 3000);
    return () => window.clearInterval(iv);
  }, []);

  useEffect(() => {
    const tick = () => setLeft(formatFlightCountdown(msUntilFlight()));
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
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-10">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
          Tot we vliegen
        </p>
        <p className="mt-0.5 text-center text-lg font-bold tabular-nums tracking-wide text-white">
          {left ?? "—"}
        </p>
        <p className="text-center text-[11px] text-white/65">3 okt · 11:50 · KM395</p>
      </div>
    </div>
  );
}
