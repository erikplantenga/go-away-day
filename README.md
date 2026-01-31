# Go Away Day

Waar gaan Erik & Benno in oktober 2026 naartoe?  
1 feb: 5 steden opgeven → 1–3 feb: wegstrepen → 4–7 feb: fruitautomaat → 7 feb 20:00: winnaar.

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

**Als Vercel eenmaal aan je GitHub-repo gekoppeld is:** elke push naar `main` wordt automatisch gedeployed. Geen Vercel CLI nodig.

- **Uploaden:** commit + push (in Cursor: Source Control → Commit → Push).
- **Testlink (preview met vooringevulde data):**  
  `https://JOUW-PROJECT.vercel.app/erik?preview=echt`  
  (vervang `JOUW-PROJECT` door je echte Vercel-URL, bv. `go-away-day-xxx`.)

Werkt de testlink niet? → [DEPLOY.md](DEPLOY.md) (controleren of Vercel aan GitHub hangt en deploy slaagt).

---

**Testen andere fase:** in `.env.local`: `NEXT_PUBLIC_PHASE_OVERRIDE=city_input` (of `wegstreep`, `fruitautomaat`, `finale`).
