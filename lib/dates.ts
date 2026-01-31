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
 * Is it after 7 Feb 2026 20:00 in Amsterdam? (CET = UTC+1, so 19:00 UTC)
 */
export function isAfterWinnerTime(): boolean {
  const winnerUtc = new Date(Date.UTC(2026, 1, 7, 19, 0, 0, 0));
  const now = new Date();
  return now.getTime() >= winnerUtc.getTime();
}

/**
 * Is it after 7 Feb 2026 20:30 in Amsterdam? (CET = UTC+1, so 19:30 UTC)
 * Uitslag mag pas vanaf 20:30 zichtbaar zijn.
 */
export function isAfterRevealTime(): boolean {
  const revealUtc = new Date(Date.UTC(2026, 1, 7, 19, 30, 0, 0));
  const now = new Date();
  return now.getTime() >= revealUtc.getTime();
}

/**
 * Exact moment waarop de uitslag zichtbaar wordt (7 feb 2026 20:30 Amsterdam).
 */
export function getRevealTime(): Date {
  return new Date(Date.UTC(2026, 1, 7, 19, 30, 0, 0));
}

/**
 * Eerste moment waarop gespind mag: 4 feb 2026 10:00 Amsterdam.
 * Spinnen mag elke dag 1× vanaf 10:00 (4 t/m 7 feb).
 */
export function getSpinOpenTimeFirstDay(): Date {
  return new Date(Date.UTC(2026, 1, 4, 9, 0, 0, 0)); // 4 feb 10:00 CET
}

/** Is het vandaag 10:00 of later in Amsterdam? (spinnen mag dan.) */
export function isSpinOpenToday(): boolean {
  const now = new Date();
  const dateStr = formatInTimeZone(now, TIMEZONE, "yyyy-MM-dd");
  const hour = parseInt(formatInTimeZone(now, TIMEZONE, "H"), 10);
  if (dateStr < "2026-02-04" || dateStr > "2026-02-07") return false;
  return hour >= 10;
}

/** Countdown tot je mag spinnen: 4 feb 10:00 (of vandaag 10:00 als we op 4–7 feb zitten). */
export function getSpinOpenTime(): Date {
  const dateStr = getCurrentDateString();
  if (dateStr >= "2026-02-04" && dateStr <= "2026-02-07") {
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
  if (dateStr === "2026-02-02") return 1;
  if (dateStr === "2026-02-03") return 2;
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
  const feb1 = "2026-02-01";
  const feb4 = "2026-02-04";
  const feb7 = "2026-02-07";

  if (isAfterWinnerTime()) return "finale";
  if (dateStr >= feb4 && dateStr <= feb7) {
    const hour = parseInt(formatInTimeZone(new Date(), TIMEZONE, "H"), 10);
    if (dateStr === feb4 && hour < 10) return "countdown_spin";
    return "fruitautomaat";
  }
  if (dateStr === "2026-02-02" || dateStr === "2026-02-03") return "wegstreep";
  if (dateStr === feb1) return "city_input";
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
