"use client";

import { ConfettiBurst } from "@/components/ConfettiBurst";
import { Fireworks } from "@/components/Fireworks";
import { quizFinale } from "@/lib/mpQuiz";
import { unlockAudio } from "@/lib/audioContext";
import { useWinSound } from "@/lib/useWinSound";
import { useEffect } from "react";

const FLYING = ["🍻", "🏆", "🎉", "✈️", "🍾", "🍻", "🎊", "🌟", "🍻", "🏆", "🎉", "✈️", "🍻", "✨", "🍾", "🎊"];

type Props = {
  benno: number;
  erik: number;
  onClose: () => void;
  preview?: boolean;
};

export function MpQuizChampion({ benno, erik, onClose, preview }: Props) {
  const finale = quizFinale(benno, erik);
  const winnerName = finale.winner === "tie" ? "Allebei" : finale.winner === "benno" ? "Benno" : "Erik";
  const winnerColor = finale.winner === "erik" ? "#7dd3fc" : "#c9a227";

  useWinSound(finale.title);

  useEffect(() => {
    unlockAudio();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[99] overflow-hidden bg-[#070d18] text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Winnaar MP-Quiz"
    >
      <Fireworks fullScreen />
      <ConfettiBurst zIndex={100} />
      <style>{`
        @keyframes mp-champ-fly-left {
          0% { transform: translateX(110vw) rotate(-8deg); opacity: 0.95; }
          100% { transform: translateX(-140px) rotate(8deg); opacity: 0.95; }
        }
        @keyframes mp-champ-fly-right {
          0% { transform: translateX(-140px) rotate(8deg); opacity: 0.95; }
          100% { transform: translateX(110vw) rotate(-8deg); opacity: 0.95; }
        }
        @keyframes mp-champ-pop {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
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
                  ? `mp-champ-fly-left ${10 + (i % 5)}s linear ${i * 0.35}s infinite`
                  : `mp-champ-fly-right ${11 + (i % 4)}s linear ${i * 0.4}s infinite`,
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      <div
        className="relative z-[101] flex h-full flex-col items-center justify-center px-5 text-center"
        style={{
          paddingTop: "max(1.25rem, env(safe-area-inset-top))",
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="w-full max-w-sm rounded-[2rem] bg-[#0b1220]/88 px-5 py-7 shadow-[0_0_80px_rgba(201,162,39,0.28)] backdrop-blur-md">
          {preview ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
              Lokaal voorbeeld
            </p>
          ) : null}
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c9a227]">
            MP-Quiz · Malta
          </p>
          <p
            className="mt-4 text-5xl font-black tracking-wide text-[#c9a227] sm:text-6xl"
            style={{ animation: "mp-champ-pop 700ms ease-out", textShadow: "0 0 28px rgba(201,162,39,0.65)" }}
          >
            Proost!
          </p>
          <p className="mt-1 text-4xl" aria-hidden>
            🍻
          </p>
          <p
            className="mt-5 text-3xl font-black leading-tight sm:text-4xl"
            style={{ color: winnerColor, textShadow: `0 0 26px ${winnerColor}` }}
          >
            {finale.title}
          </p>
          <p className="mt-4 text-lg font-bold tabular-nums text-white">
            Benno {benno} · Erik {erik}
          </p>
          <p className="mt-4 text-base font-semibold leading-snug text-[#c9a227]">{finale.beer}</p>
          <p className="mt-2 text-sm leading-snug text-white/70">{finale.toast}</p>
          <p className="mt-5 text-sm font-semibold text-white/80">
            {finale.winner === "tie" ? "Kampioenen" : `Kampioen: ${winnerName}`}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-8 inline-tap flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#c9a227] text-base font-bold text-[#0b1f3a]"
          >
            Proost en sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
