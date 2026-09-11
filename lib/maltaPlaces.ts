import type { DayItem } from "@/lib/maltaTrip";

export type PlaceLink = { label: string; href: string };

export type PlaceInfo = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  video?: string;
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
    subtitle: "MLA · landing 14:55",
    body: [
      "Op de planning staat 15:00 — de vlucht landt 14:55. Malta International Airport (Luqa) ligt zo’n 25–35 minuten van Sliema.",
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
    title: "Carlton Hotel, Sliema",
    subtitle: "Check-in ca. 16:00",
    body: [
      "Carlton Hotel, 261 Tower Road. Twee eenpersoonskamers met ontbijt. Restant €380 bij aankomst.",
      "Even inchecken, opfrissen, dan de boulevard op. Receptie is 24 uur open.",
    ],
    links: [
      { label: "Hotelwebsite", href: "https://www.carltonhotelmalta.com" },
      { label: "Open in Maps", href: "https://maps.google.com/?q=Carlton+Hotel+261+Tower+Road+Sliema+Malta" },
      { label: "Bellen receptie", href: "tel:+35621315765" },
    ],
  },
  ontbijt: {
    id: "ontbijt",
    image: "/images/places/sliema.jpg",
    title: "Ontbijt in het hotel",
    subtitle: "Carlton Hotel · 07:30 – 09:30",
    body: [
      "Ontbijt zit bij de kamer. In het Carlton tussen 07:30 en 09:30.",
      "Op terugreisdag (woensdag) is het te vroeg — dan skippen we dit voor de transfer van 05:00.",
    ],
    links: [
      { label: "Hotelwebsite", href: "https://www.carltonhotelmalta.com" },
      { label: "Open in Maps", href: "https://maps.google.com/?q=Carlton+Hotel+261+Tower+Road+Sliema+Malta" },
    ],
  },
  sliema: {
    id: "sliema",
    image: "/images/places/sliema-promenade.jpg",
    title: "Sliema verkennen",
    subtitle: "Boulevard, winkels, eerste indruk",
    body: [
      "Tower Road loopt langs het hotel: promenade, zwemtrappen, cafés en uitzicht op Valletta.",
      "De ferry naar Valletta vertrekt vanaf Sliema Ferries — de mooiste oversteek.",
    ],
    links: [
      { label: "Sliema (VisitMalta)", href: "https://www.visitmalta.com/en/location/sliema/" },
      { label: "Valletta Ferry", href: "https://www.vallettaferryservices.com" },
      { label: "Sliema Ferries op Maps", href: "https://maps.google.com/?q=Sliema+Ferries+Malta" },
    ],
  },
  "diner-sliema": {
    id: "diner-sliema",
    image: "/images/places/sliema-promenade.jpg",
    title: "Diner in Sliema",
    subtitle: "Aan het water",
    body: [
      "Eerste avond: iets lekkers aan de promenade of bij Sliema Ferries, met uitzicht op Valletta.",
      "Daarna door naar Notte Bianca — ferry of bus naar Valletta.",
    ],
    tips: ["Reserveer als het druk oogt", "Niet te laat: Notte Bianca begint in Valletta"],
    links: [
      { label: "Sliema Ferries op Maps", href: "https://maps.google.com/?q=Sliema+Ferries+Malta" },
      { label: "Ferry naar Valletta", href: "https://www.vallettaferryservices.com" },
    ],
  },
  "notte-bianca": {
    id: "notte-bianca",
    image: "/images/places/notte.jpg",
    title: "Notte Bianca",
    subtitle: "Valletta · zaterdagavond 3 oktober",
    body: [
      "Valletta’s nacht van kunst en cultuur: paleizen, kerken, musea en straten gaan open tot diep in de nacht.",
      "Vaak gratis of goedkoop naar binnen. Van Sliema: ferry of bus.",
    ],
    tips: ["Comfortabele schoenen", "Lichte jas voor de haven"],
    links: [
      { label: "Notte Bianca", href: "https://www.festivalfinder.eu/festivals/notte-bianca-5" },
      { label: "Valletta op Maps", href: "https://maps.google.com/?q=Valletta+Malta" },
      { label: "Ferry Sliema–Valletta", href: "https://www.vallettaferryservices.com" },
    ],
  },
  rabat: {
    id: "rabat",
    image: "/images/places/rabat-square.jpg",
    title: "Rabat verkennen",
    subtitle: "Historisch centrum",
    body: [
      "Rabat ligt pal tegen Mdina: plein bij St. Paul’s Church, steegjes, pastizzi en het startpunt voor de catacomben.",
      "Domus Romana zit om de hoek als er tijd over is — die valt onder de Heritage Malta-pas.",
    ],
    links: [
      { label: "Rabat (VisitMalta)", href: "https://www.visitmalta.com/en/info/rabat/" },
      { label: "Plein op Maps", href: "https://maps.google.com/?q=St+Paul+Square+Rabat+Malta" },
      { label: "Domus Romana", href: "https://heritagemalta.mt/explore/domus-romana/" },
    ],
  },
  catacombs: {
    id: "catacombs",
    image: "/images/places/catacombs.jpg",
    title: "St. Paul’s Catacombs",
    subtitle: "Rabat · must see",
    body: [
      "€15 volw., meestal zonder reservering. Vroegchristelijk grafcomplex onder Rabat: gangen, agaptafels en familiegraven.",
      "Valt onder de Heritage Malta Multisite Pass.",
    ],
    tips: ["Koel ondergronds, een vest is fijn", "Tickets of pas vooraf checken"],
    links: [
      { label: "St. Paul’s Catacombs", href: "https://heritagemalta.mt/explore/st-pauls-catacombs/" },
      { label: "Open in Maps", href: "https://maps.google.com/?q=St+Paul+Catacombs+Rabat+Malta" },
      { label: "Heritage Malta-pas", href: "https://heritagemalta.mt/store/c95/" },
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
  "lunch-mdina": {
    id: "lunch-mdina",
    image: "/images/places/rabat-square.jpg",
    title: "Lunch in Mdina / Rabat",
    subtitle: "Lokale sfeer",
    body: [
      "Lunch op het plein in Rabat of binnen de muren van Mdina. Pastizzi, ftira of een terras in de schaduw.",
      "Daarna richting Ta’ Qali voor de wedstrijd om 18:00 — niet te laat vertrekken.",
    ],
    links: [
      { label: "Mdina poort op Maps", href: "https://maps.google.com/?q=Mdina+Gate+Malta" },
      { label: "Rabat plein op Maps", href: "https://maps.google.com/?q=St+Paul+Square+Rabat+Malta" },
    ],
  },
  voetbal: {
    id: "voetbal",
    image: "/images/places/ta-qali.jpg",
    title: "Malta – Andorra",
    subtitle: "18:00 · National Stadium, Ta’ Qali",
    body: [
      "Interland in het National Stadium in Ta’ Qali, tussen Mdina/Rabat en Attard. Check kick-off en tickets dichter bij de datum.",
      "Tik op een speler op het veld voor naam en positie.",
    ],
    links: [
      { label: "Tickets Malta FA", href: "https://tickets.mfa.com.mt/" },
      { label: "UEFA Nations League", href: "https://www.uefa.com/uefanationsleague/" },
      { label: "Stadion op Maps", href: "https://maps.google.com/?q=National+Stadium+Ta+Qali+Malta" },
    ],
  },
  "ta-qali-na": {
    id: "ta-qali-na",
    image: "/images/places/ta-qali.jpg",
    title: "Na de wedstrijd",
    subtitle: "Eten en drinken rond Ta’ Qali",
    body: [
      "Rond het stadion en Crafts Village is het na de fluit het drukst. Iets eten of een biertje, dan kiezen: Defected of terug naar de baai.",
    ],
    links: [
      { label: "Ta’ Qali op Maps", href: "https://maps.google.com/?q=Ta+Qali+Crafts+Village+Malta" },
      { label: "Stadion op Maps", href: "https://maps.google.com/?q=National+Stadium+Ta+Qali+Malta" },
    ],
  },
  defected: {
    id: "defected",
    image: "/images/places/st-elmo.jpg",
    video:
      "https://www.dropbox.com/scl/fi/l9ma7oiajdz9w0yla1nvx/Defected-Malta-Recap-4x5.mp4?rlkey=hkaq7pn08oo7u6vnodsges2km&dl=0&raw=1",
    title: "Defected @ UNO",
    subtitle: "Optie A · vanaf 21:00 · Ta’ Qali",
    body: [
      "Zondagavond: house bij UNO, Crafts Village Ta’ Qali. Meerdere areas (Main Stage, Treehaus, Roots).",
      "Tickets vanaf ca. €35 plus booking fee. Defected Malta 2026 loopt 1–4 oktober.",
    ],
    tips: ["Tickets vooraf", "UNO is pal bij Ta’ Qali, handig na de wedstrijd"],
    links: [
      { label: "Defected Malta", href: "https://malta.defected.com/" },
      { label: "Tickets", href: "https://malta.defected.com/book-2026-tickets" },
      { label: "UNO op Maps", href: "https://maps.google.com/?q=UNO+Malta+Crafts+Village+Ta+Qali" },
    ],
  },
  paceville: {
    id: "paceville",
    image: "/images/places/paceville.jpg",
    title: "Spinola / St. Julian’s / Paceville",
    subtitle: "Optie B · terug naar de baai",
    body: [
      "Geen zin in het festival: terug naar Spinola Bay, St. Julian’s en Paceville. Biertje, bars, en eventueel de club in.",
      "Van Ta’ Qali is het een taxi van een kwartier naar de baai.",
    ],
    links: [
      { label: "Spinola Bay op Maps", href: "https://maps.google.com/?q=Spinola+Bay+St+Julians" },
      { label: "Paceville", href: "https://maps.google.com/?q=Paceville+Malta" },
      { label: "St. Julian’s", href: "https://maps.google.com/?q=St+Julians+Malta" },
    ],
  },
  "naar-valletta": {
    id: "naar-valletta",
    image: "/images/places/ferry.jpg",
    title: "Naar Valletta",
    subtitle: "Bus of ferry vanaf Sliema",
    body: [
      "De ferry vanaf Sliema Ferries is de mooiste oversteek, zo’n 10–15 minuten over Marsamxett.",
      "Bus is goedkoper en stopt dichter bij Lascaris. Tallinja-app of contactloos betalen.",
    ],
    links: [
      { label: "Valletta Ferry", href: "https://www.vallettaferryservices.com" },
      { label: "Sliema Ferries op Maps", href: "https://maps.google.com/?q=Sliema+Ferries+Malta" },
      { label: "Tallinja (bussen)", href: "https://www.publictransport.com.mt" },
    ],
  },
  lascaris: {
    id: "lascaris",
    image: "/images/places/lascaris.jpg",
    title: "Lascaris War Rooms",
    subtitle: "Ondergronds WWII-hoofdkwartier",
    body: [
      "Onder Valletta: het geallieerde hoofdkwartier van de Tweede Wereldoorlog. Plotting rooms, kaarten, de invasie van Sicilië.",
      "€20 volw. Niet op de Heritage Malta-pas. Online boeken is slim.",
    ],
    tips: ["Koel en vochtig ondergronds"],
    links: [
      { label: "Lascaris War Rooms", href: "https://www.lascariswarrooms.com" },
      { label: "Open in Maps", href: "https://maps.google.com/?q=Lascaris+War+Rooms+Valletta" },
    ],
  },
  "koffie-valletta": {
    id: "koffie-valletta",
    image: "/images/places/republic.jpg",
    title: "Koffie in Valletta",
    subtitle: "Terras in de stad",
    body: [
      "Na Lascaris even bovengronds: koffie op Republic Street, bij de Lower Barrakka of een zijstraat met gallarijas.",
    ],
    links: [
      { label: "Republic Street op Maps", href: "https://maps.google.com/?q=Republic+Street+Valletta" },
      { label: "Valletta (VisitMalta)", href: "https://www.visitmalta.com/en/location/valletta/" },
    ],
  },
  barrakka: {
    id: "barrakka",
    image: "/images/places/barrakka.jpg",
    title: "Upper Barrakka Gardens",
    subtitle: "Uitzicht over de Grand Harbour",
    body: [
      "De klassieke arcade boven de haven: Valletta aan de ene kant, Birgu en Fort St. Angelo aan de andere.",
      "De lift naar de waterkant zit pal ernaast als je later de dgħajsa pakt.",
    ],
    links: [
      { label: "Open in Maps", href: "https://maps.google.com/?q=Upper+Barrakka+Gardens+Valletta" },
      { label: "Barrakka Lift", href: "https://maps.google.com/?q=Barrakka+Lift+Valletta" },
    ],
  },
  saluting: {
    id: "saluting",
    image: "/images/places/saluting.jpg",
    title: "Saluting Battery",
    subtitle: "€3 · 12:00 (soms 16:00)",
    body: [
      "Onder de Upper Barrakka: historische kanonnen. Op de planning om 12:00 — 15 minuten eerder aanwezig.",
      "Vanaf de tuinen vaak gratis te zien; de batterij zelf is een kleine tour van €3.",
    ],
    links: [
      { label: "Saluting Battery", href: "https://www.salutingbattery.com" },
      { label: "Open in Maps", href: "https://maps.google.com/?q=Saluting+Battery+Valletta" },
    ],
  },
  "lunch-valletta": {
    id: "lunch-valletta",
    image: "/images/places/republic.jpg",
    title: "Lunch in Valletta",
    subtitle: "Lokale sfeer",
    body: [
      "Lunch in de stad voor de tunnels: Strait Street, Merchant Street of een bakkerij voor pastizzi en koffie.",
    ],
    links: [
      { label: "Valletta (VisitMalta)", href: "https://www.visitmalta.com/en/location/valletta/" },
      { label: "Strait Street op Maps", href: "https://maps.google.com/?q=Strait+Street+Valletta" },
    ],
  },
  "war-hq": {
    id: "war-hq",
    image: "/images/places/lascaris.jpg",
    title: "War H.Q. Tunnel Tour",
    subtitle: "Ondergrondse tour",
    body: [
      "De War Headquarters-tunnels sluiten aan op Lascaris: kilometers gangen onder Valletta.",
      "€17, timeslots rond 10:00 of 13:30. Past niet in het uur-tot-uur — extra als er tijd is.",
    ],
    links: [
      { label: "Lascaris / tunnels", href: "https://www.lascariswarrooms.com" },
      { label: "Open in Maps", href: "https://maps.google.com/?q=Lascaris+War+Rooms+Valletta" },
    ],
  },
  dghajsa: {
    id: "dghajsa",
    image: "/images/places/dghajsa.jpg",
    title: "Met dgħajsa naar Birgu",
    subtitle: "15:30 · korte overtocht",
    body: [
      "Traditionele havenboot van Valletta (Waterfront / Barrakka Lift) naar Birgu. Een paar minuten, veel sfeer.",
      "Cash voor de schipper. Alternatief: Three Cities ferry, zomerdienst tot 00:45, geen reservering.",
    ],
    links: [
      { label: "Barrakka Lift op Maps", href: "https://maps.google.com/?q=Barrakka+Lift+Valletta" },
      { label: "Birgu waterfront", href: "https://maps.google.com/?q=Birgu+Waterfront+Malta" },
      { label: "Three Cities ferry", href: "https://www.vallettaferryservices.com" },
    ],
  },
  birgu: {
    id: "birgu",
    image: "/images/places/birgu.jpg",
    title: "Malta at War Museum",
    subtitle: "Birgu · museum + schuilkelders",
    body: [
      "In Birgu (Vittoriosa): museum in een schuilkeldercomplex uit WO2.",
      "€14 volw. Niet op de Heritage Malta-pas. Staat als extra op maandag.",
    ],
    links: [
      { label: "Malta at War Museum", href: "https://www.maltaatwarmuseum.com" },
      { label: "Open in Maps", href: "https://maps.google.com/?q=Malta+at+War+Museum+Birgu" },
    ],
  },
  "birgu-biertje": {
    id: "birgu-biertje",
    image: "/images/places/birgu-marina.jpg",
    title: "Biertje in Birgu",
    subtitle: "Aan de waterfront",
    body: [
      "Dockyard Creek: terras aan het water, Valletta tegenover. Even zitten voor St. Elmo of de ferry terug.",
    ],
    links: [
      { label: "Birgu waterfront", href: "https://maps.google.com/?q=Birgu+Waterfront+Malta" },
    ],
  },
  "st-elmo": {
    id: "st-elmo",
    image: "/images/places/st-elmo.jpg",
    title: "Fort St. Elmo",
    subtitle: "National War Museum",
    body: [
      "Fort aan de monding van de Grand Harbour. National War Museum, inclusief het George Cross van 1942.",
      "Ca. €10 volw., of Heritage Malta-pas. Openingstijden vooraf checken.",
    ],
    links: [
      { label: "Fort St. Elmo", href: "https://heritagemalta.mt/explore/fort-st-elmo-national-war-museum/" },
      { label: "Open in Maps", href: "https://maps.google.com/?q=Fort+St+Elmo+Valletta" },
    ],
  },
  "diner-valletta": {
    id: "diner-valletta",
    image: "/images/places/valletta-night.jpg",
    title: "Diner in Valletta",
    subtitle: "Op een leuke plek",
    body: [
      "Strait Street, Merchants Street of St. George’s Square. Check de laatste ferry terug naar Sliema als je niet tot de live muziek blijft.",
    ],
    links: [
      { label: "Strait Street op Maps", href: "https://maps.google.com/?q=Strait+Street+Valletta" },
      { label: "Ferry terug", href: "https://www.vallettaferryservices.com" },
    ],
  },
  "live-muziek": {
    id: "live-muziek",
    image: "/images/places/valletta-night.jpg",
    title: "Live muziek in Valletta",
    subtitle: "Bridge Bar · Babel Bistro · The Pub",
    body: [
      "Drie klassiekers: Bridge Bar (jazz op het bastion, vaak vrijdag/zaterdag — maandag checken), Babel Bistro, of The Pub (O’Brien’s, bekend van Oliver Reed).",
      "Niet alle drie spelen elke maandag. Even kijken wat die avond open is.",
    ],
    links: [
      { label: "Bridge Bar op Maps", href: "https://maps.google.com/?q=Bridge+Bar+Valletta" },
      { label: "The Pub Valletta", href: "https://maps.google.com/?q=The+Pub+Valletta+Oliver+Reed" },
      { label: "Babel Bistro", href: "https://maps.google.com/?q=Babel+Bistro+Valletta" },
    ],
  },
  "mellieha-bay": {
    id: "mellieha-bay",
    image: "/images/places/mellieha-bay.jpg",
    title: "Naar Mellieħa Bay",
    subtitle: "Het noorden in",
    body: [
      "Għadira / Mellieħa Bay: langste zandstrand van Malta. Van Sliema met bus of taxi, grofweg 40–50 minuten.",
      "De speedboot vertrekt 10:30 — ruim op tijd daar zijn.",
    ],
    links: [
      { label: "Mellieħa Bay op Maps", href: "https://maps.google.com/?q=Mellieha+Bay+Malta" },
      { label: "Mellieħa", href: "https://www.mellieha.com" },
    ],
  },
  speedboot: {
    id: "speedboot",
    image: "/images/places/blue-lagoon.jpg",
    title: "Speedboottocht",
    subtitle: "10:30 · Comino, grotten, Blue Lagoon",
    body: [
      "Vanaf Mellieħa / het noorden: Comino, zeegrotten, Blue Lagoon en Crystal Lagoon. Zwemmen en snorkelen, ongeveer 2,5 uur.",
      "Snorkelspullen te huur. Zee bepaalt of de grotten open zijn — reserveren bij mooi weer.",
    ],
    tips: ["Rashguard, drybag, zonnebrand", "Contant of kaart: vraag bij boeking"],
    links: [
      { label: "Blue Lagoon op Maps", href: "https://maps.google.com/?q=Blue+Lagoon+Comino" },
      { label: "Crystal Lagoon", href: "https://maps.google.com/?q=Crystal+Lagoon+Comino" },
      { label: "Mellieħa Bay", href: "https://maps.google.com/?q=Mellieha+Bay+Malta" },
    ],
  },
  "lunch-mellieha": {
    id: "lunch-mellieha",
    image: "/images/places/mellieha.jpg",
    title: "Lunch in Mellieħa",
    subtitle: "Aan het strand of in de buurt",
    body: [
      "Na de boot: lunch op Mellieħa Bay of omhoog in het dorp, met uitzicht op de baai.",
    ],
    links: [
      { label: "Mellieħa Bay op Maps", href: "https://maps.google.com/?q=Mellieha+Bay+Malta" },
    ],
  },
  "air-raid": {
    id: "air-raid",
    image: "/images/places/shelters.jpg",
    title: "Mellieħa Air Raid Shelters",
    subtitle: "± 30–45 minuten",
    body: [
      "WOII-schuilkelders onder Mellieħa: gangen waar het dorp schuilde tijdens de bombardementen.",
      "Klein museum, snel gedaan. Daarna terug naar het strand.",
    ],
    links: [
      { label: "Open in Maps", href: "https://maps.google.com/?q=Mellieha+Air+Raid+Shelters" },
      { label: "Mellieħa", href: "https://www.mellieha.com" },
    ],
  },
  "noord-vrij": {
    id: "noord-vrij",
    image: "/images/places/mellieha.jpg",
    title: "Vrije tijd in Noord-Malta",
    subtitle: "Strand, relaxen, korte stops",
    body: [
      "Geen vast programma: liggen op Mellieħa Bay, een stukje Għajn Tuffieħa, of gewoon niks. Het is de rustigste middag van de trip.",
    ],
    links: [
      { label: "Mellieħa Bay", href: "https://maps.google.com/?q=Mellieha+Bay+Malta" },
      { label: "Għajn Tuffieħa", href: "https://maps.google.com/?q=Ghajn+Tuffieha+Malta" },
    ],
  },
  footvolley: {
    id: "footvolley",
    image: "/images/places/mellieha-bay.jpg",
    title: "Strand & footvolley",
    subtitle: "Mellieħa Bay",
    body: [
      "Zand, ondiep water, zon. Footvolley als het net er is of als we hem meenemen — anders zwemmen en liggen.",
    ],
    tips: ["Handdoek, extra shirt, na de zee even afspoelen voor de rit terug"],
    links: [
      { label: "Mellieħa Bay op Maps", href: "https://maps.google.com/?q=Mellieha+Bay+Malta" },
    ],
  },
  "terug-sliema": {
    id: "terug-sliema",
    image: "/images/places/sliema-promenade.jpg",
    title: "Terug naar Sliema",
    subtitle: "Opfrissen in het hotel",
    body: [
      "Terug naar het Carlton, douchen, dan de laatste avond: Anjunadeep-sfeer of rustig met live muziek.",
    ],
    links: [
      { label: "Hotel op Maps", href: "https://maps.google.com/?q=Carlton+Hotel+261+Tower+Road+Sliema+Malta" },
    ],
  },
  anjunadeep: {
    id: "anjunadeep",
    image: "/images/places/spinola.jpg",
    title: "Anjunadeep pre-parties",
    subtitle: "Optie A · St. Julian’s / Sliema / Attard",
    body: [
      "Het officiële Anjunadeep Malta-weekend is 8–11 oktober — ná onze terugvlucht. Dinsdagavond gaat het om voorfeesten en afters in St. Julian’s, Sliema of Attard (UNO).",
      "Check die week local listings. Geen ticket verplicht; het is de vrije keuze van de laatste avond.",
    ],
    links: [
      { label: "Anjunadeep Malta", href: "https://malta.anjunadeep.com/" },
      { label: "St. Julian’s op Maps", href: "https://maps.google.com/?q=St+Julians+Malta" },
      { label: "UNO Ta’ Qali", href: "https://maps.google.com/?q=UNO+Malta+Crafts+Village+Ta+Qali" },
    ],
  },
  "cafes-live": {
    id: "cafes-live",
    image: "/images/places/spinola.jpg",
    title: "Cafés en live muziek",
    subtitle: "Optie B · laatste avond",
    body: [
      "Rustiger: Marco Polo rooftop in Sliema, English Café, of de bars aan Spinola Bay.",
      "Geen festivaldrukte, wel uitzicht en een laat drankje.",
    ],
    links: [
      { label: "Marco Polo Sliema", href: "https://maps.google.com/?q=Marco+Polo+Rooftop+Bar+Sliema" },
      { label: "English Café Sliema", href: "https://maps.google.com/?q=English+Cafe+Sliema" },
      { label: "Spinola Bay", href: "https://maps.google.com/?q=Spinola+Bay+St+Julians" },
    ],
  },
  transfer: {
    id: "transfer",
    image: "/images/places/malta-airport.jpg",
    title: "Transfer naar het vliegveld",
    subtitle: "05:15 · ca. 25–35 min",
    body: [
      "Pick-up bij het Carlton om 05:15. Zonder verkeer ±25 minuten naar MLA. Receptie kan de avond ervoor een taxi zetten.",
      "Vroege vlucht: ruim op tijd, online check-in en bagage vooraf.",
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
  "valletta-rooftop": {
    id: "valletta-rooftop",
    image: "/images/places/valletta-night.jpg",
    title: "Valletta rooftop drankje",
    subtitle: "Zaterdag extra",
    body: [
      "Als Notte Bianca te druk is of jullie eerder klaar zijn: een rooftop in Valletta met uitzicht over de haven.",
      "The Harbour Club, Bridge Bar (bastion) of een hotelbar. Check of het open is tijdens Notte Bianca.",
    ],
    links: [
      { label: "Bridge Bar op Maps", href: "https://maps.google.com/?q=Bridge+Bar+Valletta" },
      { label: "Valletta waterfront", href: "https://maps.google.com/?q=Valletta+Waterfront" },
    ],
  },
  "harbour-cruise": {
    id: "harbour-cruise",
    image: "/images/places/dghajsa.jpg",
    title: "Sunset harbour cruise",
    subtitle: "Zaterdag extra",
    body: [
      "Korte cruise over de Grand Harbour rond zonsondergang. Past krap tussen diner (19:00) en Notte Bianca (21:00).",
      "Alleen doen als de timing klopt — anders bewaren voor een andere avond.",
    ],
    links: [
      { label: "Valletta Waterfront", href: "https://maps.google.com/?q=Valletta+Waterfront" },
      { label: "Sliema Ferries", href: "https://maps.google.com/?q=Sliema+Ferries+Malta" },
    ],
  },
  "haven-wandeling": {
    id: "haven-wandeling",
    image: "/images/places/barrakka.jpg",
    title: "Avondwandeling aan de haven",
    subtitle: "Zaterdag extra",
    body: [
      "Valletta Waterfront of de Sliema-promenade na het diner, voor Notte Bianca begint.",
    ],
    links: [
      { label: "Valletta Waterfront", href: "https://maps.google.com/?q=Valletta+Waterfront" },
      { label: "Sliema promenade", href: "https://maps.google.com/?q=Tower+Road+Sliema" },
    ],
  },
  marsa: {
    id: "marsa",
    image: "/images/places/ta-qali.jpg",
    title: "Marsa paardenbaan",
    subtitle: "Zaterdag extra · checken",
    body: [
      "Marsa Horse Racing Club: zondags vaak races, zaterdag soms training of niks. Eerst de kalender checken — niet inplannen als het dicht is.",
    ],
    links: [
      { label: "Marsa Race Track", href: "https://maps.google.com/?q=Marsa+Race+Track+Malta" },
    ],
  },
  "naar-rabat": {
    id: "naar-rabat",
    image: "/images/places/rabat-square.jpg",
    title: "Naar Rabat",
    subtitle: "09:30 · bus of taxi",
    body: [
      "Van Sliema naar Rabat/Mdina: bus (Tallinja, grofweg 40–50 min) of taxi (sneller, splitsen).",
      "Uitstappen bij Mdina Gate / Rabat centrum. Catacomben liggen een paar minuten lopen.",
    ],
    links: [
      { label: "Tallinja", href: "https://www.publictransport.com.mt" },
      { label: "Mdina poort op Maps", href: "https://maps.google.com/?q=Mdina+Gate+Malta" },
    ],
  },
  "malta-classic": {
    id: "malta-classic",
    image: "/images/places/ta-qali.jpg",
    title: "Malta Classic",
    subtitle: "4–31 oktober · Ta’ Qali",
    body: [
      "Klassieke auto’s rond Ta’ Qali, pal bij het stadion. Handig tussen lunch en de wedstrijd om 18:00.",
      "Tickets vanaf €15. Hillclimb is gratis. Extra paddock-tijd staat bij de dingen die we missen.",
    ],
    links: [
      { label: "Malta Classic", href: "https://www.maltaclassic.com" },
      { label: "Ta’ Qali op Maps", href: "https://maps.google.com/?q=Ta+Qali+Malta" },
    ],
  },
  "rabat-ajax": {
    id: "rabat-ajax",
    image: "/images/places/rabat-square.jpg",
    title: "Rabat Ajax FC",
    subtitle: "Geen match in onze kalender",
    body: [
      "Lokale club uit Rabat. In het weekend van 3–7 oktober staat er geen thuiswedstrijd in de kalender — daarom extra, niet in het uur-tot-uur.",
    ],
    links: [
      { label: "Rabat Ajax (MFA)", href: "https://www.mfa.com.mt" },
    ],
  },
  "st-georges": {
    id: "st-georges",
    image: "/images/places/ta-qali.jpg",
    title: "St. George’s FC",
    subtitle: "11 oktober — na de trip",
    body: [
      "Wedstrijd op 11 oktober, vier dagen na onze terugvlucht. Leuk om te weten, niet te doen deze reis.",
    ],
    links: [
      { label: "Malta FA", href: "https://www.mfa.com.mt" },
    ],
  },
  domus: {
    id: "domus",
    image: "/images/places/rabat.jpg",
    title: "Domus Romana",
    subtitle: "Rabat · Heritage Malta-pas",
    body: [
      "Romeinse stadswoning met mozaïeken, pal tussen Rabat en Mdina. Past krap naast catacomben en Mdina — daarom extra.",
      "Valt onder de Heritage Malta Multisite Pass.",
    ],
    links: [
      { label: "Domus Romana", href: "https://heritagemalta.mt/explore/domus-romana/" },
      { label: "Open in Maps", href: "https://maps.google.com/?q=Domus+Romana+Rabat+Malta" },
    ],
  },
  "blijven-birgu": {
    id: "blijven-birgu",
    image: "/images/places/birgu-marina.jpg",
    title: "Blijven in Birgu",
    subtitle: "Optie 1 · vanaf 18:00",
    body: [
      "Diner aan Dockyard Creek, steegjes, uitzicht op Valletta. Ferry terug tot laat (zomerdienst tot 00:45).",
    ],
    links: [
      { label: "Birgu waterfront", href: "https://maps.google.com/?q=Birgu+Waterfront+Malta" },
      { label: "Three Cities ferry", href: "https://www.vallettaferryservices.com" },
    ],
  },
  "terug-valletta": {
    id: "terug-valletta",
    image: "/images/places/valletta-night.jpg",
    title: "Terug naar Valletta",
    subtitle: "Optie 2 · extra’s in de stad",
    body: [
      "Dgħajsa of ferry terug. In Valletta: Underground Valletta, War H.Q.-tunnels, live muziek (Bridge Bar / The Pub) of diner in Strait Street.",
      "Die extra’s staan onderaan de dag onder ‘5 dingen die we missen’.",
    ],
    links: [
      { label: "Ferry Three Cities", href: "https://www.vallettaferryservices.com" },
      { label: "Strait Street", href: "https://maps.google.com/?q=Strait+Street+Valletta" },
    ],
  },
  underground: {
    id: "underground",
    image: "/images/places/lascaris.jpg",
    title: "Underground Valletta",
    subtitle: "€15 / zonder gids",
    body: [
      "Ondergrondse gangen en cisternen onder de stad, los van Lascaris. €15 zonder gids.",
      "Past niet in het uur-tot-uur van maandag — extra als jullie terug naar Valletta gaan.",
    ],
    links: [
      { label: "Underground Valletta", href: "https://maps.google.com/?q=Underground+Valletta" },
    ],
  },
  "st-angelo": {
    id: "st-angelo",
    image: "/images/places/st-angelo.jpg",
    title: "Fort St. Angelo",
    subtitle: "Birgu · extra",
    body: [
      "Het grote fort in Birgu, tegenover Valletta. Heritage Malta. Staat niet in het uur-tot-uur omdat St. Elmo al op het programma staat.",
    ],
    links: [
      { label: "Fort St. Angelo", href: "https://heritagemalta.mt/explore/fort-st-angelo/" },
      { label: "Open in Maps", href: "https://maps.google.com/?q=Fort+St+Angelo+Birgu" },
    ],
  },
  "three-cities": {
    id: "three-cities",
    image: "/images/places/senglea.jpg",
    title: "Senglea / Cospicua",
    subtitle: "Extra ronde Three Cities",
    body: [
      "Na Birgu verder naar Senglea (Gardjola Gardens, klassiek uitzicht) of Cospicua. Alleen als de benen het nog doen.",
    ],
    links: [
      { label: "Gardjola Gardens", href: "https://maps.google.com/?q=Gardjola+Gardens+Senglea" },
      { label: "Three Cities ferry", href: "https://www.vallettaferryservices.com" },
    ],
  },
  popeye: {
    id: "popeye",
    image: "/images/places/mellieha.jpg",
    title: "Popeye Village",
    subtitle: "Anchor Bay · extra",
    body: [
      "Filmset van Popeye (1980) aan Anchor Bay, vlak bij Mellieħa. Bootcruise of het park zelf.",
      "Past krap naast de speedboot om 10:30 — alleen als jullie de boot skippen of later overhouden.",
    ],
    links: [
      { label: "Popeye Village", href: "https://www.popeyemalta.com" },
      { label: "Open in Maps", href: "https://maps.google.com/?q=Popeye+Village+Malta" },
    ],
  },
  "coral-lagoon": {
    id: "coral-lagoon",
    image: "/images/places/cirkewwa.jpg",
    title: "Coral Lagoon viewpoint",
    subtitle: "Noord-Malta extra",
    body: [
      "Natuurlijke kalksteenboog bij Ċirkewwa. Vaak vanaf het water op de speedboot, of te voet als uitzichtpunt.",
    ],
    links: [
      { label: "Coral Lagoon op Maps", href: "https://maps.google.com/?q=Coral+Lagoon+Malta" },
    ],
  },
  "wwii-battery": {
    id: "wwii-battery",
    image: "/images/places/rinella.jpg",
    title: "WWII-battery / uitzichtpunt",
    subtitle: "Noord-Malta extra",
    body: [
      "Kustbatterijen en uitzicht boven Mellieħa / Ċirkewwa. Geen vaste tour — een stop als de vrije middag lang is.",
    ],
    links: [
      { label: "Fort Campbell op Maps", href: "https://maps.google.com/?q=Fort+Campbell+Malta" },
    ],
  },
  ghadira: {
    id: "ghadira",
    image: "/images/places/mellieha-bay.jpg",
    title: "Għadira Nature Reserve",
    subtitle: "Naast Mellieħa Bay",
    body: [
      "Vogelreservaat pal achter het strand. Kort pad, rustig, gratis of een kleine bijdrage. Mooi als het strand te druk is.",
    ],
    links: [
      { label: "Għadira Nature Reserve", href: "https://maps.google.com/?q=Ghadira+Nature+Reserve+Malta" },
    ],
  },
  "golden-sunset": {
    id: "golden-sunset",
    image: "/images/places/mellieha.jpg",
    title: "Sunset Golden Bay / Għajn Tuffieħa",
    subtitle: "Dinsdag extra",
    body: [
      "Als jullie niet om 17:00 teruggaan: zonsondergang op Golden Bay of Għajn Tuffieħa, tien minuten van Mellieħa.",
    ],
    links: [
      { label: "Golden Bay", href: "https://maps.google.com/?q=Golden+Bay+Malta" },
      { label: "Għajn Tuffieħa", href: "https://maps.google.com/?q=Ghajn+Tuffieha+Malta" },
    ],
  },
  checkout: {
    id: "checkout",
    image: "/images/places/sliema.jpg",
    title: "Opstaan / uitchecken",
    subtitle: "04:45",
    body: [
      "Vroege vlucht. Rekening en restant €380 eventueel al de avond ervoor. Paspoort, boarding pass, tassen bij de deur.",
      "Laatste avond niet te laat maken.",
    ],
    links: [
      { label: "Bellen receptie", href: "tel:+35621315765" },
      { label: "Hotel op Maps", href: "https://maps.google.com/?q=Carlton+Hotel+261+Tower+Road+Sliema+Malta" },
    ],
  },
  "sunrise-sliema": {
    id: "sunrise-sliema",
    image: "/images/places/sliema-promenade.jpg",
    title: "Sunrise walk in Sliema",
    subtitle: "Woensdag extra — te vroeg",
    body: [
      "Zonsopkomst op de promenade is mooi, maar om 04:45 uitchecken is te krap. Alleen als de vlucht ooit verschuift.",
    ],
    links: [
      { label: "Tower Road", href: "https://maps.google.com/?q=Tower+Road+Sliema" },
    ],
  },
  "laatste-koffie": {
    id: "laatste-koffie",
    image: "/images/places/sliema-promenade.jpg",
    title: "Laatste koffie aan zee",
    subtitle: "Woensdag extra — te vroeg",
    body: [
      "Cafés aan Tower Road gaan niet open voor de transfer van 05:15. Eventueel koffie op MLA.",
    ],
    links: [
      { label: "Sliema promenade", href: "https://maps.google.com/?q=Tower+Road+Sliema" },
    ],
  },
  souvenir: {
    id: "souvenir",
    image: "/images/places/republic.jpg",
    title: "Souvenirshop",
    subtitle: "Eerder in de week doen",
    body: [
      "Woensdagochtend is te vroeg. Pak zondag in Rabat/Mdina of maandag in Valletta: Honoring Crafts, The Malta Experience shop, of Duty Free op MLA.",
    ],
    links: [
      { label: "Republic Street", href: "https://maps.google.com/?q=Republic+Street+Valletta" },
    ],
  },
  lounge: {
    id: "lounge",
    image: "/images/places/malta-airport.jpg",
    title: "Airport lounge breakfast",
    subtitle: "MLA · extra",
    body: [
      "Malta Airport heeft een lounge na security. Handig als jullie ruim op tijd zijn — om 07:25 boarded de vlucht al vroeg.",
    ],
    links: [
      { label: "Malta Airport", href: "https://www.maltairport.com" },
    ],
  },
  ochtendwandeling: {
    id: "ochtendwandeling",
    image: "/images/places/sliema.jpg",
    title: "Korte ochtendwandeling",
    subtitle: "Woensdag extra — te vroeg",
    body: [
      "Een rondje Tower Road voor de taxi. Alleen een paar minuten — de transfer is 05:15.",
    ],
    links: [
      { label: "Hotel op Maps", href: "https://maps.google.com/?q=Carlton+Hotel+261+Tower+Road+Sliema+Malta" },
    ],
  },
};

export function placeForItem(item: Pick<DayItem, "text" | "place">): PlaceInfo | undefined {
  const id = item.place;
  return id ? PLACE_INFO[id] : undefined;
}
