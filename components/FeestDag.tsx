"use client";

import { useState, useEffect } from "react";
import { getCurrentDateString } from "@/lib/dates";
import { getRevealTime, isAfterRevealTime } from "@/lib/dates";
import { getFactForDate } from "@/lib/dailyFacts";
import { Fireworks } from "@/components/Fireworks";

/** Europese steden – mooie foto's, roteer op dag van de maand */
const EUROPE_PHOTOS = [
  "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80", // Amsterdam
  "https://images.unsplash.com/photo-1502602898657-3e1fe06a947a?w=800&q=80", // Paris
  "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80", // Barcelona
  "https://images.unsplash.com/photo-1569949230765-3c4c2c539d3a?w=800&q=80", // Lisbon
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80", // London
  "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80", // Rome
  "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80", // Prague
];

function getPhotoForDate(dateStr: string): string {
  const day = parseInt(dateStr.slice(8, 10), 10) || 1;
  const i = (day - 1) % EUROPE_PHOTOS.length;
  return EUROPE_PHOTOS[i] ?? EUROPE_PHOTOS[0]!;
}

function formatCountdown(ms: number): { days: number; hours: number } {
  if (ms <= 0) return { days: 0, hours: 0 };
  const totalHours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return { days, hours };
}

export function FeestDag() {
  const [countdown, setCountdown] = useState<{ days: number; hours: number } | null>(null);
  const dateStr = getCurrentDateString();
  const fact = getFactForDate(dateStr);
  const photoUrl = getPhotoForDate(dateStr);
  const showCountdown = !isAfterRevealTime();

  useEffect(() => {
    if (!showCountdown) return;
    const revealAt = getRevealTime();
    const update = () => {
      const left = revealAt.getTime() - Date.now();
      setCountdown(left <= 0 ? { days: 0, hours: 0 } : formatCountdown(left));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [showCountdown]);

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-foreground/5 shadow-lg shadow-amber-500/10">
      {showCountdown && (
        <div className="absolute inset-0 z-10 overflow-hidden rounded-2xl">
          <Fireworks />
        </div>
      )}
      <div className="relative z-0 aspect-[2/1] w-full">
        <img
          src={photoUrl}
          alt="Europa"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          {showCountdown && countdown !== null && (
            <p className="text-center text-xl font-bold drop-shadow-lg sm:text-2xl">
              Nog {countdown.days} dagen en {countdown.hours} uren – dan weet je waar je naartoe gaat! 🎉
            </p>
          )}
        </div>
      </div>
      <div className="border-t border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 px-4 py-4">
        <p className="text-center text-sm font-medium italic text-foreground/90 sm:text-base">{fact}</p>
      </div>
    </div>
  );
}
