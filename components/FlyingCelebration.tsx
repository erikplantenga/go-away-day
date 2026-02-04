"use client";

/**
 * Ballonnen, vliegtuigen en feest-emoji's die door het beeld vliegen op de winnaarspagina.
 */
const FLYING_ITEMS = [
  "🎈",
  "🎈",
  "🎈",
  "✈️",
  "✈️",
  "✈️",
  "🎉",
  "🎊",
  "🍾",
  "🌟",
  "🎈",
  "✈️",
  "🎉",
  "🎊",
  "🏆",
  "🌴",
  "🎈",
  "✈️",
  "🎉",
  "✨",
  "🎈",
  "✈️",
  "🎊",
  "🎉",
] as const;

export function FlyingCelebration() {
  return (
    <>
      <style>{`
        @keyframes flyAcrossLeft {
          0% { transform: translateX(100vw) translateY(0) rotate(0deg); opacity: 0.9; }
          100% { transform: translateX(-120px) translateY(0) rotate(0deg); opacity: 0.9; }
        }
        @keyframes flyAcrossRight {
          0% { transform: translateX(-120px) translateY(0) rotate(0deg); opacity: 0.9; }
          100% { transform: translateX(100vw) translateY(0) rotate(0deg); opacity: 0.9; }
        }
        @keyframes floatUp {
          0% { transform: translateY(100vh) translateX(0) rotate(0deg); opacity: 0.85; }
          100% { transform: translateY(-120px) translateX(0) rotate(0deg); opacity: 0.85; }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
        {FLYING_ITEMS.map((emoji, i) => {
          const fromLeft = i % 3 !== 1;
          const duration = 12 + (i % 7);
          const delay = (i * 0.8) % 14;
          const topPercent = 8 + (i * 4.2) % 80;
          const size = 24 + (i % 3) * 12;
          return (
            <div
              key={`${emoji}-${i}`}
              className="absolute will-change-transform"
              style={{
                left: fromLeft ? 0 : "auto",
                right: fromLeft ? "auto" : 0,
                top: `${topPercent}%`,
                fontSize: `${size}px`,
                animation: fromLeft
                  ? `flyAcrossLeft ${duration}s linear ${delay}s infinite`
                  : `flyAcrossRight ${duration + 2}s linear ${delay + 1}s infinite`,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
              }}
            >
              {emoji}
            </div>
          );
        })}
        {/* Extra ballonnen die omhoog drijven */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={`up-${i}`}
            className="absolute will-change-transform"
            style={{
              left: `${15 + i * 22}%`,
              bottom: 0,
              fontSize: `${28 + (i % 3) * 8}px`,
              animation: `floatUp ${18 + i * 2}s ease-in ${i * 3}s infinite`,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
            }}
          >
            🎈
          </div>
        ))}
      </div>
    </>
  );
}
