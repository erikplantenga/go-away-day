"use client";

import { useEffect, useState } from "react";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { MpQuizSpin } from "@/components/MpQuizSpin";
import { MpQuizStand } from "@/components/MpQuizStand";
import {
  dailyUnlockCopy,
  isLocalQuizHost,
  quizDate,
  quizPlayedWaitCopy,
  quizReminderDue,
  quizRoundsLeft,
  quizUnlockedToday,
  type QuizPlayer,
  type QuizQuestion,
} from "@/lib/mpQuiz";

type Board = {
  erik: number;
  benno: number;
  played: { erik: boolean; benno: boolean };
  daysLeft: number;
  open: boolean;
  firebaseReady: boolean;
};

type Screen = "login" | "welcome" | "wait" | "quiz" | "spinGrant" | "spin" | "result" | "already" | "ended";

const NAME: Record<QuizPlayer, string> = { erik: "Erik", benno: "Benno" };
const ME_KEY = "mpQuizMe";
const SEEN_KEY = "mpQuizSeen";

function notifyKey(date: string) {
  return `mpQuizNotify:${date}`;
}

function rememberMe(who: QuizPlayer) {
  try {
    localStorage.setItem(ME_KEY, who);
  } catch {
    /* privémodus */
  }
}

type SeenBoard = {
  date: string;
  erik: number;
  benno: number;
  finished: { erik: boolean; benno: boolean };
};

function readSeen(): SeenBoard | null {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as SeenBoard) : null;
  } catch {
    return null;
  }
}

function writeSeen(seen: SeenBoard) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    /* privémodus */
  }
}

function phonePing(title: string, body: string) {
  try {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    new Notification(title, { body, tag: "mp-quiz-played" });
  } catch {
    /* iOS Safari zonder PWA */
  }
}

export function MpQuiz({ onOpenNews }: { onOpenNews?: () => void }) {
  const [board, setBoard] = useState<Board>({
    erik: 0,
    benno: 0,
    played: { erik: false, benno: false },
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
  const [spinToken, setSpinToken] = useState("");
  const [spinsTotal, setSpinsTotal] = useState(0);
  const [spinsDone, setSpinsDone] = useState(0);
  const [spinEarned, setSpinEarned] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<[number, number, number] | null>(null);
  const [lastSpinPoints, setLastSpinPoints] = useState<number | null>(null);
  const [testRound, setTestRound] = useState(false);
  const [party, setParty] = useState(false);
  const [boot, setBoot] = useState(true);
  const [stand, setStand] = useState(false);
  const [rivalNote, setRivalNote] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  const applyBoard = (data: Partial<Board> & { erik?: number; benno?: number }) => {
    setBoard((b) => ({
      erik: data.erik ?? b.erik,
      benno: data.benno ?? b.benno,
      played: data.played ?? b.played,
      daysLeft: data.daysLeft ?? b.daysLeft,
      open: data.open ?? b.open,
      firebaseReady: data.firebaseReady ?? b.firebaseReady,
    }));
  };

  const loadBoard = () => {
    fetch("/api/quiz")
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) return;
        const date = typeof data.date === "string" ? data.date : quizDate();
        const finished = {
          erik: !!data.finished?.erik,
          benno: !!data.finished?.benno,
        };
        const nextSeen: SeenBoard = {
          date,
          erik: data.erik ?? 0,
          benno: data.benno ?? 0,
          finished,
        };
        const seen = readSeen();
        let me: QuizPlayer | null = null;
        try {
          const raw = localStorage.getItem(ME_KEY);
          if (raw === "erik" || raw === "benno") me = raw;
        } catch {
          me = null;
        }
        if (seen && seen.date === date) {
          for (const player of ["benno", "erik"] as const) {
            if (player === me) continue;
            const justFinished = finished[player] && !seen.finished[player];
            const scoreUp = nextSeen[player] > seen[player];
            if (justFinished || scoreUp) {
              const text = `${NAME[player]} heeft gespeeld, check de nieuwe tussenstand!`;
              phonePing("MP-Quiz", text);
              setRivalNote(text);
            }
          }
        }
        writeSeen(nextSeen);
        applyBoard({
          erik: data.erik ?? 0,
          benno: data.benno ?? 0,
          played: {
            erik: !!data.played?.erik,
            benno: !!data.played?.benno,
          },
          daysLeft: data.daysLeft ?? 0,
          open: data.open !== false,
          firebaseReady: data.firebaseReady !== false,
        });
      })
      .catch(() => {});
  };

  const maybeRemind = (played = board.played, open = board.open) => {
    try {
      if (!open || !quizReminderDue()) return;
      if (played.erik && played.benno) return;
      if (typeof window === "undefined") return;
      if (typeof Notification === "undefined") return;
      const date = quizDate();
      if (Notification.permission !== "granted") return;
      if (localStorage.getItem(notifyKey(date))) return;
      localStorage.setItem(notifyKey(date), "1");
      new Notification("Nieuwe MP-Quiz", {
        body: "Nieuws van de dag en de quiz staan klaar.",
      });
    } catch {
      /* iOS Safari / privémodus */
    }
  };

  useEffect(() => {
    loadBoard();
    const id = window.setInterval(loadBoard, 8000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    maybeRemind();
    const id = window.setInterval(() => maybeRemind(), 20000);
    return () => window.clearInterval(id);
  }, [board.open, board.played.erik, board.played.benno]);

  useEffect(() => {
    if (!sheet && !boot && !stand && !rivalNote) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheet, boot, stand, rivalNote]);

  useEffect(() => {
    if (sheet && screen === "wait" && board.open && quizUnlockedToday(now)) {
      setScreen("login");
    }
  }, [now, sheet, screen, board.open]);

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
    setSpinToken("");
    setSpinsTotal(0);
    setSpinsDone(0);
    setSpinEarned(0);
    setSpinning(false);
    setReels(null);
    setLastSpinPoints(null);
    setTestRound(false);
    setParty(false);
    setStand(false);
    loadBoard();
  };

  const openStand = () => {
    loadBoard();
    setStand(true);
  };

  const openQuiz = () => {
    const unlocked = quizUnlockedToday(now);
    setScreen(!board.open ? "ended" : unlocked ? "login" : "wait");
    setSheet(true);
  };

  const enableNotify = async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      localStorage.removeItem(notifyKey(quizDate()));
      maybeRemind();
    }
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
      rememberMe(player);
      if (data.ended) {
        applyBoard({ erik: data.erik, benno: data.benno, open: false });
        setScreen("ended");
        return;
      }
      if (data.alreadyPlayed) {
        setWho(player);
        applyBoard({
          erik: data.erik,
          benno: data.benno,
          played: { ...board.played, [player]: true },
        });
        setScreen("already");
        return;
      }
      if (data.continueSpins) {
        setWho(player);
        setPoints(data.points ?? 0);
        setSpinToken(data.spinToken);
        setSpinsTotal(data.spinsTotal ?? data.points ?? 0);
        setSpinsDone(data.spinsDone ?? 0);
        setSpinEarned((data.spinResults as number[] | undefined)?.reduce((a, b) => a + b, 0) ?? 0);
        setScreen("spinGrant");
        return;
      }
      setWho(player);
      setToken(data.token);
      setQuestions(data.questions);
      setPicks([null, null, null, null, null]);
      setStep(0);
      setScreen("welcome");
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
        body: JSON.stringify({
          op: "submit",
          who,
          password,
          token,
          answers: picks,
          test: testRound,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Lukt niet");
        return;
      }
      if (data.alreadyPlayed) {
        applyBoard({
          erik: data.erik,
          benno: data.benno,
          played: { ...board.played, [who]: true },
        });
        setScreen("already");
        return;
      }
      setPoints(data.points ?? 0);
      setSpinToken(data.spinToken ?? "");
      setSpinsTotal(data.points ?? 0);
      setSpinsDone(0);
      setSpinEarned(0);
      setReels(null);
      setLastSpinPoints(null);
      setTestRound(!!data.test);
      applyBoard({
        erik: data.erik,
        benno: data.benno,
        played: { ...board.played, [who]: true },
        firebaseReady: data.firebaseReady !== false,
      });
      if ((data.points ?? 0) <= 0) {
        setScreen("result");
      } else {
        setScreen("spinGrant");
      }
    } catch {
      setError("Geen verbinding");
    } finally {
      setBusy(false);
    }
  };

  const startTestSpins = async (player: QuizPlayer, pass: string, correct = 3) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "testspin", who: player, password: pass, correct }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Lukt niet");
        return;
      }
      setWho(player);
      rememberMe(player);
      setPoints(data.points ?? correct);
      setSpinToken(data.spinToken);
      setSpinsTotal(data.spinsTotal ?? correct);
      setSpinsDone(0);
      setSpinEarned(0);
      setReels(null);
      setLastSpinPoints(null);
      setTestRound(true);
      setScreen("spinGrant");
    } catch {
      setError("Geen verbinding");
    } finally {
      setBusy(false);
    }
  };

  const doSpin = async () => {
    if (!who || spinning || busy || spinsDone >= spinsTotal) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "spin", who, password, token: spinToken, test: testRound }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Lukt niet");
        return;
      }
      setReels(data.reels);
      setLastSpinPoints(data.points ?? 0);
      if (data.erik != null) applyBoard({ erik: data.erik, benno: data.benno });
      setSpinning(true);
    } catch {
      setError("Geen verbinding");
    } finally {
      setBusy(false);
    }
  };

  const finishSpin = () => {
    const add = lastSpinPoints ?? 0;
    const nextDone = spinsDone + 1;
    const nextEarned = spinEarned + add;
    setSpinsDone(nextDone);
    setSpinEarned(nextEarned);
    setSpinning(false);
    if (nextDone >= spinsTotal) {
      if (nextEarned >= 12 || points >= 4) setParty(true);
      loadBoard();
      setScreen("result");
    }
  };

  const leftBenno = quizRoundsLeft(board.daysLeft, board.open, board.played.benno);
  const leftErik = quizRoundsLeft(board.daysLeft, board.open, board.played.erik);
  const unlock = dailyUnlockCopy(now);
  const daysLabel =
    board.daysLeft > 1
      ? `nog ${board.daysLeft} dagen`
      : board.daysLeft === 1
        ? "nog 1 dag"
        : board.open
          ? "vertrekdag"
          : "afgelopen";

  return (
    <>
      {boot && (
        <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/55 p-5" role="dialog" aria-modal="true">
          <div
            className="w-full max-w-sm rounded-2xl bg-[#0b1f3a] px-5 py-6 text-center text-white"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">Go Away Day</p>
            <p className="mt-3 text-lg font-bold leading-snug">{unlock.text}</p>
            <div className="mt-5 space-y-2">
              {unlock.ready && (
                <button
                  type="button"
                  onClick={() => {
                    setBoot(false);
                    openQuiz();
                  }}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a]"
                >
                  Start quiz
                </button>
              )}
              {onOpenNews && (
                <button
                  type="button"
                  onClick={() => {
                    setBoot(false);
                    onOpenNews();
                  }}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-white/10 text-sm font-semibold"
                >
                  Nieuws van de dag
                </button>
              )}
              <button
                type="button"
                onClick={() => setBoot(false)}
                className="flex min-h-11 w-full items-center justify-center rounded-xl bg-white/10 text-sm font-semibold"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {rivalNote && (
        <div
          className="fixed inset-0 z-[99] flex items-center justify-center bg-black/55 p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Nieuwe tussenstand"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#0b1f3a] px-5 py-6 text-center text-white"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">MP-Quiz</p>
            <p className="mt-3 text-lg font-bold leading-snug">{rivalNote}</p>
            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setRivalNote(null);
                  setStand(true);
                }}
                className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a]"
              >
                Tussenstand
              </button>
              <button
                type="button"
                onClick={() => setRivalNote(null)}
                className="flex min-h-11 w-full items-center justify-center rounded-xl bg-white/10 text-sm font-semibold"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={openQuiz}
        className="flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-[#c9a227] px-4 py-3.5 text-left text-[#0b1f3a] active:scale-[0.99]"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold tracking-wide">MP-Quiz</span>
          <span className="block truncate text-sm text-[#0b1f3a]/75">
            Malta Planning Quiz · 1 per dag · {daysLabel}
          </span>
          <span className="mt-0.5 block text-sm font-semibold">
            Benno {board.benno} · Erik {board.erik}
          </span>
          <span className="block text-xs font-medium text-[#0b1f3a]/70">
            Elk nog {Math.max(leftBenno, leftErik) === leftBenno && leftBenno === leftErik
              ? `${leftBenno} te gaan`
              : `Benno ${leftBenno} · Erik ${leftErik} te gaan`}
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
            <button
              type="button"
              onClick={openStand}
              className="inline-tap flex min-h-11 items-center rounded-full bg-[#c9a227] px-3 text-sm font-bold text-[#0b1f3a]"
            >
              Stand
            </button>
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

            {screen === "wait" && (
              <div className="mx-auto mt-8 max-w-md space-y-4 text-center">
                <p className="text-lg font-bold leading-snug">{unlock.text}</p>
                <p className="text-sm text-white/60">Elke dag om 10:00. Maximaal 1 ronde per persoon.</p>
                <button
                  type="button"
                  onClick={close}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-white/10 text-sm font-bold"
                >
                  Terug
                </button>
              </div>
            )}

            {screen === "login" && (
              <div className="mx-auto mt-6 max-w-md space-y-4">
                <button
                  type="button"
                  onClick={openStand}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-white/10 text-sm font-semibold"
                >
                  Tussenstand
                </button>
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
                  Log in
                </button>
                <p className="text-center text-xs text-white/45">
                  Elke dag om 10:00 een nieuwe ronde. Maximaal 1 per dag.
                </p>
                {typeof Notification !== "undefined" && Notification.permission === "default" && (
                  <button
                    type="button"
                    onClick={() => void enableNotify()}
                    className="flex min-h-11 w-full items-center justify-center rounded-xl bg-white/10 text-sm font-semibold"
                  >
                    Zet iPhone-meldingen aan
                  </button>
                )}
                {isLocalQuizHost() && (
                  <button
                    type="button"
                    disabled={!who || !password || busy}
                    onClick={() => who && startTestSpins(who, password, 3)}
                    className="flex min-h-11 w-full items-center justify-center rounded-xl border border-white/20 text-sm font-semibold text-white/80 disabled:opacity-40"
                  >
                    Test spins lokaal (3 goed)
                  </button>
                )}
              </div>
            )}

            {screen === "welcome" && who && (
              <div className="mx-auto mt-8 max-w-md space-y-4 text-center">
                <p className="text-2xl font-bold">Welkom {NAME[who]}, succes met de quiz</p>
                <div className="space-y-2 text-sm leading-relaxed text-white/75">
                  <p>We leren de planning tot we vertrekken. Elke dag 5 vragen, 4 antwoorden.</p>
                  <p>Maximaal 1 ronde per dag. Sluiten = nieuwe vragen, dus niet spieken.</p>
                  <p className="font-semibold text-white">
                    Jij hebt er nog {quizRoundsLeft(board.daysLeft, board.open, false)} te gaan.
                    {who === "benno"
                      ? ` Erik nog ${leftErik}.`
                      : ` Benno nog ${leftBenno}.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setScreen("quiz")}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a]"
                >
                  Start
                </button>
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

            {screen === "spinGrant" && who && (
              <div className="mx-auto mt-8 max-w-md space-y-4 text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#c9a227]">{NAME[who]}</p>
                <p className="text-4xl font-bold tabular-nums">{points}/5 goed</p>
                <p className="text-lg font-bold">
                  Je mag {spinsTotal} {spinsTotal === 1 ? "keer" : "keer"} spinnen
                </p>
                <p className="text-sm text-white/70">
                  Elke spin geeft punten. Na {spinsTotal === 1 ? "deze spin" : `${spinsTotal} spins`} is dat je score
                  voor vandaag.
                </p>
                {error && <p className="text-center text-sm text-red-300">{error}</p>}
                <button
                  type="button"
                  onClick={() => setScreen("spin")}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a]"
                >
                  Naar de spins
                </button>
              </div>
            )}

            {screen === "spin" && (
              <>
                {error && <p className="text-center text-sm text-red-300">{error}</p>}
                <MpQuizSpin
                  spinsDone={spinsDone}
                  spinsTotal={spinsTotal}
                  earned={spinEarned}
                  spinning={spinning}
                  reels={reels}
                  lastPoints={lastSpinPoints}
                  onSpin={() => void doSpin()}
                  onDone={finishSpin}
                />
              </>
            )}

            {screen === "result" && who && (
              <div className="mx-auto mt-8 max-w-md space-y-3 text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#c9a227]">{NAME[who]}</p>
                <p className="text-4xl font-bold tabular-nums">{points}/5 goed</p>
                <p className="text-2xl font-bold">Score: {spinEarned} punten</p>
                <p className="text-sm text-white/70">
                  Stand: Benno {board.benno} · Erik {board.erik}
                </p>
                <p className="text-sm text-white/60">
                  {testRound
                    ? "Dit was een lokale test, de stand is niet bewaard."
                    : quizPlayedWaitCopy(now)}
                </p>
                {!testRound && (
                  <p className="text-sm text-white/50">Nog {quizRoundsLeft(board.daysLeft, board.open, true)} te gaan.</p>
                )}
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
                <p className="text-lg font-bold leading-snug">{quizPlayedWaitCopy(now)}</p>
                <p className="text-sm text-white/70">
                  Stand: Benno {board.benno} · Erik {board.erik}
                </p>
                <p className="text-sm text-white/50">Nog {quizRoundsLeft(board.daysLeft, board.open, true)} te gaan.</p>
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

      {stand && (
        <MpQuizStand
          benno={board.benno}
          erik={board.erik}
          daysLeft={board.daysLeft}
          onClose={() => setStand(false)}
        />
      )}
    </>
  );
}
