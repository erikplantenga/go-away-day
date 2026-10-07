"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { formatCheckInCountdown } from "@/lib/countdown";
import { useCheckInFeast } from "@/lib/useCheckInFeast";
import { ExternalLink } from "@/components/ExternalLink";
import { Handig } from "@/components/Handig";
import { LiveCams } from "@/components/LiveCams";
import { WeerStrip } from "@/components/WeerStrip";
import { PlaceSheet } from "@/components/PlaceSheet";
import { Updates } from "@/components/Updates";
import { BoardingPassSheet } from "@/components/BoardingPassSheet";
import { MpQuiz } from "@/components/MpQuiz";
import { ESTIMATED_WEATHER, fetchTripWeather, weatherForDate, type DayWeather } from "@/lib/maltaWeather";
import { PLACE_INFO, placeForItem, type PlaceInfo } from "@/lib/maltaPlaces";
import { FLIGHTS, HOTEL, MALTA_DAYS, PASSENGERS, type Flight } from "@/lib/maltaTrip";
import { SEED_BRIEFING, fetchDailyBriefing, type DailyBriefing } from "@/lib/maltaUpdates";
import { Photos } from "@/components/Photos";

type SectionId = "updates" | "planning" | "dagen" | "vluchten" | "hotel" | "weer" | "handig" | "fotos";

export function MaltaTrip() {
  const [open, setOpen] = useState<SectionId | null>(null);
  const [weather, setWeather] = useState<DayWeather[]>(ESTIMATED_WEATHER);
  const [briefing, setBriefing] = useState<DailyBriefing>(SEED_BRIEFING);

  useEffect(() => {
    let cancelled = false;
    fetchTripWeather()
      .then((list) => {
        if (!cancelled && list.length) setWeather(list);
      })
      .catch(() => {});
    fetchDailyBriefing()
      .then((next) => {
        if (!cancelled) setBriefing(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (id: SectionId) => setOpen((cur) => (cur === id ? null : id));
  const openNews = () => {
    setOpen("updates");
    window.setTimeout(() => {
      document.getElementById("nieuws-van-de-dag")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 140);
  };
  const todayWeather = weather[0];

  return (
    <div className="space-y-2">
      <MpQuiz onOpenNews={openNews} />

      <LiveCams />

      <Accordion
        open={open === "fotos"}
        onToggle={() => toggle("fotos")}
        title="Beeldmateriaal"
        hint="Foto's van Erik & Benno"
      >
        <Photos />
      </Accordion>

      <Accordion
        open={open === "planning"}
        onToggle={() => toggle("planning")}
        title="Weekoverzicht"
        hint="3–7 oktober"
      >
        <PlanningBody />
      </Accordion>

      <Accordion
        open={open === "dagen"}
        onToggle={() => toggle("dagen")}
        title="Dagplanning"
        hint="5 dagen"
      >
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
        hint="Paklijst · kaarten · 112"
      >
        <Handig />
      </Accordion>

      <Accordion
        id="nieuws-van-de-dag"
        open={open === "updates"}
        onToggle={() => toggle("updates")}
        title="Nieuws van de dag"
        hint={briefing.headline}
      >
        <Updates briefing={briefing} />
      </Accordion>

      {/* Sneak Preview 2027 */}
      <a
        href="https://temporary-turbo-krypton-77jdzre.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-2xl bg-[#0b1f3a]/90 text-white transition-colors duration-300 active:scale-[0.99]"
      >
        <div className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold">Sneak Preview 2027</span>
            <span className="block truncate text-sm text-white/65">Waar gaan we volgend jaar naartoe?</span>
          </span>
          <span className="text-lg text-[#c9a227]" aria-hidden>→</span>
        </div>
      </a>
    </div>
  );
}

function Accordion({
  id,
  open,
  onToggle,
  title,
  hint,
  children,
}: {
  id?: string;
  open: boolean;
  onToggle: () => void;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      className={`scroll-mt-5 overflow-hidden rounded-2xl transition-colors duration-300 ${
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
        <div className="relative aspect-[3/4] w-full">
          <Image
            src="/images/malta-week.jpg"
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
              src="/images/malta-week.jpg"
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
  const [boarding, setBoarding] = useState<Flight["boardingPasses"] | null>(null);

  return (
    <div className="space-y-3 pb-3">
      {plane && <PlaceSheet place={PLACE_INFO.vliegtuig} onBack={() => setPlane(false)} />}
      <FlightCard
        flight={FLIGHTS.outbound}
        onOpenTicket={setTicket}
        onOpenPlane={() => setPlane(true)}
        onOpenBoarding={setBoarding}
      />
      <FlightCard
        flight={FLIGHTS.inbound}
        onOpenTicket={setTicket}
        onOpenPlane={() => setPlane(true)}
        onOpenBoarding={setBoarding}
      />
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
      {boarding && <BoardingPassSheet passes={boarding} onClose={() => setBoarding(null)} />}
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

function CheckInCountdown({
  at,
  festiveLabel,
  hideWhenOpen,
}: {
  at: string;
  festiveLabel?: string | null;
  hideWhenOpen?: boolean;
}) {
  const [left, setLeft] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, new Date(at).getTime() - Date.now());
      setLeft(formatCheckInCountdown(ms));
      setOpen(ms <= 0);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [at]);

  if (festiveLabel) {
    return (
      <p className="mp-checkin-open mt-1 text-lg font-black uppercase tracking-wide text-[#c9a227]">
        {festiveLabel}
      </p>
    );
  }
  if (hideWhenOpen && open) return null;
  if (!left) return null;
  return <p className="mt-1 text-sm font-bold tabular-nums text-[#c9a227]">{left}</p>;
}

function FlightCard({
  flight,
  onOpenTicket,
  onOpenPlane,
  onOpenBoarding,
}: {
  flight: Flight;
  onOpenTicket: (src: string) => void;
  onOpenPlane: () => void;
  onOpenBoarding: (passes: NonNullable<Flight["boardingPasses"]>) => void;
}) {
  const { party, kind } = useCheckInFeast();
  const festiveLabel =
    flight.flightNumber === "KM395" && kind === "goede-vlucht"
      ? "Goede vlucht!!"
      : flight.flightNumber === "KM394" && party && kind === "return-checkin"
        ? "Incheck is open"
        : null;

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
      <CheckInCountdown
        at={flight.checkInAt}
        festiveLabel={festiveLabel}
        hideWhenOpen={Boolean(flight.boardingPasses)}
      />
      {flight.boardingPasses ? (
        <button
          type="button"
          onClick={() => onOpenBoarding(flight.boardingPasses!)}
          className="mt-3 w-full rounded-xl bg-[#c9a227] py-2.5 text-sm font-bold text-[#0b1f3a]"
        >
          Boardingpass bekijken
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => onOpenTicket(flight.image)}
        className={`${flight.boardingPasses ? "mt-2" : "mt-3"} w-full rounded-xl bg-white/10 py-2 text-sm font-medium text-white`}
      >
        Ticket bekijken
      </button>
    </div>
  );
}

function HotelBody() {
  const [confirm, setConfirm] = useState(false);
  const [wifiCopied, setWifiCopied] = useState(false);
  useLockBody(confirm);

  const copyWifiPassword = async () => {
    try {
      await navigator.clipboard.writeText(HOTEL.wifi.password);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = HOTEL.wifi.password;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 3000);
  };

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
        onClick={copyWifiPassword}
        className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#c9a227] px-4 text-sm font-semibold text-[#0b1f3a] transition-all active:scale-[0.98]"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.142 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
        {wifiCopied ? "Wachtwoord gekopieerd!" : "WiFi wachtwoord kopiëren"}
      </button>
      {wifiCopied && (
        <p className="mt-2 text-center text-xs text-white/70">
          Netwerk: <span className="font-semibold">{HOTEL.wifi.ssid}</span> · Ga naar Instellingen → WiFi en plak het wachtwoord
        </p>
      )}
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="mt-2 flex min-h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-[#0b1f3a]"
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
  const [extrasDay, setExtrasDay] = useState<(typeof MALTA_DAYS)[number] | null>(null);
  const [todayId, setTodayId] = useState<string | null>(null);
  const [doneItems, setDoneItems] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState<number>(0);
  useLockBody(!!extrasDay);

  useEffect(() => {
    // Load done items from localStorage
    try {
      const saved = localStorage.getItem("maltaDoneItems");
      if (saved) setDoneItems(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggleDone = (dayId: string, itemIndex: number) => {
    const key = `${dayId}-${itemIndex}`;
    setDoneItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      try {
        localStorage.setItem("maltaDoneItems", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (!extrasDay || place) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExtrasDay(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [extrasDay, place]);

  useEffect(() => {
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setTodayId(MALTA_DAYS.find((d) => d.date === iso)?.id ?? null);
    setCurrentTime(now.getHours() * 60 + now.getMinutes());
    
    // Update current time every minute
    const interval = setInterval(() => {
      const n = new Date();
      setCurrentTime(n.getHours() * 60 + n.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2 pb-2">
      {place && <PlaceSheet place={place} onBack={() => setPlace(null)} />}
      {extrasDay && !place && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-[#0b1f3a] text-white" role="dialog" aria-modal="true">
          <div
            className="flex shrink-0 items-center gap-2 px-3 pb-2"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <button
              type="button"
              onClick={() => setExtrasDay(null)}
              className="inline-tap flex min-h-11 items-center rounded-full bg-white/10 px-4 text-sm font-semibold"
            >
              ← Terug
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">
              {extrasDay.weekday} · {extrasDay.dateLabel}
            </p>
            <h2 className="mt-1 text-2xl font-bold">5 dingen die we missen</h2>
            <p className="mt-2 text-sm text-white/70">
              Niet in het uur-tot-uur. Tik een extra voor info, tickets en Maps.
            </p>
            <ul className="mt-4 space-y-2">
              {extrasDay.extras?.map((item, i) => {
                const info = placeForItem(item);
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => info && setPlace(info)}
                      className="flex w-full gap-3 rounded-xl bg-white/5 p-3 text-left active:bg-white/10"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{item.text}</span>
                        {item.note && <span className="mt-0.5 block text-sm text-white/65">{item.note}</span>}
                        {info && (
                          <span className="mt-1 block text-xs font-medium text-[#c9a227]">Tik voor info →</span>
                        )}
                      </span>
                      {info?.image && (
                        <span className="relative h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-black/30">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={info.image} alt="" className="h-full w-full object-cover" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      {MALTA_DAYS.map((day) => {
        const open = openId === day.id;
        const w = weatherForDate(weather, day.date);
        const isToday = todayId === day.id;
        const isPast = todayId ? day.date < todayId.replace("dag-", "2026-10-0") : false;
        const checkPast = () => {
          if (!todayId) return false;
          const todayDate = MALTA_DAYS.find(d => d.id === todayId)?.date;
          return todayDate ? day.date < todayDate : false;
        };
        const dayIsPast = checkPast();
        return (
          <div key={day.id} className={`overflow-hidden rounded-xl bg-white/5 ${dayIsPast ? "opacity-60" : ""}`}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : day.id)}
              className="flex w-full items-center gap-3 px-3 py-3 text-left"
            >
              <span className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-[#0b1f3a] ${dayIsPast ? "bg-white/40" : "bg-[#c9a227]"}`}>
                <span className="text-[10px] leading-none uppercase opacity-80">
                  {day.weekday.slice(0, 2)}
                </span>
                <span className="text-base font-bold leading-none">{day.dateLabel.split(" ")[0]}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${dayIsPast ? "line-through" : ""}`}>{day.weekday}</span>
                  {isToday && (
                    <span className="rounded-full bg-[#c9a227] px-2 py-0.5 text-[10px] font-bold uppercase text-[#0b1f3a]">
                      Vandaag
                    </span>
                  )}
                  {dayIsPast && (
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase text-white/70">
                      Gehad
                    </span>
                  )}
                </span>
                <span className={`block truncate text-sm text-white/65 ${dayIsPast ? "line-through" : ""}`}>{day.title}</span>
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
                    const info = placeForItem(item);
                    const doneKey = `${day.id}-${i}`;
                    const isManuallyDone = doneItems.has(doneKey);
                    
                    // Check if this item has passed (next item has started)
                    const isAutoPast = (() => {
                      if (dayIsPast) return true;
                      if (!isToday) return false;
                      // Get NEXT item's time
                      const nextItem = day.items[i + 1];
                      if (!nextItem?.time) {
                        // Last item of the day - check if day is over (after 23:00)
                        return currentTime >= 23 * 60;
                      }
                      const timeParts = nextItem.time.match(/(\d{1,2}):(\d{2})/);
                      if (!timeParts) return false;
                      const nextMins = parseInt(timeParts[1], 10) * 60 + parseInt(timeParts[2], 10);
                      return currentTime >= nextMins;
                    })();
                    
                    const isItemPast = isManuallyDone || isAutoPast;
                    
                    const inner = (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDone(day.id, i);
                          }}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-xs ${
                            isItemPast
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-white/30 text-transparent hover:border-white/50"
                          }`}
                        >
                          ✓
                        </button>
                        <span className={`w-[3.5rem] shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wide ${isItemPast ? "text-white/40" : "text-[#c9a227]"}`}>
                          {item.time}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-sm font-medium ${isItemPast ? "line-through text-white/50" : ""}`}>{item.text}</span>
                          {item.note && (
                            <span className={`mt-0.5 block text-sm ${isItemPast ? "line-through text-white/40" : "text-white/65"}`}>{item.note}</span>
                          )}
                          {info && !isItemPast && (
                            <span className="mt-1 block text-xs font-medium text-[#c9a227]">Tik voor info →</span>
                          )}
                        </span>
                        {info?.image && (
                          <span className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-black/30 ${isItemPast ? "opacity-50" : ""}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={info.image} alt="" className="h-full w-full object-cover" />
                          </span>
                        )}
                      </>
                    );
                    const rowClass = `flex w-full items-start gap-2 rounded-lg py-1.5 text-left ${
                      item.choice ? "bg-[#c9a227]/20 px-2 active:bg-[#c9a227]/30" : "active:bg-white/5"
                    } ${isItemPast ? "opacity-70" : ""}`;
                    return (
                      <li key={i}>
                        {info ? (
                          <button type="button" onClick={() => setPlace(info)} className={rowClass}>
                            {inner}
                          </button>
                        ) : (
                          <div className={rowClass}>{inner}</div>
                        )}
                      </li>
                    );
                  })}
                  {day.extras && day.extras.length > 0 && (
                    <li>
                      <button
                        type="button"
                        onClick={() => setExtrasDay(day)}
                        className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#c9a227] px-3 text-sm font-semibold text-[#0b1f3a]"
                      >
                        5 dingen die we missen
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
