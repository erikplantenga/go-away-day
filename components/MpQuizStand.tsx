"use client";

import { useEffect, useState, type ReactNode } from "react";
import { formatQuizMs, type QuizMiss } from "@/lib/mpQuiz";

type Props = {
  benno: number;
  erik: number;
  daysLeft: number;
  played: { erik: boolean; benno: boolean };
  correct: { erik: number | null; benno: number | null };
  quizMs: { erik: number | null; benno: number | null };
  misses: { erik: QuizMiss[]; benno: QuizMiss[] };
  preview?: boolean;
  onClose: () => void;
};

function useCountUp(target: number, play: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!play) return;
    const start = performance.now();
    const from = 0;
    const dur = 900;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - t) * (1 - t);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, play]);
  return value;
}

function PersonRing({
  name,
  score,
  max,
  colorFrom,
  colorTo,
  glow,
  lead,
}: {
  name: string;
  score: number;
  max: number;
  colorFrom: string;
  colorTo: string;
  glow: string;
  lead: boolean;
}) {
  const shown = useCountUp(score, true);
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = max <= 0 ? 0 : Math.min(1, shown / max);
  const dash = pct <= 0 ? 0 : c * pct;
  const gid = `mp-${name.toLowerCase()}`;

  return (
    <div className="flex flex-col items-center" style={{ ["--mp-glow" as string]: glow }}>
      <div className="relative h-[168px] w-[168px]">
        {lead ? (
          <>
            <div className="mp-lead-halo" />
            <div className="mp-lead-aura" />
          </>
        ) : null}
        <svg viewBox="0 0 140 140" className="absolute inset-0 h-full w-full -rotate-90">
          <defs>
            <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorFrom} />
              <stop offset="100%" stopColor={colorTo} />
            </linearGradient>
          </defs>
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={`url(#${gid})`}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold tabular-nums tracking-tight"
            style={lead ? { textShadow: `0 0 22px ${glow}, 0 0 40px ${glow}` } : undefined}
          >
            {shown}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">pt</span>
        </div>
      </div>
      <p className="mt-3 text-lg font-bold" style={lead ? { color: colorTo, textShadow: `0 0 16px ${glow}` } : undefined}>
        {name}
      </p>
    </div>
  );
}

function InfoColumn({
  name,
  played,
  correct,
  quizMs,
  items,
  accent,
}: {
  name: string;
  played: boolean;
  correct: number | null;
  quizMs: number | null;
  items: QuizMiss[];
  accent: string;
}) {
  const timeLabel = !played ? "—" : quizMs == null ? "tijd niet bewaard" : formatQuizMs(quizMs);

  let body: ReactNode;
  if (!played) {
    body = <p className="mt-2 text-center text-xs text-white/45">Nog niet gespeeld</p>;
  } else if (correct != null && items.length === 0 && correct >= 5) {
    body = <p className="mt-2 text-center text-xs text-white/45">Alles goed</p>;
  } else if (items.length > 0) {
    body = (
      <ul className="mt-2 space-y-2">
        {items.map((miss, i) => (
          <li key={`${miss.question}-${i}`} className="rounded-xl bg-white/5 px-2 py-2 text-left">
            <p className="text-[11px] font-semibold leading-snug text-white/85">{miss.question}</p>
            <p className="mt-1 text-[11px] leading-snug text-rose-300/90">
              Fout: {miss.picked || "geen antwoord"}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-[#c9a227]">Goed: {miss.answer}</p>
          </li>
        ))}
      </ul>
    );
  } else {
    body = (
      <p className="mt-2 text-center text-xs leading-snug text-white/45">
        {correct == null ? "Geen fouten bekend" : `${correct} goed — fouten van deze ronde zijn niet bewaard`}
      </p>
    );
  }

  return (
    <div className="min-w-0">
      <p className="text-center text-sm font-bold" style={{ color: accent }}>
        {name}
      </p>
      <p className="mt-1 text-center text-sm font-semibold tabular-nums text-white/80">{timeLabel}</p>
      {body}
    </div>
  );
}

export function MpQuizStand({
  benno,
  erik,
  daysLeft,
  played,
  correct,
  quizMs,
  misses,
  preview,
  onClose,
}: Props) {
  const max = Math.max(benno, erik, 1);
  const top = Math.max(benno, erik);
  const lead =
    benno === erik ? "Gelijkspel" : benno > erik ? "Benno leidt" : "Erik leidt";
  const gap = Math.abs(benno - erik);

  return (
    <div
      className="fixed inset-0 z-[98] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Tussenstand"
      onClick={onClose}
    >
      <div
        className="relative max-h-[min(90dvh,44rem)] w-full max-w-md overflow-y-auto rounded-[2rem] bg-[#0b1220] px-5 pb-6 pt-5 text-white shadow-[0_0_80px_rgba(201,162,39,0.18)]"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute -left-16 top-8 h-40 w-40 rounded-full bg-[#c9a227]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-4 h-44 w-44 rounded-full bg-sky-400/15 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c9a227]">
            {preview ? "Tussenstand · voorbeeld" : "Tussenstand"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-tap flex min-h-11 items-center rounded-full bg-white/10 px-4 text-sm font-semibold"
          >
            Sluiten
          </button>
        </div>

        <div className="relative mt-8 flex items-end justify-center gap-4 sm:gap-8">
          <PersonRing
            name="Benno"
            score={benno}
            max={max}
            colorFrom="#ffe08a"
            colorTo="#c9a227"
            glow="rgba(255, 214, 90, 0.9)"
            lead={benno > 0 && benno === top}
          />
          <PersonRing
            name="Erik"
            score={erik}
            max={max}
            colorFrom="#7dd3fc"
            colorTo="#0a84ff"
            glow="rgba(96, 185, 255, 0.9)"
            lead={erik > 0 && erik === top}
          />
        </div>

        <p className="relative mt-6 text-center text-lg font-bold">
          {lead}
          {gap > 0 ? <span className="font-semibold text-white/55"> · {gap} punt{gap === 1 ? "" : "en"}</span> : null}
        </p>
        <p className="relative mt-1 text-center text-sm text-white/50">
          {daysLeft > 1 ? `Nog ${daysLeft} dagen tot vertrek` : daysLeft === 1 ? "Nog 1 dag tot vertrek" : "Vertrekdag"}
        </p>
        <p className="relative mt-4 text-center text-sm leading-snug text-[#c9a227]">
          Winnaar krijgt het eerste rondje bier van de verliezer.
        </p>
        <div className="relative mt-5">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Info van vandaag
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <InfoColumn
              name="Benno"
              played={played.benno}
              correct={correct.benno}
              quizMs={quizMs.benno}
              items={misses.benno}
              accent="#c9a227"
            />
            <InfoColumn
              name="Erik"
              played={played.erik}
              correct={correct.erik}
              quizMs={quizMs.erik}
              items={misses.erik}
              accent="#7dd3fc"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
