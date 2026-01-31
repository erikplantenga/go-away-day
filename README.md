# Go Away Day

Waar gaan Erik & Benno in oktober 2026 naartoe?  
1 feb: 5 steden opgeven → 2–3 feb: wegstrepen → 4–7 feb: fruitautomaat → 7 feb 20:00: winnaar.

---

## Lokaal

```bash
npm install
npm run dev
```

Open **http://localhost:3000/erik?token=test** of **/benno?token=test**. Geen Firebase nodig (werkt met localStorage).

---

## Online

1. **Eerst live:** [ONLINE-ALLEEN-GITHUB.md](ONLINE-ALLEEN-GITHUB.md) – GitHub + Vercel, geen env vars. Werkt op één telefoon.
2. **Jouw + Benno’s telefoon:** [ONLINE-FIREBASE-1-VAR.md](ONLINE-FIREBASE-1-VAR.md) – Firebase (1 veld op Vercel) → zelfde data op beide telefoons.

---

## Uploaden & testlink

**Puur voor visuals (geen data):** push naar `main` → automatisch op **GitHub Pages**.  
→ `https://[jouw-username].github.io/go-away-day/erik?preview=echt`  
Eenmalig: repo **Settings** → **Pages** → Source: **GitHub Actions**. Zie [DEPLOY.md](DEPLOY.md).

**Met Vercel (voor echte data):** als Vercel aan GitHub hangt, deployt elke push daar ook.  
Testlink: `https://JOUW-PROJECT.vercel.app/erik?preview=echt`

---

**Testen andere fase:** in `.env.local`: `NEXT_PUBLIC_PHASE_OVERRIDE=city_input` (of `wegstreep`, `fruitautomaat`, `finale`).
