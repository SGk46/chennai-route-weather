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

## “Premium-style” features (all free)

- Route **dropdown** with full stop lists per corridor  
- **Two-way** direction toggle (saved in browser)  
- **Route compare** cards + “best right now”  
- **Comfort score** (0–100) for the selected path  
- **Smart leave** window from hourly rain  
- **3D-style weather sky** (sun, clouds, rain, storm, fog — CSS only)  
- Glass UI, focus card, commute tips  
- Sunrise / sunset  

## Run locally

```powershell
cd C:\Users\Gowtham\Source\Repos\Grok
python -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080)

## Customize

Edit `js/config.js` → `ROUTES` for stops/lat-lon, or `APP.refreshMs` for refresh interval.

## Privacy

No accounts, no tracking backend. Browser calls Open-Meteo with configured coordinates only.

## License

MIT — see [LICENSE](LICENSE). Weather data via Open-Meteo (attribution in app).
