"use client";

import { useEffect, useRef } from "react";
import { getAudioContext } from "@/lib/audioContext";

/** Kort feestgeluid (3 stijgende tonen) – speelt één keer wanneer winner truthy wordt. Gebruik unlockAudio() in onClick voor iOS. */
export function useWinSound(winner: string | null) {
  const playedRef = useRef(false);

  useEffect(() => {
    if (!winner) {
      playedRef.current = false;
      return;
    }
    if (playedRef.current) return;
    playedRef.current = true;

    const ctx = getAudioContext() ?? new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();

    const notes = [523.25, 659.25, 783.99];
    const startTimes = [0, 0.15, 0.3];

    startTimes.forEach((start, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = notes[i]!;
      osc.type = "sine";
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + start + 0.05);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + start + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.4);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + 0.4);
    });
  }, [winner]);
}
