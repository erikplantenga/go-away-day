"use client";

import { useEffect, useState } from "react";
import { MALTA_CAMS, camEmbedSrc, camThumb, type MaltaCam } from "@/lib/maltaCams";

function CamFrame({
  cam,
  large = false,
}: {
  cam: MaltaCam;
  large?: boolean;
}) {
  const [live, setLive] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-black ${large ? "aspect-video w-full rounded-xl" : "aspect-video"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={camThumb(cam)}
        alt=""
        className={`absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-500 ${
          live ? "opacity-0" : "opacity-100"
        }`}
      />
      <iframe
        src={camEmbedSrc(cam, large)}
        title={cam.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen={large}
        tabIndex={large ? 0 : -1}
        onLoad={() => {
          window.setTimeout(() => setLive(true), 2200);
        }}
        className={`border-0 transition-opacity duration-500 ${
          large
            ? "absolute inset-0 h-full w-full"
            : "pointer-events-none absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 brightness-125 contrast-[1.05] [color-scheme:light]"
        } ${live ? "opacity-100" : "opacity-0"}`}
        style={large ? undefined : { width: "170%", height: "170%" }}
      />
    </div>
  );
}

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
            <div className="relative overflow-hidden rounded-lg">
              {!full && <CamFrame cam={cam} />}
              {full && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={camThumb(cam)} alt="" className="aspect-video w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => setFull(cam)}
                className="absolute inset-0 z-10"
                aria-label={`${cam.title} groter`}
              />
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
            <CamFrame cam={full} large />
          </div>
        </div>
      )}
    </section>
  );
}
