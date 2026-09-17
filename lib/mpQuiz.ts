import { fromZonedTime } from "date-fns-tz";
import { FLIGHTS, HOTEL, MALTA_DAYS, PASSENGERS, type DayItem, type TripDay } from "@/lib/maltaTrip";
import { daysUntilDeparture } from "@/lib/maltaWeather";

export type QuizPlayer = "erik" | "benno";

export type QuizQuestion = {
  question: string;
  choices: string[];
};

export type QuizQuestionInternal = QuizQuestion & { correct: number };

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
  return fromZonedTime(`${date}T10:00:00`, TZ);
}

export function todayTenAmsterdam(now = new Date()): Date {
  return tenOn(quizDate(now));
}

export function quizUnlockedToday(now = new Date()): boolean {
  return quizStillOpen(now) && now.getTime() >= todayTenAmsterdam(now).getTime();
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

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function four(correct: string, pool: string[]): string[] {
  const rest = shuffle(pool.filter((p) => p.trim() && p !== correct)).slice(0, 3);
  const filler = ["Paceville", "Mdina", "Comino", "Birgu", "Schiphol", "Gozo"];
  let i = 0;
  while (rest.length < 3) {
    const extra = filler[i++] ?? `Anders ${rest.length}`;
    if (extra !== correct && !rest.includes(extra)) rest.push(extra);
  }
  return shuffle([correct, ...rest]);
}

function pack(question: string, answer: string, pool: string[]): QuizQuestionInternal | null {
  if (!answer) return null;
  const choices = four(answer, pool);
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

export function generateMpRound(): QuizQuestionInternal[] {
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
        push(pack(`Wat doen we ${day.weekday.toLowerCase()} om ${item.time}?`, item.text, acts));
      }
      if (item.time !== "Extra") {
        push(pack(`Hoe laat is: ${item.text}?`, item.time, times));
      }
    }
    const after = lunchFollowUp(day);
    if (after) {
      push(pack(`Wat doen we op ${day.weekday.toLowerCase()} na de lunch?`, after.text, acts));
    }
    const extra = day.extras?.[0];
    if (extra) {
      push(
        pack(
          `Wat staat er als extra op ${day.weekday.toLowerCase()}?`,
          extra.text,
          (day.extras ?? []).map((e) => e.text).concat(acts),
        ),
      );
    }
    const choiceA = day.items.find((i) => i.choice === "A");
    const choiceB = day.items.find((i) => i.choice === "B");
    if (choiceA && choiceB) {
      push(pack(`Wat is optie A op ${day.weekday.toLowerCase()}avond?`, choiceA.text, [choiceB.text, ...acts]));
      push(pack(`Wat is optie B op ${day.weekday.toLowerCase()}avond?`, choiceB.text, [choiceA.text, ...acts]));
    }
  }

  push(pack("Tegen wie speelt Malta?", "Andorra", ["Gibraltar", "Italië", "Nederland", "Luxemburg", "Spanje"]));
  push(pack("Tegen wie speelt Andorra?", "Malta", ["Gibraltar", "Italië", "Nederland", "San Marino", "Cyprus"]));
  push(pack("Waar is Malta – Andorra?", "National Stadium, Ta’ Qali", ["Fort St. Elmo", "Marsa", "UNO", "Mdina"]));
  push(pack("Hoe laat fluit Malta – Andorra?", "18:00", times));
  push(pack("Op welke dag is de interland?", "Zondag 4 oktober", ["Zaterdag 3 oktober", "Maandag 5 oktober", "Dinsdag 6 oktober"]));
  push(pack("Hoe heet ons hotel?", HOTEL.name, ["The Palace", "Hilton Malta", "Phoenicia", "AX The Victoria"]));
  push(pack("In welke plaats ligt het hotel?", HOTEL.place, ["Valletta", "St. Julian’s", "Mdina", "Birgu"]));
  push(pack("Wat is het adres van het hotel?", HOTEL.address, ["Republic Street, Valletta", "The Strand, Gżira", "St. George’s Bay", "Pjazza San Ġwann"]));
  push(pack("Wat kost het hotel in totaal?", HOTEL.total, ["€560", "€980", "€380", "€1.200"]));
  push(pack("Wat betalen we nog bij check-in?", "€380", ["€190", "€760", "€0", "€120"]));
  push(pack("Hoe laat is het ontbijt?", "07:30 – 09:30", ["06:00 – 08:00", "08:00 – 11:00", "07:00 – 10:30"]));
  push(pack("Welk vluchtnummer is de heenreis?", FLIGHTS.outbound.flightNumber, ["KM394", "KL1691", "FR3892", "BA2614"]));
  push(pack("Welk vluchtnummer is de terugreis?", FLIGHTS.inbound.flightNumber, ["KM395", "KL1692", "FR3893", "BA2615"]));
  push(pack("Hoe laat vertrekt KM395 van Schiphol?", FLIGHTS.outbound.departTime, times));
  push(pack("Hoe laat landen we op Malta?", FLIGHTS.outbound.arriveTime, times));
  push(pack("Hoe laat vertrekt KM394 van Malta?", FLIGHTS.inbound.departTime, times));
  push(pack("Hoe laat landen we weer in Amsterdam?", FLIGHTS.inbound.arriveTime, times));
  push(pack("Welke airline vliegen we?", "KM Malta Airlines", ["KLM", "Ryanair", "Air Malta", "easyJet"]));
  push(pack("Hoe laat is de transfer naar het vliegveld?", "05:15", times));
  push(pack("Wanneer opent de check-in voor KM395?", "vr 2 okt, 11:50", ["do 1 okt, 11:50", "za 3 okt, 08:00", "vr 2 okt, 07:25"]));
  push(pack("Wie gaan er mee?", PASSENGERS.join(" & "), ["Erik & Martijn", "Benno & Tim", "Erik & Sanne"]));
  push(pack("Wat doen we zaterdagavond in Valletta?", "Valletta: Notte Bianca", acts));
  push(pack("Is Notte Bianca gratis?", "Ja, geen ticket", ["Nee, €15", "Nee, MFA-ticket", "Alleen met Heritage-pas"]));
  push(pack("Wat bezoeken we zondag om 10:30?", "St. Paul’s Catacombs", acts));
  push(pack("Wat kost St. Paul’s Catacombs (volw.)?", "€15", ["€3", "€20", "€10", "gratis"]));
  push(pack("Wat bezoeken we maandag om 10:00?", "Lascaris War Rooms", acts));
  push(pack("Wat kost Lascaris (volw.)?", "€20", ["€15", "€3", "€10", "gratis"]));
  push(pack("Hoe laat is de Saluting Battery?", "12:00", times));
  push(pack("Wat kost de Saluting Battery?", "€3", ["€15", "€20", "gratis", "€10"]));
  push(pack("Hoe gaan we van Valletta naar Birgu?", "Dgħajsa naar Birgu", acts));
  push(pack("Waar gaan we dinsdagochtend naartoe?", "Naar Mellieħa Bay", acts));
  push(pack("Wat doen we met de speedboot?", "Speedboot: Comino / Blue Lagoon / Crystal Lagoon", acts));
  push(pack("Hoe laat staan we woensdag op?", "04:45", times));
  push(pack("Wat is Defected @ UNO?", "Optie A zondagavond", ["Optie B zondagavond", "Dinsdagavond Anjunadeep", "Notte Bianca"]));
  push(pack("Wat is Anjunadeep op deze trip?", "Optie A dinsdagavond", ["Zondagavond in UNO", "Notte Bianca", "Malta Classic"]));

  const unique = new Map<string, QuizQuestionInternal>();
  for (const q of bank) {
    if (!unique.has(q.question)) unique.set(q.question, q);
  }
  return shuffle([...unique.values()]).slice(0, 5);
}
