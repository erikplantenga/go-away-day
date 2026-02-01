# Alleen Firebase gebruiken – stap voor stap

Zo zet je de app zo dat **alleen Firebase** wordt gebruikt (geen Supabase). Daarna staan de steden van Erik en Benno in Firestore.

---

## Stap 1: Firebase-project en Firestore

1. Ga naar **https://console.firebase.google.com** en log in.
2. Klik op **Project toevoegen** (of open je bestaande project **Go Away Day**).
3. Als je een nieuw project maakt: geef een naam (bijv. `go-away-day`) → **Volgende** → **Project maken**.
4. In het linkermenu: **Build** → **Firestore Database**.
5. Klik **Database maken**.
   - Kies **Testmodus** (voor nu; later kun je regels aanpassen).
   - Kies regio **europe-west1** (of een regio bij jou in de buurt).
   - Klik **Inschakelen**.

Firestore is nu klaar. De app maakt later zelf de collections aan (`citySubmissions` en `cities`) zodra iemand steden opgeeft.

---

## Stap 2: Web-app config ophalen (voor Vercel)

De app heeft de **client**-config van Firebase nodig. Die haal je zo op:

1. In Firebase: linksboven het **tandwiel** → **Projectinstellingen**.
2. Scroll naar beneden naar **“Jouw apps”**.
3. Als er nog geen webapp is:
   - Klik op het **</>**-icoon (Web).
   - Geef een bijnaam (bijv. `go-away-day-web`) → **App registreren**.
   - Je kunt “Firebase Hosting” nu overslaan.
4. Je ziet een codeblok met iets als:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "jouw-project.firebaseapp.com",
     projectId: "jouw-project-id",
     storageBucket: "jouw-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc..."
   };
   ```
5. **Kopieer de waarden** van deze velden (zonder de aanhalingstekens in Vercel invullen):
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

Je hebt deze zes waarden straks nodig voor Vercel.

---

## Stap 3: Supabase uitzetten in Vercel

Als de app nu Supabase gebruikt, zet je dat uit:

1. Ga naar **https://vercel.com** → jouw project **go-away-day**.
2. Klik op **Settings** (bovenin).
3. Klik in het linkermenu op **Environment Variables**.
4. Zoek de variabelen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Klik bij elk op de **⋯** (drie puntjes) → **Delete** (of wijzig de waarde naar leeg en save).
6. Klik **Save** als dat nog moet.

Daarna kiest de app geen Supabase meer.

---

## Stap 4: Firebase-variabelen in Vercel zetten

1. Blijf in Vercel bij **Settings** → **Environment Variables**.
2. Klik **Add New** (of **Add**) en vul **één voor één** deze variabelen in. Kies bij “Environment” **Production** (en eventueel Preview als je dat ook wilt).

   | Key | Value (jouw waarde uit stap 2) |
   |-----|----------------------------------|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | de `apiKey` uit Firebase |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | de `authDomain` uit Firebase |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | de `projectId` uit Firebase |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | de `storageBucket` uit Firebase |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | de `messagingSenderId` uit Firebase |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | de `appId` uit Firebase |

3. Bij elke variabele: **Save** of bevestig.
4. Zorg dat je **zes** regels hebt met exact deze namen (copy-paste van de tabel om typfouten te voorkomen).

---

## Stap 5: (Optioneel) Service account voor server

Als je later server-side Firebase wilt gebruiken (bijv. Admin API), kun je dit doen:

1. In Firebase: **Tandwiel** → **Projectinstellingen** → tab **Service accounts**.
2. **Nieuwe persoonlijke sleutel genereren** → **Sleutel genereren**.
3. Het gedownloade JSON-bestand openen → **alles** selecteren (Ctrl+A) → **kopiëren**.
4. In Vercel → **Environment Variables** → **Add**:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT_JSON`
   - **Value:** de gekopieerde JSON (hele inhoud) plakken.
   - **Save**.

Voor alleen “steden opgeven en gezamenlijke lijst in Firestore” is dit niet verplicht; de app kan alleen met de zes `NEXT_PUBLIC_FIREBASE_*` variabelen.

---

## Stap 6: Opnieuw deployen

1. In Vercel: ga naar **Deployments** (bovenin).
2. Bij de laatste deployment: klik op de **⋯** (drie puntjes).
3. Kies **Redeploy**.
4. Bevestig en wacht tot de deployment klaar is.

Daarna draait de live app met de nieuwe instellingen.

---

## Stap 7: Controleren

1. Open **https://go-away-day.vercel.app/erik** (met je token als dat nodig is).
2. Vul 5 steden in en geef ze op.
3. Open (bijv. op een andere telefoon of in incognito) **https://go-away-day.vercel.app/benno** en vul ook 5 steden in.
4. Ga naar **https://console.firebase.google.com** → jouw project → **Firestore Database**.
5. Je zou nu moeten zien:
   - Verzameling **`citySubmissions`** met documenten **`erik`** en **`benno`** (elk met veld `cities`).
   - Verzameling **`cities`** met document **`combined`** (gezamenlijke lijst na “Ga naar lijst + countdown”).

Als je die collections en documenten ziet, werkt alles **alleen via Firebase**.

---

## Samenvatting

| Stap | Wat je doet |
|------|-------------|
| 1 | Firestore aanmaken in Firebase (Testmodus, europe-west1). |
| 2 | Web-app config in Firebase ophalen (apiKey, authDomain, projectId, enz.). |
| 3 | In Vercel: Supabase-variabelen verwijderen. |
| 4 | In Vercel: zes `NEXT_PUBLIC_FIREBASE_*` variabelen toevoegen. |
| 5 | (Optioneel) `FIREBASE_SERVICE_ACCOUNT_JSON` toevoegen. |
| 6 | Redeploy in Vercel. |
| 7 | In de app steden opgeven en in Firestore controleren of de data er staat. |

Als iets niet lukt, controleer of de variabelennamen in Vercel **exact** overeenkomen (inclusief `NEXT_PUBLIC_` en hoofdletters).
