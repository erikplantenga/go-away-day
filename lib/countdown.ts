const DEPARTURE = new Date("2026-10-03T11:50:00+02:00");

export function msUntilFlight(now = Date.now()): number {
  return Math.max(0, DEPARTURE.getTime() - now);
}

export function formatFlightCountdown(ms: number): string {
  if (ms <= 0) return "We vliegen";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (days > 0) return `${days}d ${pad(hours)}u ${pad(min)}m ${pad(sec)}s`;
  return `${pad(hours)}u ${pad(min)}m ${pad(sec)}s`;
}
