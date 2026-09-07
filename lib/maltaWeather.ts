export type DayWeather = {
  date: string;
  max: number;
  min: number;
  label: string;
  rainChance: number;
  wind: number;
  source: "schatting" | "verwachting";
};

export const TRIP_WEATHER_DATES = [
  "2026-10-03",
  "2026-10-04",
  "2026-10-05",
  "2026-10-06",
  "2026-10-07",
] as const;

export const DEPARTURE_DATE = "2026-10-03";
export const FORECAST_DAYS_AHEAD = 7;

/** Typisch begin-oktober in Malta (klimaat, geen echte forecast). */
export const ESTIMATED_WEATHER: DayWeather[] = [
  { date: "2026-10-03", max: 26, min: 20, label: "Zonnig", rainChance: 10, wind: 18, source: "schatting" },
  { date: "2026-10-04", max: 25, min: 20, label: "Licht bewolkt", rainChance: 15, wind: 16, source: "schatting" },
  { date: "2026-10-05", max: 24, min: 19, label: "Zonnig", rainChance: 10, wind: 14, source: "schatting" },
  { date: "2026-10-06", max: 25, min: 20, label: "Zonnig", rainChance: 5, wind: 12, source: "schatting" },
  { date: "2026-10-07", max: 24, min: 19, label: "Half bewolkt", rainChance: 20, wind: 20, source: "schatting" },
];

export const SEA_TEMP_ESTIMATE = 24;

/** Sliema / Carlton Hotel — opent de iPhone Weer-app via Apple universal link. */
export const WEATHER_APP_URL =
  "https://weather.apple.com/?lat=35.9126&long=14.5020";

export function daysUntilDeparture(now = new Date()): number {
  const depart = new Date(`${DEPARTURE_DATE}T00:00:00+02:00`);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((depart.getTime() - today.getTime()) / 86_400_000);
}

export function shouldUseRealForecast(now = new Date()): boolean {
  const days = daysUntilDeparture(now);
  return days <= FORECAST_DAYS_AHEAD;
}

function wmoLabel(code: number): string {
  if (code === 0) return "Helder";
  if (code <= 2) return "Licht bewolkt";
  if (code === 3) return "Bewolkt";
  if (code <= 48) return "Mistig";
  if (code <= 57) return "Motregen";
  if (code <= 67) return "Regen";
  if (code <= 77) return "Winters";
  if (code <= 82) return "Buien";
  if (code <= 86) return "Sneeuwbuien";
  return "Onweer";
}

type OpenMeteoDaily = {
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
    wind_speed_10m_max: number[];
  };
};

export async function fetchTripWeather(): Promise<DayWeather[]> {
  if (!shouldUseRealForecast()) return ESTIMATED_WEATHER;

  const start = TRIP_WEATHER_DATES[0];
  const end = TRIP_WEATHER_DATES[TRIP_WEATHER_DATES.length - 1];
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=35.91&longitude=14.51" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max" +
    "&timezone=Europe%2FMalta" +
    `&start_date=${start}&end_date=${end}`;

  const res = await fetch(url);
  if (!res.ok) return ESTIMATED_WEATHER;
  const data = (await res.json()) as OpenMeteoDaily;
  const d = data.daily;
  if (!d?.time?.length) return ESTIMATED_WEATHER;

  return d.time.map((date, i) => ({
    date,
    max: Math.round(d.temperature_2m_max[i] ?? 0),
    min: Math.round(d.temperature_2m_min[i] ?? 0),
    label: wmoLabel(d.weather_code[i] ?? 1),
    rainChance: Math.round(d.precipitation_probability_max[i] ?? 0),
    wind: Math.round(d.wind_speed_10m_max[i] ?? 0),
    source: "verwachting",
  }));
}

export function weatherForDate(list: DayWeather[], date: string): DayWeather | undefined {
  return list.find((w) => w.date === date);
}
