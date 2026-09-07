"use client";

import { useEffect, useState } from "react";
import { ConfettiBurst } from "@/components/ConfettiBurst";

const FLYERS = [
  "🎈",
  "✈️",
  "🎉",
  "🎈",
  "🎊",
  "✈️",
  "🎏",
  "🎈",
  "🎉",
  "✈️",
  "🎊",
  "🎈",
  "✨",
  "🍾",
  "🎈",
  "✈️",
] as const;

export function RefreshFeest() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-hidden>
      <style>{`
        @keyframes gad-fly-left {
          0% { transform: translateX(110vw) rotate(-8deg); opacity: 0; }
          8% { opacity: 1; }
          92% { opacity: 1; }
          100% { transform: translateX(-20vw) rotate(8deg); opacity: 0; }
        }
        @keyframes gad-fly-right {
          0% { transform: translateX(-20vw) rotate(8deg); opacity: 0; }
          8% { opacity: 1; }
          92% { opacity: 1; }
          100% { transform: translateX(110vw) rotate(-8deg); opacity: 0; }
        }
        @keyframes gad-float-up {
          0% { transform: translateY(20vh) scale(0.8); opacity: 0; }
          12% { opacity: 1; }
          100% { transform: translateY(-110vh) scale(1.1); opacity: 0.85; }
        }
        @keyframes gad-slinger {
          0% { transform: translateY(-120%) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          50% { transform: translateY(0) rotate(8deg); }
          100% { transform: translateY(8px) rotate(-6deg); opacity: 1; }
        }
      `}</style>
      <ConfettiBurst />
      <div className="absolute inset-x-0 top-0 flex justify-around px-2 pt-[max(0.4rem,env(safe-area-inset-top))] text-3xl">
        {["🎊", "🎉", "🎏", "🎀", "🎊", "🎉", "🎏"].map((emoji, i) => (
          <span
            key={`slinger-${i}`}
            className="inline-block"
            style={{
              animation: `gad-slinger 0.7s ease-out ${i * 0.08}s both`,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
      {FLYERS.map((emoji, i) => {
        const goRight = i % 2 === 1;
        const duration = 3.6 + (i % 4) * 0.25;
        const delay = (i % 6) * 0.18;
        const top = 12 + ((i * 11) % 72);
        const size = 26 + (i % 4) * 8;
        return (
          <div
            key={`fly-${i}`}
            className="absolute will-change-transform"
            style={{
              top: `${top}%`,
              left: 0,
              fontSize: `${size}px`,
              animation: `${goRight ? "gad-fly-right" : "gad-fly-left"} ${duration}s linear ${delay}s both`,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
            }}
          >
            {emoji}
          </div>
        );
      })}
      {["🎈", "🎈", "🎈", "🎈", "🎈", "🎈"].map((emoji, i) => (
        <div
          key={`up-${i}`}
          className="absolute will-change-transform"
          style={{
            left: `${8 + i * 15}%`,
            bottom: 0,
            fontSize: `${30 + (i % 3) * 8}px`,
            animation: `gad-float-up ${4.2 + i * 0.15}s ease-out ${i * 0.12}s both`,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
}
