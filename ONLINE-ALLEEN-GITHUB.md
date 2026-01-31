# Alleen GitHub – 2 stappen

Geen Firebase, geen env vars. Push → klaar.

---

## 1. Code op GitHub

- In Cursor: **Source Control** (icoon links, of Ctrl+Shift+G)
- Klik **Publish to GitHub** (of: commit alles, dan **Push**)
- Kies een naam voor de repo (bijv. `go-away-day`) → **Publish**

---

## 2. Vercel koppelen

- Ga naar **https://vercel.com** → log in met **GitHub**
- Klik **Add New** → **Project**
- Kies je repo (**go-away-day**) → **Import**
- Klik **Deploy** (niks invullen)
- Wacht 1–2 minuten → je krijgt een link (bijv. `https://go-away-day-xxx.vercel.app`)

**Klaar.** Open op je telefoon:  
`https://JOUW-LINK.vercel.app/erik?token=test`

---

**Let op:** Zo werkt de app op **één** telefoon (alles lokaal).  
Wil je dat het ook op **Benno’s telefoon** werkt met dezelfde lijst? Dan na de deploy **nog 1x** Firebase doen (1 veld invullen) → zie **ONLINE-FIREBASE-1-VAR.md**.
