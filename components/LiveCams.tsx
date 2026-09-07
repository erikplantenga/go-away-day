"use client";

import { useEffect, useState } from "react";
import { MALTA_CAMS, type MaltaCam } from "@/lib/maltaCams";

function snapshotUrl(src: string) {
  const tick = Math.floor(Date.now() / 300_000);
  return `${src}?t=${tick}`;
}

export function LiveCams({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState<MaltaCam | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 300_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <section>
      {!compact && (
        <div className="mb-3">
          <h2 className="text-lg font-bold text-foreground">Live uit Malta</h2>
          <p className="text-sm text-foreground/60">Beeld ververst elke 5 min · SkylineWebcams</p>
        </div>
      )}
      {compact && (
        <p className="mb-3 px-1 text-sm text-white/60">Beeld ververst elke 5 min · SkylineWebcams</p>
      )}
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MALTA_CAMS.map((cam) => (
          <button
            key={cam.id}
            type="button"
            onClick={() => setOpen(cam)}
            className="w-[72vw] max-w-[280px] shrink-0 overflow-hidden rounded-2xl bg-[#0b1f3a] text-left"
          >
            <div className="relative aspect-[16/10] bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
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
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-black" role="dialog" aria-modal="true">
          <div
            className="flex shrink-0 items-center justify-between gap-3 px-3"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <div className="min-w-0 text-white">
              <p className="truncate text-sm font-semibold">{open.title}</p>
              <p className="truncate text-xs text-white/70">{open.place}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="inline-tap flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white"
              aria-label="Sluiten"
            >
              ×
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center px-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={tick}
              src={snapshotUrl(open.snapshot)}
              alt={open.title}
              referrerPolicy="no-referrer"
              className="max-h-full w-full object-contain"
            />
          </div>
          <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            <a
              href={open.page}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-black"
            >
              Live video openen
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
