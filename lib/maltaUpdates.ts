import { daysUntilDeparture, weatherCodeLabel } from "@/lib/maltaWeather";

export type UpdateKind = "planning" | "weer" | "malta";

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

const MALTA_TZ = "Europe/Malta";
const FEEDS = [
  { url: "https://lovinmalta.com/feed", source: "Lovin Malta" },
  { url: "https://ohmymalta.com.mt/feed", source: "Oh My Malta" },
];
const UA = "GoAwayDay/1.0 (https://go-away-day.vercel.app)";

const SKIP_NEWS =
  /lawsuit|psycho|commenter|bursts into flames|car bursts|ricky caruana|won.?t forgive|threatens every|theft|homeless|murder|rape|arrested|accused|court case|pension boost|facebook and instagram|media battle|dominance in facebook/i;

const PLANNING_NEWS =
  /notte bianca|andorra|defected|anjunadeep|heritage malta|km malta|airline|airport|flight|ferry|paceville|ta.?qali|nations league|football|voetbal|carlton|sliema|mdina|rabat|birgu|valletta|comino|blue lagoon|mellieha|ticket/i;

const WEATHER_NEWS =
  /storm|weather|drought|rain|shower|waterspout|heat|flood|buien|droogte|wind|wet week|goodbye drought/i;

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
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function stripXml(raw: string) {
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

function tag(block: string, name: string) {
  const m = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "i"));
  return m ? stripXml(m[1]) : "";
}

function daysCopy(days: number) {
  if (days > 1) return `${days} dagen tot KM395`;
  if (days === 1) return "Morgen vliegen we";
  if (days === 0) return "Vandaag is de heenreis";
  if (days >= -4) return "We zijn op Malta";
  return "De trip is geweest";
}

function planningNotes(now: Date): UpdateItem[] {
  const days = daysUntilDeparture(now);
  const items: UpdateItem[] = [
    {
      id: "planning-countdown",
      kind: "planning",
      title: daysCopy(days),
      body:
        days > 0
          ? `Zaterdag 3 oktober, KM395 van Schiphol 11:50 → Malta 14:55. Daarna inchecken bij de Carlton in Sliema.`
          : days === 0
            ? `KM395 vertrekt 11:50 van Schiphol, landing 14:55. Avond: diner in Sliema en Notte Bianca in Valletta.`
            : `Carlton Hotel Sliema · dagplanning staat in het tablad hieronder.`,
    },
  ];

  if (days > 7 && days <= 28) {
    items.push({
      id: "planning-tickets-andorra",
      kind: "planning",
      title: "Tickets Malta – Andorra",
      body: `Zondag 4 oktober, 18:00, National Stadium Ta’ Qali. MFA zet kaarten meestal 2–4 weken van tevoren in de verkoop — dit is het moment om te checken.`,
      href: "https://tickets.mfa.com.mt/",
      source: "Malta FA",
    });
  }

  if (days >= 0 && days <= 21) {
    items.push({
      id: "planning-notte",
      kind: "planning",
      title: "Notte Bianca blijft staan",
      body: `Zaterdag 3 oktober, Valletta vanaf 19:00 tot middernacht. Gratis / geen ticket. Van Sliema met de ferry of een taxi. Dagprogramma dichterbij nog even nalopen.`,
      href: "https://www.festivalfinder.eu/festivals/notte-bianca-5",
      source: "Notte Bianca",
    });
  }

  if (days >= 2 && days <= 10) {
    items.push({
      id: "planning-checkin",
      kind: "planning",
      title: "Check-in KM395",
      body: `Online check-in opent vrijdag 2 oktober om 11:50. Terugvlucht KM394: check-in di 6 okt 07:25, transfer 05:15, vertrek 07:25.`,
      href: "https://www.kmmaltaairlines.com",
      source: "KM Malta Airlines",
    });
  }

  if (days >= 0 && days <= 14) {
    items.push({
      id: "planning-defected",
      kind: "planning",
      title: "Defected @ UNO",
      body: `Zondagavond is optie A: Defected in UNO, vanaf ca. €35 + booking fee. Optie B is Paceville / St. Julian’s. Kaarten op tijd checken als jullie A doen.`,
      href: "https://malta.defected.com/book-2026-tickets",
      source: "Defected",
    });
  }

  return items;
}

type OpenMeteoNow = {
  current?: {
    time: string;
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    precipitation: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
    wind_speed_10m_max: number[];
  };
};

async function fetchWeatherItems(): Promise<UpdateItem[]> {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=35.91&longitude=14.51" +
    "&current=temperature_2m,weather_code,wind_speed_10m,precipitation" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max" +
    "&timezone=Europe%2FMalta&forecast_days=5";
  const res = await fetch(url, { signal: AbortSignal.timeout(8000), next: { revalidate: 1800 } });
  if (!res.ok) return [];
  const data = (await res.json()) as OpenMeteoNow;
  const cur = data.current;
  const daily = data.daily;
  if (!cur || !daily?.time?.length) return [];

  const nowLabel = weatherCodeLabel(cur.weather_code);
  const temp = Math.round(cur.temperature_2m);
  const wind = Math.round(cur.wind_speed_10m);
  const items: UpdateItem[] = [
    {
      id: "weer-nu",
      kind: "weer",
      title: `Nu in Sliema: ${temp}° · ${nowLabel.toLowerCase()}`,
      body: `Wind ${wind} km/u${cur.precipitation ? `, ${cur.precipitation} mm neerslag` : ", droog"}. Zeewater nog zomerachtig, zo’n 24°.`,
      href: "https://weather.apple.com/?lat=35.9126&long=14.5020",
      source: "Open-Meteo",
    },
  ];

  const highs = daily.temperature_2m_max.map((n) => Math.round(n));
  const maxHigh = Math.max(...highs);
  const minHigh = Math.min(...highs);
  const rainPeak = Math.max(...daily.precipitation_probability_max.map((n) => Math.round(n)));
  const days = daily.time.map((date, i) => {
    const label = NL_DATE.format(new Date(`${date}T12:00:00+02:00`));
    return `${label} ${Math.round(daily.temperature_2m_max[i])}°`;
  });

  items.push({
    id: "weer-dagen",
    kind: "weer",
    title: `Komende dagen ${minHigh}–${maxHigh}°`,
    body:
      `${days.join(" · ")}. Max. regenkans ${rainPeak}%. ` +
      (daysUntilDeparture() > 7
        ? `Echte tripverwachting voor 3–7 okt volgt over ${daysUntilDeparture() - 7} dagen.`
        : `De tripweek staat in het tablad Weer.`),
    href: "https://weather.apple.com/?lat=35.9126&long=14.5020",
    source: "Open-Meteo",
  });

  return items;
}

type RssItem = { title: string; href: string; source: string; date?: string };

async function readFeed(url: string, source: string): Promise<RssItem[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml" },
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 1800 },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 12).map((m) => ({
    title: tag(m[1], "title"),
    href: tag(m[1], "link"),
    source,
    date: tag(m[1], "pubDate"),
  }));
}

function newsKind(title: string): UpdateKind | null {
  if (SKIP_NEWS.test(title)) return null;
  if (WEATHER_NEWS.test(title)) return "weer";
  if (PLANNING_NEWS.test(title)) return "planning";
  return "malta";
}

function newsScore(title: string, kind: UpdateKind) {
  let n = kind === "weer" ? 4 : kind === "planning" ? 3 : 1;
  if (
    /\b(festival|exhibition|restaurant|harbour|ranked|museum|fish fest|storm|drought|weather|football|concert|ticket|airline|gozo|valletta|sliema|mdina|rabat|birgu|notte|andorra|defected)\b/i.test(
      title,
    )
  ) {
    n += 3;
  }
  return n;
}

function cleanTitle(title: string) {
  return title.replace(/\s*\|\s*Lovin Malta\s*$/i, "").trim();
}

async function fetchNewsItems(): Promise<UpdateItem[]> {
  const lists = await Promise.all(FEEDS.map((f) => readFeed(f.url, f.source).catch(() => [] as RssItem[])));
  const seen = new Set<string>();
  const picked: { score: number; item: UpdateItem }[] = [];

  for (const row of lists.flat()) {
    if (!row.title) continue;
    const kind = newsKind(row.title);
    if (!kind) continue;
    const title = cleanTitle(row.title);
    const key = title.toLowerCase().slice(0, 48);
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push({
      score: newsScore(title, kind),
      item: {
        id: `news-${picked.length}-${key.replace(/[^a-z0-9]+/g, "").slice(0, 24)}`,
        kind,
        title,
        body: `Uit ${row.source}${row.date ? ` · ${formatRssDate(row.date)}` : ""}.`,
        href: row.href || undefined,
        source: row.source,
      },
    });
  }

  return picked
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((row) => row.item);
}

function formatRssDate(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return NL_DATE.format(d);
}

function headlineFor(items: UpdateItem[], days: number, date: string) {
  const weer = items.find((i) => i.id === "weer-nu");
  const dayBit = daysCopy(days).replace(" tot KM395", "");
  if (weer) {
    const temp = weer.title.match(/(\d+)°/)?.[1];
    return temp ? `${formatBriefingDate(date)} · ${dayBit} · ${temp}°` : `${formatBriefingDate(date)} · ${dayBit}`;
  }
  return `${formatBriefingDate(date)} · ${dayBit}`;
}

/** Snapshot 17 sep 2026 — fallback als RSS/weer even niet meewerken. */
export const SEED_BRIEFING: DailyBriefing = {
  date: "2026-09-17",
  checkedAt: "2026-09-17T08:00:00.000Z",
  headline: "17 sep · 16 dagen · 25°",
  live: false,
  items: [
    {
      id: "planning-countdown",
      kind: "planning",
      title: "16 dagen tot KM395",
      body: "Zaterdag 3 oktober, KM395 van Schiphol 11:50 → Malta 14:55. Daarna inchecken bij de Carlton in Sliema.",
    },
    {
      id: "planning-tickets-andorra",
      kind: "planning",
      title: "Tickets Malta – Andorra",
      body: "Zondag 4 oktober, 18:00, National Stadium Ta’ Qali. MFA zet kaarten meestal 2–4 weken van tevoren in de verkoop — dit is het moment om te checken.",
      href: "https://tickets.mfa.com.mt/",
      source: "Malta FA",
    },
    {
      id: "planning-notte",
      kind: "planning",
      title: "Notte Bianca blijft staan",
      body: "Zaterdag 3 oktober, Valletta vanaf 19:00 tot middernacht. Gratis / geen ticket. Van Sliema met de ferry of een taxi.",
      href: "https://www.festivalfinder.eu/festivals/notte-bianca-5",
      source: "Notte Bianca",
    },
    {
      id: "weer-nu",
      kind: "weer",
      title: "Nu in Sliema: 25° · helder",
      body: "Na een natte week (einde van ~120 droge dagen, waterspout bij Golden Bay op 16 sep) is het weer droog. Wind 2 km/u.",
      href: "https://weather.apple.com/?lat=35.9126&long=14.5020",
      source: "Open-Meteo",
    },
    {
      id: "weer-dagen",
      kind: "weer",
      title: "Komende dagen 30–31°",
      body: "17 sep 30° · 18 sep 31° · 19 sep 31° · 20 sep 31°. Kans op een bui in het weekend tot zo’n 40%. Echte tripverwachting volgt over 9 dagen.",
      source: "Open-Meteo",
    },
    {
      id: "news-rank",
      kind: "malta",
      title: "Malta bij de top 10 landen om te wonen in 2026",
      body: "Lovin Malta, 16 september.",
      href: "https://lovinmalta.com/news/local/malta-ranked-among-worlds-top-10-countries-to-live-in-for-2026/",
      source: "Lovin Malta",
    },
    {
      id: "news-ion",
      kind: "malta",
      title: "ION Harbour is terug, met een nieuwe look",
      body: "Restaurant aan de haven — mogelijk een optie als jullie in Sliema / Valletta Waterfront eten.",
      href: "https://lovinmalta.com/news/ion-harbour-is-back-with-a-new-look-and-possibly-maltas-most-romantic-table/",
      source: "Lovin Malta",
    },
    {
      id: "news-fishfest",
      kind: "malta",
      title: "Malta Fish Fest in Marsaxlokk, zondag 20 september",
      body: "Nog voor de trip, maar leuk als sfeerpeiling voor het zuiden.",
      href: "https://ohmymalta.com.mt/2026/09/16/malta-fish-fest-returns-to-marsaxlokk-this-sunday/",
      source: "Oh My Malta",
    },
    {
      id: "news-km",
      kind: "planning",
      title: "KM Malta schrapte 8 sep Londen-vluchten (NATS)",
      body: "Dat ging om de UK-lijn, niet om AMS. KM395/KM394 staan nog gewoon. Dichter bij 3 okt nog even de status checken.",
      href: "https://www.kmmaltaairlines.com",
      source: "KM Malta Airlines",
    },
  ],
};

export async function gatherLiveUpdates(now = new Date()): Promise<DailyBriefing> {
  const { date } = maltaNowParts(now);
  const days = daysUntilDeparture(now);
  const planning = planningNotes(now);

  const [weather, news] = await Promise.all([
    fetchWeatherItems().catch(() => [] as UpdateItem[]),
    fetchNewsItems().catch(() => [] as UpdateItem[]),
  ]);

  const live = weather.length + news.length > 0;
  const merged = [...planning, ...weather, ...news];
  const items = live ? merged.slice(0, 12) : SEED_BRIEFING.items;

  return {
    date,
    checkedAt: now.toISOString(),
    headline: live ? headlineFor(items, days, date) : SEED_BRIEFING.headline,
    items,
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
