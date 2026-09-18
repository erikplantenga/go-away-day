"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { mpQuizChoiceClass } from "@/components/MpQuizBonus";
import type { QuizQuestion } from "@/lib/mpQuiz";

function isLocalDemoHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function makeQuestions(): QuizQuestion[] {
  const pack = (question: string, answer: string, rest: string[]): QuizQuestion => {
    const choices = shuffle([answer, ...rest]);
    return { question, choices, correct: choices.indexOf(answer) };
  };
  return [
    pack("Tegen wie speelt Malta?", "Andorra", ["Gibraltar", "Italië", "Nederland"]),
    pack("Hoe laat is de transfer naar het vliegveld?", "05:15", ["06:00", "07:25", "08:30"]),
  ];
}

export default function QuizDemoPage() {
  const router = useRouter();
  const [local, setLocal] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [step, setStep] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!isLocalDemoHost()) {
      router.replace("/");
      return;
    }
    setLocal(true);
    setQuestions(makeQuestions());
    return () => {
      if (timer.current != null) window.clearTimeout(timer.current);
    };
  }, [router]);

  if (!local || questions.length === 0) return null;

  const q = questions[step]!;

  const restart = () => {
    if (timer.current != null) window.clearTimeout(timer.current);
    setQuestions(makeQuestions());
    setStep(0);
    setPick(null);
    setReveal(false);
    setDone(false);
  };

  const goNext = () => {
    if (pick == null || reveal) return;
    setReveal(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setReveal(false);
      setPick(null);
      if (step < questions.length - 1) setStep((s) => s + 1);
      else setDone(true);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-[#0b1f3a] text-white" role="dialog" aria-modal="true">
      <div
        className="flex shrink-0 items-center gap-2 px-3 pb-2"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-tap flex min-h-11 items-center rounded-full bg-white/10 px-4 text-sm font-semibold"
        >
          Sluiten
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-[#c9a227]">MP-Quiz</p>
        <span className="inline-tap min-h-11 min-w-16" aria-hidden />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          Lokaal voorbeeld
        </p>
        {done ? (
          <div className="mx-auto mt-16 max-w-md space-y-4 text-center">
            <p className="text-2xl font-bold">Zo werkt het</p>
            <p className="text-sm text-white/70">Antwoord kiezen, Volgende, 2 seconden groen, dan de volgende vraag.</p>
            <button
              type="button"
              onClick={restart}
              className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a]"
            >
              Nog een keer
            </button>
          </div>
        ) : (
          <div className="mx-auto mt-5 max-w-md space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">
              Vraag {step + 1} / {questions.length} · voorbeeld
            </p>
            <p className="text-lg font-bold leading-snug">{q.question}</p>
            <div className="space-y-2">
              {q.choices.map((choice, i) => (
                <button
                  key={`${step}-${choice}`}
                  type="button"
                  disabled={reveal}
                  onClick={() => {
                    if (reveal) return;
                    setPick(i);
                  }}
                  className={mpQuizChoiceClass(pick === i, reveal, q.correct === i)}
                >
                  {choice}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={pick == null || reveal}
              onClick={goNext}
              className="flex min-h-11 w-full items-center justify-center rounded-xl bg-white text-sm font-bold text-[#0b1f3a] disabled:opacity-40"
            >
              {reveal ? "…" : step < questions.length - 1 ? "Volgende" : "Inleveren"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
