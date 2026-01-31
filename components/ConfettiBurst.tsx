"use client";

import { useEffect, useState } from "react";

const COLORS = ["#fbbf24", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f97316"];
const EMOJIS = ["🎉", "🎊", "✈️", "🌍", "🌟", "🎈", "🏆", "✨"];

/**
 * Confetti-explosie vanuit het midden – voor spin-moment en feestpagina.
 */
export function ConfettiBurst() {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; emoji?: string }[]
  >([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const count = 100;
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 22,
      vy: -16 - Math.random() * 14,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      size: 8 + Math.random() * 10,
      emoji: Math.random() > 0.55 ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : undefined,
    }));
    setParticles(newParticles);

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
          vy: p.vy + 4 * dt,
        }))
      );
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const t = setTimeout(() => setDone(true), 4500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  if (done || particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
          style={{
            transform: `translate(${p.x}px, ${p.y}px) rotate(${p.x * 1.5}deg)`,
          }}
        >
          {p.emoji ? (
            <span className="text-2xl sm:text-3xl" style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.3))" }}>
              {p.emoji}
            </span>
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
