"use client";

import { useEffect, useRef, useState } from "react";
import { SPIN_PHRASES } from "@/lib/spinPhrases";
import { useSpinSound } from "@/lib/useSpinSound";
import { unlockAudio } from "@/lib/audioContext";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { QUIZ_REEL_VALUES } from "@/lib/mpQuiz";

const REVEAL_DELAY_MS = 900;
const PAUSE_BEFORE_REVEAL_MS = 200;
const CYCLE_MS = 80;

type Props = {
  spinsDone: number;
  spinsTotal: number;
  earned: number;
  spinning: boolean;
  reels: [number, number, number] | null;
  lastPoints: number | null;
  onSpin: () => void;
  onDone: () => void;
};

export function MpQuizSpin({
  spinsDone,
  spinsTotal,
  earned,
  spinning,
  reels,
  lastPoints,
  onSpin,
  onDone,
}: Props) {
  const [display, setDisplay] = useState<(number | null)[]>([null, null, null]);
  const [stopped, setStopped] = useState<(number | null)[]>([null, null, null]);
  const [phrase, setPhrase] = useState(0);
  const [party, setParty] = useState(false);
  const intervalsRef = useRef<(ReturnType<typeof setInterval> | undefined)[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const soundMs = PAUSE_BEFORE_REVEAL_MS + REVEAL_DELAY_MS * 3;
  useSpinSound(spinning, CYCLE_MS, soundMs);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      intervalsRef.current.forEach((i) => i != null && clearInterval(i));
    };
  }, []);

  useEffect(() => {
    if (!spinning) return;
    setPhrase(0);
    const iv = setInterval(() => setPhrase((i) => (i + 1) % SPIN_PHRASES.length), 1200);
    return () => clearInterval(iv);
  }, [spinning]);

  useEffect(() => {
    if (!spinning || !reels) return;
    timeoutsRef.current.forEach(clearTimeout);
    intervalsRef.current.forEach((i) => i != null && clearInterval(i));
    setStopped([null, null, null]);
    setDisplay([null, null, null]);
    setParty(false);

    const pick = () => QUIZ_REEL_VALUES[Math.floor(Math.random() * QUIZ_REEL_VALUES.length)]!;
    const start = PAUSE_BEFORE_REVEAL_MS;

    function startRoll(i: number) {
      setDisplay((prev) => {
        const next = [...prev];
        next[i] = pick();
        return next;
      });
      intervalsRef.current[i] = setInterval(() => {
        setDisplay((prev) => {
          const next = [...prev];
          next[i] = pick();
          return next;
        });
      }, CYCLE_MS);
    }

    function stopRoll(i: number, value: number) {
      if (intervalsRef.current[i]) {
        clearInterval(intervalsRef.current[i]);
        intervalsRef.current[i] = undefined;
      }
      setDisplay((prev) => {
        const next = [...prev];
        next[i] = null;
        return next;
      });
      setStopped((prev) => {
        const next = [...prev];
        next[i] = value;
        return next;
      });
    }

    startRoll(0);
    timeoutsRef.current = [
      setTimeout(() => {
        stopRoll(0, reels[0]);
        startRoll(1);
      }, start + REVEAL_DELAY_MS),
      setTimeout(() => {
        stopRoll(1, reels[1]);
        startRoll(2);
      }, start + REVEAL_DELAY_MS * 2),
      setTimeout(() => {
        stopRoll(2, reels[2]);
        setParty(true);
        timeoutsRef.current.push(setTimeout(() => onDoneRef.current(), 650));
      }, start + REVEAL_DELAY_MS * 3),
    ];
  }, [spinning, reels]);

  const shown = [0, 1, 2].map((i) => stopped[i] ?? display[i]);
  const current = Math.min(spinsTotal, spinsDone + (spinning || lastPoints != null ? 1 : 0));
  const done = spinsDone >= spinsTotal && !spinning;

  return (
    <div className="mx-auto mt-5 max-w-md space-y-4">
      {party && <ConfettiBurst />}
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-[#c9a227]">
        {done ? "Klaar" : `Spin ${Math.max(1, current)} van ${spinsTotal}`}
      </p>
      <div className="flex justify-center gap-3">
        {shown.map((n, i) => (
          <div
            key={i}
            className="flex h-24 w-20 items-center justify-center rounded-xl border-2 border-[#c9a227] bg-[#c9a227]/15 text-4xl font-bold tabular-nums text-[#c9a227]"
          >
            {n ?? "—"}
          </div>
        ))}
      </div>
      {spinning && <p className="text-center text-sm italic text-white/60">{SPIN_PHRASES[phrase]}</p>}
      {lastPoints != null && !spinning && (
        <p className="text-center text-lg font-bold">Deze spin: +{lastPoints}</p>
      )}
      <p className="text-center text-sm text-white/70">
        Totaal uit spins: <span className="font-semibold text-white">{earned}</span>
      </p>
      {!done && (
        <button
          type="button"
          disabled={spinning}
          onClick={() => {
            unlockAudio();
            onSpin();
          }}
          className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a] disabled:opacity-40"
        >
          {spinning ? "Bezig…" : spinsDone === 0 ? "SPIN!" : `Nog ${spinsTotal - spinsDone}× spinnen`}
        </button>
      )}
    </div>
  );
}
