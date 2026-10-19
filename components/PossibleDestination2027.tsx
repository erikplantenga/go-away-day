"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BIKE_RENTAL_2027, ROUTE_PLACES, type DayPlaces } from "@/lib/sicilyPlaces2027";
import { ROUTE_STOPS, SICILY_PATHS, projectCoordinate, type RouteCoordinate } from "@/lib/possibleDestination2027";

type IconName = "plane" | "bike" | "bed" | "history" | "arrow" | "transfer" | "pin" | "beer" | "snorkel";
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, string[]> = {
    plane: ["m22 2-7 20-4-9-9-4 20-7Z", "M22 2 11 13"],
    bike: ["M5 17a4 4 0 1 0 0 .01", "M19 17a4 4 0 1 0 0 .01", "m5 17 5-9 5 9H5", "m10 8 9 9-4-12h-3", "M8 5h4"],
    bed: ["M3 18V7m18 11V7M3 14h18M6 14V9h12v5"],
    history: ["M4 21h16M6 21V10h12v11M9 10V4h6v6M9 15h6M9 18h6"],
    arrow: ["M4 12h16m-6-6 6 6-6 6"],
    transfer: ["M3 16V7h13l5 5v4H3", "M7 16a2 2 0 1 0 0 .01", "M17 16a2 2 0 1 0 0 .01", "M3 11h17"],
    snorkel: ["M3 9h15v6a3 3 0 0 1-3 3h-2l-2-3-2 3H6a3 3 0 0 1-3-3V9Z", "M18 11h3V3h-3", "M6 12h3m4 0h2"],
    beer: ["M6 3h11l-1 18H7L6 3Z", "M17 7h2a3 3 0 0 1 0 6h-2", "M10 7v9m3-9v9"],
    pin: ["M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z", "M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0"],
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name].map((d, i) => <path key={i} d={d} />)}</svg>;
}


function mapSearch(query: string) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
}

function BikeRentalCard({ returning }: { returning: boolean }) {
  const rental = BIKE_RENTAL_2027;
  const perPerson = rental.dailyRate * rental.days;
  return <section className="rental-section" aria-label="Voorgestelde elektrische fietsverhuur">
    <div className="places-section-title"><Icon name="bike" size={20} /><h3>{returning ? "Na de laatste fietsetappe" : "Jullie elektrische fietsen"}</h3></div>
    <div className="rental-card">
      <div className="place-labels"><span>E-BIKE · {rental.days} FIETSDAGEN</span><span>KANDIDAAT</span></div>
      <h4>{rental.name}</h4>
      <p className="rental-price">€{perPerson} <span>per persoon / {rental.days} dagen</span></p>
      <p className="rental-rate">€{rental.dailyRate} per dag · €{perPerson * rental.riders} voor {rental.riders} personen</p>
      <dl className="rental-logistics"><div><dt>START · VOORGESTELD</dt><dd>{rental.pickup}</dd></div><div><dt>FINISH · VOORGESTELD</dt><dd>{rental.return}</dd></div></dl>
      <p className="rental-note">{rental.note}</p>
      <details className="place-planning"><summary>Borg & praktisch <span>+</span></summary><p>Borg volgens de huidige voorwaarden: €{rental.deposit.toLocaleString("nl-NL")} per e-bike. Stem fietsmaten, helm, fietstassen en laders af met de verhuurder. ’s Nachts veilig stallen en opladen bij het verblijf. Ophalen dinsdagavond voorkomt fietsvervoer naar het vliegveld op woensdag.</p></details>
      <div className="place-links"><a href={rental.url} target="_blank" rel="noopener noreferrer">Inspiring Tours · e-bikes & prijzen ↗</a></div>
    </div>
  </section>;
}

function PlaceCards({ places }: { places: DayPlaces }) {
  return <div className="day-places">
    {!!places.visits?.length && <section className="visit-section" aria-label="Battlefield en bezichtigingen">
      <div className="places-section-title"><Icon name="history" size={17} /><h3>Battlefield & bezichtigen</h3></div>
      <ol className="visit-list">
        {places.visits.map((visit, index) => <li key={visit.name} className="visit-card">
          <div className="place-labels"><span>{visit.category}</span>{visit.optional && <span className="place-optional">Optioneel</span>}</div>
          <h4><span className="visit-number">{String(index + 1).padStart(2,"0")}</span>{visit.name}</h4>
          <p className="place-timing">{visit.when}</p>
          <p className="place-description">{visit.description}</p>
          <div className="place-address"><Icon name="pin" size={13} /><span>{visit.location}</span></div>
          <details className="place-planning"><summary>Zo past het in de dag <span>+</span></summary><p>{visit.note}</p></details>
          <div className="place-links">
            <a href={mapSearch(visit.mapQuery)} target="_blank" rel="noopener noreferrer">Open kaart ↗</a>
            <a href={visit.infoUrl} target="_blank" rel="noopener noreferrer">{visit.category === "Museum" ? "Museuminfo" : visit.category === "Stadje" ? "Bezoektip" : "Achtergrond"} ↗</a>
            {visit.bookingUrl && <a href={visit.bookingUrl} target="_blank" rel="noopener noreferrer">{visit.category === "Museum" ? "Afspraak aanvragen" : "Gids aanvragen"} ↗</a>}
          </div>
        </li>)}
      </ol>
    </section>}
    {!!places.snorkel?.length && <section className="snorkel-section" aria-label="Snorkelstops langs de route">
      <div className="places-section-title"><Icon name="snorkel" size={19} /><h3>Tussendoor even snorkelen</h3></div>
      <p className="snorkel-priority">WO2 blijft de hoofdzaak. Twee zeepauzes op de korte kustdag; we kiezen ter plaatse wat de zee toelaat.</p>
      <ol className="snorkel-list">
        {places.snorkel.map((spot, i) => <li className="snorkel-card" key={spot.name}>
          <div className="place-labels"><span>SNORKELMOMENT {String(i + 1).padStart(2,"0")}</span><span>BIJ RUSTIGE ZEE</span></div>
          <h4>{spot.name}</h4>
          <p className="place-timing">{spot.when}</p>
          <p className="place-description">{spot.description}</p>
          <div className="place-address"><Icon name="pin" size={13} /><span>{spot.location}</span></div>
          <details className="place-planning"><summary>Tijd, instap & zeecondities <span>+</span></summary><p>{spot.plan}</p></details>
          <div className="place-links"><a href={mapSearch(spot.mapQuery)} target="_blank" rel="noopener noreferrer">Open kaart ↗</a><a href={spot.infoUrl} target="_blank" rel="noopener noreferrer">Snorkelinfo ↗</a></div>
        </li>)}
      </ol>
    </section>}
    {places.beer && <section className="beer-section" aria-label="Bierplek voor de avond">
      <div className="places-section-title"><Icon name="beer" size={18} /><h3>En dan een biertje</h3><span>VOOR DE AVOND</span></div>
      <div className="beer-card">
        <div className="place-labels"><span>ONZE AVONDTIP</span>{places.beer.seasonal && <span className="place-seasonal">Zomerlocatie</span>}</div>
        <h4>{places.beer.name}</h4>
        <p className="place-description">{places.beer.description}</p>
        <div className="place-address"><Icon name="pin" size={13} /><span>{places.beer.location}</span></div>
        <p className="beer-planning">{places.beer.note}</p>
        <div className="place-links">
          <a href={mapSearch(places.beer.mapQuery)} target="_blank" rel="noopener noreferrer">Open kaart ↗</a>
          <a href={places.beer.infoUrl} target="_blank" rel="noopener noreferrer">Info & website ↗</a>
          {places.beer.phone && <a href={"tel:" + places.beer.phone}>Bel voor een tafel</a>}
        </div>
        {places.beer.alternative && <div className="beer-alternative"><span>Alternatief als de zomerlocatie gesloten is</span><a href={mapSearch(places.beer.alternative.mapQuery)} target="_blank" rel="noopener noreferrer">{places.beer.alternative.name} · kaart ↗</a><a href={places.beer.alternative.infoUrl} target="_blank" rel="noopener noreferrer">Info ↗</a></div>}
      </div>
    </section>}
  </div>;
}

const WIDE_VIEW = [40, 15, 920, 620];
const COAST_VIEW = [445, 340, 320, 215];
const TRANSFER_VIEW = [475, 260, 365, 255];

function RouteMap({ step }: { step: number }) {
  const [view, setView] = useState(WIDE_VIEW);
  const viewRef = useRef(WIDE_VIEW);
  const zoomed = step > 0 && step < ROUTE_STOPS.length - 1;
  const target = step === 1 ? TRANSFER_VIEW : zoomed ? COAST_VIEW : WIDE_VIEW;
  useEffect(() => {
    const start = [...viewRef.current];
    let frame = 0;
    let started: number | undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = (now: number) => {
      started ??= now;
      const p = reduced ? 1 : Math.min((now - started) / 1100, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const next = start.map((v, i) => v + (target[i] - v) * ease);
      viewRef.current = next;
      setView(next);
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  const factor = view[2] / WIDE_VIEW[2];
  const pointSize = 6 * factor;
  const labelSize = 26 * factor;
  const offsets: [number, number, "start" | "middle" | "end"][] = [[-12,-20,"end"],[-12,-14,"end"],[-10,22,"end"],[0,25,"middle"],[12,-14,"start"],[-12,-20,"end"]];
  const pathFrom = (coordinates: readonly RouteCoordinate[]) => coordinates.map((c, i) => {
    const [x, y] = projectCoordinate(c);
    return (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2);
  }).join(" ");

  return (
    <div className="mission-map">
      <div className="map-topline"><span><i /> {step === 1 ? "TRANSFER · CATANIA → GELA" : "LIVE ROUTE REVEAL"}</span><span>37° N / 14° E</span></div>
      <svg className="sicily-map" viewBox={view.join(" ")} role="img" aria-label={"Kaart van Sicilië. Huidige stop: " + ROUTE_STOPS[step].title + ". Alleen de al ontdekte routepunten zijn zichtbaar."}>
        <defs>
          <radialGradient id="sicily-land"><stop stopColor="#154333" /><stop offset="1" stopColor="#0b2421" /></radialGradient>
          <pattern id="mission-grid" width="45" height="45" patternUnits="userSpaceOnUse"><path d="M45 0H0V45" fill="none" stroke="#71b99b" strokeOpacity=".09" strokeWidth=".6" /></pattern>
          <filter id="route-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={1.8 * factor} /></filter>
        </defs>
        <rect x="-1000" y="-1000" width="3000" height="3000" fill="#061316" />
        <rect x="-1000" y="-1000" width="3000" height="3000" fill="url(#mission-grid)" />
        {SICILY_PATHS.map((d, i) => <path key={i} d={d} fill="url(#sicily-land)" stroke="#7bbca0" strokeOpacity=".65" strokeWidth={1.15 * factor} fillRule="evenodd" />)}
        {!zoomed && <g fill="#8bad9c" textAnchor="middle"><text x="430" y="245" fontSize="38" letterSpacing="14" opacity=".5">S I C I L I A</text><text x="330" y="510" fontSize="17" letterSpacing="5" opacity=".35">MEDITERRANEAN SEA</text></g>}
        {zoomed && <text x="495" y="515" fill="#8bad9c" fontSize={labelSize * .75} letterSpacing="2" opacity=".4">CANALE DI SICILIA</text>}
        {ROUTE_STOPS.slice(1, step + 1).map((stop, i) => {
          const index = i + 1;
          const previous = ROUTE_STOPS[index - 1];
          const d = pathFrom([previous.coordinate, ...stop.via, stop.coordinate]);
          const cycle = stop.mode === "bike";
          const color = cycle ? "#a9f276" : "#e8bc79";
          return <g key={stop.id}>
            <defs><mask id={"route-mask-" + index} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="700"><path d={d} fill="none" stroke="white" strokeWidth={18 * factor} pathLength="1" strokeDasharray="1" className="route-ink" /></mask></defs>
            <g mask={"url(#route-mask-" + index + ")"}>
              <path d={d} fill="none" stroke={color} strokeWidth={7 * factor} opacity=".28" filter="url(#route-glow)" />
              <path d={d} fill="none" stroke={color} strokeWidth={2.6 * factor} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={cycle ? undefined : (7 * factor) + " " + (6 * factor)} />
            </g>
          </g>;
        })}
        {ROUTE_STOPS.slice(0, step + 1).map((stop, i) => {
          // The return uses the same airport marker, rather than a duplicate underneath it.
          if (step === ROUTE_STOPS.length - 1 && i === 0) return null;
          const [x,y] = projectCoordinate(stop.coordinate);
          const active = i === step;
          const color = active ? "#d4ffac" : "#89c16e";
          const [dx, dy, anchor] = offsets[i];
          const labelVisible = zoomed || active || i === 1;
          return <g key={stop.id}>
            {active && <circle cx={x} cy={y} r={pointSize * 2.6} fill="none" stroke="#b5f18a" strokeWidth={factor} opacity=".45" className="current-point-halo" />}
            <circle cx={x} cy={y} r={pointSize} fill={color} stroke="#08211d" strokeWidth={2 * factor} />
            {labelVisible && <text x={x + dx * factor} y={y + dy * factor} fill={active ? "#efffe3" : "#bbd3bc"} fontFamily="monospace" fontSize={labelSize} textAnchor={anchor} paintOrder="stroke" stroke="#061316" strokeWidth={4 * factor} strokeLinejoin="round">{i === 0 || i === 5 ? "CATANIA · CTA" : stop.title.toUpperCase()}</text>}
          </g>;
        })}
      </svg>
      <div className="map-compass" aria-hidden="true">N<span>↑</span></div>
      <div className="map-bottomline"><div className="map-legend"><span><b /> Fiets</span><span><b /> Transfer</span></div><span className="map-counter">{String(step + 1).padStart(2,"0")} <small>/ 06</small></span></div>
      <div className="map-footnote">Indicatieve verbindingen · geen navigatietrack</div>
    </div>
  );
}

export default function PossibleDestination2027({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const mapColumn = useRef<HTMLElement>(null);
  const stop = ROUTE_STOPS[step];
  const places = ROUTE_PLACES[stop.id];
  const last = step === ROUTE_STOPS.length - 1;
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function goTo(next: number) {
    if (drawing || next < 0 || next >= ROUTE_STOPS.length) return;
    setStep(next);
    setDrawing(true);
    if (timer.current) clearTimeout(timer.current);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => setDrawing(false), reduced ? 0 : 1150);
    // Move the reading focus without scrolling the map out of view.
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      if (window.innerWidth < 900 && scroller.current && mapColumn.current) {
        scroller.current.scrollTo({ top: mapColumn.current.offsetTop - 16, behavior: reduced ? "auto" : "smooth" });
      }
    });
  }
  return (
    <div className="route-briefing" ref={scroller}>
      <div className="mission-shell">
        <header className="mission-header">
          <button type="button" className="mission-wordmark" onClick={onClose} aria-label="Terug naar de wereldbol">GO_AWAY_DAY<span>://2027</span></button>
          <Link href="/" className="mission-exit">Terug naar 2026 <span>↗</span></Link>
        </header>
        <div className="mission-intro">
          <div className="mission-eyebrow"><span /> ERIK & BENNO / THE NEXT CHAPTER</div>
          <h1>POSSIBLE <em>DESTINATION</em></h1>
          <div className="mission-flight-ticket" aria-label="Voorgestelde vliegreis vanaf Schiphol naar Catania">
            <span><b>AMS</b><small>SCHIPHOL</small></span>
            <div><i /><Icon name="plane" size={18} /><i /></div>
            <span><b>CTA</b><small>CATANIA, SICILIË</small></span>
          </div>
          <div className="mission-subline"><p>Sicilië. Op de sporen van Operatie Husky.</p><span>ZA → WO <i /> 4 NACHTEN <i /> 3 FIETSETAPPES</span></div>
        </div>
        <main className="mission-layout">
          <section className="mission-map-column" ref={mapColumn} aria-label="Ontdek de route">
            <RouteMap step={step} />
            <div className="mission-stepper" aria-label="Ontdekte routepunten">
              {ROUTE_STOPS.map((item, i) => <button type="button" key={item.id} disabled={i > step || drawing} onClick={() => goTo(i)} aria-current={i === step ? "step" : undefined} aria-label={i <= step ? "Toon " + item.title : "Punt " + (i+1) + " nog niet ontdekt"} className={i <= step ? "is-revealed" : ""}><span>{i < step ? "✓" : String(i+1).padStart(2,"0")}</span><small>{i <= step ? item.title.replace("Back to ","") : "•••"}</small></button>)}
            </div>
            <p className="mission-map-note">Een mogelijke reis. Elke klik onthult de volgende stop.</p>
          </section>
          <section className="mission-card" aria-label="Huidige routepunt">
            <div className="mission-card-body" key={stop.id}>
              <div className="stop-kicker"><span>{stop.day}</span><span>{String(step + 1).padStart(2,"0")} / 06</span></div>
              <div className="stop-title-row"><h2 ref={heading} tabIndex={-1}>{stop.title}</h2><div className="stop-mode"><Icon name={stop.mode === "bike" ? "bike" : stop.mode === "arrival" || stop.mode === "return" ? "plane" : "transfer"} size={28} /></div></div>
              <p className="stop-tagline">{stop.kicker}</p>
              {stop.connection && (
                <div className="stop-connection" aria-label="Transfer van Catania Airport naar Gela">
                  <div className="connection-mode"><Icon name="transfer" size={18} /><span>{stop.connection.transport} · {stop.connection.duration} · {stop.distance}</span></div>
                  <div className="connection-endpoints"><span>{stop.connection.from}</span><Icon name="arrow" size={18} /><strong>{stop.connection.to}</strong></div>
                  <p>TRANSFER OP ZATERDAG · FIETSEN VANAF ZONDAG</p>
                </div>
              )}
              <div className="stop-facts"><div><span>{stop.mode === "bike" ? "FIETSAFSTAND" : stop.mode === "transfer" ? "TRANSFERAFSTAND" : "REIS"}</span><strong>{stop.distance}</strong></div><div><span><Icon name="bed" size={13} /> OVERNACHTING</span><strong>{stop.overnight}</strong></div></div>
              <p className="stop-description">{stop.description}</p>
              {places && <PlaceCards places={places} />}
              {(stop.id === "gela" || stop.id === "modica") && <BikeRentalCard returning={stop.id === "modica"} />}
              {!places?.visits?.length && <div className="stop-detail"><div className="stop-detail-icon"><Icon name="history" /></div><div><h3>Het verhaal van 1943</h3><p>{stop.history}</p></div></div>}
              {!places?.beer && <div className="stop-detail"><div className="stop-detail-icon"><Icon name="bed" /></div><div><h3>{last ? "De herinnering" : "En daarna de stad in"}</h3><p>{stop.evening}</p></div></div>}
              <details className="stop-practical"><summary>Praktisch & bronnen <span>+</span></summary><p>{stop.practical}</p><a href={stop.source.url} target="_blank" rel="noopener noreferrer">{stop.source.label} ↗</a>{stop.mode === "bike" && <p>Afstanden zijn richtafstanden. Leg de definitieve fietsroute met alle bezoeken vast op maximaal 50 km per dag.</p>}</details>
              {last && <div className="mission-recap"><strong>DE MOGELIJKE REIS</strong><p>Za: Gela · Zo: Scoglitti · Ma: Marina di Ragusa · Di: Modica · Wo: terugvlucht</p><span>Drie fietsdagen, elk gepland onder 50 km. Vluchten en verblijven nog afstemmen op de reisdata.</span></div>}
            </div>
            <nav className="mission-navigation" aria-label="Route bedienen">
              <button className="mission-back" type="button" disabled={step === 0 || drawing} onClick={() => goTo(step - 1)} aria-label="Vorig routepunt">←</button>
              <button className="mission-next" type="button" disabled={drawing} onClick={() => goTo(last ? 0 : step + 1)}><span>{drawing ? "ROUTE WORDT GETEKEND" : last ? "BEKIJK DE ROUTE OPNIEUW" : step === 0 ? "TRANSFER CATANIA → GELA" : step === 1 ? "START FIETSETAPPE 1 · ZONDAG" : "ONTDEK HET VOLGENDE PUNT"}</span><Icon name="arrow" /></button>
            </nav>
          </section>
        </main>
        <p className="places-availability">Locaties uitgezocht. Openingstijden, gidsen en tafels voor jullie reisdata nog bevestigen.</p>
        <footer className="mission-footer"><span>OPERATION HUSKY / SICILY, JULY 1943</span><div><a href="https://github.com/guglielmo/geojson-italy" target="_blank" rel="noopener noreferrer">Kustlijn: Openpolis</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> · vereenvoudigd</div></footer>
      </div>
      <style jsx global>{`

        .rental-section{margin-top:24px}.rental-section .places-section-title{color:#9cd8d0}
        .rental-card{padding:18px;border:1px solid #416c64;border-radius:11px;background:linear-gradient(135deg,#193a3266,#102a3066)}
        .rental-card h4{font-size:19px;line-height:1.4;margin:0 0 14px;color:#d9f4e8;font-weight:500}.rental-card .place-labels>span{color:#99cdb8}.rental-card .place-labels>span+span{margin-left:auto;color:#d5bd8d}
        .rental-price{font-size:30px;line-height:1.2;color:#cbf4b1;margin:0 0 5px;letter-spacing:-.8px}.rental-price span{font-size:11px;letter-spacing:0;color:#adc4b4;display:inline-block}
        .rental-rate{font-size:11px;line-height:1.7;color:#93b9a9;margin:0 0 16px}.rental-logistics{margin:0;display:grid;gap:12px}.rental-logistics dt{font:8px monospace;letter-spacing:.7px;color:#8fc6af;margin-bottom:5px}.rental-logistics dd{font-size:12px;line-height:1.7;color:#c1d8ca;margin:0}
        .rental-note{font-size:11px;line-height:1.75;color:#beaF8c;margin:16px 0 0}.rental-card .place-planning{border-color:#35574c}.rental-card .place-links a{border-color:#50796a;color:#c9ecd9}

        .snorkel-section{margin-top:24px}.snorkel-section .places-section-title{color:#8dd7d4}.snorkel-priority{font-size:11px;line-height:1.75;color:#91b4ad;margin:0 0 13px}
        .snorkel-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px}.snorkel-card{padding:16px;border:1px solid #35585a;border-radius:10px;background:linear-gradient(135deg,#12323766,#112b2266)}
        .snorkel-card h4{font-size:14px;line-height:1.5;color:#d3eeea;font-weight:500;margin:0 0 6px}.snorkel-card .place-labels>span{color:#89c9c7}.snorkel-card .place-labels>span+span{font-size:7px;color:#80a8a3;margin-left:auto}
        .snorkel-card .place-timing{color:#83b4ad}.snorkel-card .place-description{color:#a0bfb7}.snorkel-card .place-planning{border-color:#2e4847}.snorkel-card .place-planning summary{color:#9ccbc2}.snorkel-card .place-planning p{color:#95b4a7}
        .snorkel-card .place-links a{border-color:#406766;color:#a8dcd5;background:#8ac9c605}

        .day-places{margin-top:22px}.places-section-title{display:flex;align-items:center;gap:8px;color:#a8cc92;margin-bottom:12px}.places-section-title h3{font-size:12px;margin:0;font-weight:600}.places-section-title>span{font:7px monospace;letter-spacing:.5px;margin-left:auto;color:#8e916e}
        .visit-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px}.visit-card{padding:16px;border:1px solid #324332;border-radius:10px;background:#14201566}
        .place-labels{display:flex;align-items:center;gap:8px;margin-bottom:9px;flex-wrap:wrap}.place-labels>span{font:8px monospace;color:#96bb7a;letter-spacing:.8px;text-transform:uppercase}
        .place-labels .place-optional{color:#b4b89b;background:#6d73541c;border:1px solid #485038;border-radius:3px;padding:3px 5px;letter-spacing:.3px}
        .visit-card h4,.beer-card h4{font-size:14px;line-height:1.5;color:#e1efd7;font-weight:500;margin:0 0 6px}.visit-card h4{display:flex;gap:9px;align-items:baseline}.visit-number{font:9px monospace;flex-shrink:0;color:#7fa260}
        .place-timing{font:9px monospace;color:#9ab489;line-height:1.6;margin:0 0 10px}.place-description{font-size:12px;line-height:1.75;color:#a2b397;margin:0 0 12px}
        .place-address{display:flex;gap:6px;align-items:flex-start;font-size:10px;line-height:1.6;color:#8a9d80}.place-address svg{flex-shrink:0;margin-top:2px}
        .place-planning{margin-top:12px;border-top:1px solid #2d3c2b;padding-top:11px}.place-planning summary{font-size:10px;line-height:1.5;color:#a5b991;display:flex;justify-content:space-between;cursor:pointer;list-style:none}.place-planning summary::-webkit-details-marker{display:none}.place-planning summary>span{margin-left:10px}.place-planning[open] summary>span{transform:rotate(45deg)}.place-planning p{font-size:11px;line-height:1.75;color:#91a47f;margin:9px 0 0}
        .place-links{display:flex;flex-wrap:wrap;gap:7px;margin-top:13px}.place-links a{font-size:9px;line-height:1.5;padding:7px 9px;color:#c2e1a7;background:#a4d17e08;border:1px solid #455638;border-radius:5px;text-decoration:none;min-height:30px;display:flex;align-items:center}
        .beer-section{margin-top:22px}.beer-section .places-section-title{color:#d6b276}.beer-card{padding:17px;border:1px solid #6e5833;border-radius:11px;background:linear-gradient(135deg,#30291a80,#1a211780)}
        .beer-card h4{font-size:17px;color:#f0d5a8;letter-spacing:-.2px}.beer-card .place-labels>span{color:#c09f68}.beer-card .place-labels .place-seasonal{color:#f4d599;border:1px solid #826236;border-radius:3px;padding:3px 5px;background:#a6782420}
        .beer-card .place-description{color:#bdaf94}.beer-card .place-address{color:#aa9a7e}.beer-planning{font-size:10px;line-height:1.75;color:#b5a37c;margin:13px 0 0}
        .beer-card .place-links a{border-color:#735a35;color:#e8c58a;background:#b18b3c0a}.beer-alternative{display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-top:1px solid #5f4b2b;margin-top:15px;padding-top:12px}
        .beer-alternative>span{flex-basis:100%;font-size:9px;line-height:1.5;color:#b09b74}.beer-alternative a{font-size:10px;color:#dec091;text-underline-offset:3px}
        .places-availability{font-size:10px;line-height:1.7;color:#8aa17b;margin:25px 0 0;text-align:center}
        @media(max-width:480px){.visit-card{padding:14px}.beer-card{padding:15px}.place-links a{font-size:10px;min-height:36px}.places-section-title>span{font-size:6px}.beer-card h4{font-size:16px}}

        .route-briefing{position:fixed;inset:0;z-index:110;overflow-y:auto;overscroll-behavior:contain;background:#050d10;color:#eaf2e8;font-family:Arial,Helvetica,sans-serif;-webkit-overflow-scrolling:touch}
        .route-briefing *{box-sizing:border-box}
        .route-briefing button,.route-briefing a{-webkit-tap-highlight-color:transparent}
        .route-briefing button{font:inherit}
        .route-briefing button:focus-visible,.route-briefing a:focus-visible,.route-briefing summary:focus-visible{outline:2px solid #b1f18a;outline-offset:5px}
        .mission-shell{max-width:1240px;margin:auto;padding: max(env(safe-area-inset-top),24px) 32px max(env(safe-area-inset-bottom),24px)}
        .mission-header{display:flex;align-items:center;justify-content:space-between;padding:4px 0 24px;border-bottom:1px solid #20312e}
        .mission-wordmark{border:0;background:none;color:#b4f58d;font-family:monospace!important;font-size:16px;letter-spacing:1px;text-align:left;cursor:pointer;padding:0}
        .mission-wordmark span{color:#7e9c90;margin-left:10px;font-size:12px}
        .mission-exit{color:#a6b6ad;font-size:12px;text-decoration:none}.mission-exit span{color:#b4f58d;margin-left:9px}
        .mission-flight-ticket{display:flex;align-items:center;gap:18px;width:fit-content;margin:0 0 19px;padding:12px 16px;border:1px solid #324b35;border-radius:9px;background:#a8ec7a05}
        .mission-flight-ticket>span{display:flex;flex-direction:column;gap:4px}.mission-flight-ticket b{font:20px monospace;letter-spacing:2px;color:#c6efa6}.mission-flight-ticket small{font:8px monospace;letter-spacing:1px;color:#829d7c}
        .mission-flight-ticket>div{display:flex;align-items:center;gap:9px;color:#b3f28b}.mission-flight-ticket i{height:1px;width:22px;background:#547649}
        .mission-intro{padding:32px 0 24px}.mission-eyebrow{display:flex;gap:9px;align-items:center;font:10px monospace;letter-spacing:2px;color:#a5bfae}
        .mission-eyebrow>span{height:5px;width:5px;background:#acf285;border-radius:50%;box-shadow:0 0 12px #96ef63}
        .mission-intro h1{font-size:clamp(25px,4.1vw,51px);font-weight:800;letter-spacing:-1.5px;line-height:1.04;margin:16px 0 15px}
        .mission-intro h1 em{font-style:normal;color:#b3f28b}.mission-subline{display:flex;align-items:center;justify-content:space-between;gap:20px}
        .mission-subline p{font-size:14px;color:#a3b6aa;margin:0}.mission-subline>span{display:flex;gap:10px;align-items:center;font:10px monospace;letter-spacing:1px;color:#9fb2a4;white-space:nowrap}
        .mission-subline i{height:3px;width:3px;background:#526a5f;border-radius:50%}
        .mission-layout{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(340px,1fr);gap:22px;align-items:start}
        .mission-map{position:relative;overflow:hidden;border-radius:18px;border:1px solid #2b4940;background:#061316;isolation:isolate}
        .sicily-map{display:block;width:100%;height:480px}
        .map-topline,.map-bottomline{position:absolute;left:22px;right:22px;display:flex;justify-content:space-between;align-items:center;z-index:2;pointer-events:none}
        .map-topline{top:21px;font:9px monospace;letter-spacing:1.5px;color:#a7c0b3}.map-topline>span:first-child{display:flex;gap:7px;align-items:center}
        .map-topline i{height:5px;width:5px;background:#b2f98b;border-radius:50%}.map-topline>span:last-child{color:#688f7b}
        .map-bottomline{bottom:36px}.map-legend{display:flex;gap:16px;font:10px monospace;color:#a7b9b1}.map-legend>span{display:flex;gap:6px;align-items:center}
        .map-legend b{width:14px;height:2px;background:#a9f276}.map-legend>span+span b{background:repeating-linear-gradient(to right,#e8bc79 0 3px,transparent 3px 5px)}
        .map-counter{color:#b9f294;font:21px monospace}.map-counter small{font-size:11px;color:#6d9981}
        .map-footnote{position:absolute;bottom:14px;left:22px;color:#5e8175;font-size:9px;letter-spacing:.4px}
        .map-compass{position:absolute;right:23px;top:57px;color:#749682;text-align:center;font:10px monospace;pointer-events:none}.map-compass span{display:block;font-size:22px}
        .mission-stepper{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;padding:21px 4px 0;position:relative}
        .mission-stepper:before{content:"";height:1px;background:#293c31;position:absolute;left:8%;right:8%;top:36px}
        .mission-stepper button{position:relative;display:flex;align-items:center;gap:8px;flex-direction:column;border:0;padding:0;background:transparent;color:#496053;cursor:pointer}
        .mission-stepper button span{font:10px monospace;display:grid;place-items:center;height:29px;width:29px;border-radius:50%;border:1px solid #2a4235;background:#08130e}
        .mission-stepper button.is-revealed{color:#a2b69e}.mission-stepper button.is-revealed span{border-color:#6b9a54;color:#b3f28b}
        .mission-stepper button[aria-current="step"] span{color:#132712;background:#b3f28b;border-color:#b3f28b;box-shadow:0 0 15px #a9f27615}
        .mission-stepper small{font-size:9px;text-align:center;line-height:1.3;max-width:75px}
        .mission-map-note{font-size:11px;color:#718b79;margin:19px 0 0;text-align:center}
        .mission-card{border:1px solid #2b3d32;background:linear-gradient(140deg,#111d17,#0a1311);border-radius:18px;overflow:hidden}
        .mission-card-body{padding:24px;animation:mission-card-in .5s ease both}.stop-kicker{display:flex;justify-content:space-between;gap:10px;color:#b9d1a9;font:10px monospace;letter-spacing:.8px;text-transform:uppercase}
        .stop-kicker>span:last-child{color:#5f7b62;white-space:nowrap}.stop-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px}
        .stop-title-row h2{font-size:clamp(27px,2.8vw,38px);line-height:1.05;letter-spacing:-1.1px;margin:0;color:#f0f6e9}.stop-title-row h2:focus{outline:none}
        .stop-mode{color:#b5ed8c;display:grid;place-items:center;flex-shrink:0;height:49px;width:49px;border:1px solid #33532e;border-radius:50%;background:#b3f28b08}
        .stop-tagline{font-family:Georgia,serif;font-style:italic;font-size:18px;color:#91ad89;margin:9px 0 21px}
        .stop-connection{margin:0 0 20px;padding:15px;border:1px solid #79613d;border-radius:9px;background:#e8bc7908}
        .connection-mode{display:flex;align-items:center;gap:9px;color:#e8bc79;font-size:12px;margin-bottom:12px}
        .connection-endpoints{display:flex;flex-direction:column;gap:7px;color:#d8c9ab;font-size:12px}.connection-endpoints>svg{transform:rotate(90deg);color:#ab8550}.connection-endpoints strong{font-size:14px;color:#f0d9b5;font-weight:500}
        .stop-connection>p{font:8px monospace;letter-spacing:.6px;line-height:1.6;color:#af9671;margin:13px 0 0}
        .stop-facts{display:grid;grid-template-columns:1fr 1.25fr;border-top:1px solid #2c3d2e;border-bottom:1px solid #2c3d2e;padding:14px 0;gap:15px}
        .stop-facts>div+div{border-left:1px solid #2c3d2e;padding-left:16px}.stop-facts span{display:flex;align-items:center;gap:5px;font:8px monospace;letter-spacing:1.1px;color:#89a27c;margin-bottom:7px}
        .stop-facts strong{font-size:13px;font-weight:500;color:#ddebd3}.stop-description{font-size:13px;line-height:1.8;color:#b9c8b2;margin:20px 0}
        .stop-detail{display:flex;gap:11px;margin-top:17px}.stop-detail-icon{color:#86b66c;flex-shrink:0;padding-top:1px}.stop-detail h3{font-size:11px;font-weight:600;letter-spacing:.2px;color:#d7e4cd;margin:0 0 5px}
        .stop-detail p{font-size:12px;line-height:1.7;color:#8da386;margin:0}.stop-practical{margin-top:21px;border-top:1px solid #27372a;padding-top:14px}
        .stop-practical summary{font-size:10px;color:#a6bd99;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:20px}.stop-practical summary::-webkit-details-marker{display:none}
        .stop-practical summary span{font-size:14px;color:#93bd77}.stop-practical[open] summary span{transform:rotate(45deg)}
        .stop-practical p,.stop-practical a{font-size:11px;line-height:1.7;color:#8ea384}.stop-practical a{color:#bcdf9e;text-underline-offset:3px}
        .mission-navigation{display:flex;gap:9px;border-top:1px solid #293c2b;padding:15px;background:#0c1710}
        .mission-navigation button{border-radius:7px;border:0;cursor:pointer;min-height:49px}.mission-back{width:48px;flex-shrink:0;border:1px solid #375033!important;background:transparent;color:#b1d09b;font-size:20px!important}
        .mission-next{display:flex;align-items:center;justify-content:space-between;gap:12px;flex:1;padding:10px 15px;background:#b3f28b;color:#15240d}
        .mission-next span{font:10px monospace;letter-spacing:.4px;text-align:left;line-height:1.5}.mission-navigation button:disabled{cursor:default}.mission-next:disabled{background:#537146;color:#d7e8cc}.mission-back:disabled{opacity:.25}
        .mission-recap{padding:15px;background:#b3f28b08;border:1px solid #375033;border-radius:8px;margin-top:20px}.mission-recap strong{font:9px monospace;letter-spacing:1px;color:#b3f28b}
        .mission-recap p{font-size:12px;line-height:1.7;color:#d0dec7;margin:9px 0}.mission-recap>span{font-size:10px;line-height:1.6;color:#97ae88}
        .mission-footer{display:flex;justify-content:space-between;gap:16px;margin-top:30px;padding-top:16px;border-top:1px solid #1d2d22;font:8px monospace;letter-spacing:1px;color:#536d5b;line-height:1.7}
        .mission-footer a{color:#6d8874;text-decoration:none;letter-spacing:0}
        .route-ink{animation:mission-route-ink 1.1s ease-in-out both}.current-point-halo{animation:mission-beacon 3s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
        @keyframes mission-route-ink{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
        @keyframes mission-card-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mission-beacon{0%,100%{opacity:.25;transform:scale(.85)}50%{opacity:.6;transform:scale(1.1)}}
        @media(min-width:900px){.mission-map-column{position:sticky;top:24px}}
        @media(max-width:899px){.mission-shell{padding-left:20px;padding-right:20px;padding-bottom:calc(100px + env(safe-area-inset-bottom))}.mission-layout{grid-template-columns:minmax(0,1fr)}.mission-subline{align-items:flex-start;flex-direction:column;gap:14px}.sicily-map{height:380px}.mission-card-body{padding:22px}.mission-stepper small{max-width:90px}.mission-footer{flex-direction:column;gap:5px}.mission-navigation{position:fixed;bottom:0;left:0;right:0;z-index:5;padding:12px 20px calc(12px + env(safe-area-inset-bottom));border-top:1px solid #35512f;box-shadow:0 -12px 35px #050d10cc}.mission-navigation .mission-next{min-height:50px}}
        @media(max-width:480px){.mission-shell{padding-left:16px;padding-right:16px;padding-top:max(env(safe-area-inset-top),18px)}.mission-header{padding-bottom:19px}.mission-wordmark{font-size:12px}.mission-wordmark span{display:block;margin:4px 0 0;font-size:10px}.mission-exit{font-size:10px}.mission-intro{padding-top:23px}.mission-eyebrow{font-size:8px;letter-spacing:1px}.mission-intro h1{font-size:28px;letter-spacing:-.8px;line-height:1.1}.mission-intro h1 em{display:block}.mission-subline p{font-size:12px}.mission-subline>span{font-size:8px;gap:7px}.sicily-map{height:290px}.map-topline{left:16px;right:16px;font-size:7px;letter-spacing:.7px}.map-bottomline{left:16px;right:16px}.map-footnote{left:16px;font-size:8px}.map-compass{right:17px}.mission-stepper{padding-top:17px}.mission-stepper:before{top:32px}.mission-stepper small{font-size:8px}.mission-map-note{font-size:10px;margin-top:15px}.mission-card-body{padding:20px}.stop-kicker{font-size:9px}.stop-facts{gap:9px}.stop-facts>div+div{padding-left:10px}.stop-facts strong{font-size:12px}.mission-next span{font-size:9px}.mission-footer{margin-top:23px}.mission-navigation{padding:12px 16px calc(12px + env(safe-area-inset-bottom))}.mission-map{border-radius:14px}}
        @media(prefers-reduced-motion:reduce){.route-ink,.current-point-halo,.mission-card-body{animation:none!important}}
      `}</style>
    </div>
  );
}
