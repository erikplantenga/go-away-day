import { FLIGHTS, HOTEL, MALTA_DAYS, PASSENGERS, type DayItem, type TripDay } from "@/lib/maltaTrip";
import { daysUntilDeparture } from "@/lib/maltaWeather";

export type QuizPlayer = "erik" | "benno";

export type QuizMiss = {
  date: string;
  question: string;
  answer: string;
  picked: string;
};

export type QuizQuestion = {
  question: string;
  choices: string[];
  bonus?: boolean;
  correct?: number;
  corrects?: number[];
};

export type QuizQuestionInternal = QuizQuestion & {
  correct: number;
  corrects?: number[];
  correctLabel?: string;
  bonusPoints?: number;
};

export const QUIZ_BONUS_POINTS = 3;

export function quizQuestionValue(q: QuizQuestionInternal): number {
  if (!q.bonus) return 1;
  return q.bonusPoints ?? QUIZ_BONUS_POINTS;
}

export function quizPickIsCorrect(q: QuizQuestionInternal, pick: number): boolean {
  if (Array.isArray(q.corrects) && q.corrects.length > 0) return q.corrects.includes(pick);
  return pick === q.correct;
}

export function quizCorrectLabel(q: QuizQuestionInternal): string {
  if (q.correctLabel) return q.correctLabel;
  if (Array.isArray(q.corrects) && q.corrects.length > 1) {
    const names = q.corrects
      .map((i) => q.choices[i])
      .filter((name): name is string => Boolean(name));
    if (names.length <= 1) return names[0] ?? "";
    return `${names.slice(0, -1).join(", ")} of ${names[names.length - 1]}`;
  }
  return q.choices[q.correct] ?? "";
}

export function quizDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function quizDaysLeft(now = new Date()): number {
  return daysUntilDeparture(now);
}

export function quizStillOpen(now = new Date()): boolean {
  return quizDaysLeft(now) >= 0;
}

export function quizAmsterdamHour(now = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Amsterdam",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(now),
  );
}

/** Quizdagen tot en met vertrek. Na spelen vandaag telt die ronde niet meer mee. */
export function quizRoundsLeft(daysLeft: number, open: boolean, playedToday: boolean): number {
  if (!open) return 0;
  const includingToday = daysLeft <= 0 ? 1 : daysLeft;
  return playedToday ? Math.max(0, includingToday - 1) : includingToday;
}

export function quizReminderDue(now = new Date()): boolean {
  return quizUnlockedToday(now);
}

const TZ = "Europe/Amsterdam";

function tenOn(date: string): Date {
  const cest = new Date(`${date}T10:00:00+02:00`);
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(cest),
  );
  if (hour === 10) return cest;
  return new Date(`${date}T10:00:00+01:00`);
}

export function todayTenAmsterdam(now = new Date()): Date {
  return tenOn(quizDate(now));
}

function nextAmsterdamDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const next = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1, (d ?? 1) + 1));
  return next.toISOString().slice(0, 10);
}

export function nextQuizUnlock(now = new Date()): Date {
  const todayTen = todayTenAmsterdam(now);
  if (now.getTime() < todayTen.getTime()) return todayTen;
  return tenOn(nextAmsterdamDate(quizDate(now)));
}

export function quizUnlockedToday(now = new Date()): boolean {
  return quizStillOpen(now) && now.getTime() >= todayTenAmsterdam(now).getTime();
}

export function quizPlayedWaitCopy(now = new Date()): string {
  const next = nextQuizUnlock(now);
  if (!quizStillOpen(next)) {
    return "Je hebt al gespeeld. Dit was je laatste ronde.";
  }
  const wait = formatDurationNl(next.getTime() - now.getTime());
  return `Je hebt al gespeeld, je kunt over ${wait} weer.`;
}

export function formatQuizMs(ms: number): string {
  const totalSec = Math.max(1, Math.round(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min <= 0) return `${sec} sec`;
  if (sec === 0) return min === 1 ? "1 min" : `${min} min`;
  return `${min} min ${sec} sec`;
}

export function formatDurationNl(ms: number): string {
  const totalMin = Math.max(0, Math.ceil(ms / 60_000));
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  const uur = hours === 1 ? "1 uur" : `${hours} uur`;
  const min = minutes === 1 ? "1 minuut" : `${minutes} minuten`;
  if (hours <= 0) return min;
  if (minutes === 0) return uur;
  return `${uur} en ${min}`;
}

export function dailyUnlockCopy(now = new Date()): { ready: boolean; text: string } {
  if (!quizStillOpen(now)) {
    return { ready: false, text: "De quiz is afgelopen. Nieuws van de dag blijft staan." };
  }
  if (quizUnlockedToday(now)) {
    return { ready: true, text: "Nieuws van de dag en de quiz staan klaar." };
  }
  const wait = formatDurationNl(todayTenAmsterdam(now).getTime() - now.getTime());
  return { ready: false, text: `Nieuws van de dag en start quiz over ${wait}.` };
}

export function quizFinale(benno: number, erik: number): {
  winner: "benno" | "erik" | "tie";
  title: string;
  beer: string;
  toast: string;
} {
  if (benno === erik) {
    return {
      winner: "tie",
      title: "Gelijkspel!",
      beer: "Dan geven jullie elkaar een rondje. Dubbel proost.",
      toast: "Felicitaties — jullie landen als kampioenen in Malta.",
    };
  }
  const name = benno > erik ? "Benno" : "Erik";
  const other = benno > erik ? "Erik" : "Benno";
  return {
    winner: benno > erik ? "benno" : "erik",
    title: `${name} wint de MP-Quiz!`,
    beer: `Proost ${name} — ${other} geeft het eerste rondje bier.`,
    toast: "Felicitaties, goede vlucht, en tot in Sliema.",
  };
}

export const QUIZ_REEL_VALUES = [1, 2, 3, 4, 5] as const;

export function rollQuizSpin(): { reels: [number, number, number]; points: number } {
  const pick = () => QUIZ_REEL_VALUES[Math.floor(Math.random() * QUIZ_REEL_VALUES.length)]!;
  const reels: [number, number, number] = [pick(), pick(), pick()];
  return { reels, points: reels[0] + reels[1] + reels[2] };
}

export function isLocalQuizHost(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: T[], rand: () => number = Math.random): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function four(correct: string, pool: string[], rand: () => number): string[] {
  const rest = shuffle(
    pool.filter((p) => p.trim() && p !== correct),
    rand,
  ).slice(0, 3);
  const filler = ["Paceville", "Mdina", "Comino", "Birgu", "Schiphol", "Gozo"];
  let i = 0;
  while (rest.length < 3) {
    const extra = filler[i++] ?? `Anders ${rest.length}`;
    if (extra !== correct && !rest.includes(extra)) rest.push(extra);
  }
  return shuffle([correct, ...rest], rand);
}

function pack(
  question: string,
  answer: string,
  pool: string[],
  rand: () => number,
): QuizQuestionInternal | null {
  if (!answer) return null;
  const choices = four(answer, pool, rand);
  const correct = choices.indexOf(answer);
  if (correct < 0) return null;
  return { question, choices, correct };
}

function lunchFollowUp(day: TripDay): DayItem | undefined {
  const i = day.items.findIndex((item) => /lunch/i.test(item.text));
  if (i < 0) return undefined;
  return day.items[i + 1];
}

function activityPool(): string[] {
  const texts = MALTA_DAYS.flatMap((d) => [...d.items, ...(d.extras ?? [])].map((i) => i.text));
  return [...new Set(texts)];
}

function timePool(): string[] {
  const times = MALTA_DAYS.flatMap((d) => d.items.map((i) => i.time)).filter((t) => t !== "Extra");
  return [...new Set(["11:50", "14:55", "07:25", "10:50", "18:00", "21:00", "08:30", "05:15", ...times])];
}

export function dailyQuizSeed(date = quizDate()): string {
  return `mp-quiz-${date}`;
}

const SILENT_EXTRA_BY_DATE: Record<string, (rand: () => number) => QuizQuestionInternal | null> = {
  "2026-09-19": (rand) => pack("Wat is Benno zijn tweede naam?", "Sjoerd", ["Bokke", "Jacob", "Flapje"], rand),
};

const BONUS_START = "2026-09-20";
const BONUS_EVERY_DAYS = 3;

function addAmsterdamDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const next = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1, (d ?? 1) + days));
  return next.toISOString().slice(0, 10);
}

function bonusDate(slot: number): string {
  return addAmsterdamDays(BONUS_START, slot * BONUS_EVERY_DAYS);
}

function lammeKopBonus(rand: () => number): QuizQuestionInternal | null {
  const choices = shuffle(["Sloot", "Greppel", "Kanaal", "Bushok"], rand);
  const good = new Set(["Sloot", "Greppel", "Kanaal"]);
  const corrects = choices.flatMap((choice, i) => (good.has(choice) ? [i] : []));
  const correct = corrects[0] ?? -1;
  if (correct < 0 || corrects.length !== 3) return null;
  return {
    question: "Benno fietste met zijn lamme kop in een:",
    choices,
    correct,
    corrects,
    correctLabel: "Sloot, Greppel of Kanaal",
    bonus: true,
    bonusPoints: QUIZ_BONUS_POINTS,
  };
}

function toiletSpreukBonus(rand: () => number): QuizQuestionInternal | null {
  const good =
    "Je gezicht is je eigen weerbericht\nals je in de spiegel kijkt kun je je eigen bui zien hangen";
  const others = [
    "Je gezicht\nis net een stoplicht\nstaat het op onweer\ndan weet iedereen:\neven niet storen",
    "Je gezicht\nliegt eigenlijk nooit\nje mond zegt “gaat prima”\nmaar je hoofd zegt:\nhou maar even afstand",
    "Je gezicht\nis je eigen Buienradar\néén blik in de spiegel\nen je weet:\nvandaag 100% kans op gezeik",
  ];
  const choices = shuffle([good, ...others], rand);
  const correct = choices.indexOf(good);
  if (correct < 0) return null;
  return {
    question: "Wat hangt er voor wijze spreuk op Benno’s toilet?",
    choices,
    correct,
    bonus: true,
    bonusPoints: QUIZ_BONUS_POINTS,
  };
}

function femePopBonus(rand: () => number): QuizQuestionInternal | null {
  const good = "21 september";
  const choices = shuffle([good, "11 september", "26 september", "20 september"], rand);
  const correct = choices.indexOf(good);
  if (correct < 0) return null;
  return {
    question: "Wanneer is Feme Pop jarig?",
    choices,
    correct,
    bonus: true,
    bonusPoints: QUIZ_BONUS_POINTS,
  };
}

/** Slot 0 = 20 sep, daarna elke 3 dagen. */
const BONUSES: Array<(rand: () => number) => QuizQuestionInternal | null> = [
  lammeKopBonus,
  toiletSpreukBonus,
  femePopBonus,
];

function bonusForDate(date: string, rand: () => number): QuizQuestionInternal | null {
  const maker = BONUSES.find((_, slot) => bonusDate(slot) === date);
  return maker ? maker(rand) : null;
}

export function generateMpRound(seedKey?: string, date = quizDate()): QuizQuestionInternal[] {
  const rand = seedKey ? mulberry32(hashString(seedKey)) : Math.random;
  const make = (question: string, answer: string, pool: string[]) => pack(question, answer, pool, rand);
  const acts = activityPool();
  const times = timePool();
  const bank: QuizQuestionInternal[] = [];
  const push = (q: QuizQuestionInternal | null) => {
    if (q) bank.push(q);
  };

  for (const day of MALTA_DAYS) {
    const timeCount = new Map<string, number>();
    for (const item of day.items) {
      timeCount.set(item.time, (timeCount.get(item.time) ?? 0) + 1);
    }
    for (const item of day.items) {
      if ((timeCount.get(item.time) ?? 0) === 1) {
        push(make(`Wat doen we ${day.weekday.toLowerCase()} om ${item.time}?`, item.text, acts));
      }
      if (item.time !== "Extra") {
        push(make(`Hoe laat is: ${item.text}?`, item.time, times));
      }
    }
    const after = lunchFollowUp(day);
    if (after) {
      push(make(`Wat doen we op ${day.weekday.toLowerCase()} na de lunch?`, after.text, acts));
    }
    const extra = day.extras?.[0];
    if (extra) {
      push(
        make(
          `Wat staat er als extra op ${day.weekday.toLowerCase()}?`,
          extra.text,
          (day.extras ?? []).map((e) => e.text).concat(acts),
        ),
      );
    }
    const choiceA = day.items.find((i) => i.choice === "A");
    const choiceB = day.items.find((i) => i.choice === "B");
    if (choiceA && choiceB) {
      push(make(`Wat is optie A op ${day.weekday.toLowerCase()}avond?`, choiceA.text, [choiceB.text, ...acts]));
      push(make(`Wat is optie B op ${day.weekday.toLowerCase()}avond?`, choiceB.text, [choiceA.text, ...acts]));
    }
  }

  push(make("Tegen wie speelt Malta?", "Andorra", ["Gibraltar", "Italië", "Nederland", "Luxemburg", "Spanje"]));
  push(make("Tegen wie speelt Andorra?", "Malta", ["Gibraltar", "Italië", "Nederland", "San Marino", "Cyprus"]));
  push(make("Waar is Malta – Andorra?", "National Stadium, Ta’ Qali", ["Fort St. Elmo", "Marsa", "UNO", "Mdina"]));
  push(make("Hoe laat fluit Malta – Andorra?", "18:00", times));
  push(make("Op welke dag is de interland?", "Zondag 4 oktober", ["Zaterdag 3 oktober", "Maandag 5 oktober", "Dinsdag 6 oktober"]));
  push(make("Hoe heet ons hotel?", HOTEL.name, ["The Palace", "Hilton Malta", "Phoenicia", "AX The Victoria"]));
  push(make("In welke plaats ligt het hotel?", HOTEL.place, ["Valletta", "St. Julian’s", "Mdina", "Birgu"]));
  push(make("Wat is het adres van het hotel?", HOTEL.address, ["Republic Street, Valletta", "The Strand, Gżira", "St. George’s Bay", "Pjazza San Ġwann"]));
  push(make("Wat kost het hotel in totaal?", HOTEL.total, ["€560", "€980", "€380", "€1.200"]));
  push(make("Wat betalen we nog bij check-in?", "€380", ["€190", "€760", "€0", "€120"]));
  push(make("Hoe laat is het ontbijt?", "07:30 – 09:30", ["06:00 – 08:00", "08:00 – 11:00", "07:00 – 10:30"]));
  push(make("Welk vluchtnummer is de heenreis?", FLIGHTS.outbound.flightNumber, ["KM394", "KL1691", "FR3892", "BA2614"]));
  push(make("Welk vluchtnummer is de terugreis?", FLIGHTS.inbound.flightNumber, ["KM395", "KL1692", "FR3893", "BA2615"]));
  push(make("Hoe laat vertrekt KM395 van Schiphol?", FLIGHTS.outbound.departTime, times));
  push(make("Hoe laat landen we op Malta?", FLIGHTS.outbound.arriveTime, times));
  push(make("Hoe laat vertrekt KM394 van Malta?", FLIGHTS.inbound.departTime, times));
  push(make("Hoe laat landen we weer in Amsterdam?", FLIGHTS.inbound.arriveTime, times));
  push(make("Welke airline vliegen we?", "KM Malta Airlines", ["KLM", "Ryanair", "Air Malta", "easyJet"]));
  push(make("Hoe laat is de transfer naar het vliegveld?", "05:15", times));
  push(make("Wanneer opent de check-in voor KM395?", "vr 2 okt, 11:50", ["do 1 okt, 11:50", "za 3 okt, 08:00", "vr 2 okt, 07:25"]));
  push(make("Wie gaan er mee?", PASSENGERS.join(" & "), ["Erik & Martijn", "Benno & Tim", "Erik & Sanne"]));
  push(make("Wat doen we zaterdagavond in Valletta?", "Valletta: Notte Bianca", acts));
  push(make("Is Notte Bianca gratis?", "Ja, geen ticket", ["Nee, €15", "Nee, MFA-ticket", "Alleen met Heritage-pas"]));
  push(make("Wat bezoeken we zondag om 10:30?", "St. Paul’s Catacombs", acts));
  push(make("Wat kost St. Paul’s Catacombs (volw.)?", "€15", ["€3", "€20", "€10", "gratis"]));
  push(make("Wat bezoeken we maandag om 10:00?", "Lascaris War Rooms", acts));
  push(make("Wat kost Lascaris (volw.)?", "€20", ["€15", "€3", "€10", "gratis"]));
  push(make("Hoe laat is de Saluting Battery?", "12:00", times));
  push(make("Wat kost de Saluting Battery?", "€3", ["€15", "€20", "gratis", "€10"]));
  push(make("Hoe gaan we van Valletta naar Birgu?", "Dgħajsa naar Birgu", acts));
  push(make("Waar gaan we dinsdagochtend naartoe?", "Naar Mellieħa Bay", acts));
  push(make("Wat doen we met de speedboot?", "Speedboot: Comino / Blue Lagoon / Crystal Lagoon", acts));
  push(make("Hoe laat staan we woensdag op?", "04:45", times));
  push(make("Wat is Defected @ UNO?", "Optie A zondagavond", ["Optie B zondagavond", "Dinsdagavond Anjunadeep", "Notte Bianca"]));
  push(make("Wat is Anjunadeep op deze trip?", "Optie A dinsdagavond", ["Zondagavond in UNO", "Notte Bianca", "Malta Classic"]));

  const unique = new Map<string, QuizQuestionInternal>();
  for (const q of bank) {
    if (!unique.has(q.question)) unique.set(q.question, q);
  }
  let round = shuffle([...unique.values()], rand).slice(0, 5);
  const extra = SILENT_EXTRA_BY_DATE[date]?.(rand);
  if (extra) {
    const at = Math.floor(rand() * (round.length + 1));
    round = [...round.slice(0, at), extra, ...round.slice(at)];
  }
  const bonus = bonusForDate(date, rand);
  return bonus ? [...round, bonus] : round;
}
