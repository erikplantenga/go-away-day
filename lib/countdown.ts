const DEPARTURE = new Date("2026-10-03T11:50:00+02:00");
const CHECK_IN = new Date("2026-10-02T11:50:00+02:00");
const GOOD_FLIGHT_UNTIL = new Date("2026-10-03T12:00:00+02:00");
const MALTA_PARTY_UNTIL = new Date("2026-10-03T18:00:00+02:00");
const RETURN_CHECK_IN = new Date("2026-10-06T07:25:00+02:00");
const RETURN_FLIGHT = new Date("2026-10-07T07:25:00+02:00");

export const CHECK_IN_FEAST_MS = 60 * 60 * 1000;

export type CheckInLeg = "heen" | "terug";
export type FeastKind = "goede-vlucht" | "veel-plezier" | "return-checkin";

export function tripFeast(now = Date.now()): FeastKind | null {
  if (now < GOOD_FLIGHT_UNTIL.getTime()) return "goede-vlucht";
  if (now < MALTA_PARTY_UNTIL.getTime()) return "veel-plezier";
  if (now >= RETURN_CHECK_IN.getTime() && now < RETURN_FLIGHT.getTime()) return "return-checkin";
  return null;
}

export function activeCheckIn(now = Date.now()): CheckInLeg | null {
  if (now >= CHECK_IN.getTime() && now < DEPARTURE.getTime()) return "heen";
  if (now >= RETURN_CHECK_IN.getTime() && now < RETURN_FLIGHT.getTime()) return "terug";
  return null;
}

export function msUntilFlight(now = Date.now()): number {
  return Math.max(0, DEPARTURE.getTime() - now);
}

export function msUntilCheckIn(now = Date.now()): number {
  return Math.max(0, CHECK_IN.getTime() - now);
}

export function msUntilReturnFlight(now = Date.now()): number {
  return Math.max(0, RETURN_FLIGHT.getTime() - now);
}

export function msUntilReturnCheckIn(now = Date.now()): number {
  return Math.max(0, RETURN_CHECK_IN.getTime() - now);
}

export function formatCountdown(ms: number, done: string): string {
  if (ms <= 0) return done;
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (days > 0) return `${days}d ${pad(hours)}u ${pad(min)}m ${pad(sec)}s`;
  return `${pad(hours)}u ${pad(min)}m ${pad(sec)}s`;
}

export function formatFlightCountdown(ms: number): string {
  return formatCountdown(ms, "We vliegen");
}

export function formatCheckInCountdown(ms: number): string {
  return formatCountdown(ms, "Check-in is open");
}
