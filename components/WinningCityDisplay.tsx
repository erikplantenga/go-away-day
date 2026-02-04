"use client";

import { useState, useEffect, useRef } from "react";

const COLORS = [
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#14b8a6",
];

type Props = {
  city: string;
  /** Voor gebruik in winnaar-kaart (grote tekst) vs demo-popup (iets kleiner) */
  size?: "lg" | "md";
};

export function WinningCityDisplay({ city, size = "lg" }: Props) {
  const [colorIndex, setColorIndex] = useState(0);
  const [floating, setFloating] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const placeholderRef = useRef<HTMLSpanElement>(null);

  // Elke seconde van kleur wisselen
  useEffect(() => {
    const t = setInterval(() => setColorIndex((i) => (i + 1) % COLORS.length), 1000);
    return () => clearInterval(t);
  }, []);

  // Na 3 seconden starten met zweven; na 5 seconden zweven weer terug op plek
  useEffect(() => {
    const tStart = setTimeout(() => {
      const el = placeholderRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        setPos({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }
      setFloating(true);
    }, 3000);
    const tBack = setTimeout(() => setFloating(false), 8000); // 3s + 5s zweven
    return () => {
      clearTimeout(tStart);
      clearTimeout(tBack);
    };
  }, []);

  // Willekeurig zweven over het scherm (DOM direct updaten voor vloeiende animatie)
  const floatElRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!floating || !floatElRef.current) return;
    const el = floatElRef.current;
    let x = pos.x;
    let y = pos.y;
    let vx = (Math.random() - 0.5) * 0.6;
    let vy = (Math.random() - 0.5) * 0.6;
    let lastChange = performance.now();
    let raf: number;

    const loop = () => {
      x += vx;
      y += vy;
      const now = performance.now();
      if (now - lastChange > 400 + Math.random() * 600) {
        lastChange = now;
        vx = (Math.random() - 0.5) * 1.2;
        vy = (Math.random() - 0.5) * 1.2;
      }
      const margin = 80;
      if (x < margin || x > window.innerWidth - margin) vx *= -1;
      if (y < margin || y > window.innerHeight - margin) vy *= -1;
      x = Math.max(margin, Math.min(window.innerWidth - margin, x));
      y = Math.max(margin, Math.min(window.innerHeight - margin, y));
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [floating, pos.x, pos.y]);

  const color = COLORS[colorIndex];
  const textSize = size === "lg" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl";

  return (
    <>
      <span
        ref={placeholderRef}
        className={floating ? "inline-block opacity-0" : ""}
        style={floating ? undefined : { color }}
      >
        {city}
      </span>
      {floating && (
        <span
          ref={floatElRef}
          className={`pointer-events-none fixed z-[60] whitespace-nowrap font-bold ${textSize}`}
          style={{
            color,
            left: pos.x,
            top: pos.y,
            transform: "translate(-50%, -50%)",
            textShadow: "0 0 12px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.15)",
          }}
        >
          {city}
        </span>
      )}
    </>
  );
}
