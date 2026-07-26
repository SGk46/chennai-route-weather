# Chennai Route Weather

Personal **two-way** commute weather for Chennai:

| | Place |
|--|--------|
| **Home** | Velachery |
| **Destination** | MSC IT Park, Ambattur |

Pick a corridor from the **dropdown** — each shows its own stop list:

| Route | Path |
|--------|------|
| **Koyambedu** | Velachery → Guindy → Vadapalani → Koyambedu → Ambattur → MSC |
| **Porur Bypass** | Velachery → Guindy → Porur Bypass → Vanagaram → Ambattur → MSC |
| **DLF** | Velachery → Guindy → DLF Ramapuram → Porur → Ambattur → MSC |

**Home → Office** and **Office → Home** both supported.

**Auto-refresh every 10 minutes.**

## Free only (no paid APIs)

| Item | Detail |
|------|--------|
| Weather | [Open-Meteo](https://open-meteo.com/) — free, no API key |
| Stack | Static HTML + CSS + vanilla JS |
| Cost | **₹0** — no subscriptions |

## App navigation (not one long page)

Bottom tabs keep each screen simple:

| Tab | What’s there |
|-----|----------------|
| **Home** | Live overview, comfort, smart leave, key stretch, shortcuts |
| **Routes** | Dropdown (Koyambedu / Porur / DLF), two-way direction, compare |
| **Stops** | Full stop timeline + hourly for the selected route |
| **Tips** | Commute tips + about |

URL hash works too: `#home` `#routes` `#stops` `#tips`.

## “Premium-style” features (all free)

- Multi-page shell + bottom nav  
- Route **dropdown** with full stop lists per corridor  
- **Two-way** direction toggle (saved in browser)  
- **Route compare** cards + “best right now”  
- **Comfort score** (0–100) for the selected path  
- **Smart leave** window from hourly rain  
- **3D-style weather sky** (sun, clouds, rain, storm, fog — CSS only)  
- Rich SVG icons + glass UI  
- Sunrise / sunset  

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
