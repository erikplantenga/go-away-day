import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

const TIMEZONE = "Europe/Amsterdam";

export type Phase =
  | "countdown"
  | "city_input"
  | "wegstreep"
  | "countdown_spin"
  | "fruitautomaat"
  | "finale";

/**
 * Get current date in Europe/Amsterdam (date only, no time).
 */
export function getCurrentDate(): Date {
  const now = new Date();
  const zoned = toZonedTime(now, TIMEZONE);
  return new Date(zoned.getFullYear(), zoned.getMonth(), zoned.getDate());
}

/**
 * Get date string YYYY-MM-DD in Europe/Amsterdam.
 */
export function getCurrentDateString(): string {
  const d = getCurrentDate();
  return format(d, "yyyy-MM-dd");
}

/**
 * Is it after 7 Feb 20:00 in Amsterdam? (year from current date)
 */
export function isAfterWinnerTime(): boolean {
  const now = new Date();
  const zoned = toZonedTime(now, TIMEZONE);
  const m = zoned.getMonth();
  const d = zoned.getDate();
  const h = zoned.getHours();
  if (m > 1 || (m === 1 && d > 7)) return true;
  if (m === 1 && d === 7 && h >= 20) return true;
  return false;
}

/**
 * Is it after 7 Feb 20:00 in Amsterdam this year? Uitslag mag pas vanaf 20:00 zichtbaar zijn.
 */
export function isAfterRevealTime(): boolean {
  const now = new Date();
  return now.getTime() >= getRevealTime().getTime();
}

/**
 * Exact moment waarop de uitslag zichtbaar wordt (7 feb 20:00 Amsterdam, huidig jaar).
 */
export function getRevealTime(): Date {
  const y = toZonedTime(new Date(), TIMEZONE).getFullYear();
  return new Date(Date.UTC(y, 1, 7, 19, 0, 0, 0)); // 20:00 CET = 19:00 UTC
}

/**
 * Eerste moment waarop gespind mag: 4 feb 10:00 Amsterdam (huidig jaar).
 * Spinnen mag elke dag 1× vanaf 10:00 (4 t/m 7 feb).
 */
export function getSpinOpenTimeFirstDay(): Date {
  const y = toZonedTime(new Date(), TIMEZONE).getFullYear();
  return new Date(Date.UTC(y, 1, 4, 9, 0, 0, 0)); // 4 feb 10:00 CET
}

/** Is het vandaag 10:00 of later in Amsterdam? (spinnen mag dan, 4–7 feb.) */
export function isSpinOpenToday(): boolean {
  const now = new Date();
  const mmdd = formatInTimeZone(now, TIMEZONE, "MM-dd");
  const hour = parseInt(formatInTimeZone(now, TIMEZONE, "H"), 10);
  if (mmdd < "02-04" || mmdd > "02-07") return false;
  return hour >= 10;
}

/** Countdown tot je mag spinnen: 4 feb 10:00 (of vandaag 10:00 als we op 4–7 feb zitten). */
export function getSpinOpenTime(): Date {
  const dateStr = getCurrentDateString();
  const mmdd = dateStr.slice(5);
  if (mmdd >= "02-04" && mmdd <= "02-07") {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d, 9, 0, 0, 0)); // 10:00 CET = 09:00 UTC
  }
  return getSpinOpenTimeFirstDay();
}

/**
 * Maximaal aantal wegstrepen per gebruiker op deze datum.
 * 2 feb: 1 stad, 3 feb: 2 steden (eenmalig per dag).
 */
export function getStrikeLimitForDate(dateStr: string): number {
  const mmdd = dateStr.slice(5);
  if (mmdd === "02-02") return 1;
  if (mmdd === "02-03") return 2;
  return 0;
}

const VALID_PHASES: Phase[] = [
  "countdown", "city_input", "wegstreep", "countdown_spin", "fruitautomaat", "finale",
];

/**
 * Phase based on system date (Europe/Amsterdam).
 * In preview mode (?preview=echt): phase from URL ?phase= or default fruitautomaat.
 * Optional override for testing via env NEXT_PUBLIC_PHASE_OVERRIDE.
 */
export function getPhase(): Phase {
  if (typeof window !== "undefined") {
    const win = window as unknown as { __GO_AWAY_DAY_PREVIEW__?: boolean; __GO_AWAY_DAY_PREVIEW_PHASE__?: string };
    if (win.__GO_AWAY_DAY_PREVIEW__) {
      const p = (win.__GO_AWAY_DAY_PREVIEW_PHASE__ || "fruitautomaat") as Phase;
      return VALID_PHASES.includes(p) ? p : "fruitautomaat";
    }
  }
  const override = typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_PHASE_OVERRIDE as Phase | undefined)
    : (process.env.NEXT_PUBLIC_PHASE_OVERRIDE as Phase | undefined);
  if (override) return override;

  const dateStr = getCurrentDateString();
  const mmdd = dateStr.slice(5);
  const feb1 = "02-01";
  const feb2 = "02-02";
  const feb3 = "02-03";
  const feb4 = "02-04";
  const feb7 = "02-07";

  if (isAfterWinnerTime()) return "finale";
  if (mmdd >= feb4 && mmdd <= feb7) {
    const hour = parseInt(formatInTimeZone(new Date(), TIMEZONE, "H"), 10);
    if (mmdd === feb4 && hour < 10) return "countdown_spin";
    return "fruitautomaat";
  }
  if (mmdd === feb2 || mmdd === feb3) return "wegstreep";
  if (mmdd === feb1) return "city_input";
  return "countdown";
}

/**
 * Format date for display (e.g. "1 februari").
 */
export function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return format(date, "d MMMM", { locale: nl });
}
