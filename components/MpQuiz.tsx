"use client";

import { useEffect, useState } from "react";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import type { QuizPlayer, QuizQuestion } from "@/lib/mpQuiz";

type Board = {
  erik: number;
  benno: number;
  daysLeft: number;
  open: boolean;
  firebaseReady: boolean;
};

type Screen = "login" | "quiz" | "result" | "already" | "ended";

const NAME: Record<QuizPlayer, string> = { erik: "Erik", benno: "Benno" };

export function MpQuiz() {
  const [board, setBoard] = useState<Board>({
    erik: 0,
    benno: 0,
    daysLeft: 0,
    open: true,
    firebaseReady: true,
  });
  const [sheet, setSheet] = useState(false);
  const [screen, setScreen] = useState<Screen>("login");
  const [who, setWho] = useState<QuizPlayer | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [token, setToken] = useState("");
  const [picks, setPicks] = useState<(number | null)[]>([null, null, null, null, null]);
  const [step, setStep] = useState(0);
  const [points, setPoints] = useState(0);
  const [party, setParty] = useState(false);

  const loadBoard = () => {
    fetch("/api/quiz")
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) return;
        setBoard({
          erik: data.erik ?? 0,
          benno: data.benno ?? 0,
          daysLeft: data.daysLeft ?? 0,
          open: data.open !== false,
          firebaseReady: data.firebaseReady !== false,
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadBoard();
    const id = window.setInterval(loadBoard, 20000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheet]);

  const close = () => {
    setSheet(false);
    setScreen("login");
    setWho(null);
    setPassword("");
    setError("");
    setQuestions([]);
    setToken("");
    setPicks([null, null, null, null, null]);
    setStep(0);
    setPoints(0);
    setParty(false);
    loadBoard();
  };

  const start = async (player: QuizPlayer, pass: string) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "start", who: player, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Lukt niet");
        return;
      }
      if (data.ended) {
        setBoard((b) => ({ ...b, erik: data.erik, benno: data.benno, open: false }));
        setScreen("ended");
        return;
      }
      if (data.alreadyPlayed) {
        setWho(player);
        setBoard((b) => ({ ...b, erik: data.erik, benno: data.benno }));
        setScreen("already");
        return;
      }
      setWho(player);
      setToken(data.token);
      setQuestions(data.questions);
      setPicks([null, null, null, null, null]);
      setStep(0);
      setScreen("quiz");
    } catch {
      setError("Geen verbinding");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!who || picks.some((p) => p === null)) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "submit", who, password, token, answers: picks }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Lukt niet");
        return;
      }
      if (data.alreadyPlayed) {
        setBoard((b) => ({ ...b, erik: data.erik, benno: data.benno }));
        setScreen("already");
        return;
      }
      setPoints(data.points ?? 0);
      setBoard((b) => ({
        ...b,
        erik: data.erik,
        benno: data.benno,
        firebaseReady: data.firebaseReady !== false,
      }));
      setScreen("result");
      if ((data.points ?? 0) >= 4) setParty(true);
    } catch {
      setError("Geen verbinding");
    } finally {
      setBusy(false);
    }
  };

  const daysLabel =
    board.daysLeft > 1 ? `nog ${board.daysLeft} dagen` : board.daysLeft === 1 ? "nog 1 dag" : board.open ? "vertrekdag" : "afgelopen";

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setScreen(board.open ? "login" : "ended");
          setSheet(true);
        }}
        className="flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-[#c9a227] px-4 py-3.5 text-left text-[#0b1f3a] active:scale-[0.99]"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold tracking-wide">MP-Quiz</span>
          <span className="block truncate text-sm text-[#0b1f3a]/75">
            Malta Planning Quiz · {daysLabel}
          </span>
          <span className="mt-0.5 block text-sm font-semibold">
            Benno {board.benno} · Erik {board.erik}
          </span>
        </span>
        <span className="text-2xl" aria-hidden>
          🏆
        </span>
      </button>

      {sheet && (
        <div className="fixed inset-0 z-[95] flex flex-col bg-[#0b1f3a] text-white" role="dialog" aria-modal="true">
          {party && <ConfettiBurst />}
          <div
            className="flex shrink-0 items-center gap-2 px-3 pb-2"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <button
              type="button"
              onClick={close}
              className="inline-tap flex min-h-11 items-center rounded-full bg-white/10 px-4 text-sm font-semibold"
            >
              Sluiten
            </button>
            <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-[#c9a227]">MP-Quiz</p>
            <span className="w-[4.5rem]" />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <p className="text-center text-sm text-white/70">
              {daysLabel} · Benno {board.benno} · Erik {board.erik}
            </p>
            {!board.firebaseReady && (
              <p className="mx-auto mt-2 max-w-md rounded-xl bg-white/10 px-3 py-2 text-center text-xs text-white/70">
                Scores staan nog niet in Firebase. Zet in Vercel de variabele FIREBASE_SERVICE_ACCOUNT_JSON (JSON-key
                uit Firebase → Service accounts).
              </p>
            )}

            {screen === "login" && (
              <div className="mx-auto mt-6 max-w-md space-y-4">
                <p className="text-center text-lg font-bold">Ben je Benno of Erik?</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["benno", "erik"] as const).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setWho(id)}
                      className={`rounded-2xl px-4 py-4 text-base font-bold ${
                        who === id ? "bg-[#c9a227] text-[#0b1f3a]" : "bg-white/10 text-white"
                      }`}
                    >
                      {NAME[id]}
                    </button>
                  ))}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && who && password && !busy) void start(who, password);
                  }}
                  placeholder="Wachtwoord"
                  autoComplete="current-password"
                  className="min-h-11 w-full rounded-xl bg-white/10 px-4 text-base text-white placeholder:text-white/40"
                />
                {error && <p className="text-center text-sm text-red-300">{error}</p>}
                <button
                  type="button"
                  disabled={!who || !password || busy}
                  onClick={() => who && start(who, password)}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a] disabled:opacity-40"
                >
                  Start de quiz
                </button>
                <p className="text-center text-xs text-white/45">
                  5 vragen · 4 antwoorden · 1 ronde per dag. Sluiten = nieuwe vragen, niet spieken.
                </p>
              </div>
            )}

            {screen === "quiz" && questions[step] && (
              <div className="mx-auto mt-5 max-w-md space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">
                  Vraag {step + 1} / 5{who ? ` · ${NAME[who]}` : ""}
                </p>
                <p className="text-lg font-bold leading-snug">{questions[step].question}</p>
                <div className="space-y-2">
                  {questions[step].choices.map((choice, i) => {
                    const on = picks[step] === i;
                    return (
                      <button
                        key={`${step}-${i}`}
                        type="button"
                        onClick={() =>
                          setPicks((cur) => {
                            const next = [...cur];
                            next[step] = i;
                            return next;
                          })
                        }
                        className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                          on ? "bg-[#c9a227] text-[#0b1f3a]" : "bg-white/10 text-white"
                        }`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
                {error && <p className="text-center text-sm text-red-300">{error}</p>}
                <button
                  type="button"
                  disabled={picks[step] === null || busy}
                  onClick={() => {
                    if (step < 4) setStep((s) => s + 1);
                    else void submit();
                  }}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-white text-sm font-bold text-[#0b1f3a] disabled:opacity-40"
                >
                  {step < 4 ? "Volgende" : busy ? "Bezig…" : "Inleveren"}
                </button>
              </div>
            )}

            {screen === "result" && who && (
              <div className="mx-auto mt-8 max-w-md space-y-3 text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#c9a227]">{NAME[who]}</p>
                <p className="text-4xl font-bold tabular-nums">{points}/5</p>
                <p className="text-sm text-white/70">
                  Stand: Benno {board.benno} · Erik {board.erik}
                </p>
                <p className="text-sm text-white/60">Morgen een nieuwe ronde. Tot de dag van vertrek.</p>
                <button
                  type="button"
                  onClick={close}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a]"
                >
                  Klaar
                </button>
              </div>
            )}

            {screen === "already" && (
              <div className="mx-auto mt-8 max-w-md space-y-3 text-center">
                <p className="text-lg font-bold">Jij hebt vandaag al gespeeld</p>
                <p className="text-sm text-white/70">
                  Stand: Benno {board.benno} · Erik {board.erik}
                </p>
                <p className="text-sm text-white/60">Morgen weer 5 nieuwe vragen.</p>
                <button
                  type="button"
                  onClick={close}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-white/10 text-sm font-bold"
                >
                  Terug
                </button>
              </div>
            )}

            {screen === "ended" && (
              <div className="mx-auto mt-8 max-w-md space-y-3 text-center">
                <p className="text-lg font-bold">De quiz is afgelopen</p>
                <p className="text-3xl font-bold">
                  {board.benno === board.erik
                    ? "Gelijkspel"
                    : board.benno > board.erik
                      ? "Benno wint"
                      : "Erik wint"}
                </p>
                <p className="text-sm text-white/70">
                  Benno {board.benno} · Erik {board.erik}
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-white/10 text-sm font-bold"
                >
                  Terug
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
