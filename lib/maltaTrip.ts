export type DayItem = {
  time: string;
  text: string;
  note?: string;
  place?: string;
  choice?: "A" | "B";
};

export type TripDay = {
  id: string;
  weekday: string;
  dateLabel: string;
  date: string;
  title: string;
  items: DayItem[];
};

export type Flight = {
  label: string;
  date: string;
  airline: string;
  flightNumber: string;
  duration: string;
  departTime: string;
  departCode: string;
  departPlace: string;
  arriveTime: string;
  arriveCode: string;
  arrivePlace: string;
  checkInOpens: string;
  image: string;
  aircraft: string;
  aircraftHref: string;
  transfer?: string;
};

export const TRIP_DATES = "3 – 7 oktober 2026";
export const PASSENGERS = ["Erik Plantenga", "BokkeSjoerd Venstra"];

export const HOTEL = {
  name: "Carlton Hotel",
  place: "Sliema",
  address: "261, Tower Road, Sliema, Malta",
  phone: "+356 2131 5765",
  phoneHref: "tel:+35621315765",
  reservationsPhone: "+356 2298 9000",
  reservationsPhoneHref: "tel:+35622989000",
  email: "rooms@carltonhotelmalta.com",
  website: "https://www.carltonhotelmalta.com",
  maps: "https://maps.google.com/?q=Carlton+Hotel+261+Tower+Road+Sliema+Malta",
  confirmation: "/images/hotel-bevestiging.png",
  rooms: "2 eenpersoonskamers inclusief ontbijt",
  total: "€760",
  deposit: "€380",
  rest: "€380 bij check-in",
  about:
    "Zeefront 3-sterrenhotel op de Tower Road-promenade. Links St. Julian’s, rechts Sliema, tegenover een zandstrand.",
  extras: [
    "Ontbijt 07:30 – 09:30",
    "Dakterras met zwembad",
    "Gratis wifi",
    "24-uurs receptie",
  ],
};

export const FLIGHTS: { outbound: Flight; inbound: Flight } = {
  outbound: {
    label: "Heen",
    date: "Zaterdag 3 oktober",
    airline: "KM Malta Airlines",
    flightNumber: "KM395",
    duration: "3u 05m",
    departTime: "11:50",
    departCode: "AMS",
    departPlace: "Schiphol",
    arriveTime: "14:55",
    arriveCode: "MLA",
    arrivePlace: "Malta",
    checkInOpens: "Check-in opent vr 2 okt, 11:50",
    image: "/images/heen-vlucht.png",
    aircraft: "Airbus A320neo",
    aircraftHref: "https://nl.wikipedia.org/wiki/Airbus_A320neo",
  },
  inbound: {
    label: "Terug",
    date: "Woensdag 7 oktober",
    airline: "KM Malta Airlines",
    flightNumber: "KM394",
    duration: "3u 25m",
    departTime: "07:25",
    departCode: "MLA",
    departPlace: "Malta",
    arriveTime: "10:50",
    arriveCode: "AMS",
    arrivePlace: "Schiphol",
    checkInOpens: "Check-in opent di 6 okt, 07:25",
    image: "/images/retour-vlucht.png",
    aircraft: "Airbus A320neo",
    aircraftHref: "https://nl.wikipedia.org/wiki/Airbus_A320neo",
    transfer: "05:00 transfer naar het vliegveld",
  },
};

export const MALTA_DAYS: TripDay[] = [
  {
    id: "za-3",
    weekday: "Zaterdag",
    dateLabel: "3 oktober",
    date: "2026-10-03",
    title: "Reisdag & Notte Bianca",
    items: [
      { time: "11:50", text: "Vertrek Schiphol", note: "KM395 · AMS → MLA", place: "vertrek-schiphol" },
      { time: "15:00", text: "Aankomst Malta", note: "Landing 14:55, daarna bagage.", place: "aankomst-malta" },
      {
        time: "16:00",
        text: "Naar het hotel",
        note: "Carlton Hotel, Sliema. Inchecken en even opfrissen.",
        place: "checkin",
      },
      {
        time: "Middag",
        text: "Sliema verkennen",
        note: "Boulevard, winkels en eerste indruk van Malta.",
        place: "sliema",
      },
      {
        time: "Avond",
        text: "Diner in Sliema",
        note: "Op een leuke plek aan het water.",
        place: "diner-sliema",
      },
      {
        time: "Avond",
        text: "Notte Bianca",
        note: "Kunst, muziek en cultuur in de straten van Valletta.",
        place: "notte-bianca",
      },
    ],
  },
  {
    id: "zo-4",
    weekday: "Zondag",
    dateLabel: "4 oktober",
    date: "2026-10-04",
    title: "Rabat, Mdina, voetbal & uitgaan",
    items: [
      { time: "Ochtend", text: "Ontbijt in het hotel", place: "ontbijt" },
      {
        time: "Ochtend",
        text: "Rabat verkennen",
        note: "Historisch centrum pal naast Mdina.",
        place: "rabat",
      },
      {
        time: "Ochtend",
        text: "St. Paul’s Catacombs",
        note: "Ondergronds grafcomplex — must see.",
        place: "catacombs",
      },
      {
        time: "Middag",
        text: "Mdina verkennen",
        note: "The Silent City: stille straten en uitzicht.",
        place: "mdina",
      },
      {
        time: "Middag",
        text: "Lunch in Mdina / Rabat",
        note: "Lokale sfeer en mooie plekken.",
        place: "lunch-mdina",
      },
      {
        time: "18:00",
        text: "Malta – Andorra",
        note: "National Stadium, Ta’ Qali.",
        place: "voetbal",
      },
      {
        time: "Avond",
        text: "Eten en drinken na de wedstrijd",
        note: "Rond Ta’ Qali.",
        place: "ta-qali-na",
      },
      {
        time: "Optie A",
        text: "Defected @ UNO",
        note: "Vanaf 21:00 — house, meerdere areas.",
        place: "defected",
        choice: "A",
      },
      {
        time: "Optie B",
        text: "Spinola / St. Julian’s / Paceville",
        note: "Terug naar de baai: biertje, bars, eventueel de club in.",
        place: "paceville",
        choice: "B",
      },
    ],
  },
  {
    id: "ma-5",
    weekday: "Maandag",
    dateLabel: "5 oktober",
    date: "2026-10-05",
    title: "Valletta & WOII-historie",
    items: [
      { time: "Ochtend", text: "Ontbijt in het hotel", place: "ontbijt" },
      {
        time: "Ochtend",
        text: "Naar Valletta",
        note: "Met bus of ferry vanaf Sliema.",
        place: "naar-valletta",
      },
      {
        time: "Ochtend",
        text: "Lascaris War Rooms",
        note: "Ondergronds WWII-hoofdkwartier.",
        place: "lascaris",
      },
      {
        time: "Ochtend",
        text: "Koffie in Valletta",
        note: "Op een mooi terras.",
        place: "koffie-valletta",
      },
      {
        time: "Middag",
        text: "Upper Barrakka Gardens",
        note: "Uitzicht over de Grand Harbour.",
        place: "barrakka",
      },
      {
        time: "Middag",
        text: "Saluting Battery",
        note: "De dagelijkse kanonschoten.",
        place: "saluting",
      },
      {
        time: "Middag",
        text: "Lunch in Valletta",
        note: "Lokale sfeer en even bijkomen.",
        place: "lunch-valletta",
      },
      {
        time: "Middag",
        text: "War H.Q. Tunnel Tour",
        note: "Indrukwekkende ondergrondse tour.",
        place: "war-hq",
      },
      {
        time: "Middag",
        text: "Met dgħajsa naar Birgu",
        note: "Korte overtocht over de haven.",
        place: "dghajsa",
      },
      {
        time: "Middag",
        text: "Malta at War Museum + shelters",
        note: "Geschiedenis en schuilkelders in Birgu.",
        place: "birgu",
      },
      {
        time: "Later",
        text: "Biertje in Birgu",
        note: "Aan de sfeervolle waterfront.",
        place: "birgu-biertje",
      },
      {
        time: "Later",
        text: "Fort St. Elmo + National War Museum",
        note: "Historie en panoramisch uitzicht.",
        place: "st-elmo",
      },
      {
        time: "Avond",
        text: "Diner in Valletta",
        note: "Op een leuke plek in de stad.",
        place: "diner-valletta",
      },
      {
        time: "Avond",
        text: "Live muziek",
        note: "Bridge Bar, Babel Bistro of The Pub.",
        place: "live-muziek",
      },
    ],
  },
  {
    id: "di-6",
    weekday: "Dinsdag",
    dateLabel: "6 oktober",
    date: "2026-10-06",
    title: "Noorden, boot, snorkelen & strand",
    items: [
      { time: "Ochtend", text: "Ontbijt in het hotel", place: "ontbijt" },
      {
        time: "Ochtend",
        text: "Naar Mellieħa Bay",
        note: "Korte rit naar het noorden.",
        place: "mellieha-bay",
      },
      {
        time: "10:30",
        text: "Speedboottocht",
        note: "Comino, grotten, Blue Lagoon / Crystal Lagoon. Zwemmen & snorkelen, ± 2,5 uur. Snorkelspullen te huur.",
        place: "speedboot",
      },
      {
        time: "Middag",
        text: "Lunch in Mellieħa",
        note: "Aan het strand of in de buurt.",
        place: "lunch-mellieha",
      },
      {
        time: "Middag",
        text: "Mellieħa Air Raid Shelters",
        note: "WOII-schuilkelders, ± 30–45 minuten.",
        place: "air-raid",
      },
      {
        time: "Middag",
        text: "Vrije tijd in Noord-Malta",
        note: "Strand, relaxen of een korte stop.",
        place: "noord-vrij",
      },
      {
        time: "Middag",
        text: "Mellieħa Bay — strand & footvolley",
        note: "Zon, zee en sport.",
        place: "footvolley",
      },
      {
        time: "Avond",
        text: "Terug naar Sliema",
        note: "Even opfrissen in het hotel.",
        place: "terug-sliema",
      },
      {
        time: "Optie A",
        text: "Anjunadeep pre-parties",
        note: "St. Julian’s / Sliema / Attard. Laatste avond: jouw keuze.",
        place: "anjunadeep",
        choice: "A",
      },
      {
        time: "Optie B",
        text: "Cafés en live muziek",
        note: "Marco Polo rooftop, English Café of bars aan Spinola Bay.",
        place: "cafes-live",
        choice: "B",
      },
    ],
  },
  {
    id: "wo-7",
    weekday: "Woensdag",
    dateLabel: "7 oktober",
    date: "2026-10-07",
    title: "Terugreis",
    items: [
      { time: "05:00", text: "Transfer naar het vliegveld", note: "Ongeveer 25–35 min.", place: "transfer" },
      { time: "07:25", text: "Vertrek Malta", note: "KM394 · MLA → AMS", place: "vertrek-malta" },
      { time: "10:50", text: "Aankomst Schiphol", place: "schiphol" },
    ],
  },
];
