export type PlaceLink = { label: string; href: string };

export type PlaceInfo = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  body: string[];
  tips?: string[];
  links: PlaceLink[];
};

export const PLACE_INFO: Record<string, PlaceInfo> = {
  "vertrek-schiphol": {
    id: "vertrek-schiphol",
    image: "/images/places/schiphol.jpg",
    title: "Vertrek Schiphol",
    subtitle: "KM395 · AMS → MLA · 11:50",
    body: [
      "KM Malta Airlines vlucht KM395. Check-in opent vrijdag 2 oktober om 11:50.",
      "Reken op tijd voor security. Vertrekhal en gate volgen in de app of op de schermen.",
    ],
    tips: ["Paspoort of ID meenemen", "Online check-in zodra die open is"],
    links: [
      { label: "Schiphol", href: "https://www.schiphol.nl" },
      { label: "KM Malta Airlines", href: "https://www.kmmaltaairlines.com" },
      { label: "Route naar Schiphol", href: "https://maps.google.com/?q=Amsterdam+Airport+Schiphol" },
    ],
  },
  "aankomst-malta": {
    id: "aankomst-malta",
    image: "/images/places/malta-airport.jpg",
    title: "Aankomst Malta",
    subtitle: "MLA · 14:55",
    body: [
      "Malta International Airport (Luqa) ligt zo’n 25–35 minuten van Sliema.",
      "Na bagage: taxi of transfer naar het Carlton Hotel aan Tower Road.",
    ],
    links: [
      { label: "Malta Airport", href: "https://www.maltairport.com" },
      { label: "Route luchthaven → hotel", href: "https://maps.google.com/maps?saddr=Malta+International+Airport&daddr=Carlton+Hotel+Sliema" },
    ],
  },
  checkin: {
    id: "checkin",
    image: "/images/places/sliema.jpg",
    title: "Check-in Carlton Hotel",
    subtitle: "Sliema · ca. 16:00",
    body: [
      "Carlton Hotel, 261 Tower Road, Sliema. Twee eenpersoonskamers met ontbijt. Restant €380 bij aankomst.",
      "Receptie is 24 uur open.",
    ],
    links: [
      { label: "Hotelwebsite", href: "https://www.carltonhotelmalta.com" },
      { label: "Open in Maps", href: "https://maps.google.com/?q=Carlton+Hotel+261+Tower+Road+Sliema+Malta" },
      { label: "Bellen receptie", href: "tel:+35621315765" },
    ],
  },
  sliema: {
    id: "sliema",
    image: "/images/places/sliema.jpg",
    title: "Sliema verkennen",
    subtitle: "Boulevard en sfeer",
    body: [
      "Lange promenade, zwemtrappen, cafés en uitzicht op Valletta. Tower Road loopt langs het hotel.",
      "De ferry naar Valletta vertrekt vanaf Sliema Ferries — de mooiste oversteek.",
    ],
    links: [
      { label: "Sliema (VisitMalta)", href: "https://www.visitmalta.com/en/location/sliema/" },
      { label: "Valletta Ferry", href: "https://www.vallettaferryservices.com" },
      { label: "Sliema Ferries op Maps", href: "https://maps.google.com/?q=Sliema+Ferries+Malta" },
    ],
  },
  "notte-bianca": {
    id: "notte-bianca",
    image: "/images/places/notte-bianca.jpg",
    title: "Notte Bianca",
    subtitle: "Valletta · zaterdagavond 3 oktober",
    body: [
      "Valletta’s nacht van kunst en cultuur: paleizen, kerken, musea en straten gaan open tot diep in de nacht.",
      "Vaak gratis of goedkoop naar binnen. Van Sliema: ferry of bus.",
    ],
    tips: ["Comfortabele schoenen", "Lichte jas voor de haven"],
    links: [
      { label: "Notte Bianca", href: "https://www.nottebianca.org.mt" },
      { label: "Valletta op Maps", href: "https://maps.google.com/?q=Valletta+Malta" },
      { label: "Ferry Sliema–Valletta", href: "https://www.vallettaferryservices.com" },
    ],
  },
  rabat: {
    id: "rabat",
    image: "/images/places/rabat.jpg",
    title: "Rabat",
    subtitle: "St. Paul’s Catacombs & Domus Romana",
    body: [
      "Vroegchristelijke catacomben onder de stad, plus de Romeinse Domus Romana met mozaïeken, pal naast Mdina.",
    ],
    links: [
      { label: "St. Paul’s Catacombs", href: "https://heritagemalta.mt/explore/st-pauls-catacombs/" },
      { label: "Domus Romana", href: "https://heritagemalta.mt/explore/domus-romana/" },
      { label: "Rabat op Maps", href: "https://maps.google.com/?q=St+Paul+Catacombs+Rabat+Malta" },
    ],
  },
  mdina: {
    id: "mdina",
    image: "/images/places/mdina.jpg",
    title: "Mdina — The Silent City",
    subtitle: "Oude hoofdstad",
    body: [
      "Ommuurde oude hoofdstad: weinig verkeer, barokke paleizen, kathedraal van St. Paulus en uitzicht over het eiland.",
    ],
    links: [
      { label: "Mdina (VisitMalta)", href: "https://www.visitmalta.com/en/location/mdina/" },
      { label: "Mdina poort op Maps", href: "https://maps.google.com/?q=Mdina+Gate+Malta" },
    ],
  },
  voetbal: {
    id: "voetbal",
    image: "/images/places/ta-qali.jpg",
    title: "Malta – Andorra",
    subtitle: "18:00 · National Stadium, Ta’ Qali",
    body: [
      "Interland in het National Stadium in Ta’ Qali, tussen Mdina/Rabat en Attard. Check kick-off en tickets dichter bij de datum.",
    ],
    links: [
      { label: "Tickets Malta FA", href: "https://tickets.mfa.com.mt/" },
      { label: "UEFA Nations League", href: "https://www.uefa.com/uefanationsleague/" },
      { label: "Stadion op Maps", href: "https://maps.google.com/?q=National+Stadium+Ta+Qali+Malta" },
    ],
  },
  defected: {
    id: "defected",
    image: "/images/places/st-elmo.jpg",
    title: "Defected Malta",
    subtitle: "1–5 oktober 2026 · housefestival",
    body: [
      "Defected Malta 2026 loopt van 1 oktober tot in de vroege 5e. Zondag 4 oktober valt midden in het festival.",
      "Locaties: UNO (Ta’ Qali), Fort St. Elmo, Café del Mar en The Ditch. Vaak fort, boot of outdoor stages.",
    ],
    tips: ["Tickets via de officiële site", "Check die dag of het fort, boot of UNO is"],
    links: [
      { label: "Defected Malta", href: "https://malta.defected.com/" },
      { label: "Tickets", href: "https://malta.defected.com/book-2026-tickets" },
      { label: "Info & FAQ", href: "https://malta.defected.com/info-faqs" },
    ],
  },
  valletta: {
    id: "valletta",
    image: "/images/places/valletta.jpg",
    title: "Valletta — Malta at War",
    subtitle: "Lascaris, tunnels, Barrakka, Saluting Battery",
    body: [
      "Lascaris War Rooms: ondergronds hoofdkwartier uit WO2. Daarna Upper Barrakka Gardens en de Saluting Battery boven de Grand Harbour.",
    ],
    links: [
      { label: "Lascaris War Rooms", href: "https://www.lascariswarrooms.com" },
      { label: "Valletta (VisitMalta)", href: "https://www.visitmalta.com/en/location/valletta/" },
      { label: "Barrakka op Maps", href: "https://maps.google.com/?q=Upper+Barrakka+Gardens+Valletta" },
    ],
  },
  "st-elmo": {
    id: "st-elmo",
    image: "/images/places/st-elmo.jpg",
    title: "Fort St. Elmo",
    subtitle: "National War Museum",
    body: [
      "Fort aan de monding van de Grand Harbour. National War Museum, inclusief het George Cross van 1942. Ook een van de Defected-locaties.",
    ],
    links: [
      { label: "Fort St. Elmo", href: "https://heritagemalta.mt/explore/fort-st-elmo-national-war-museum/" },
      { label: "Open in Maps", href: "https://maps.google.com/?q=Fort+St+Elmo+Valletta" },
    ],
  },
  birgu: {
    id: "birgu",
    image: "/images/places/birgu.jpg",
    title: "Three Cities — Birgu",
    subtitle: "Malta at War Museum & schuilkelders",
    body: [
      "Birgu (Vittoriosa): museum in een schuilkeldercomplex uit WO2, daarna steegjes en uitzicht op Valletta.",
    ],
    links: [
      { label: "Malta at War Museum", href: "https://www.maltaatwarmuseum.com" },
      { label: "Birgu op Maps", href: "https://maps.google.com/?q=Malta+at+War+Museum+Birgu" },
    ],
  },
  rinella: {
    id: "rinella",
    image: "/images/places/rinella.jpg",
    title: "Fort Rinella",
    subtitle: "Armstrong 100-ton kanon",
    body: [
      "Victoriaans fort met een van de grootste voorlaadkanonnen ter wereld. Optioneel na de Three Cities.",
    ],
    links: [
      { label: "Fort Rinella", href: "https://www.fortrinella.com" },
      { label: "Open in Maps", href: "https://maps.google.com/?q=Fort+Rinella+Malta" },
    ],
  },
  "valletta-avond": {
    id: "valletta-avond",
    image: "/images/places/valletta-night.jpg",
    title: "Avond in Valletta",
    subtitle: "Cafés en bistros",
    body: [
      "Strait Street voor bars, Merchants Street en St. George’s Square voor diner. Check de laatste ferry terug naar Sliema.",
    ],
    links: [
      { label: "Valletta (VisitMalta)", href: "https://www.visitmalta.com/en/location/valletta/" },
      { label: "Strait Street op Maps", href: "https://maps.google.com/?q=Strait+Street+Valletta" },
      { label: "Ferry terug", href: "https://www.vallettaferryservices.com" },
    ],
  },
  mellieha: {
    id: "mellieha",
    image: "/images/places/mellieha.jpg",
    title: "Mellieħa",
    subtitle: "Air Raid Shelters & Fort Campbell",
    body: [
      "WO2-schuilkelders onder het dorp, Fort Campbell aan de kust, daarna de baai en de parochiekerk.",
    ],
    links: [
      { label: "Mellieħa", href: "https://www.mellieha.com" },
      { label: "Air Raid Shelters op Maps", href: "https://maps.google.com/?q=Mellieha+Air+Raid+Shelters" },
      { label: "Fort Campbell op Maps", href: "https://maps.google.com/?q=Fort+Campbell+Malta" },
    ],
  },
  speedboot: {
    id: "speedboot",
    image: "/images/places/cirkewwa.jpg",
    title: "Speedboot vanaf Ċirkewwa",
    subtitle: "Coral Lagoon & zeegrotten",
    body: [
      "Noordpunt van Malta: speedboten naar Coral Lagoon en de grotten. Meestal 60–90 minuten, snorkelen als de zee het toelaat.",
    ],
    tips: ["Reserveren bij mooi weer", "Rashguard en drybag"],
    links: [
      { label: "Coral Lagoon op Maps", href: "https://maps.google.com/?q=Coral+Lagoon+Malta" },
      { label: "Bootvertrek Ċirkewwa", href: "https://maps.google.com/?q=Cirkewwa+Ferry+Terminal+Malta" },
      { label: "Comino-ferry (optie)", href: "https://bluelagoon.mt/ferry/cirkewwa/" },
    ],
  },
  "three-cities": {
    id: "three-cities",
    image: "/images/places/senglea.jpg",
    title: "Three Cities",
    subtitle: "Birgu, Senglea, Cospicua",
    body: [
      "Tegenover Valletta. Gardjola Gardens in Senglea is het klassieke uitzicht. Oversteken met een dgħajsa is het sfeervolst.",
    ],
    links: [
      { label: "Three Cities ferry", href: "https://www.vallettaferryservices.com" },
      { label: "Gardjola Gardens", href: "https://maps.google.com/?q=Gardjola+Gardens+Senglea" },
    ],
  },
  avond: {
    id: "avond",
    image: "/images/places/spinola.jpg",
    title: "St. Julian’s / Sliema / Attard",
    subtitle: "Drinks en live muziek",
    body: [
      "St. Julian’s (Spinola Bay, Paceville) is uitgaan. Sliema is rustiger boulevard. Attard is stiller, landinwaarts — daar zit ook UNO van Defected.",
    ],
    links: [
      { label: "St. Julian’s op Maps", href: "https://maps.google.com/?q=St+Julians+Malta" },
      { label: "Spinola Bay op Maps", href: "https://maps.google.com/?q=Spinola+Bay+St+Julians" },
      { label: "Paceville", href: "https://maps.google.com/?q=Paceville+Malta" },
    ],
  },
  transfer: {
    id: "transfer",
    image: "/images/places/malta-airport.jpg",
    title: "Transfer naar het vliegveld",
    subtitle: "05:00 · ca. 25–35 min",
    body: [
      "Vroege pick-up bij het Carlton. Zonder verkeer ±25 minuten naar MLA. Receptie kan de avond ervoor een taxi zetten.",
    ],
    links: [
      { label: "Route hotel → MLA", href: "https://maps.google.com/maps?saddr=Carlton+Hotel+Sliema&daddr=Malta+International+Airport" },
      { label: "Bellen hotel", href: "tel:+35621315765" },
    ],
  },
  "vertrek-malta": {
    id: "vertrek-malta",
    image: "/images/places/malta-airport.jpg",
    title: "Vertrek Malta",
    subtitle: "KM394 · 07:25",
    body: [
      "KM Malta Airlines KM394 naar Schiphol. Check-in opent dinsdag 6 oktober om 07:25. MLA is klein, ochtendvluchten zijn druk.",
    ],
    links: [
      { label: "Malta Airport", href: "https://www.maltairport.com" },
      { label: "KM Malta Airlines", href: "https://www.kmmaltaairlines.com" },
      { label: "Luchthaven op Maps", href: "https://maps.google.com/?q=Malta+International+Airport" },
    ],
  },
  schiphol: {
    id: "schiphol",
    image: "/images/places/schiphol.jpg",
    title: "Aankomst Schiphol",
    subtitle: "10:50",
    body: ["Landing AMS rond 10:50. Bagage, dan naar huis — of nog een koffie."],
    links: [
      { label: "Schiphol", href: "https://www.schiphol.nl" },
      { label: "Aankomsten", href: "https://www.schiphol.nl/nl/vertrekken-en-aankomsten/" },
    ],
  },
  vliegtuig: {
    id: "vliegtuig",
    title: "Airbus A320neo",
    subtitle: "KM Malta Airlines · hele vloot",
    image: "/images/places/a320neo.jpg",
    body: [
      "KM Malta Airlines vliegt alleen met de Airbus A320neo. KM395 en KM394 staan zo in het schema.",
      "Nieuwere, stillere A320 met sharklets. Economy plus een klein Business-gedeelte vooraan.",
    ],
    tips: ["Type kan in uitzondering een andere A320 zijn"],
    links: [
      { label: "Airbus A320neo", href: "https://nl.wikipedia.org/wiki/Airbus_A320neo" },
      { label: "Vloot KM Malta Airlines", href: "https://kmmaltaairlines.com/en/about-km-malta-airlines" },
    ],
  },
};

const TEXT_TO_PLACE: Record<string, string> = {
  "Vertrek Schiphol": "vertrek-schiphol",
  "Aankomst Malta": "aankomst-malta",
  "Check-in Carlton Hotel, Sliema": "checkin",
  "Sliema verkennen: boulevard en sfeer": "sliema",
  "Notte Bianca": "notte-bianca",
  Rabat: "rabat",
  "Mdina — The Silent City": "mdina",
  "Voetbal: Malta – Andorra": "voetbal",
  Defected: "defected",
  Valletta: "valletta",
  "Fort St. Elmo & National War Museum": "st-elmo",
  "Three Cities (Birgu)": "birgu",
  "Fort Rinella": "rinella",
  "Valletta — cafés en bistros": "valletta-avond",
  Mellieħa: "mellieha",
  "Speedboot vanaf Ċirkewwa": "speedboot",
  "Three Cities": "three-cities",
  "St. Julian’s / Sliema / Attard": "avond",
  "Transfer naar het vliegveld": "transfer",
  "Vertrek Malta": "vertrek-malta",
  "Aankomst Schiphol": "schiphol",
};

export function placeForItem(text: string): PlaceInfo | undefined {
  const id = TEXT_TO_PLACE[text];
  return id ? PLACE_INFO[id] : undefined;
}
