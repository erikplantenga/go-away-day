"use client";

import { QUIZ_BONUS_POINTS } from "@/lib/mpQuiz";

type Props = {
  question: string;
  choices: string[];
  pick: number | null;
  onPick: (index: number) => void;
  onSubmit: () => void;
  busy?: boolean;
  error?: string;
  submitLabel?: string;
};

export function MpQuizBonus({
  question,
  choices,
  pick,
  onPick,
  onSubmit,
  busy = false,
  error,
  submitLabel = "Inleveren",
}: Props) {
  return (
    <div className="relative mx-auto mt-4 max-w-md">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-[#160f02] px-4 pb-5 pt-6 ring-2 ring-[#ffe08a] shadow-[0_0_80px_rgba(255,214,90,0.4)]">
        <div className="pointer-events-none absolute -left-12 -top-10 h-40 w-40 rounded-full bg-[#c9a227]/45 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-4 h-36 w-36 rounded-full bg-[#ffe08a]/25 blur-3xl" />
        <p className="text-center text-4xl leading-none" aria-hidden>
          ✨🏆✨
        </p>
        <p className="mp-bonus-title mt-3 text-center text-5xl font-black uppercase leading-[0.85] tracking-[0.08em] text-[#ffe08a]">
          Bonusvraag
        </p>
        <p className="mp-bonus-points mt-4 text-center text-xl font-black text-white">
          Dit is voor <span className="text-[#c9a227]">{QUIZ_BONUS_POINTS} extra punten</span>!
        </p>
        <p className="relative mt-6 text-center text-lg font-bold leading-snug">{question}</p>
        <div className="relative mt-4 space-y-2">
          {choices.map((choice, i) => {
            const on = pick === i;
            return (
              <button
                key={`${choice}-${i}`}
                type="button"
                onClick={() => onPick(i)}
                className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                  on ? "bg-[#c9a227] text-[#0b1f3a] ring-2 ring-[#ffe08a]" : "bg-white/10 text-white"
                }`}
              >
                {choice}
              </button>
            );
          })}
        </div>
        {error ? <p className="relative mt-3 text-center text-sm text-red-300">{error}</p> : null}
        <button
          type="button"
          disabled={pick == null || busy}
          onClick={onSubmit}
          className="relative mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-[#c9a227] text-sm font-black uppercase tracking-wide text-[#0b1f3a] disabled:opacity-40"
        >
          {busy ? "Bezig…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
