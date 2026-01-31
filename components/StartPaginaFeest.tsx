"use client";

import { Fireworks } from "@/components/Fireworks";
import { ConfettiBurst } from "@/components/ConfettiBurst";

const EMOJIS = ["🎉", "🎊", "✈️", "🌍", "🌟", "🎈", "🏆", "✨"];

function FloatingEmojis() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {EMOJIS.map((emoji, i) => (
        <div
          key={i}
          className="absolute animate-float text-4xl opacity-70 sm:text-5xl"
          style={{
            left: `${15 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${8 + i}s`,
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
}

export function StartPaginaFeest() {
  return (
    <>
      {/* Vuurwerk op de achtergrond – vol scherm */}
      <div className="pointer-events-none fixed inset-0 z-0 h-full w-full">
        <Fireworks fullScreen />
      </div>
      {/* Zwevende emoji's */}
      <FloatingEmojis />
      {/* Grote confetti-explosie bij openen */}
      <ConfettiBurst />
    </>
  );
}
