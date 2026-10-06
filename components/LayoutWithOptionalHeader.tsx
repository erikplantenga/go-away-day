"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { HeroCarousel } from "@/components/HeroCarousel";

function EndOfTripPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0b1f3a] to-[#061220] p-6 text-center shadow-2xl">
        <div className="text-5xl">🎉✈️🇲🇹✈️🎉</div>
        <h2 className="mt-4 text-2xl font-bold text-white">
          Helaas is het al bijna voorbij!
        </h2>
        <p className="mt-3 text-lg text-[#c9a227]">
          Tot volgend jaar! 🥳
        </p>
        <div className="mt-2 text-3xl">🎊🍻🌟🎈🎊</div>
        <p className="mt-4 text-sm text-white/60">
          Wat een geweldige trip was dit!
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-[#c9a227] py-3 text-base font-bold text-[#0b1f3a]"
        >
          Doei Malta! 👋
        </button>
      </div>
    </div>
  );
}

export function LayoutWithOptionalHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showEndPopup, setShowEndPopup] = useState(false);

  useEffect(() => {
    // Show popup until Oct 7, 2026 at 13:00
    const hideAfter = new Date("2026-10-07T13:00:00").getTime();
    const now = Date.now();
    
    if (now < hideAfter) {
      const dismissed = sessionStorage.getItem("maltaEndPopupDismissed");
      if (!dismissed) {
        setShowEndPopup(true);
      }
    }
  }, []);

  const closePopup = () => {
    setShowEndPopup(false);
    sessionStorage.setItem("maltaEndPopupDismissed", "true");
  };

  if (
    pathname === "/tussenstand-demo" ||
    pathname === "/bonus-demo" ||
    pathname === "/quiz-demo" ||
    pathname === "/kampioen-demo" ||
    pathname === "/checkin-demo" ||
    pathname === "/eindstand-demo"
  ) {
    return <main>{children}</main>;
  }

  return (
    <>
      {showEndPopup && <EndOfTripPopup onClose={closePopup} />}
      <header className="mb-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-green-400">✓ Ingecheckt!</p>
        <h1 className="text-xl font-bold text-[#f4efe4] sm:text-2xl">Go Away Day</h1>
        <p className="mt-1 text-sm text-[#c9a227]">Malta · 3–7 oktober 2026</p>
        <HeroCarousel />
      </header>
      <main className="min-h-[40vh]">{children}</main>
    </>
  );
}
