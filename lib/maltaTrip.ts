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
  extras?: DayItem[];
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
    transfer: "05:15 transfer naar het vliegveld",
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
        text: "Carlton Hotel Sliema",
        note: "Inchecken en opfrissen.",
        place: "checkin",
      },
      {
        time: "17:30",
        text: "Sliema boulevard verkennen",
        note: "Eerste indruk: winkels, water, sfeer.",
        place: "sliema",
      },
      {
        time: "19:00",
        text: "Diner aan het water",
        note: "In Sliema, daarna door naar Valletta.",
        place: "diner-sliema",
      },
      {
        time: "21:00",
        text: "Valletta: Notte Bianca",
        note: "Gratis / geen ticket. Ferry of taxi. Check het dagprogramma kort vooraf.",
        place: "notte-bianca",
      },
    ],
    extras: [
      { time: "Extra", text: "Valletta rooftop drankje", place: "valletta-rooftop" },
      { time: "Extra", text: "Sunset harbour cruise", place: "harbour-cruise" },
      { time: "Extra", text: "Avondwandeling aan de haven", place: "haven-wandeling" },
      { time: "Extra", text: "Paceville nachtleven", place: "paceville" },
      { time: "Extra", text: "Marsa paardenbaan checken", place: "marsa" },
    ],
  },
  {
    id: "zo-4",
    weekday: "Zondag",
    dateLabel: "4 oktober",
    date: "2026-10-04",
    title: "Rabat, Mdina, voetbal & uitgaan",
    items: [
      { time: "08:30", text: "Ontbijt in het hotel", place: "ontbijt" },
      { time: "09:30", text: "Naar Rabat", note: "Bus of taxi vanaf Sliema.", place: "naar-rabat" },
      { time: "10:00", text: "Rabat verkennen", note: "Historisch centrum pal naast Mdina.", place: "rabat" },
      {
        time: "10:30",
        text: "St. Paul’s Catacombs",
        note: "€15 volw. · meestal geen reservering. Heritage Malta-pas dekt dit.",
        place: "catacombs",
      },
      { time: "12:15", text: "Mdina verkennen", note: "The Silent City.", place: "mdina" },
      {
        time: "13:30",
        text: "Lunch in Rabat / Mdina",
        note: "Lokale sfeer, daarna richting Ta’ Qali.",
        place: "lunch-mdina",
      },
      {
        time: "15:30",
        text: "Richting Ta’ Qali",
        note: "Eventueel Malta Classic-sfeer. Event 4–31 okt, tickets vanaf €15, hillclimb gratis.",
        place: "malta-classic",
      },
      {
        time: "18:00",
        text: "Malta – Andorra",
        note: "National Stadium, Ta’ Qali. Tickets via MFA / Eventbrite — prijs en status checken.",
        place: "voetbal",
      },
      {
        time: "20:15",
        text: "Eten / drinken na de wedstrijd",
        note: "Rond Ta’ Qali.",
        place: "ta-qali-na",
      },
      {
        time: "21:30",
        text: "Defected @ UNO",
        note: "Optie A · vanaf ca. €35 + booking fee.",
        place: "defected",
        choice: "A",
      },
      {
        time: "21:30",
        text: "St. Julian’s / Paceville",
        note: "Optie B · terug naar de baai.",
        place: "paceville",
        choice: "B",
      },
    ],
    extras: [
      {
        time: "Extra",
        text: "Rabat Ajax FC",
        note: "Geen thuiswedstrijd in onze kalender.",
        place: "rabat-ajax",
      },
      {
        time: "Extra",
        text: "St. George’s FC · 11 oktober",
        note: "Na onze terugvlucht — valt buiten de trip.",
        place: "st-georges",
      },
      { time: "Extra", text: "Domus Romana", note: "Heritage Malta-pas.", place: "domus" },
      { time: "Extra", text: "Extra tijd Malta Classic paddock", place: "malta-classic" },
      { time: "Extra", text: "Spinola Bay rooftop bars", place: "cafes-live" },
    ],
  },
  {
    id: "ma-5",
    weekday: "Maandag",
    dateLabel: "5 oktober",
    date: "2026-10-05",
    title: "Valletta, WOII-historie & Birgu",
    items: [
      { time: "08:30", text: "Ontbijt in het hotel", place: "ontbijt" },
      { time: "09:15", text: "Naar Valletta", note: "Bus of ferry vanaf Sliema.", place: "naar-valletta" },
      {
        time: "10:00",
        text: "Lascaris War Rooms",
        note: "€20 volw. · online boeken is slim.",
        place: "lascaris",
      },
      { time: "11:15", text: "Koffie in Valletta", place: "koffie-valletta" },
      { time: "11:45", text: "Upper Barrakka Gardens", note: "Uitzicht over de Grand Harbour.", place: "barrakka" },
      {
        time: "12:00",
        text: "Saluting Battery",
        note: "€3 volw. · 12:00 (soms 16:00). 15 min eerder aanwezig.",
        place: "saluting",
      },
      { time: "12:30", text: "Lunch in Valletta", place: "lunch-valletta" },
      {
        time: "14:00",
        text: "Fort St. Elmo + National War Museum",
        note: "Ca. €10 volw. · openingstijden vooraf checken. Heritage Malta-pas dekt dit.",
        place: "st-elmo",
      },
      {
        time: "15:30",
        text: "Dgħajsa naar Birgu",
        note: "Of Three Cities ferry (zomerdienst tot 00:45, geen reservering).",
        place: "dghajsa",
      },
      { time: "16:00", text: "Biertje in Birgu", note: "Aan de waterfront.", place: "birgu-biertje" },
      {
        time: "18:00",
        text: "Blijven in Birgu",
        note: "Optie 1 · diner en sfeer in de Three Cities.",
        place: "blijven-birgu",
        choice: "A",
      },
      {
        time: "18:00",
        text: "Terug naar Valletta",
        note: "Optie 2 · voor extra’s in de stad.",
        place: "terug-valletta",
        choice: "B",
      },
    ],
    extras: [
      { time: "Extra", text: "Underground Valletta", note: "€15 / zonder gids.", place: "underground" },
      { time: "Extra", text: "War H.Q. Tunnel Tour", note: "€17 · timeslot 10:00 of 13:30.", place: "war-hq" },
      { time: "Extra", text: "Malta at War Museum", note: "€14 · Birgu, schuilkelders.", place: "birgu" },
      { time: "Extra", text: "Fort St. Angelo", place: "st-angelo" },
      { time: "Extra", text: "Senglea / Cospicua extra ronde", place: "three-cities" },
    ],
  },
  {
    id: "di-6",
    weekday: "Dinsdag",
    dateLabel: "6 oktober",
    date: "2026-10-06",
    title: "Noorden, boot, snorkelen & strand",
    items: [
      { time: "08:30", text: "Ontbijt in het hotel", place: "ontbijt" },
      { time: "09:15", text: "Naar Mellieħa Bay", note: "Korte rit naar het noorden.", place: "mellieha-bay" },
      {
        time: "10:30",
        text: "Speedboot: Comino / Blue Lagoon / Crystal Lagoon",
        note: "Zwemmen & snorkelen. Prijs verschilt per aanbieder — van tevoren checken.",
        place: "speedboot",
      },
      { time: "13:00", text: "Lunch in Mellieħa", note: "Aan het strand of in de buurt.", place: "lunch-mellieha" },
      {
        time: "14:30",
        text: "Mellieħa Air Raid Shelters",
        note: "Korte stop · ticket meestal ter plekke.",
        place: "air-raid",
      },
      {
        time: "15:30",
        text: "Vrije tijd in Noord-Malta / strand",
        note: "Relaxen, zwemmen, eventueel footvolley.",
        place: "noord-vrij",
      },
      { time: "17:00", text: "Terug naar Sliema", note: "Even opfrissen in het hotel.", place: "terug-sliema" },
      {
        time: "19:00",
        text: "Anjunadeep pre-parties",
        note: "Optie A · St. Julian’s / Sliema / Attard.",
        place: "anjunadeep",
        choice: "A",
      },
      {
        time: "19:00",
        text: "Cafés en live muziek",
        note: "Optie B · Marco Polo rooftop, English Café of Spinola Bay.",
        place: "cafes-live",
        choice: "B",
      },
    ],
    extras: [
      { time: "Extra", text: "Popeye Village / bootcruise", place: "popeye" },
      { time: "Extra", text: "Coral Lagoon viewpoint", place: "coral-lagoon" },
      { time: "Extra", text: "WWII-battery / uitzichtpunt", place: "wwii-battery" },
      { time: "Extra", text: "Għadira Nature Reserve", place: "ghadira" },
      { time: "Extra", text: "Sunset Golden Bay of Għajn Tuffieħa", place: "golden-sunset" },
    ],
  },
  {
    id: "wo-7",
    weekday: "Woensdag",
    dateLabel: "7 oktober",
    date: "2026-10-07",
    title: "Terug naar huis",
    items: [
      {
        time: "04:45",
        text: "Opstaan / uitchecken",
        note: "Laatste avond niet te laat maken. Paspoort en boarding pass klaarleggen.",
        place: "checkout",
      },
      {
        time: "05:15",
        text: "Naar de luchthaven",
        note: "Vroege vlucht: ruim op tijd. Ca. 25–35 min.",
        place: "transfer",
      },
      {
        time: "07:25",
        text: "Vertrek Malta",
        note: "KM394 · MLA → AMS. Online check-in en bagage vooraf.",
        place: "vertrek-malta",
      },
      { time: "10:50", text: "Aankomst Amsterdam", place: "schiphol" },
    ],
    extras: [
      { time: "Extra", text: "Sunrise walk in Sliema", place: "sunrise-sliema" },
      { time: "Extra", text: "Laatste koffie aan zee", place: "laatste-koffie" },
      { time: "Extra", text: "Souvenirshop", place: "souvenir" },
      { time: "Extra", text: "Airport lounge breakfast", place: "lounge" },
      { time: "Extra", text: "Korte ochtendwandeling", place: "ochtendwandeling" },
    ],
  },
];
