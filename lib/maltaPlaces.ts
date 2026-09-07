export type PlaceInfo = {
  id: string;
  title: string;
  subtitle?: string;
  body: string[];
  tips?: string[];
  link?: { label: string; href: string };
};

export const PLACE_INFO: Record<string, PlaceInfo> = {
  "vertrek-schiphol": {
    id: "vertrek-schiphol",
    title: "Vertrek Schiphol",
    subtitle: "KM395 · AMS → MLA · 11:50",
    body: [
      "KM Malta Airlines vlucht KM395. Check-in opent vrijdag 2 oktober om 11:50.",
      "Reken op tijd voor security. Vertrekhal en gate volgen in de KLM/KM-app of op de schermen.",
    ],
    tips: ["Paspoort of ID meenemen", "Online check-in zodra die open is"],
  },
  "aankomst-malta": {
    id: "aankomst-malta",
    title: "Aankomst Malta",
    subtitle: "MLA · 14:55",
    body: [
      "Luchthaven Malta International (Luqa) ligt zo’n 25–35 minuten van Sliema, afhankelijk van verkeer.",
      "Na bagage: transfer of taxi naar het Carlton Hotel aan Tower Road.",
    ],
  },
  checkin: {
    id: "checkin",
    title: "Check-in Carlton Hotel",
    subtitle: "Sliema · ca. 16:00",
    body: [
      "Carlton Hotel, 261 Tower Road, Sliema. Zeefront, links St. Julian’s, rechts Sliema.",
      "Receptie is 24 uur open. Kamers hebben airco, wifi en kluisje.",
    ],
    link: { label: "Hotelwebsite", href: "https://www.carltonhotelmalta.com" },
  },
  sliema: {
    id: "sliema",
    title: "Sliema verkennen",
    subtitle: "Boulevard en sfeer",
    body: [
      "Sliema is het levendige zeefront van Malta: een lange promenade, zwemtrappen in de rotsen, cafés en uitzicht op Valletta.",
      "Tower Road loopt langs het hotel. Wandel richting Tigné Point voor het uitzicht, of de andere kant op naar St. Julian’s.",
    ],
    tips: ["Zwemmen kan vanaf de rotskust tegenover het hotel", "Ferry naar Valletta vertrekt vanaf Sliema Ferries"],
  },
  "notte-bianca": {
    id: "notte-bianca",
    title: "Notte Bianca",
    subtitle: "Valletta · zaterdagavond 3 oktober",
    body: [
      "Notte Bianca is Valletta’s nacht van kunst en cultuur. Paleizen, kerken, musea en straten gaan open: muziek, licht, exposities en eten tot diep in de nacht.",
      "De oude stad wordt één groot festival. Vaak gratis of goedkoop naar binnen op plekken die overdag een ticket kosten.",
      "Van Sliema naar Valletta: ferry (sfeervol) of bus. ’s Avonds is het druk — comfortabele schoenen.",
    ],
    tips: ["Ferry Sliema–Valletta is de mooiste aankomst", "Pak een lichte jas: het kan afkoelen bij de haven"],
    link: { label: "Notte Bianca", href: "https://www.nottebianca.org.mt" },
  },
  rabat: {
    id: "rabat",
    title: "Rabat",
    subtitle: "St. Paul’s Catacombs & Domus Romana",
    body: [
      "Rabat ligt pal tegen Mdina. Onder de stad liggen kilometers vroegchristelijke catacomben: grafnissen, agapè-tafels en koele gangen.",
      "St. Paul’s Catacombs horen bij Heritage Malta. Domus Romana toont een Romeinse stadswoning met mozaïeken, vlak bij de poort van Mdina.",
    ],
    tips: ["Koel ondergronds: een vest is fijn", "Combineer makkelijk met Mdina in dezelfde dag"],
    link: { label: "Heritage Malta — catacomben", href: "https://heritagemalta.mt/explore/st-pauls-catacombs/" },
  },
  mdina: {
    id: "mdina",
    title: "Mdina — The Silent City",
    subtitle: "Oude hoofdstad",
    body: [
      "Mdina is de ommuurde oude hoofdstad van Malta. Weinig verkeer, smalle steegjes, barokke paleizen en uitzicht over het eiland.",
      "Hoogtepunten: de kathedraal van St. Paulus, Bastion Square en de stadspoort. ’s Avonds is het extra stil en sfeervol.",
    ],
    tips: ["In het weekend kan het drukker zijn bij de poort", "IJs of koffie op een binnenplaats"],
  },
  voetbal: {
    id: "voetbal",
    title: "Malta – Andorra",
    subtitle: "18:00 · National Stadium, Ta’ Qali",
    body: [
      "Interland in het National Stadium in Ta’ Qali, tussen Mdina/Rabat en Attard. Compact stadion, lokale sfeer.",
      "Check de kick-off en tickets dichter bij de datum. Vanaf Mdina/Rabat is het een korte rit.",
    ],
    tips: ["Zon nog laag: pet of zonnebril meenemen", "Openbaar vervoer of taxi; parkeren kan vol raken"],
  },
  defected: {
    id: "defected",
    title: "Defected",
    subtitle: "Housefestival · fort of boot",
    body: [
      "Defected is een Brits house-label dat festivals geeft op bijzondere plekken — op Malta vaak in een fort of op het water.",
      "Locatie en line-up volgen dichter bij oktober. Na het voetbal is dit de nacht-optie.",
    ],
    tips: ["Tickets vaak vooraf", "Check of het in een fort of op een boot is — kleding en jas"],
    link: { label: "Defected", href: "https://defected.com" },
  },
  valletta: {
    id: "valletta",
    title: "Valletta — Malta at War",
    subtitle: "Lascaris, tunnels, Barrakka, Saluting Battery",
    body: [
      "Lascaris War Rooms: het ondergrondse hoofdkwartier van waaruit de geallieerden Malta en de Middellandse Zee aanstuurden. Kaartentafels, radio’s, de sfeer van 1940–1943.",
      "De War H.Q. Tunnel Tour gaat door de gangen onder de stad. Upper Barrakka Gardens kijken uit over de Grand Harbour; bij de Saluting Battery knalt nog steeds het middaguur-kanon.",
    ],
    tips: ["Lascaris: tickets vooraf, koel en vochtig", "Barrakka: lift vanaf de haven als je met de ferry komt"],
    link: { label: "Lascaris War Rooms", href: "https://www.lascariswarrooms.com" },
  },
  "st-elmo": {
    id: "st-elmo",
    title: "Fort St. Elmo",
    subtitle: "National War Museum",
    body: [
      "Fort St. Elmo bewaakt de monding van de Grand Harbour. In 1565 hield het stand tegen de Ottomanen; in WO2 was het vol luchtafweer.",
      "Het National War Museum vertelt Malta’s oorlogsverhaal, inclusief het George Cross dat het eiland in 1942 kreeg.",
    ],
    tips: ["Combineer met de ochtend in Valletta", "Winderig op de wallen"],
    link: { label: "Heritage Malta — Fort St. Elmo", href: "https://heritagemalta.mt/explore/fort-st-elmo-national-war-museum/" },
  },
  birgu: {
    id: "birgu",
    title: "Three Cities — Birgu",
    subtitle: "Malta at War Museum & schuilkelders",
    body: [
      "Birgu (Vittoriosa) is de oudste van de Three Cities. Het Malta at War Museum zit in een voormalig schuilkeldercomplex: tunnels waar duizenden mensen schuilden tijdens de bombardementen.",
      "Daarna de steegjes, Fort St. Angelo in de verte, en de kade met uitzicht op Valletta.",
    ],
    tips: ["Ferry of water-taxi vanuit Valletta is het mooist", "Kelders zijn koel en laag — geen hoge hakken"],
  },
  rinella: {
    id: "rinella",
    title: "Fort Rinella",
    subtitle: "Armstrong 100-ton kanon",
    body: [
      "Fort Rinella is een Victoriaans fort met het Armstrong 100-ton kanon — een van de grootste voorlaadkanonnen ter wereld, gebouwd om slagschepen uit de Grand Harbour te houden.",
      "Klein, maar indrukwekkend als je van wapens en forten houdt. Optioneel na de Three Cities.",
    ],
    link: { label: "Fort Rinella", href: "https://www.fortrinella.com" },
  },
  "valletta-avond": {
    id: "valletta-avond",
    title: "Avond in Valletta",
    subtitle: "Cafés en bistros",
    body: [
      "Valletta ’s avonds: Strait Street (Triq id-Dejqa) voor bars, Merchants Street en de steegjes rondom St. George’s Square voor diner.",
      "Terrasjes tot laat, weinig auto’s in het centrum.",
    ],
    tips: ["Reserveer in het weekend", "Ferry terug naar Sliema: check de laatste oversteek"],
  },
  mellieha: {
    id: "mellieha",
    title: "Mellieħa",
    subtitle: "Air Raid Shelters & Fort Campbell",
    body: [
      "Mellieħa ligt in het noorden, boven een baai. De Mellieħa Air Raid Shelters zijn uitgehakte gangen uit WO2 onder het dorp — een van de best bewaarde schuilplaatsen van het eiland.",
      "Fort Campbell is een vervallen Brits kustfort met uitzicht op Comino. Daarna strand of koffie met zicht op de baai en de parochiekerk.",
    ],
    tips: ["Goede combinatie met Ċirkewwa later op de dag", "In de shelters is het koel en vochtig"],
  },
  speedboot: {
    id: "speedboot",
    title: "Speedboot vanaf Ċirkewwa",
    subtitle: "Coral Lagoon & zeegrotten",
    body: [
      "Ċirkewwa is de noordpunt: ferry naar Gozo, én startpunt voor speedboten naar Coral Lagoon (Il-Ħofra) en de grotten langs de kliffen.",
      "Tocht duurt meestal 60–90 minuten. Helder water, snorkelen als de zee het toelaat. ‘Snorkel, ontdek, geniet.’",
    ],
    tips: ["Reserven, vooral bij mooi weer", "Rashguard, water en een drybag", "Als de zee te ruw is: omboeken of Mellieħa Bay"],
  },
  "three-cities": {
    id: "three-cities",
    title: "Three Cities",
    subtitle: "Birgu, Senglea, Cospicua",
    body: [
      "Birgu, Senglea (Isla) en Cospicua (Bormla) liggen tegenover Valletta. Minder toeristen, wel forten, steegjes en het beste uitzicht op de hoofdstad.",
      "Gardjola Gardens in Senglea is het klassieke plaatje. Een dgħajsa (traditionele boot) over de haven is de sfeervolle oversteek.",
    ],
  },
  avond: {
    id: "avond",
    title: "St. Julian’s / Sliema / Attard",
    subtitle: "Drinks en live muziek",
    body: [
      "St. Julian’s (Spinola Bay, Paceville) is uitgaan: bars, restaurants, soms live muziek. Sliema is rustiger, meer boulevard en terras.",
      "Attard is landinwaarts, groener en stiller — alleen doen als jullie een specifieke plek hebben.",
    ],
    tips: ["Spinola Bay is mooi verlicht ’s avonds", "Taxi terug naar het Carlton is een paar minuten"],
  },
  transfer: {
    id: "transfer",
    title: "Transfer naar het vliegveld",
    subtitle: "05:00 · ca. 25–35 min",
    body: [
      "Vroege pick-up bij het hotel. Van Sliema naar MLA is zonder verkeer zo’n 25 minuten, met ochtendspits langer — vandaar 05:00.",
      "Receptie kan een taxi of transfer regelen de avond ervoor.",
    ],
    tips: ["Avond ervoor inpakken", "Ontbijt skippen of iets meenemen — hotelontbijt is pas vanaf 07:30"],
  },
  "vertrek-malta": {
    id: "vertrek-malta",
    title: "Vertrek Malta",
    subtitle: "KM394 · 07:25",
    body: [
      "KM Malta Airlines KM394 naar Schiphol. Check-in opent dinsdag 6 oktober om 07:25.",
      "MLA is klein, maar de ochtendvluchten zijn druk. Wees op tijd bij de gate.",
    ],
  },
  schiphol: {
    id: "schiphol",
    title: "Aankomst Schiphol",
    subtitle: "10:50",
    body: [
      "Landing AMS rond 10:50. Bagage, dan naar huis — of nog een koffie op Schiphol.",
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
  "Mellieħa": "mellieha",
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
