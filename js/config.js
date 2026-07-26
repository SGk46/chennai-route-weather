/**
 * Chennai commute weather — free Open-Meteo (no API key).
 * Home: Velachery · Office: MSC IT Park, Ambattur
 * Primary corridor: via Porur Bypass.
 */
export const APP = {
  name: "Chennai Route Weather",
  timezone: "Asia/Kolkata",
  /** Live refresh every 10 minutes */
  refreshMs: 10 * 60 * 1000,
  /** Open-Meteo — free, open-source, no key */
  apiBase: "https://api.open-meteo.com/v1/forecast",
  /** Highlighted stretch you care about most */
  focusStopId: "porur-bypass",
};

/**
 * Stop order = home → route → office (and reverse for evening).
 * Via Porur Bypass toward Ambattur / MSC IT Park.
 * Coords are approximate public map locations for personal use.
 */
export const STOPS = [
  {
    id: "home",
    role: "home",
    name: "Velachery",
    label: "Home",
    area: "Velachery, Chennai",
    lat: 12.9756,
    lon: 80.2207,
  },
  {
    id: "guindy",
    role: "route",
    name: "Guindy",
    label: "En route",
    area: "Guindy / Kathipara corridor",
    lat: 13.0067,
    lon: 80.2206,
  },
  {
    id: "porur-bypass",
    role: "route",
    name: "Porur Bypass",
    label: "Key stretch",
    area: "Porur Bypass Rd · your usual path",
    lat: 13.0418,
    lon: 80.1565,
    focus: true,
    tip: "Open stretch — rain + wind can hit hard; watch for standing water after heavy rain.",
  },
  {
    id: "vanagaram",
    role: "route",
    name: "Vanagaram",
    label: "En route",
    area: "After Porur Bypass → Ambattur side",
    lat: 13.0625,
    lon: 80.1528,
  },
  {
    id: "ambattur",
    role: "route",
    name: "Ambattur",
    label: "En route",
    area: "Ambattur Industrial Estate",
    lat: 13.0982,
    lon: 80.1619,
  },
  {
    id: "office",
    role: "office",
    name: "MSC IT Park",
    label: "Office",
    area: "Ambattur IT Park area",
    lat: 13.1142,
    lon: 80.1541,
  },
];

/** WMO weather codes → plain Chennai-friendly labels */
export const WMO = {
  0: { text: "Clear sky", icon: "sun", tag: "hot-sun" },
  1: { text: "Mainly clear", icon: "sun", tag: "hot-sun" },
  2: { text: "Partly cloudy", icon: "partly", tag: "mild" },
  3: { text: "Overcast", icon: "cloud", tag: "cloudy" },
  45: { text: "Fog", icon: "fog", tag: "fog" },
  48: { text: "Depositing rime fog", icon: "fog", tag: "fog" },
  51: { text: "Light drizzle", icon: "drizzle", tag: "rain" },
  53: { text: "Drizzle", icon: "drizzle", tag: "rain" },
  55: { text: "Heavy drizzle", icon: "drizzle", tag: "rain" },
  56: { text: "Freezing drizzle", icon: "drizzle", tag: "rain" },
  57: { text: "Heavy freezing drizzle", icon: "drizzle", tag: "rain" },
  61: { text: "Light rain", icon: "rain", tag: "rain" },
  63: { text: "Rain", icon: "rain", tag: "rain" },
  65: { text: "Heavy rain", icon: "heavyrain", tag: "rain" },
  66: { text: "Freezing rain", icon: "rain", tag: "rain" },
  67: { text: "Heavy freezing rain", icon: "heavyrain", tag: "rain" },
  71: { text: "Light snow", icon: "snow", tag: "cool" },
  73: { text: "Snow", icon: "snow", tag: "cool" },
  75: { text: "Heavy snow", icon: "snow", tag: "cool" },
  77: { text: "Snow grains", icon: "snow", tag: "cool" },
  80: { text: "Light showers", icon: "shower", tag: "rain" },
  81: { text: "Showers", icon: "shower", tag: "rain" },
  82: { text: "Violent showers", icon: "heavyrain", tag: "rain" },
  85: { text: "Snow showers", icon: "snow", tag: "cool" },
  86: { text: "Heavy snow showers", icon: "snow", tag: "cool" },
  95: { text: "Thunderstorm", icon: "storm", tag: "storm" },
  96: { text: "Thunderstorm + hail", icon: "storm", tag: "storm" },
  99: { text: "Thunderstorm + heavy hail", icon: "storm", tag: "storm" },
};

export function describeHeat(tempC) {
  if (tempC >= 38) return { level: "extreme", label: "Extreme heat" };
  if (tempC >= 35) return { level: "very-hot", label: "Very hot sun" };
  if (tempC >= 32) return { level: "hot", label: "Hot" };
  if (tempC >= 28) return { level: "warm", label: "Warm" };
  if (tempC >= 24) return { level: "pleasant", label: "Pleasant" };
  return { level: "cool", label: "Cool" };
}

/**
 * Simple personal checklist from route conditions (no extra APIs).
 */
export function buildCommuteTips(stops) {
  const tips = [];
  const anyRainNow = stops.some((s) => s.rainNow);
  const anyRainSoon = stops.some((s) => s.rainingSoon);
  const storm = stops.some((s) => s.tag === "storm" || s.code >= 95);
  const maxTemp = Math.max(...stops.map((s) => s.temp));
  const maxUv = Math.max(...stops.map((s) => s.uv ?? 0));
  const focus = stops.find((s) => s.id === APP.focusStopId) || stops.find((s) => s.focus);

  if (storm) {
    tips.push({
      id: "storm",
      level: "alert",
      icon: "⛈️",
      text: "Thunderstorm risk — delay two-wheeler if you can; keep distance on open roads.",
    });
  }
  if (anyRainNow) {
    tips.push({
      id: "rain-now",
      level: "rain",
      icon: "🌧️",
      text: "Rain on route now — umbrella / raincoat, leave extra time for Porur Bypass spray.",
    });
  } else if (anyRainSoon) {
    tips.push({
      id: "rain-soon",
      level: "rain",
      icon: "🌦️",
      text: "Rain likely in the next few hours — keep a foldable umbrella in the bag.",
    });
  }
  if (maxTemp >= 35) {
    tips.push({
      id: "heat",
      level: "hot",
      icon: "🥵",
      text: "Very hot sun — water bottle, sunglasses; avoid long outdoor waits.",
    });
  } else if (maxTemp >= 32) {
    tips.push({
      id: "warm",
      level: "hot",
      icon: "☀️",
      text: "Hot stretch — light clothes and hydration help on open bypass sections.",
    });
  }
  if (maxUv >= 8) {
    tips.push({
      id: "uv",
      level: "hot",
      icon: "🧴",
      text: "High UV — sunscreen if you walk or ride exposed on Porur Bypass.",
    });
  }
  if (focus?.rainNow || focus?.rainingSoon) {
    tips.push({
      id: "porur",
      level: "focus",
      icon: "🛣️",
      text: `Porur Bypass: ${focus.text}${focus.rainNow ? " · wet road now" : " · rain risk soon"}.`,
    });
  } else if (focus) {
    tips.push({
      id: "porur-ok",
      level: "ok",
      icon: "🛣️",
      text: `Porur Bypass looks manageable: ${focus.temp.toFixed(0)}°C, ${focus.text}.`,
    });
  }
  if (tips.length === 0) {
    tips.push({
      id: "clear",
      level: "ok",
      icon: "✅",
      text: "No major weather flags on the Velachery → Porur Bypass → Ambattur path.",
    });
  }
  return tips;
}
