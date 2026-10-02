"use client";

import { useEffect, useState } from "react";

export type BoardingPasses = { benno: string; erik: string };

export function BoardingPassSheet({
  passes,
  onClose,
  zIndex = 92,
}: {
  passes: BoardingPasses;
  onClose: () => void;
  zIndex?: number;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (src) {
    return (
      <div
        className="fixed inset-0 flex flex-col bg-black"
        style={{ zIndex: zIndex + 2 }}
        role="dialog"
        aria-modal="true"
        aria-label="Boardingpass"
      >
        <div
          className="flex shrink-0 items-center px-3"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <button
            type="button"
            onClick={() => setSrc(null)}
            className="inline-tap flex min-h-11 items-center rounded-full bg-white/15 px-4 text-sm font-bold text-white"
          >
            ← Terug
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-2 pb-[env(safe-area-inset-bottom)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Boardingpass" className="mx-auto block h-auto w-full max-w-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-end justify-center bg-black/65 p-4 sm:items-center"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="boarding-who-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-[#0b1220] px-5 py-6 text-white">
        <p id="boarding-who-title" className="text-center text-lg font-bold leading-snug">
          Ben je Bokke Sjoerd of Erik?
        </p>
        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() => setSrc(passes.benno)}
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a]"
          >
            Bokke Sjoerd
          </button>
          <button
            type="button"
            onClick={() => setSrc(passes.erik)}
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a]"
          >
            Erik
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 w-full items-center justify-center rounded-xl bg-white/10 text-sm font-semibold"
          >
            Annuleer
          </button>
        </div>
      </div>
    </div>
  );
}
