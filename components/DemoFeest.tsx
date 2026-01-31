"use client";

import { useEffect, useState } from "react";
import { Fireworks } from "@/components/Fireworks";
import { clearDemoStorage } from "@/lib/demoStorage";

const COLORS = ["#fbbf24", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#06b6d4"];
const EMOJIS = ["🎉", "🎊", "✈️", "🌍", "🌟", "🎈"];

function MiniConfetti() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; emoji?: string }[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const count = 50;
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 18,
        vy: -12 - Math.random() * 10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
        size: 6 + Math.random() * 8,
        emoji: Math.random() > 0.5 ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : undefined,
      }))
    );
    let raf: number;
    let last = performance.now();
    const animate = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          vy: p.vy + 3 * dt,
        }))
      );
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    const t = setTimeout(() => setDone(true), 3500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  if (done || particles.length === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
          style={{ transform: `translate(${p.x}px, ${p.y}px) rotate(${p.x}deg)` }}
        >
          {p.emoji ? (
            <span className="text-xl sm:text-2xl">{p.emoji}</span>
          ) : (
            <div
              className="rounded-sm"
              style={{
                width: p.size,
                height: p.size * 0.6,
                background: p.color,
                boxShadow: `0 0 ${p.size}px ${p.color}`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

type Props = { children: React.ReactNode };

export function DemoFeest({ children }: Props) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent shadow-xl shadow-amber-500/20">
      {/* Vuurwerk – blijft doorlopen */}
      <div className="pointer-events-none absolute inset-0 z-0 h-72 overflow-hidden rounded-2xl sm:h-80">
        <Fireworks />
      </div>
      {/* Confetti bij openen */}
      {showConfetti && <MiniConfetti />}
      {/* Inhoud */}
      <div className="relative z-20 p-4 sm:p-6">
        <p className="mb-2 text-center text-base font-semibold text-foreground sm:text-lg">
          🎉 Één groot feest – demo! 🎉
        </p>
        <p className="mb-4 text-center text-sm text-foreground/70">
          Zo werkt het straks op 1 februari. Geniet van elke stap!
        </p>
        {children}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => {
              clearDemoStorage();
              window.location.reload();
            }}
            className="rounded border border-foreground/20 bg-foreground/5 px-3 py-1.5 text-xs text-foreground/70"
          >
            Demo wissen – opnieuw beginnen
          </button>
        </div>
      </div>
    </div>
  );
}
