"use client";

import { useEffect, useRef } from "react";
import { getAudioContext } from "@/lib/audioContext";

const TICK_DURATION = 0.06;

/** Geluid stopt na maxDurationMs (bijv. wanneer laatste slot stopt). Gebruik unlockAudio() in onClick voor iOS. */
export function useSpinSound(
  spinning: boolean,
  cycleMs: number = 200,
  maxDurationMs?: number
) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!spinning) {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      return;
    }

    const ctx = getAudioContext() ?? audioContextRef.current ?? new AudioContext();
    audioContextRef.current = ctx;
    if (ctx.state === "suspended") void ctx.resume();

    function playTick() {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 280 + Math.random() * 120;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + TICK_DURATION);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + TICK_DURATION);
    }

    tickIntervalRef.current = setInterval(playTick, cycleMs);

    const stopAt =
      maxDurationMs != null ? setTimeout(() => {
        if (tickIntervalRef.current) {
          clearInterval(tickIntervalRef.current);
          tickIntervalRef.current = null;
        }
      }, maxDurationMs) : null;

    return () => {
      if (stopAt != null) clearTimeout(stopAt);
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [spinning, cycleMs, maxDurationMs]);
}
