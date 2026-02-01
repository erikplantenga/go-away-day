# Waar kun je kijken wat er is ingevuld?

De app slaat per speler 5 steden op en maakt daar één gezamenlijke lijst van (dubbelen eraf). Hier zie je waar die data staat.

---

## Firebase is leeg – waar staat de data dan?

Als je in de Firebase-console **geen** collections ziet (geen `citySubmissions`, geen `cities`), dan gebruikt de live app **niet** Firebase voor de steden. De app kiest automatisch:

1. **Supabase** – als `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel staan → kijk in Supabase (tabel `store`, keys `submission_erik`, `submission_benno`, `cities`).
2. **Firebase** – als `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (en de andere `NEXT_PUBLIC_FIREBASE_*`) in Vercel staan → dan zouden hier collections verschijnen.
3. **Lokaal** – als geen van beide is gezet → data staat alleen in de browser (localStorage), dus per telefoon/device en niet gedeeld.

**Als je wél in Firebase wilt kijken:** zet in Vercel onder Environment Variables de **client**-variabelen van Firebase (Projectinstellingen → Algemeen → “Jouw apps” → config object):  
`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`.  
Redeploy, en laat Erik en Benno opnieuw steden opgeven – dan verschijnen `citySubmissions` en `cities` in Firestore.

---

## Als je **Firebase** gebruikt

1. Ga naar **https://console.firebase.google.com** → jouw project.
2. **Firestore Database** (linkermenu).

### Per speler (wat Erik en Benno elk hebben ingevoerd)

- **Verzameling:** `citySubmissions`
- **Documenten:** `erik` en `benno`
- In elk document: veld **`cities`** = array met 5 objecten `{ city, country?, addedBy }`.

Daar zie je dus exact wat Erik heeft ingevuld en wat Benno heeft ingevuld.

### Gezamenlijke lijst (wat de app toont)

- **Verzameling:** `cities`
- **Document:** `combined`
- Veld **`cities`** = de gemergde lijst na “dubbelen eraf”.

---

## Als je **Supabase** gebruikt

1. Ga naar **https://supabase.com** → jouw project.
2. **Table Editor** → tabel **`store`**.

In de kolom **`key`** zoek je:

- **`submission_erik`** → kolom **`value`** = Erik’s 5 steden (JSON).
- **`submission_benno`** → kolom **`value`** = Benno’s 5 steden (JSON).
- **`cities`** → kolom **`value`** = de gezamenlijke lijst (JSON).

---

## Waarom zie ik maar 5 steden?

De gezamenlijke lijst is **Erik’s 5 + Benno’s 5, met dubbelen eraf**. Dus:

- Als Erik en Benno **dezelfde 5 steden** (of bijna dezelfde) hebben ingevuld → na dedupe blijft **1× die lijst** over → **5 steden**.
- Als ze **allemaal verschillende** steden hebben ingevuld → je krijgt **tot 10 steden**.

De app toont dus de **unieke** steden. Als je in Firebase/Supabase bij `citySubmissions`/`submission_erik` en `submission_benno` wél 10 verschillende steden ziet, maar op het scherm maar 5, dan zijn er 5 dubbelen (zelfde stad door beiden gekozen) en is dat gedrag correct.

Om te controleren of “alles” erin zit: kijk in **Firebase** bij `citySubmissions` → `erik` en `benno` (of in **Supabase** bij `submission_erik` en `submission_benno`). Daar staan altijd de ruwe 5+5 van jullie beiden.
