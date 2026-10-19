export type VisitStop = {
  name: string;
  category: "Battlefield" | "Museum" | "Herdenking" | "Stadje";
  when: string;
  description: string;
  location: string;
  mapQuery: string;
  infoUrl: string;
  note: string;
  optional?: boolean;
  bookingUrl?: string;
};

export type BeerStop = {
  name: string;
  location: string;
  description: string;
  mapQuery: string;
  infoUrl: string;
  note: string;
  phone?: string;
  seasonal?: boolean;
  alternative?: { name: string; mapQuery: string; infoUrl: string };
};

export type DayPlaces = {
  visits?: readonly VisitStop[];
  beer?: BeerStop;
};

// Selected from venue websites, museums, local tourism and battlefield sources.
// Availability and opening on the eventual 2027 travel dates are not confirmed.
export const ROUTE_PLACES: Partial<Record<string, DayPlaces>> = {
  "catania-arrival": {
    visits: [{
      name: "Museo Storico dello Sbarco in Sicilia 1943",
      category: "Museum",
      when: "Zaterdag · bij vroege aankomst",
      description: "Begin met het verhaal van de geallieerde landingen. Dit museum geeft context voor de stranden en slagvelden die jullie daarna bezoeken.",
      location: "Le Ciminiere · Piazzale Rocco Chinnici / Viale Africa, Catania",
      mapQuery: "Museo Storico dello Sbarco in Sicilia 1943 Le Ciminiere Catania",
      infoUrl: "https://cittametropolitana.ct.it/it/page/museo-storico-dello-sbarco-in-sicilia-1943",
      note: "Optioneel vóór de transfer naar Gela. Plan ongeveer 1,5–2 uur bezoek en extra tijd voor de rit naar het centrum. Alleen inpassen als de vlucht vroeg genoeg aankomt; opening op de reisdatum bevestigen.",
      optional: true,
      bookingUrl: "https://cittametropolitana.ct.it/it/page/museo-storico-dello-sbarco-in-sicilia-1943",
    }],
  },
  gela: {
    visits: [{
      name: "De landingstranden van Gela",
      category: "Battlefield",
      when: "Zaterdag · na aankomst in Gela",
      description: "Een eerste wandeling langs de kust van de Amerikaanse landingen van 10 juli 1943. Het begin van jullie Husky-verhaal, met tijd om het landschap rustig in je op te nemen.",
      location: "Lungomare Federico II di Svevia · Gela",
      mapQuery: "Lungomare Federico II di Svevia Gela",
      infoUrl: "https://www.museosicilia1943.it/site/gela-ponte-dirillo-2/",
      note: "Wandeling aan de kust; dit is een landingsgebied. Exacte historische posities kun je met de battlefield-gids voor zondag afstemmen.",
    }],
    beer: {
      name: "La Mandragola da Tino",
      location: "Historisch centrum · Gela",
      description: "De eerste avond een ristopub met Siciliaans eten en craftbier. Een ontspannen plek om de landing te vieren en de zondagroute door te nemen.",
      mapQuery: "La Mandragola da Tino Gela",
      infoUrl: "https://gelatourism.com/la-mandragola-da-tino/",
      note: "Voorgesteld voor zaterdagavond. Actueel adres, opening en een tafel voor jullie reisdatum nog bevestigen.",
    },
  },
  scoglitti: {
    visits: [
      {
        name: "Ponte Dirillo · bunkers en memorial",
        category: "Battlefield",
        when: "Zondag · tussen Gela en Scoglitti",
        description: "De verdedigingsstellingen en het memorial maken de strijd rond de brug tastbaar. Dit wordt de belangrijkste battlefield-stop van de fietsdag.",
        location: "Omgeving Ponte Dirillo · tussen Gela en Vittoria",
        mapQuery: "Ponte Dirillo memorial Gela",
        infoUrl: "https://www.museosicilia1943.it/site/gela-ponte-dirillo-2/",
        bookingUrl: "https://www.impavidus.it/en/",
        note: "Voorgestelde gids: Impavidus / Roberto Piccione. Vraag een bezoek op maat aan en stem toegang, ontmoetingspunt en de aansluiting op jullie fietsroute af. Fietsroute inclusief stops vóór vertrek op maximaal 50 km vastleggen.",
      },
      {
        name: "Biazza Ridge",
        category: "Battlefield",
        when: "Zondag · extra stop met gids",
        description: "Het terrein van de gevechten van Gavins Amerikaanse parachutisten tegen de Duitse tegenaanval. Juist hier helpt een gids om te begrijpen wat je ziet.",
        location: "Slagveld ten oosten van Gela",
        mapQuery: "Biazza Ridge Sicily battlefield",
        infoUrl: "https://www.asomf.org/airborne-operations-in-sicily-operation-husky/",
        bookingUrl: "https://www.impavidus.it/en/",
        note: "Extra optie, geen vaste omweg in de fietsafstand. Alleen toevoegen als de complete etappe onder 50 km blijft; anders met de gids per auto organiseren.",
        optional: true,
      },
      {
        name: "De landingskust van Scoglitti",
        category: "Battlefield",
        when: "Zondag · bij aankomst",
        description: "Eindig de dag aan de kust waar ook Amerikaanse troepen aan land kwamen. Daarna de fiets wegzetten en te voet het plaatsje in.",
        location: "Haven en kust · Scoglitti",
        mapQuery: "Porto di Scoglitti",
        infoUrl: "https://www.museosicilia1943.it/site/la-guerra-nel-ragusano/",
        note: "Een kustwandeling past bij de aankomst. De gids kan het precieze landingsverhaal en passende uitzichtpunten toelichten.",
      },
    ],
    beer: {
      name: "CLAD Pub",
      location: "Piazza Cavour 49/A · Scoglitti",
      description: "Bier en een hap eten op het plein. Onze keuze voor de zondagavond in Scoglitti, op loopafstand van het centrum.",
      mapQuery: "CLAD Pub Piazza Cavour Scoglitti",
      infoUrl: "https://www.cladpub.it/",
      phone: "+393773761143",
      seasonal: true,
      note: "De locatie in Scoglitti is volgens de lokale toerismesite alleen in de zomer open. Seizoen en zondagopening voor jullie reisdata bevestigen.",
      alternative: {
        name: "Bar del Porto",
        mapQuery: "Bar del Porto Via Genova Scoglitti",
        infoUrl: "https://www.scoglittiinside.it/en/activity/bar-del-porto/",
      },
    },
  },
  marina: {
    beer: {
      name: "SODO Bar",
      location: "Via del Mare 1 · Marina di Ragusa",
      description: "Een adres voor lokale craftbieren, met iets te eten erbij. Een mooie afsluiting van de ontspannen kustdag.",
      mapQuery: "SODO Bar Via del Mare 1 Marina di Ragusa",
      infoUrl: "https://sodobar.it/",
      phone: "+393279005368",
      note: "Voorgesteld voor maandagavond, nadat de fietsen zijn weggezet. Opening en een tafel voor jullie reisdatum bevestigen.",
    },
  },
  modica: {
    visits: [
      {
        name: "Scicli · het historische centrum",
        category: "Stadje",
        when: "Dinsdag · onderweg naar Modica",
        description: "Een pauze tussen de barokke gevels van Via Francesco Mormino Penna. Tijd voor koffie en een rondje door het centrum voordat de klim naar Modica verdergaat.",
        location: "Via Francesco Mormino Penna · Scicli",
        mapQuery: "Via Francesco Mormino Penna Scicli",
        infoUrl: "https://www.visitsicily.info/scicli-appunti-per-la-visita/",
        note: "Culturele tussenstop op de geplande etappe. Neem de museumaanrijroute en alle lokale omwegen mee in de limiet van 50 km.",
      },
      {
        name: "Museo della Memoria · Sicilia 1943",
        category: "Museum",
        when: "Dinsdag · op afspraak",
        description: "De historische afsluiter: voorwerpen, uniformen en verhalen over de oorlog op Sicilië. Het museum organiseert ook bezoeken aan oorlogslocaties.",
        location: "Via Sorda Sampieri 46/D · Modica",
        mapQuery: "Museo della Memoria Sicilia 1943 Via Sorda Sampieri 46D Modica",
        infoUrl: "https://www.museosicilia1943.it/site/",
        bookingUrl: "https://www.museosicilia1943.it/site/contatti/",
        note: "Vooraf een afspraak aanvragen. Het museum ligt buiten de avondwandeling door Modica Bassa; plan het bezoek in de fietsroute of regel een aparte lokale transfer.",
      },
    ],
    beer: {
      name: "Al Vico Birreria Indipendente",
      location: "Vico Napolitano 20 · Modica Bassa",
      description: "Siciliaans craftbier en focaccia in een steegje van de oude stad. Dit wordt het voorstel voor jullie laatste avond samen.",
      mapQuery: "Al Vico Birreria Indipendente Vico Napolitano 20 Modica",
      infoUrl: "https://www.alvicobirreriaindipendente.it/",
      phone: "+393335493189",
      note: "Voorgesteld voor dinsdagavond. Dinsdagopening en een tafel vooraf bevestigen; kies bij voorkeur een overnachting op loopafstand in Modica Bassa.",
    },
  },
  "catania-return": {
    visits: [{
      name: "Catania War Cemetery",
      category: "Herdenking",
      when: "Woensdag · alleen bij ruime vluchtmarge",
      description: "Een rustig moment van herdenking aan het einde van de reis. Een mogelijke laatste stop bij de terugkeer naar de omgeving van Catania.",
      location: "Contrada Bicocca · ten zuidwesten van Catania",
      mapQuery: "Catania War Cemetery Sicily",
      infoUrl: "https://www.veterans.gc.ca/en/remembrance/memorials/overseas/catania-war-cemetery",
      note: "Alleen met de transferchauffeur inpassen als de vlucht voldoende ruimte laat. Controleer opening en houd de volledige luchthavenmarge aan.",
      optional: true,
    }],
  },
};
