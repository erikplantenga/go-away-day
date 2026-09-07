"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { ExternalLink } from "@/components/ExternalLink";
import { Handig } from "@/components/Handig";
import { LiveCams } from "@/components/LiveCams";
import { WeerStrip } from "@/components/WeerStrip";
import { PlaceSheet } from "@/components/PlaceSheet";
import { ESTIMATED_WEATHER, fetchTripWeather, weatherForDate, type DayWeather } from "@/lib/maltaWeather";
import { PLACE_INFO, placeForItem, type PlaceInfo } from "@/lib/maltaPlaces";
import { FLIGHTS, HOTEL, MALTA_DAYS, PASSENGERS, type Flight } from "@/lib/maltaTrip";

type SectionId = "planning" | "vluchten" | "hotel" | "weer" | "handig";

export function MaltaTrip() {
  const [open, setOpen] = useState<SectionId | null>(null);
  const [weather, setWeather] = useState<DayWeather[]>(ESTIMATED_WEATHER);

  useEffect(() => {
    let cancelled = false;
    fetchTripWeather()
      .then((list) => {
        if (!cancelled && list.length) setWeather(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (id: SectionId) => setOpen((cur) => (cur === id ? null : id));
  const todayWeather = weather[0];

  return (
    <div className="space-y-2">
      <LiveCams />

      <Accordion
        open={open === "planning"}
        onToggle={() => toggle("planning")}
        title="Weekoverzicht"
        hint="5 dagen · tik een plek"
      >
        <PlanningBody />
        <div className="px-1 pb-2">
          <Dagplanning weather={weather} />
        </div>
      </Accordion>

      <Accordion
        open={open === "vluchten"}
        onToggle={() => toggle("vluchten")}
        title="Vluchten"
        hint="KM395 · KM394"
      >
        <VluchtenBody />
      </Accordion>

      <Accordion
        open={open === "hotel"}
        onToggle={() => toggle("hotel")}
        title="Hotel"
        hint="Carlton, Sliema"
      >
        <HotelBody />
      </Accordion>

      <Accordion
        open={open === "weer"}
        onToggle={() => toggle("weer")}
        title="Weer"
        hint={todayWeather ? `${todayWeather.max}° · ${todayWeather.label}` : "Begin oktober"}
      >
        <div className="px-1 pb-3">
          <WeerStrip days={weather} compact />
        </div>
      </Accordion>

      <Accordion
        open={open === "handig"}
        onToggle={() => toggle("handig")}
        title="Handig"
        hint="Paklijst · 112 · ferry"
      >
        <Handig />
      </Accordion>
    </div>
  );
}

function Accordion({
  open,
  onToggle,
  title,
  hint,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl transition-colors duration-300 ${
        open ? "bg-[#0b1f3a] text-white" : "bg-[#0b1f3a]/90 text-white"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:scale-[0.99]"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold">{title}</span>
          <span className="block truncate text-sm text-white/65">{hint}</span>
        </span>
        <span className={`chevron text-lg text-[#c9a227] ${open ? "open" : ""}`} aria-hidden>
          ▾
        </span>
      </button>
      <div className={`fold ${open ? "open" : ""}`}>
        <div className="fold-inner">
          <div className="border-t border-white/10 px-3 pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

function useLockBody(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
}

function PlanningBody() {
  const [full, setFull] = useState(false);
  useLockBody(full);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full]);

  return (
    <>
      <button
        type="button"
        onClick={() => setFull(true)}
        className="relative mb-3 block w-full overflow-hidden rounded-xl bg-black/30 text-left"
        aria-label="Weekoverzicht beeldvullend"
      >
        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/images/malta-planning.jpg"
            alt="Malta reisprogramma 3–7 oktober 2026"
            fill
            className="object-cover object-top"
            sizes="100vw"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10">
            <p className="text-xs text-white/80">Tik voor beeldvullend</p>
          </div>
        </div>
      </button>
      {full && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-black" role="dialog" aria-modal="true">
          <div
            className="flex shrink-0 items-center justify-end px-3"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <button
              type="button"
              onClick={() => setFull(false)}
              className="inline-tap flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white"
              aria-label="Sluiten"
            >
              ×
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto overscroll-contain px-1 pb-[env(safe-area-inset-bottom)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/malta-planning.jpg"
              alt="Malta reisprogramma 3–7 oktober 2026"
              className="mx-auto block h-auto w-full"
            />
          </div>
        </div>
      )}
    </>
  );
}

function VluchtenBody() {
  const [ticket, setTicket] = useState<string | null>(null);
  const [plane, setPlane] = useState(false);

  return (
    <div className="space-y-3 pb-3">
      {plane && <PlaceSheet place={PLACE_INFO.vliegtuig} onBack={() => setPlane(false)} />}
      <FlightCard flight={FLIGHTS.outbound} onOpenTicket={setTicket} onOpenPlane={() => setPlane(true)} />
      <FlightCard flight={FLIGHTS.inbound} onOpenTicket={setTicket} onOpenPlane={() => setPlane(true)} />
      <p className="px-1 text-sm text-white/60">Passagiers: {PASSENGERS.join(" · ")}</p>
      <div className="flex flex-col items-stretch space-y-2 px-1">
        <ExternalLink
          href="https://www.kmmaltaairlines.com"
          className="rounded-xl bg-white px-4 text-sm font-semibold text-[#0b1f3a]"
        >
          KM Malta Airlines
        </ExternalLink>
        <ExternalLink
          href="https://www.schiphol.nl"
          className="rounded-xl bg-white/10 px-4 text-sm font-semibold text-white"
        >
          Schiphol
        </ExternalLink>
        <ExternalLink
          href="https://www.maltairport.com"
          className="rounded-xl bg-white/10 px-4 text-sm font-semibold text-white"
        >
          Malta Airport
        </ExternalLink>
      </div>
      {ticket && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black" role="dialog" aria-modal="true">
          <div
            className="flex shrink-0 items-center justify-end px-3"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <button
              type="button"
              onClick={() => setTicket(null)}
              className="inline-tap flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white"
              aria-label="Sluiten"
            >
              ×
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center px-2 pb-[env(safe-area-inset-bottom)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ticket} alt="Boekingsbewijs" className="max-h-full w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

function FlightCard({
  flight,
  onOpenTicket,
  onOpenPlane,
}: {
  flight: Flight;
  onOpenTicket: (src: string) => void;
  onOpenPlane: () => void;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">{flight.label}</p>
        <p className="text-xs font-medium text-white/60">{flight.flightNumber}</p>
      </div>
      <p className="mt-1 text-sm text-white/70">{flight.date}</p>
      <p className="text-xs text-white/50">
        {flight.airline} · {flight.duration}
      </p>
      <button
        type="button"
        onClick={onOpenPlane}
        className="mt-2 text-left text-sm font-semibold text-[#c9a227] underline underline-offset-2"
      >
        {flight.aircraft} →
      </button>
      {flight.transfer && <p className="mt-2 text-sm text-white/80">{flight.transfer}</p>}
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-bold tabular-nums">{flight.departTime}</p>
          <p className="text-sm text-white/70">
            {flight.departCode} · {flight.departPlace}
          </p>
        </div>
        <div className="mb-3 h-px flex-1 bg-white/20" />
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums">{flight.arriveTime}</p>
          <p className="text-sm text-white/70">
            {flight.arriveCode} · {flight.arrivePlace}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-white/50">{flight.checkInOpens}</p>
      <button
        type="button"
        onClick={() => onOpenTicket(flight.image)}
        className="mt-3 w-full rounded-xl bg-white/10 py-2 text-sm font-medium text-white"
      >
        Ticket bekijken
      </button>
    </div>
  );
}

function HotelBody() {
  const [confirm, setConfirm] = useState(false);
  useLockBody(confirm);

  return (
    <div className="rounded-xl bg-white/5 p-4 pb-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">Check-in zaterdag</p>
      <h3 className="mt-1 text-xl font-bold">
        {HOTEL.name}, {HOTEL.place}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-white/80">{HOTEL.about}</p>
      <p className="mt-3 text-sm text-white/85">
        {HOTEL.rooms} · {HOTEL.total} totaal · {HOTEL.rest}
      </p>
      <ExternalLink href={HOTEL.maps} className="mt-4 block text-left text-sm font-medium text-white underline">
        {HOTEL.address}
      </ExternalLink>
      <a href={HOTEL.phoneHref} className="mt-2 block text-sm font-medium text-white underline">
        Receptie
      </a>
      <a href={HOTEL.reservationsPhoneHref} className="mt-1 block text-sm font-medium text-white underline">
        Reserveringen
      </a>
      <ul className="mt-4 space-y-1.5 text-sm text-white/80">
        {HOTEL.extras.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="mt-5 flex min-h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-[#0b1f3a]"
      >
        Bevestiging bekijken
      </button>
      <ExternalLink
        href={HOTEL.website}
        className="mt-2 mb-1 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white"
      >
        Website openen
      </ExternalLink>
      {confirm && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black" role="dialog" aria-modal="true">
          <div
            className="flex shrink-0 items-center justify-end px-3"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <button
              type="button"
              onClick={() => setConfirm(false)}
              className="inline-tap flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white"
              aria-label="Sluiten"
            >
              ×
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center px-2 pb-[env(safe-area-inset-bottom)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HOTEL.confirmation} alt="Hotelbevestiging Carlton" className="max-h-full w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

function Dagplanning({ weather }: { weather: DayWeather[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [place, setPlace] = useState<PlaceInfo | null>(null);
  const [todayId, setTodayId] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setTodayId(MALTA_DAYS.find((d) => d.date === iso)?.id ?? null);
  }, []);

  return (
    <div className="space-y-2 pb-2">
      {place && <PlaceSheet place={place} onBack={() => setPlace(null)} />}
      {MALTA_DAYS.map((day) => {
        const open = openId === day.id;
        const w = weatherForDate(weather, day.date);
        const isToday = todayId === day.id;
        return (
          <div key={day.id} className="overflow-hidden rounded-xl bg-white/5">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : day.id)}
              className="flex w-full items-center gap-3 px-3 py-3 text-left"
            >
              <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#c9a227] text-[#0b1f3a]">
                <span className="text-[10px] leading-none uppercase opacity-80">
                  {day.weekday.slice(0, 2)}
                </span>
                <span className="text-base font-bold leading-none">{day.dateLabel.split(" ")[0]}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{day.weekday}</span>
                  {isToday && (
                    <span className="rounded-full bg-[#c9a227] px-2 py-0.5 text-[10px] font-bold uppercase text-[#0b1f3a]">
                      Vandaag
                    </span>
                  )}
                </span>
                <span className="block truncate text-sm text-white/65">{day.title}</span>
                {w && (
                  <span className="mt-0.5 block text-xs text-white/50">
                    {w.max}° / {w.min}° · {w.label}
                  </span>
                )}
              </span>
              <span className={`chevron text-[#c9a227] ${open ? "open" : ""}`}>▾</span>
            </button>
            <div className={`fold ${open ? "open" : ""}`}>
              <div className="fold-inner">
                <ul className="space-y-3 border-t border-white/10 px-3 py-3">
                  {w && (
                    <li className="text-sm text-white/70">
                      Weer: {w.max}° / {w.min}° · {w.label} · {w.rainChance}% regen
                      {w.source === "schatting" ? " (schatting)" : ""}
                    </li>
                  )}
                  {day.items.map((item, i) => {
                    const info = placeForItem(item.text);
                    const inner = (
                      <>
                        <span className="w-20 shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wide text-[#c9a227]">
                          {item.time}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{item.text}</span>
                          {item.note && (
                            <span className="mt-0.5 block text-sm text-white/65">{item.note}</span>
                          )}
                          {info && (
                            <span className="mt-1 block text-xs font-medium text-[#c9a227]">Tik voor info →</span>
                          )}
                        </span>
                        {info?.image && (
                          <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-black/30">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={info.image} alt="" className="h-full w-full object-cover" />
                          </span>
                        )}
                      </>
                    );
                    return (
                      <li key={i}>
                        {info ? (
                          <button
                            type="button"
                            onClick={() => setPlace(info)}
                            className="flex w-full gap-3 rounded-lg py-1 text-left active:bg-white/5"
                          >
                            {inner}
                          </button>
                        ) : (
                          <div className="flex gap-3">{inner}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
