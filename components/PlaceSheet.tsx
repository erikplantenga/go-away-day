"use client";

import { useEffect } from "react";
import type { PlaceInfo } from "@/lib/maltaPlaces";

export function PlaceSheet({
  place,
  onBack,
}: {
  place: PlaceInfo;
  onBack: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onBack]);

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-[#0b1f3a] text-white" role="dialog" aria-modal="true">
      <div
        className="flex shrink-0 items-center gap-2 px-3 pb-2"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          onClick={onBack}
          className="inline-tap flex min-h-11 items-center rounded-full bg-white/10 px-4 text-sm font-semibold"
        >
          ← Terug
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {place.subtitle && (
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">{place.subtitle}</p>
        )}
        <h2 className="mt-1 text-2xl font-bold">{place.title}</h2>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-white/85">
          {place.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        {place.tips && place.tips.length > 0 && (
          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">Handig</p>
            <ul className="mt-2 space-y-1.5 text-sm text-white/80">
              {place.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
        {place.link && (
          <a
            href={place.link.href}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-[#0b1f3a]"
          >
            {place.link.label}
          </a>
        )}
      </div>
    </div>
  );
}
