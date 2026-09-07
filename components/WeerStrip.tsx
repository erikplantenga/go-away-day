"use client";

import { ExternalLink } from "@/components/ExternalLink";
import {
  SEA_TEMP_ESTIMATE,
  WEATHER_APP_URL,
  daysUntilDeparture,
  type DayWeather,
} from "@/lib/maltaWeather";

const WEEKDAYS = ["Za", "Zo", "Ma", "Di", "Wo"];

export function WeerStrip({ days, compact = false }: { days: DayWeather[]; compact?: boolean }) {
  const source = days[0]?.source ?? "schatting";
  const until = daysUntilDeparture();
  const caption =
    source === "verwachting"
      ? "Echte verwachting · Open-Meteo"
      : until > 7
        ? `Schatting begin oktober · echte verwachting over ${until - 7} dagen`
        : "Schatting begin oktober";

  return (
    <section>
      {!compact && (
        <div className="mb-3">
          <h2 className="text-lg font-bold text-foreground">Weer</h2>
          <p className="text-sm text-foreground/60">{caption}</p>
        </div>
      )}
      {compact && <p className="mb-3 text-sm text-white/60">{caption}</p>}
      <div className="grid grid-cols-5 gap-1.5">
        {days.map((day, i) => (
          <div
            key={day.date}
            className={
              compact
                ? "rounded-xl bg-white/10 px-1.5 py-2.5 text-center"
                : "rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-1.5 py-2.5 text-center"
            }
          >
            <p
              className={`text-[10px] font-semibold uppercase tracking-wide ${
                compact ? "text-white/50" : "text-foreground/50"
              }`}
            >
              {WEEKDAYS[i]}
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums leading-none">{day.max}°</p>
            <p className={`mt-0.5 text-[11px] ${compact ? "text-white/55" : "text-foreground/55"}`}>
              {day.min}°
            </p>
            <p
              className={`mt-1 truncate text-[10px] leading-tight ${
                compact ? "text-white/70" : "text-foreground/70"
              }`}
            >
              {day.label}
            </p>
          </div>
        ))}
      </div>
      <ExternalLink
        href={WEATHER_APP_URL}
        className={`mt-3 rounded-xl px-4 text-sm font-semibold ${
          compact ? "bg-white/10 text-white" : "bg-foreground/10 text-foreground"
        }`}
      >
        Open Weer-app
      </ExternalLink>
      <p className={`mt-2 text-xs ${compact ? "text-white/50" : "text-foreground/50"}`}>
        Zeewater ±{SEA_TEMP_ESTIMATE}° · regen {Math.min(...days.map((d) => d.rainChance))}–
        {Math.max(...days.map((d) => d.rainChance))}%
      </p>
    </section>
  );
}
