import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  generateMpRound,
  quizDate,
  quizDaysLeft,
  quizStillOpen,
  quizUnlockedToday,
  type QuizPlayer,
  type QuizQuestionInternal,
} from "@/lib/mpQuiz";

export const dynamic = "force-dynamic";

const PASSWORDS: Record<QuizPlayer, string> = {
  erik: "Plantenga",
  benno: "Wenstra",
};

type Session = {
  u: QuizPlayer;
  d: string;
  q: QuizQuestionInternal[];
};

function secret() {
  return process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.slice(0, 48) || process.env.QUIZ_HMAC || "mp-quiz-go-away-day";
}

function sign(payload: Session): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function readToken(token: string): Session | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expect = createHmac("sha256", secret()).update(body).digest("base64url");
  if (expect.length !== sig.length) return null;
  let ok = 0;
  for (let i = 0; i < expect.length; i++) ok |= expect.charCodeAt(i) ^ sig.charCodeAt(i);
  if (ok !== 0) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Session;
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

async function fb() {
  return import("@/lib/firebase-admin");
}

export async function GET() {
  if (process.env.GITHUB_PAGES === "true") {
    return NextResponse.json({ error: "Geen quiz op static export" }, { status: 503 });
  }
  const admin = await fb();
  const date = quizDate();
  const [totals, erikPlayed, bennoPlayed] = await Promise.all([
    admin.getMpQuizTotals(),
    admin.hasMpQuizPlayed("erik", date),
    admin.hasMpQuizPlayed("benno", date),
  ]);
  return NextResponse.json({
    erik: totals.erik,
    benno: totals.benno,
    played: { erik: erikPlayed, benno: bennoPlayed },
    daysLeft: quizDaysLeft(),
    open: quizStillOpen(),
    unlocked: quizUnlockedToday(),
    date,
    firebaseReady: admin.isFirebaseAdminConfigured(),
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

  if (op === "start") {
    if (!quizStillOpen()) {
      const totals = await admin.getMpQuizTotals();
      return NextResponse.json({ ended: true, ...totals, daysLeft: quizDaysLeft() });
    }
    if (!quizUnlockedToday()) {
      return NextResponse.json({ error: "Vanaf 10:00 kun je de quiz doen." }, { status: 403 });
    }
    if (!isPlayer(body.who) || !checkPass(body.who, body.password)) {
      return NextResponse.json({ error: "Verkeerd wachtwoord" }, { status: 401 });
    }
    const date = quizDate();
    const played = await admin.hasMpQuizPlayed(body.who, date);
    if (played) {
      const totals = await admin.getMpQuizTotals();
      return NextResponse.json({
        alreadyPlayed: true,
        who: body.who,
        ...totals,
        daysLeft: quizDaysLeft(),
      });
    }
    const round = generateMpRound();
    const token = sign({ u: body.who, d: date, q: round });
    return NextResponse.json({
      token,
      who: body.who,
      questions: round.map(({ question, choices }) => ({ question, choices })),
    });
  }

  if (op === "submit") {
    const token = typeof body.token === "string" ? readToken(body.token) : null;
    if (!token) return NextResponse.json({ error: "Sessie verlopen. Open opnieuw." }, { status: 400 });
    if (!isPlayer(body.who) || !checkPass(body.who, body.password) || body.who !== token.u) {
      return NextResponse.json({ error: "Verkeerd wachtwoord" }, { status: 401 });
    }
    if (token.d !== quizDate()) {
      return NextResponse.json({ error: "Deze ronde is van een andere dag." }, { status: 400 });
    }
    const answers = Array.isArray(body.answers) ? body.answers.map((n) => Number(n)) : [];
    if (answers.length !== 5 || token.q.length !== 5) {
      return NextResponse.json({ error: "Antwoorden incompleet" }, { status: 400 });
    }
    const played = await admin.hasMpQuizPlayed(token.u, token.d);
    if (played) {
      const totals = await admin.getMpQuizTotals();
      return NextResponse.json({ alreadyPlayed: true, who: token.u, ...totals, daysLeft: quizDaysLeft() });
    }
    let points = 0;
    token.q.forEach((q, i) => {
      if (answers[i] === q.correct) points += 1;
    });
    const totals = await admin.submitMpQuiz(token.u, token.d, points);
    return NextResponse.json({
      points,
      who: token.u,
      erik: totals.erik,
      benno: totals.benno,
      daysLeft: quizDaysLeft(),
      firebaseReady: admin.isFirebaseAdminConfigured(),
    });
  }

  return NextResponse.json({ error: "Unknown op" }, { status: 400 });
}
