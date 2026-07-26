# Chennai Route Weather

Personal commute weather for **Chennai**:

| End | Place |
|-----|--------|
| **Home** | Velachery |
| **Office** | MSC IT Park, Ambattur |

Shows **live conditions along the route** (home → intermediate stops → office): rain, hot sun, storms, temperature, humidity, wind, UV, and next-hour rain chance.

**Auto-refreshes every 10 minutes.**

## Cost & data

| Item | Detail |
|------|--------|
| Weather API | [Open-Meteo](https://open-meteo.com/) — free, open-source, **no API key** |
| App stack | Static HTML + CSS + vanilla JS (ES modules) |
| Hosting | Local browser, or any free static host |
| Paid services | **None** |

Open-Meteo terms: free for non-commercial use; attribution required (shown in the app footer).

## Features

- Route strip: Velachery → Guindy → Vadapalani → Koyambedu → Ambattur → MSC IT Park
- Headline summary (rain now / rain soon / hot sun / storm risk)
- Per-stop: temperature, feels-like, humidity, wind, UV, WMO condition
- Next hours rain probability per stop
- Flip direction (morning home→office / evening office→home)
- Manual refresh + 10-minute live countdown
- Mobile-friendly dark UI

## Run locally

ES modules need a simple HTTP server (recommended):

```powershell
cd C:\Users\Gowtham\Source\Repos\Grok

# Python 3
python -m http.server 8080

# Or Node (if installed)
npx --yes serve -l 8080
```

Open: [http://localhost:8080](http://localhost:8080)

## Customize

Edit `js/config.js`:

- `STOPS` — names and lat/lon for home, route, office  
- `APP.refreshMs` — default `10 * 60 * 1000` (10 minutes)

Coordinates are approximate public map points for personal use.

## Privacy

Private personal project. No accounts, no tracking, no backend. The browser only calls Open-Meteo’s public forecast API with the coordinates you configure.

## License

MIT — see [LICENSE](LICENSE). Weather data © Open-Meteo contributors / underlying models as attributed by Open-Meteo.
