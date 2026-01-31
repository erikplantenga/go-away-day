# Deploy & testlink laten werken

---

## Testlink puur via GitHub (geen Vercel, geen data)

**Voor alleen de visuals** – geen backend, geen Vercel nodig. Elke push naar `main` bouwt en deployt automatisch naar **GitHub Pages**.

1. **Eenmalig:** op GitHub → je repo **go-away-day** → **Settings** → **Pages**.
2. Onder **Build and deployment** kies **Source:** **GitHub Actions**.
3. Na de eerste push op `main` draait de workflow; daarna staat je site op:
   - **https://[jouw-github-username].github.io/go-away-day/erik?preview=echt**

Geen token nodig; preview gebruikt alleen localStorage. Werkt meteen na elke push.

---

## Vercel (als je later wél data wilt)

Als de testlink via Vercel niet werkt, komt dat vaak doordat Vercel niet (meer) automatisch deployt na een push.

### 1. Vercel aan GitHub koppelen (eenmalig)

1. Ga naar **https://vercel.com** en log in (bij voorkeur met **GitHub**).
2. Klik **Add New** → **Project**.
3. Kies je repo **go-away-day** (of de naam die je gebruikt) → **Import**.
4. Klik **Deploy** (standaardinstellingen zijn prima).
5. Wacht tot de eerste deploy klaar is. Je krijgt een URL zoals `https://go-away-day-xxx.vercel.app`.

Daarna: **elke push naar `main`** triggert automatisch een nieuwe deploy. Je hoeft niks meer in Vercel te doen.

---

## 2. Controleren of het goed staat

- Ga in Vercel naar **Dashboard** → jouw project **go-away-day**.
- Tab **Deployments**: staat de **laatste deploy** op “Ready” (groen)?
- Tab **Settings** → **Git**: staat **Connected Git Repository** op je GitHub-repo?

Als Git niet gekoppeld is:
- **Settings** → **Git** → **Connect Git Repository** → kies GitHub en de repo.  
Daarna weer een keer pushen; dan hoort er een nieuwe deploy te starten.

---

## 3. Testlink gebruiken

- **Live app:**  
  `https://JOUW-PROJECT.vercel.app/erik` (eventueel met `?token=...`).
- **Preview (vooringevulde data):**  
  `https://JOUW-PROJECT.vercel.app/erik?preview=echt`  
  Geen token nodig; je ziet de echte flow met demo-data.

Vervang `JOUW-PROJECT` door je echte Vercel-URL (bijv. `go-away-day-abc123.vercel.app`).

---

## 4. Handmatig deployen (zonder Git)

Als je toch zonder push wilt deployen:

1. Installeer Vercel CLI: `npm i -g vercel`
2. Log in: `vercel login` (volg de instructies in de browser).
3. In de projectmap: `vercel --prod`

Daarna is dezelfde URL weer up-to-date.
