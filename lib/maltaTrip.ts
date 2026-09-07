export type DayItem = {
  time: string;
  text: string;
  note?: string;
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
  website: "https://www.carltonhotelmalta.com",
  maps: "https://maps.google.com/?q=Carlton+Hotel+261+Tower+Road+Sliema+Malta",
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
    transfer: "05:00 transfer naar het vliegveld",
  },
};

export const MALTA_DAYS: TripDay[] = [
  {
    id: "za-3",
    weekday: "Zaterdag",
    dateLabel: "3 oktober",
    date: "2026-10-03",
    title: "Aankomst & Notte Bianca",
    items: [
      { time: "11:50", text: "Vertrek Schiphol", note: "KM395 · AMS → MLA" },
      { time: "14:55", text: "Aankomst Malta" },
      { time: "16:00", text: `Check-in ${HOTEL.name}, ${HOTEL.place}` },
      { time: "Middag", text: "Sliema verkennen: boulevard en sfeer" },
      {
        time: "Avond",
        text: "Notte Bianca",
        note: "Stadsbreed kunst- en cultuurfestival in Valletta.",
      },
    ],
  },
  {
    id: "zo-4",
    weekday: "Zondag",
    dateLabel: "4 oktober",
    date: "2026-10-04",
    title: "Rabat, Mdina & voetbal",
    items: [
      {
        time: "Ochtend",
        text: "Rabat",
        note: "Historisch centrum, St. Paul’s Catacombs, Romeinse graven en Domus Romana.",
      },
      {
        time: "Middag",
        text: "Mdina — The Silent City",
        note: "Wandelen door de stille straten, mooie uitzichten.",
      },
      {
        time: "18:00",
        text: "Voetbal: Malta – Andorra",
        note: "National Stadium, Ta’ Qali.",
      },
      {
        time: "Avond",
        text: "Defected",
        note: "Housefestival in een fort of op een boot.",
      },
    ],
  },
  {
    id: "ma-5",
    weekday: "Maandag",
    dateLabel: "5 oktober",
    date: "2026-10-05",
    title: "Malta at War",
    items: [
      {
        time: "Ochtend",
        text: "Valletta",
        note: "Lascaris War Rooms, War H.Q. Tunnel Tour, Upper Barrakka Gardens en Saluting Battery.",
      },
      {
        time: "Middag",
        text: "Fort St. Elmo & National War Museum",
      },
      {
        time: "Later",
        text: "Three Cities (Birgu)",
        note: "Malta at War Museum en schuilkelders.",
      },
      {
        time: "Optioneel",
        text: "Fort Rinella",
        note: "Armstrong-kanon.",
      },
      {
        time: "Avond",
        text: "Valletta — cafés en bistros",
      },
    ],
  },
  {
    id: "di-6",
    weekday: "Dinsdag",
    dateLabel: "6 oktober",
    date: "2026-10-06",
    title: "Zee, snorkelen & Three Cities",
    items: [
      {
        time: "Ochtend",
        text: "Mellieħa",
        note: "Air Raid Shelters, Fort Campbell en strand.",
      },
      {
        time: "Middag",
        text: "Speedboot vanaf Ċirkewwa",
        note: "Coral Lagoon en zeegrotten, 60–90 min. Snorkel, ontdek, geniet.",
      },
      {
        time: "Later",
        text: "Three Cities",
        note: "Birgu, Senglea en Cospicua — uitzicht en sfeer.",
      },
      {
        time: "Avond",
        text: "St. Julian’s / Sliema / Attard",
        note: "Drinks en live muziek.",
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
      { time: "05:00", text: "Transfer naar het vliegveld", note: "Ongeveer 25–35 min." },
      { time: "07:25", text: "Vertrek Malta", note: "KM394 · MLA → AMS" },
      { time: "10:50", text: "Aankomst Schiphol" },
    ],
  },
];
