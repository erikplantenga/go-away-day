"use client";

import { useEffect, useState } from "react";
import { MALTA_CAMS, camEmbedSrc, camThumb, type MaltaCam } from "@/lib/maltaCams";

export function LiveCams() {
  const [full, setFull] = useState<MaltaCam | null>(null);

  useEffect(() => {
    if (!full) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [full]);

  return (
    <section className="overflow-hidden rounded-2xl bg-[#0b1f3a] p-2 text-white">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-sm font-semibold">Live Malta</p>
        <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          Live
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {MALTA_CAMS.map((cam) => (
          <div key={cam.id} className="min-w-0">
            <div className="relative overflow-hidden rounded-lg bg-black">
              <div className="relative aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={camThumb(cam)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <iframe
                  src={camEmbedSrc(cam)}
                  title={cam.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
                <button
                  type="button"
                  onClick={() => setFull(cam)}
                  className="absolute inset-0"
                  aria-label={`${cam.title} groter`}
                />
              </div>
            </div>
            <p className="mt-1 truncate text-[11px] font-semibold leading-tight">{cam.title}</p>
            <p className="truncate text-[10px] text-white/60">{cam.place}</p>
          </div>
        ))}
      </div>
      {full && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black" role="dialog" aria-modal="true">
          <div
            className="flex shrink-0 items-center justify-between gap-2 px-3"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <p className="min-w-0 truncate text-sm font-semibold text-white">
              {full.title} · {full.place}
            </p>
            <button
              type="button"
              onClick={() => setFull(null)}
              className="inline-tap flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white"
              aria-label="Sluiten"
            >
              ×
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center px-2 pb-[env(safe-area-inset-bottom)]">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={camEmbedSrc(full, true)}
                title={full.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
