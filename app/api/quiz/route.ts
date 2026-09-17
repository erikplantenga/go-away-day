import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  generateMpRound,
  quizDate,
  quizDaysLeft,
  quizStillOpen,
  quizUnlockedToday,
  rollQuizSpin,
  type QuizPlayer,
  type QuizQuestionInternal,
} from "@/lib/mpQuiz";

export const dynamic = "force-dynamic";

const PASSWORDS: Record<QuizPlayer, string> = {
  erik: "Plantenga",
  benno: "Wenstra",
};

type QuizSession = { k: "q"; u: QuizPlayer; d: string; q: QuizQuestionInternal[] };
type SpinSession = { k: "s"; u: QuizPlayer; d: string; c: number; test?: boolean };
type Token = QuizSession | SpinSession;

function secret() {
  return process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.slice(0, 48) || process.env.QUIZ_HMAC || "mp-quiz-go-away-day";
}

function sign(payload: Token): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function readToken(token: string): Token | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expect = createHmac("sha256", secret()).update(body).digest("base64url");
  if (expect.length !== sig.length) return null;
  let ok = 0;
  for (let i = 0; i < expect.length; i++) ok |= expect.charCodeAt(i) ^ sig.charCodeAt(i);
  if (ok !== 0) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Token;
  } catch {
    return null;
  }
}

function isPlayer(v: unknown): v is QuizPlayer {
  return v === "erik" || v === "benno";
}

function checkPass(who: QuizPlayer, password: unknown) {
  return typeof password === "string" && password === PASSWORDS[who];
}

function isDev() {
  return process.env.NODE_ENV === "development";
}

function spinTok(user: QuizPlayer, date: string, correct: number, test = false): string {
  return sign({ k: "s", u: user, d: date, c: correct, ...(test ? { test: true } : {}) });
}

async function fb() {
  return import("@/lib/firebase-admin");
}

export async function GET() {
  if (process.env.GITHUB_PAGES === "true") {
    return NextResponse.json({ error: "Geen quiz op static export" }, { status: 503 });
  }
  const admin = await fb();
  const date = quizDate();
  const [totals, erikPlay, bennoPlay] = await Promise.all([
    admin.getMpQuizTotals(),
    admin.getMpQuizPlay("erik", date),
    admin.getMpQuizPlay("benno", date),
  ]);
  return NextResponse.json({
    erik: totals.erik,
    benno: totals.benno,
    played: { erik: erikPlay != null, benno: bennoPlay != null },
    finished: {
      erik: erikPlay?.spinScore != null,
      benno: bennoPlay?.spinScore != null,
    },
    misses: {
      erik: erikPlay?.misses ?? [],
      benno: bennoPlay?.misses ?? [],
    },
    daysLeft: quizDaysLeft(),
    open: quizStillOpen(),
    unlocked: quizUnlockedToday(),
    date,
    firebaseReady: admin.isFirebaseAdminConfigured(),
    localTest: isDev(),
  });
}

export async function POST(req: NextRequest) {
  if (process.env.GITHUB_PAGES === "true") {
    return NextResponse.json({ error: "Geen quiz op static export" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ongeldig" }, { status: 400 });
  }

  const op = body.op as string;
  const admin = await fb();
  const test = isDev() && body.test === true;

  if (op === "testspin") {
    if (!isDev()) return NextResponse.json({ error: "Alleen lokaal" }, { status: 403 });
    if (!isPlayer(body.who) || !checkPass(body.who, body.password)) {
      return NextResponse.json({ error: "Verkeerd wachtwoord" }, { status: 401 });
    }
    const correct = Math.max(1, Math.min(5, Number(body.correct ?? 3)));
    return NextResponse.json({
      who: body.who,
      points: correct,
      spinToken: spinTok(body.who, "test", correct, true),
      spinsTotal: correct,
      test: true,
    });
  }

  if (op === "start") {
    if (!quizStillOpen() && !test) {
      const totals = await admin.getMpQuizTotals();
      return NextResponse.json({ ended: true, ...totals, daysLeft: quizDaysLeft() });
    }
    if (!quizUnlockedToday() && !test) {
      return NextResponse.json({ error: "Vanaf 10:00 kun je de quiz doen." }, { status: 403 });
    }
    if (!isPlayer(body.who) || !checkPass(body.who, body.password)) {
      return NextResponse.json({ error: "Verkeerd wachtwoord" }, { status: 401 });
    }
    const date = quizDate();
    const play = test ? null : await admin.getMpQuizPlay(body.who, date);
    if (play && play.spinScore != null) {
      const totals = await admin.getMpQuizTotals();
      return NextResponse.json({
        alreadyPlayed: true,
        who: body.who,
        ...totals,
        daysLeft: quizDaysLeft(),
      });
    }
    if (play && play.spinScore == null && play.correct > 0) {
      const totals = await admin.getMpQuizTotals();
      return NextResponse.json({
        continueSpins: true,
        who: body.who,
        points: play.correct,
        spinToken: spinTok(body.who, date, play.correct),
        spinsDone: play.spinResults.length,
        spinsTotal: play.correct,
        spinResults: play.spinResults,
        erik: totals.erik,
        benno: totals.benno,
      });
    }
    const round = generateMpRound();
    const token = sign({ k: "q", u: body.who, d: date, q: round });
    return NextResponse.json({
      token,
      who: body.who,
      questions: round.map(({ question, choices }) => ({ question, choices })),
    });
  }

  if (op === "submit") {
    const token = typeof body.token === "string" ? readToken(body.token) : null;
    if (!token || token.k !== "q") return NextResponse.json({ error: "Sessie verlopen. Open opnieuw." }, { status: 400 });
    if (!isPlayer(body.who) || !checkPass(body.who, body.password) || body.who !== token.u) {
      return NextResponse.json({ error: "Verkeerd wachtwoord" }, { status: 401 });
    }
    if (token.d !== quizDate() && !test) {
      return NextResponse.json({ error: "Deze ronde is van een andere dag." }, { status: 400 });
    }
    const answers = Array.isArray(body.answers) ? body.answers.map((n) => Number(n)) : [];
    if (answers.length !== 5 || token.q.length !== 5) {
      return NextResponse.json({ error: "Antwoorden incompleet" }, { status: 400 });
    }
    const existing = test ? null : await admin.getMpQuizPlay(token.u, token.d);
    if (existing && existing.spinScore != null) {
      const totals = await admin.getMpQuizTotals();
      return NextResponse.json({ alreadyPlayed: true, who: token.u, ...totals, daysLeft: quizDaysLeft() });
    }
    let points = 0;
    const misses: { date: string; question: string; answer: string; picked: string }[] = [];
    token.q.forEach((q, i) => {
      if (answers[i] === q.correct) {
        points += 1;
        return;
      }
      misses.push({
        date: token.d,
        question: q.question,
        answer: q.choices[q.correct] ?? "",
        picked: q.choices[answers[i] ?? -1] ?? "geen antwoord",
      });
    });
    if (!test) await admin.beginMpQuizPlay(token.u, token.d, points, misses);
    const totals = await admin.getMpQuizTotals();
    return NextResponse.json({
      points,
      who: token.u,
      spinToken: spinTok(token.u, test ? "test" : token.d, points, test),
      spinsTotal: points,
      erik: totals.erik,
      benno: totals.benno,
      daysLeft: quizDaysLeft(),
      firebaseReady: admin.isFirebaseAdminConfigured(),
      test,
    });
  }

  if (op === "spin") {
    const token = typeof body.token === "string" ? readToken(body.token) : null;
    if (!token || token.k !== "s") return NextResponse.json({ error: "Sessie verlopen. Open opnieuw." }, { status: 400 });
    if (!isPlayer(body.who) || !checkPass(body.who, body.password) || body.who !== token.u) {
      return NextResponse.json({ error: "Verkeerd wachtwoord" }, { status: 401 });
    }
    if (token.c <= 0) {
      return NextResponse.json({ error: "Geen spins" }, { status: 400 });
    }
    const roll = rollQuizSpin();
    if (token.test || test) {
      return NextResponse.json({
        reels: roll.reels,
        points: roll.points,
        test: true,
      });
    }
    if (token.d !== quizDate()) {
      return NextResponse.json({ error: "Deze ronde is van een andere dag." }, { status: 400 });
    }
    const { play, totals } = await admin.recordMpQuizSpin(token.u, token.d, roll.points);
    return NextResponse.json({
      reels: roll.reels,
      points: roll.points,
      spinsDone: play.spinResults.length,
      spinsTotal: play.correct,
      spinScore: play.spinScore,
      erik: totals.erik,
      benno: totals.benno,
      daysLeft: quizDaysLeft(),
    });
  }

  return NextResponse.json({ error: "Unknown op" }, { status: 400 });
}
