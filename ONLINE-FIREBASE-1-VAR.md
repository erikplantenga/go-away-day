# Firebase – snel & makkelijk (1 veld invullen)

**3 stappen → werkt op jouw én Benno’s telefoon.**

---

## 1. Firebase

- **https://console.firebase.google.com** → **Project toevoegen**
- Naam: `goawayday` → Volgende → Project maken
- **Firestore Database** → Database maken → **Testmodus** → Regio **europe-west1** → Inschakelen

---

## 2. JSON key

- **Tandwiel** (linksboven) → **Projectinstellingen** → tab **Service accounts**
- **Nieuwe persoonlijke sleutel genereren** → Sleutel genereren
- Het gedownloade JSON-bestand **openen** → **alles** selecteren (Ctrl+A) → **kopiëren**

---

## 3. Vercel

- **https://vercel.com** → je project openen (geen project? Add New → Project → repo → Deploy)
- **Settings** → **Environment Variables** → **Add**
  - **Key:** `FIREBASE_SERVICE_ACCOUNT_JSON`
  - **Value:** de gekopieerde JSON plakken (hele inhoud)
- **Save** → **Deployments** → **⋯** bij laatste deployment → **Redeploy**

**Klaar.**  
Jij: `https://JOUW-LINK.vercel.app/erik?token=test`  
Benno: `https://JOUW-LINK.vercel.app/benno?token=test`
