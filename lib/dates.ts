import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

const TIMEZONE = "Europe/Amsterdam";

export type Phase =
  | "countdown"
  | "city_input"
  | "wegstreep"
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
 * Phase based on system date (Europe/Amsterdam).
 * Optional override for testing via env NEXT_PUBLIC_PHASE_OVERRIDE.
 */
export function getPhase(): Phase {
  const override = typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_PHASE_OVERRIDE as Phase | undefined)
    : (process.env.NEXT_PUBLIC_PHASE_OVERRIDE as Phase | undefined);
  if (override) return override;

  const dateStr = getCurrentDateString();
  const feb1 = "2026-02-01";
  const feb4 = "2026-02-04";
  const feb7 = "2026-02-07";

  if (isAfterWinnerTime()) return "finale";
  if (dateStr >= feb4 && dateStr <= feb7) return "fruitautomaat";
  if (dateStr >= feb1 && dateStr <= "2026-02-03") return "wegstreep";
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
