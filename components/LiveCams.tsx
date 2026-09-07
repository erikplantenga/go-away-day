"use client";

import { useEffect, useState } from "react";
import { MALTA_CAMS, MALTA_CAMS_INDEX } from "@/lib/maltaCams";

function snapshotUrl(src: string) {
  const tick = Math.floor(Date.now() / 300_000);
  return `${src}?t=${tick}`;
}

export function LiveCams({ compact = false }: { compact?: boolean }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 300_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section>
      {!compact && (
        <div className="mb-3">
          <h2 className="text-lg font-bold text-foreground">Live uit Malta</h2>
          <p className="text-sm text-foreground/60">Tik op een cam · opent de livestream</p>
        </div>
      )}
      {compact && (
        <p className="mb-3 px-1 text-sm text-white/60">Tik op een beeld · livestream opent meteen</p>
      )}
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MALTA_CAMS.map((cam) => (
          <a
            key={cam.id}
            href={cam.page}
            target="_blank"
            rel="noreferrer"
            className="w-[72vw] max-w-[280px] shrink-0 overflow-hidden rounded-2xl bg-black/25 text-left"
          >
            <div className="relative aspect-[16/10] bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={`${cam.id}-${tick}`}
                src={snapshotUrl(cam.snapshot)}
                alt={cam.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Live
              </span>
            </div>
            <div className="px-3 py-2.5 text-white">
              <p className="text-sm font-semibold">{cam.title}</p>
              <p className="text-xs text-white/70">
                {cam.place} · {cam.dayHint}
              </p>
            </div>
          </a>
        ))}
      </div>
      <a
        href={MALTA_CAMS_INDEX}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-[#0b1f3a]"
      >
        Alle Malta-cams
      </a>
    </section>
  );
}
