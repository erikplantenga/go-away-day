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
      "Vroegchristelijk grafcomplex onder Rabat: gangen, agaptafels en familiegraven in de zachte kalksteen.",
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
      "Defected Malta 2026 loopt 1–4 oktober. Tickets via de officiële site — los van het stadion.",
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
      "Niet op de Heritage Malta-pas. Ticket ter plaatse of online.",
    ],
    tips: ["Koel en vochtig ondergronds", "Combineer met de War H.Q. Tunnel Tour later op de dag"],
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
    subtitle: "Dagelijkse kanonschoten",
    body: [
      "Onder de Upper Barrakka: historische kanonnen die nog steeds afgaan — meestal rond 16:00, check de tijd ter plaatse.",
      "Gratis vanaf de tuinen te zien; de batterij zelf is een kleine tour.",
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
      "De War Headquarters-tunnels sluiten aan op Lascaris: kilometers gangen onder Valletta, gegraven in de oorlog.",
      "Vaak een apart ticket / timeslot. Reserveren scheelt wachten.",
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
    subtitle: "Korte overtocht over de haven",
    body: [
      "Traditionele havenboot van Valletta (Waterfront / Barrakka Lift) naar Birgu. Een paar minuten, veel sfeer.",
      "Cash voor de schipper is handig. Alternatief: Three Cities ferry.",
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
      "In Birgu (Vittoriosa): museum in een schuilkeldercomplex uit WO2, daarna steegjes en uitzicht op Valletta.",
      "Niet op de Heritage Malta-pas.",
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
      "Valt onder de Heritage Malta-pas. Ook een van de Defected-locaties op andere avonden.",
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

export function placeForItem(item: Pick<DayItem, "text" | "place">): PlaceInfo | undefined {
  const id = item.place;
  return id ? PLACE_INFO[id] : undefined;
}
