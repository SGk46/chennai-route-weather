# Chennai Route Weather

Personal **two-way** commute weather for Chennai:

| | Place |
|--|--------|
| **Home** | Velachery |
| **Destination** | MSC IT Park, Ambattur |

**Commute cockpit UI:** path map on **Now**, pick corridor on **Routes**, details on **More**.

| Route | Path |
|--------|------|
| **Koyambedu** | Velachery → Guindy → Vadapalani → Koyambedu → Ambattur → MSC |
| **Porur Bypass** | Velachery → Guindy → Porur Bypass → Vanagaram → Ambattur → MSC |
| **DLF** | Velachery → Guindy → DLF Ramapuram → Porur → Ambattur → MSC |

Two-way: **Home → Office** / **Office → Home**. Auto-refresh **10 minutes**.

## Free only (no paid APIs)

| Item | Detail |
|------|--------|
| Weather | [Open-Meteo](https://open-meteo.com/) — free, no API key |
| Stack | Static HTML + CSS + vanilla JS |
| Cost | **₹0** — no subscriptions |

## Mobile + desktop versions

One app, two layouts (switch anytime):

| Layout | When | UI |
|--------|------|-----|
| **Mobile** | Phone / narrow, or force **M** | Bottom tabs, centered cockpit (~440px) |
| **Desktop** | Wide screen, or force **D** | Full-page dashboard, left sidebar, multi-column |
| **Auto** | Default | ≥900px → desktop, else mobile |

Toggle: **A / M / D** in the header (mobile) or **Layout** in the sidebar (desktop).  
Or URL: `?layout=mobile` · `?layout=desktop` · `?layout=auto`

## Navigation

| Tab | What’s there |
|-----|----------------|
| **Now** | Path map (green/hot/rain), comfort, headline, smart leave, key stretch |
| **Routes** | Direction toggle + 3 corridor cards + Best badge |
| **More** | Full stops + hourly, tips, about |

Hashes: `#now` `#routes` `#more`

## Features

- Map-style path with per-stop weather color  
- Route compare + one-tap select  
- Comfort score, smart leave, SVG weather icons  
- Soft solid cards, Marina blue + gold (Chennai-friendly)  
- Subtle sky wash (not heavy glass / 3D clutter)  

## Run locally

```powershell
cd C:\Users\Gowtham\Source\Repos\Grok
python -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080)

## Publish free with GitHub Pages

Your app is static HTML/CSS/JS — perfect for **free** GitHub Pages.

| Plan | Public repo | Private repo |
|------|-------------|--------------|
| GitHub Free | Pages **free** | Pages needs **GitHub Pro** |
| GitHub Pro | Free | Free |

### Enable (about 1 minute)

1. Open the repo: https://github.com/SGk46/chennai-route-weather  
2. If you want **zero cost** and the site can be public:  
   **Settings → General → Danger Zone → Change visibility → Public**  
   (code will be visible; weather still free Open-Meteo)  
3. **Settings → Pages → Build and deployment → Source: GitHub Actions**  
4. Push to `master` (or run the **Deploy to GitHub Pages** workflow under **Actions**).

Site URL (after deploy succeeds):

**https://sgk46.github.io/chennai-route-weather/**

A workflow is already in `.github/workflows/pages.yml`.

## Customize

Edit `js/config.js` → `ROUTES` for stops/lat-lon, or `APP.refreshMs` for refresh interval.

## Privacy

No accounts, no tracking backend. Browser calls Open-Meteo with configured coordinates only.

## License

MIT — see [LICENSE](LICENSE). Weather data via Open-Meteo (attribution in app).
