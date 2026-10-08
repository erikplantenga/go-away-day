"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { HeroCarousel } from "@/components/HeroCarousel";
import { IdeasNewIdeaPopup } from "@/components/IdeasNewIdeaPopup";

function EndOfTripPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0b1f3a] to-[#061220] p-6 text-center shadow-2xl">
        <div className="text-5xl">🇲🇹✨🎉✨🇲🇹</div>
        <h2 className="mt-4 text-2xl font-bold text-white">
          Wat een fantastische trip!
        </h2>
        <p className="mt-3 text-base text-white/90">
          Zoveel hoogtepunten, zoveel mooie momenten samen. 
        </p>
        <div className="mt-3 text-3xl">🍻🌅🏝️☀️🍝</div>
        <p className="mt-4 text-lg font-semibold text-[#c9a227]">
          Stay tuned voor de volgende trip!
        </p>
        <p className="mt-3 text-sm text-white/70">
          PS: Vergeet niet om onze foto's te liken! ❤️
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-[#c9a227] py-3 text-base font-bold text-[#0b1f3a]"
        >
          Tot ziens! 👋
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
    const dismissed = sessionStorage.getItem("maltaEndPopupDismissed");
    if (!dismissed) {
      setShowEndPopup(true);
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
    pathname === "/eindstand-demo" ||
    pathname === "/preview-2027" ||
    pathname === "/ideeen-2027"
  ) {
    return (
      <>
        <IdeasNewIdeaPopup />
        <main>{children}</main>
      </>
    );
  }

  return (
    <>
      <IdeasNewIdeaPopup />
      {showEndPopup && <EndOfTripPopup onClose={closePopup} />}
      <header className="mb-4 text-center">
        <h1 className="text-xl font-bold text-[#f4efe4] sm:text-2xl">Go Away Day</h1>
        <p className="mt-1 text-sm text-[#c9a227]">Malta · 3–7 oktober 2026</p>
        <HeroCarousel />
      </header>
      <main className="min-h-[40vh]">{children}</main>
    </>
  );
}
