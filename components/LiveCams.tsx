"use client";

import { useEffect, useRef, useState } from "react";
import { MALTA_CAMS, camEmbedSrc, camThumb, type MaltaCam } from "@/lib/maltaCams";

function isYouTubePlaying(data: unknown) {
  if (!data || typeof data !== "object") return false;
  const msg = data as { event?: string; info?: unknown };
  if (msg.event === "onStateChange" && msg.info === 1) return true;
  if (msg.info && typeof msg.info === "object" && "playerState" in msg.info) {
    return (msg.info as { playerState?: number }).playerState === 1;
  }
  return false;
}

function CamFrame({
  cam,
  large = false,
}: {
  cam: MaltaCam;
  large?: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [live, setLive] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (large) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 25_000);
    return () => window.clearInterval(id);
  }, [large]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== "https://www.youtube.com") return;
      if (e.source !== iframeRef.current?.contentWindow) return;
      let payload: unknown = e.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }
      if (isYouTubePlaying(payload)) setLive(true);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return (
    <div className={`relative overflow-hidden bg-black ${large ? "aspect-video w-full rounded-xl" : "aspect-video"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={camThumb(cam, tick)}
        alt=""
        className={`absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-500 ${
          live ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />
      <iframe
        ref={iframeRef}
        src={camEmbedSrc(cam, large)}
        title={cam.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen={large}
        tabIndex={large ? 0 : -1}
        onLoad={() => {
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ event: "listening", id: cam.id }),
            "https://www.youtube.com",
          );
        }}
        className={`border-0 ${
          large
            ? "absolute inset-0 h-full w-full"
            : "pointer-events-none absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        } ${live ? "opacity-100" : "opacity-0"}`}
        style={large ? undefined : { width: 400, height: 225 }}
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
