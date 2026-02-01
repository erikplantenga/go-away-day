"use client";

import { useState, useEffect } from "react";
import { getCurrentDateString } from "@/lib/dates";
import { getRevealTime, isAfterRevealTime } from "@/lib/dates";
import { getFactForDate } from "@/lib/dailyFacts";
import { Fireworks } from "@/components/Fireworks";

/** Gradient-achtergronden per dag (geen externe afbeeldingen – werkt altijd) */
const GRADIENTS = [
  "linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #1e3a5f 100%)",
  "linear-gradient(135deg, #2d4a3e 0%, #3d6b5a 50%, #2d4a3e 100%)",
  "linear-gradient(135deg, #4a3728 0%, #6b5344 50%, #4a3728 100%)",
  "linear-gradient(135deg, #3d2d4a 0%, #5a4a6b 50%, #3d2d4a 100%)",
  "linear-gradient(135deg, #4a2d2d 0%, #6b4a4a 50%, #4a2d2d 100%)",
  "linear-gradient(135deg, #2d3d4a 0%, #4a5a6b 50%, #2d3d4a 100%)",
  "linear-gradient(135deg, #3d4a2d 0%, #5a6b4a 50%, #3d4a2d 100%)",
];

function getBackgroundForDate(dateStr: string): string {
  const day = parseInt(dateStr.slice(8, 10), 10) || 1;
  const i = (day - 1) % GRADIENTS.length;
  return GRADIENTS[i] ?? GRADIENTS[0]!;
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
  const backgroundStyle = getBackgroundForDate(dateStr);
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
      <div
        className="relative z-0 aspect-[2/1] w-full"
        style={{ background: backgroundStyle }}
      >
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
