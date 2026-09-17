const TRIP_START = "2026-10-03";
const TRIP_END = "2026-10-06"; // wo 7 okt 07:25 vertrek — overdag telt niet mee
const MALTA_TZ = "Europe/Malta";
const UA = "GoAwayDay/1.0 (https://go-away-day.vercel.app)";
const LISTING_PAGES = [
  "https://manicmalta.com/events/month/october/",
  "https://manicmalta.com/events/month/october/page/2/",
  "https://manicmalta.com/events/month/october/page/3/",
  "https://manicmalta.com/events/month/october/page/4/",
  "https://manicmalta.com/events/month/october/page/5/",
  "https://manicmalta.com/events/month/october/page/6/",
];

export type UpdateKind = "activiteit";

export type UpdateItem = {
  id: string;
  kind: UpdateKind;
  title: string;
  body: string;
  href?: string;
  source?: string;
};

export type DailyBriefing = {
  date: string;
  checkedAt: string;
  headline: string;
  items: UpdateItem[];
  live: boolean;
};

const NL_DATE = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "short",
  timeZone: MALTA_TZ,
});

const NL_TIME = new Intl.DateTimeFormat("nl-NL", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: MALTA_TZ,
});

const NL_WEEKDAY = new Intl.DateTimeFormat("nl-NL", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: MALTA_TZ,
});

export function formatBriefingDate(iso: string): string {
  return NL_DATE.format(new Date(`${iso}T12:00:00+02:00`));
}

export function formatCheckedAt(iso: string): string {
  const d = new Date(iso);
  return `${NL_DATE.format(d)} · ${NL_TIME.format(d)}`;
}

function maltaNowParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: MALTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}` };
}

function stripHtml(raw: string) {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const MONTH: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseDateRange(raw: string): { start: string; end: string } | null {
  const s = stripHtml(raw);
  let m = s.match(/^(\d{1,2})-(\d{1,2})\s+([A-Za-z]{3})\s+(20\d{2})$/);
  if (m) {
    const month = MONTH[m[3].toLowerCase()];
    const y = Number(m[4]);
    if (!month) return null;
    return { start: iso(y, month, Number(m[1])), end: iso(y, month, Number(m[2])) };
  }
  m = s.match(/^(\d{1,2})\s+([A-Za-z]{3})\s*[-–]\s*(\d{1,2})\s+([A-Za-z]{3})\s+(20\d{2})$/);
  if (m) {
    const y = Number(m[5]);
    const a = MONTH[m[2].toLowerCase()];
    const b = MONTH[m[4].toLowerCase()];
    if (!a || !b) return null;
    return { start: iso(y, a, Number(m[1])), end: iso(y, b, Number(m[3])) };
  }
  m = s.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(20\d{2})$/);
  if (m) {
    const month = MONTH[m[2].toLowerCase()];
    const y = Number(m[3]);
    if (!month) return null;
    const day = iso(y, month, Number(m[1]));
    return { start: day, end: day };
  }
  return null;
}

function daySpan(start: string, end: string) {
  return Math.round((Date.parse(`${end}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86_400_000);
}

function formatWhen(start: string, end: string) {
  if (start === end) return NL_WEEKDAY.format(new Date(`${start}T12:00:00+02:00`));
  return `${NL_DATE.format(new Date(`${start}T12:00:00+02:00`))} – ${NL_DATE.format(new Date(`${end}T12:00:00+02:00`))}`;
}

type ScrapedEvent = {
  title: string;
  place: string;
  start: string;
  end: string;
  excerpt: string;
  href: string;
};

const SKIP =
  /early stages|main stages|tinies|kinder kids|oceankids|beyblade|baby talks|toi toi baby|9-11 years|12\+ years|14\+ years|notte bianca|defected|andorra|anjunadeep|malta classic|mdina grand prix|david morales|todd terry|ferreck dawn|rya |gmdss|stcw|boat master|officer in charge|nautical licence|wsop|conference|summit|student jobs|home pro|dissecting red flags|skills course|digital workshop|certificate in project|tech wreck|painting retreat|allura by venus|mcast freshers|general admission|oceanman|oceanteams|sprint 2 km|half oceanman|diving holiday|mac pre-festival|transport malta|use of leadership|ewfonija|marsalforn|gozo/i;

const SKIP_TITLE =
  /^(september|sundays|4 october|13th anniversary|casual commander|up in the air|the beach day ticket|music hidedout|sci_art|captured moments)$/i;

const ARRIVAL_TOO_EARLY =
  /climb|wied babu|eurobirdwatch|food forest|oceanman|branch to bottle/i;

function keepEvent(ev: ScrapedEvent) {
  if (ev.end < TRIP_START || ev.start > TRIP_END) return false;
  if (SKIP.test(`${ev.title} ${ev.excerpt}`)) return false;
  if (SKIP_TITLE.test(ev.title.trim())) return false;
  if (ev.title.length < 4 || ev.title.length > 90) return false;
  const span = daySpan(ev.start, ev.end);
  const startsInTrip = ev.start >= TRIP_START && ev.start <= TRIP_END;
  const startsEve = ev.start >= "2026-10-02" && ev.start < TRIP_START;
  if (!startsInTrip && !startsEve) return false;
  if (!startsInTrip && span > 4) return false;
  if (startsInTrip && span > 7) return false;
  if (ev.start === TRIP_START && ARRIVAL_TOO_EARLY.test(ev.title)) return false;
  return true;
}

function category(ev: ScrapedEvent) {
  const blob = `${ev.title} ${ev.excerpt}`.toLowerCase();
  if (/\b(hike|trail run|fun walk|v19k)\b/.test(blob)) return "hike";
  if (/\bfesta\b/.test(blob)) return "festa";
  if (/\b(theatre live|misanthrope|opera live|the maids|queen at sea)\b/.test(blob)) return "screen";
  if (/\b(workshop|knitting|embroidery|baking|salsa|yoga|class|padel)\b/.test(blob)) return "les";
  return "overig";
}

function scoreEvent(ev: ScrapedEvent) {
  const blob = `${ev.title} ${ev.place} ${ev.excerpt}`.toLowerCase();
  let n = 1;
  if (
    /\b(workshop|class|festa|kayak|hike|yoga|salsa|knitting|baking|embroidery|flamenco|padel|pottery|pottenbak|concert|theatre|theater|jazz|comedy|maker faire|villa frere)\b/.test(
      blob,
    )
  ) {
    n += 4;
  }
  if (/\b(sliema|valletta|st\.? julian|spinola|gżira|gzira|pieta|pietà|mdina|rabat|birgu)\b/.test(blob)) n += 3;
  if (/\b(gozo|marsalforn|victoria)\b/.test(blob)) n -= 2;
  if (ev.start === ev.end) n += 1;
  return n;
}

function diversify(events: ScrapedEvent[]) {
  const used: Record<string, number> = {};
  const cap: Record<string, number> = { hike: 1, festa: 2, screen: 1, les: 4, overig: 4 };
  const out: ScrapedEvent[] = [];
  for (const ev of [...events].sort((a, b) => scoreEvent(b) - scoreEvent(a))) {
    const cat = category(ev);
    if ((used[cat] ?? 0) >= (cap[cat] ?? 3)) continue;
    used[cat] = (used[cat] ?? 0) + 1;
    out.push(ev);
    if (out.length >= 9) break;
  }
  return out;
}

const CARD_RE =
  /<a class="mm-card[^"]*"\s+href="(\/events\/event\/[^"]+)"[\s\S]*?<h3 class="mm-card__title">(.*?)<\/h3>[\s\S]*?(?:<span class="mm-card__loc">(.*?)<\/span>)?[\s\S]*?<span>(\d[^<]*20\d{2})<\/span>[\s\S]*?(?:<p class="mm-card__excerpt">(.*?)<\/p>)?/gi;

async function readListing(url: string): Promise<ScrapedEvent[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 1800 },
  });
  if (!res.ok) return [];
  const html = (await res.text()).replace(/<script[\s\S]*?<\/script>/gi, " ");
  const out: ScrapedEvent[] = [];
  const cardRe = new RegExp(CARD_RE.source, "gi");
  for (const m of html.matchAll(cardRe)) {
    const range = parseDateRange(m[4] ?? "");
    if (!range) continue;
    out.push({
      title: stripHtml(m[2] ?? ""),
      place: stripHtml(m[3] ?? ""),
      start: range.start,
      end: range.end,
      excerpt: stripHtml(m[5] ?? ""),
      href: `https://manicmalta.com${m[1]}`,
    });
  }
  return out;
}

function toItem(ev: ScrapedEvent): UpdateItem {
  const when = formatWhen(ev.start, ev.end);
  const place = ev.place || "";
  const bits = [when, place].filter(Boolean).join(" · ");
  const body = [bits, ev.excerpt].filter(Boolean).join(". ");
  const key = ev.title.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 28);
  return {
    id: `act-${ev.start}-${key}`,
    kind: "activiteit",
    title: ev.title,
    body: body || bits,
    href: ev.href,
    source: "Manic Malta",
  };
}

const PADEL: UpdateItem = {
  id: "act-padel-valletta",
  kind: "activiteit",
  title: "Padel in de gracht van Valletta",
  body: "1 Padel Malta, Valletta Ditch. Drop-in via Playtomic, ook ’s avonds. Rackets ter plekke.",
  href: "https://playtomic.io/tenant/1-padel-malta-valletta",
  source: "1 Padel Malta",
};

async function fetchActivityItems(): Promise<UpdateItem[]> {
  const lists = await Promise.all(LISTING_PAGES.map((url) => readListing(url).catch(() => [] as ScrapedEvent[])));
  const seen = new Set<string>();
  const unique: ScrapedEvent[] = [];
  for (const ev of lists.flat()) {
    if (!keepEvent(ev)) continue;
    const key = ev.title.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 28);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(ev);
  }

  const live = diversify(unique).map(toItem);
  const have = new Set(live.map((i) => i.title.toLowerCase().slice(0, 24)));
  const extras = SEED_BRIEFING.items.filter((s) => !have.has(s.title.toLowerCase().slice(0, 24)));
  const items = [...live, ...extras].filter((i, idx, arr) => arr.findIndex((x) => x.title === i.title) === idx);
  if (!items.some((i) => /padel/i.test(i.title))) items.splice(Math.min(2, items.length), 0, PADEL);
  return items.slice(0, 10);
}

/** Fallback: activiteiten 3–7 okt 2026, geen herhaling van de dagplanning. */
export const SEED_BRIEFING: DailyBriefing = {
  date: "2026-09-17",
  checkedAt: "2026-09-17T08:00:00.000Z",
  headline: "10 nieuwe activiteiten",
  live: false,
  items: [
    {
      id: "act-festa-sliema",
      kind: "activiteit",
      title: "Festa Our Lady of the Rosary — Sliema",
      body: "Zo 4 okt · Tas-Sliema. Dorpsfeest pal bij het hotel: processie, bands en vuurwerk.",
      href: "https://manicmalta.com/events/event/festa-our-lady-of-the-rosary-tas-sliema-2026/",
      source: "Manic Malta",
    },
    {
      id: "act-flamenco",
      kind: "activiteit",
      title: "Puerto Flamenco",
      body: "Za 3 okt · 20:00 · Teatru Salesjan, Sliema. Live flamenco, parterre vanaf €30. Krap na het diner, voor Notte Bianca.",
      href: "https://manicmalta.com/events/event/puerto-flamenco-teatru-salesjan-2026/",
      source: "Teatru Salesjan",
    },
    {
      id: "act-baking",
      kind: "activiteit",
      title: "Baking workshop",
      body: "Za 3 okt. Kleine bakles — check tijd, want we landen pas 14:55.",
      href: "https://manicmalta.com/events/month/october/",
      source: "Manic Malta",
    },
    {
      id: "act-embroidery",
      kind: "activiteit",
      title: "Embroidery Saturday Afternoon",
      body: "Za 3 okt, middag. Borduren — zo klein als het klinkt.",
      href: "https://manicmalta.com/events/month/october/",
      source: "Manic Malta",
    },
    {
      id: "act-villa-frere",
      kind: "activiteit",
      title: "Villa Frere tuinen open",
      body: "Zo 4 okt · Pietà. Zeldzame eerste-zondag opening van de terrastuinen.",
      href: "https://manicmalta.com/events/event/experience-villa-frere-2026/",
      source: "Manic Malta",
    },
    {
      id: "act-kayak",
      kind: "activiteit",
      title: "Sunset kayaking",
      body: "Zo 4 okt. Kajak bij zonsondergang — voor de wedstrijd om 18:00 is het krap, daarna te donker.",
      href: "https://manicmalta.com/events/month/october/",
      source: "Manic Malta",
    },
    {
      id: "act-salsa",
      kind: "activiteit",
      title: "Cuban salsa voor beginners — San Ġwann",
      body: "Ma 5 okt. Beginnersles salsa.",
      href: "https://manicmalta.com/events/month/october/",
      source: "Manic Malta",
    },
    {
      id: "act-knitting",
      kind: "activiteit",
      title: "Knitting course",
      body: "Ma 5 okt. Brei-avond / les.",
      href: "https://manicmalta.com/events/month/october/",
      source: "Manic Malta",
    },
    {
      id: "act-yoga",
      kind: "activiteit",
      title: "Power yoga",
      body: "Di 6 okt. Losse yogales.",
      href: "https://manicmalta.com/events/month/october/",
      source: "Manic Malta",
    },
    PADEL,
  ],
};

export async function gatherLiveUpdates(now = new Date()): Promise<DailyBriefing> {
  const { date } = maltaNowParts(now);
  const items = await fetchActivityItems().catch(() => [] as UpdateItem[]);
  const live = items.length > 0;
  const list = live ? items : SEED_BRIEFING.items;
  const n = list.length;
  return {
    date,
    checkedAt: now.toISOString(),
    headline: n === 1 ? "1 nieuwe activiteit" : `${n} nieuwe activiteiten`,
    items: list,
    live,
  };
}

export async function fetchDailyBriefing(): Promise<DailyBriefing> {
  try {
    const res = await fetch("/api/updates", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as DailyBriefing;
      if (data?.items?.length) return data;
    }
  } catch {
    /* static export / offline */
  }
  return SEED_BRIEFING;
}
