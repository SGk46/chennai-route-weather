/**
 * Chennai commute weather — free Open-Meteo (no API key).
 * Home: Velachery · Destination: MSC IT Park, Ambattur
 * Routes: Koyambedu · Porur Bypass · DLF (Ramapuram)
 */

export const APP = {
  name: "Chennai Route Weather",
  timezone: "Asia/Kolkata",
  refreshMs: 10 * 60 * 1000,
  apiBase: "https://api.open-meteo.com/v1/forecast",
  storageKey: "chennai-route-weather:v4",
};

export const HOME = {
  id: "home",
  role: "home",
  name: "Velachery",
  label: "Home",
  area: "Velachery, Chennai",
  lat: 12.9756,
  lon: 80.2207,
};

export const OFFICE = {
  id: "office",
  role: "office",
  name: "MSC IT Park",
  label: "Destination",
  area: "Ambattur IT Park area",
  lat: 13.1142,
  lon: 80.1541,
};

/**
 * Three two-way corridors (home → … → office).
 * Flip direction in UI for office → home.
 */
export const ROUTES = {
  koyambedu: {
    id: "koyambedu",
    name: "Koyambedu route",
    short: "Koyambedu",
    blurb: "Guindy · Vadapalani · Koyambedu · Ambattur",
    focusStopId: "koyambedu",
    emoji: "🚌",
    stops: [
      HOME,
      {
        id: "guindy-k",
        role: "route",
        name: "Guindy",
        label: "En route",
        area: "Guindy / Kathipara",
        lat: 13.0067,
        lon: 80.2206,
      },
      {
        id: "vadapalani",
        role: "route",
        name: "Vadapalani",
        label: "En route",
        area: "Vadapalani / Arcot Road",
        lat: 13.0504,
        lon: 80.2121,
      },
      {
        id: "koyambedu",
        role: "route",
        name: "Koyambedu",
        label: "Key stretch",
        area: "Koyambedu / CMBT corridor",
        lat: 13.0698,
        lon: 80.1948,
        focus: true,
        tip: "Busy junction zone — rain slows traffic; keep buffer time.",
      },
      {
        id: "ambattur-k",
        role: "route",
        name: "Ambattur",
        label: "En route",
        area: "Ambattur Industrial Estate",
        lat: 13.0982,
        lon: 80.1619,
      },
      OFFICE,
    ],
  },
  porur: {
    id: "porur",
    name: "Porur Bypass route",
    short: "Porur Bypass",
    blurb: "Guindy · Porur Bypass · Vanagaram · Ambattur",
    focusStopId: "porur-bypass",
    emoji: "🛣️",
    stops: [
      HOME,
      {
        id: "guindy-p",
        role: "route",
        name: "Guindy",
        label: "En route",
        area: "Guindy / Kathipara",
        lat: 13.0067,
        lon: 80.2206,
      },
      {
        id: "porur-bypass",
        role: "route",
        name: "Porur Bypass",
        label: "Key stretch",
        area: "Porur Bypass Rd · open stretch",
        lat: 13.0418,
        lon: 80.1565,
        focus: true,
        tip: "Open bypass — wind + rain spray; watch standing water after heavy rain.",
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
        id: "ambattur-p",
        role: "route",
        name: "Ambattur",
        label: "En route",
        area: "Ambattur Industrial Estate",
        lat: 13.0982,
        lon: 80.1619,
      },
      OFFICE,
    ],
  },
  dlf: {
    id: "dlf",
    name: "DLF route",
    short: "DLF",
    blurb: "Guindy · DLF Ramapuram · Porur · Ambattur",
    focusStopId: "dlf",
    emoji: "🏢",
    stops: [
      HOME,
      {
        id: "guindy-d",
        role: "route",
        name: "Guindy",
        label: "En route",
        area: "Guindy / Kathipara",
        lat: 13.0067,
        lon: 80.2206,
      },
      {
        id: "dlf",
        role: "route",
        name: "DLF Ramapuram",
        label: "Key stretch",
        area: "DLF IT Park / Ramapuram belt",
        lat: 13.0147,
        lon: 80.1865,
        focus: true,
        tip: "IT corridor traffic + sudden showers — leave a little early if rain % rises.",
      },
      {
        id: "porur-dlf",
        role: "route",
        name: "Porur",
        label: "En route",
        area: "Porur junction approach",
        lat: 13.0358,
        lon: 80.1562,
      },
      {
        id: "ambattur-d",
        role: "route",
        name: "Ambattur",
        label: "En route",
        area: "Ambattur Industrial Estate",
        lat: 13.0982,
        lon: 80.1619,
      },
      OFFICE,
    ],
  },
};

export const ROUTE_LIST = Object.values(ROUTES);

export const WMO = {
  0: { text: "Clear sky", icon: "sun", tag: "clear", scene: "sun" },
  1: { text: "Mainly clear", icon: "sun", tag: "clear", scene: "sun" },
  2: { text: "Partly cloudy", icon: "partly", tag: "mild", scene: "partly" },
  3: { text: "Overcast", icon: "cloud", tag: "cloudy", scene: "cloud" },
  45: { text: "Fog", icon: "fog", tag: "fog", scene: "fog" },
  48: { text: "Rime fog", icon: "fog", tag: "fog", scene: "fog" },
  51: { text: "Light drizzle", icon: "drizzle", tag: "rain", scene: "rain" },
  53: { text: "Drizzle", icon: "drizzle", tag: "rain", scene: "rain" },
  55: { text: "Heavy drizzle", icon: "drizzle", tag: "rain", scene: "rain" },
  56: { text: "Freezing drizzle", icon: "drizzle", tag: "rain", scene: "rain" },
  57: { text: "Heavy freezing drizzle", icon: "drizzle", tag: "rain", scene: "rain" },
  61: { text: "Light rain", icon: "rain", tag: "rain", scene: "rain" },
  63: { text: "Rain", icon: "rain", tag: "rain", scene: "rain" },
  65: { text: "Heavy rain", icon: "heavyrain", tag: "rain", scene: "heavyrain" },
  66: { text: "Freezing rain", icon: "rain", tag: "rain", scene: "rain" },
  67: { text: "Heavy freezing rain", icon: "heavyrain", tag: "rain", scene: "heavyrain" },
  71: { text: "Light snow", icon: "snow", tag: "cool", scene: "cloud" },
  73: { text: "Snow", icon: "snow", tag: "cool", scene: "cloud" },
  75: { text: "Heavy snow", icon: "snow", tag: "cool", scene: "cloud" },
  77: { text: "Snow grains", icon: "snow", tag: "cool", scene: "cloud" },
  80: { text: "Light showers", icon: "shower", tag: "rain", scene: "rain" },
  81: { text: "Showers", icon: "shower", tag: "rain", scene: "rain" },
  82: { text: "Violent showers", icon: "heavyrain", tag: "rain", scene: "heavyrain" },
  85: { text: "Snow showers", icon: "snow", tag: "cool", scene: "cloud" },
  86: { text: "Heavy snow showers", icon: "snow", tag: "cool", scene: "cloud" },
  95: { text: "Thunderstorm", icon: "storm", tag: "storm", scene: "storm" },
  96: { text: "Thunderstorm + hail", icon: "storm", tag: "storm", scene: "storm" },
  99: { text: "Thunderstorm + heavy hail", icon: "storm", tag: "storm", scene: "storm" },
};

export function describeHeat(tempC) {
  if (tempC >= 38) return { level: "extreme", label: "Extreme heat", score: 20 };
  if (tempC >= 35) return { level: "very-hot", label: "Very hot sun", score: 35 };
  if (tempC >= 32) return { level: "hot", label: "Hot", score: 50 };
  if (tempC >= 28) return { level: "warm", label: "Warm", score: 70 };
  if (tempC >= 24) return { level: "pleasant", label: "Pleasant", score: 90 };
  return { level: "cool", label: "Cool", score: 80 };
}

export function pickWmo(code) {
  return (
    WMO[code] || {
      text: `Code ${code}`,
      icon: "cloud",
      tag: "cloudy",
      scene: "cloud",
    }
  );
}

/** 0–100 commute comfort (higher = nicer ride) */
export function comfortScore(stop) {
  let score = 100;
  if (stop.rainNow) score -= 35;
  else if (stop.rainingSoon) score -= 18;
  if (stop.tag === "storm" || stop.code >= 95) score -= 40;
  if (stop.temp >= 38) score -= 30;
  else if (stop.temp >= 35) score -= 20;
  else if (stop.temp >= 32) score -= 10;
  if ((stop.humidity ?? 0) >= 85) score -= 8;
  if ((stop.uv ?? 0) >= 9) score -= 8;
  if ((stop.wind ?? 0) >= 40) score -= 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function buildCommuteTips(stops, route) {
  const tips = [];
  const anyRainNow = stops.some((s) => s.rainNow);
  const anyRainSoon = stops.some((s) => s.rainingSoon);
  const storm = stops.some((s) => s.tag === "storm" || s.code >= 95);
  const maxTemp = Math.max(...stops.map((s) => s.temp));
  const maxUv = Math.max(...stops.map((s) => s.uv ?? 0));
  const focus =
    stops.find((s) => s.id === route.focusStopId) || stops.find((s) => s.focus);

  if (storm) {
    tips.push({
      level: "alert",
      icon: "⛈️",
      text: "Thunderstorm risk — delay two-wheeler if you can; open stretches are riskier.",
    });
  }
  if (anyRainNow) {
    tips.push({
      level: "rain",
      icon: "🌧️",
      text: `Rain on ${route.short} now — raincoat/umbrella and extra buffer time.`,
    });
  } else if (anyRainSoon) {
    tips.push({
      level: "rain",
      icon: "🌦️",
      text: "Rain likely soon — pack a foldable umbrella before you leave.",
    });
  }
  if (maxTemp >= 35) {
    tips.push({
      level: "hot",
      icon: "🥵",
      text: "Very hot sun — water bottle, sunglasses, avoid long outdoor waits.",
    });
  } else if (maxTemp >= 32) {
    tips.push({
      level: "hot",
      icon: "☀️",
      text: "Hot commute — light clothes and hydration help on open roads.",
    });
  }
  if (maxUv >= 8) {
    tips.push({
      level: "hot",
      icon: "🧴",
      text: "High UV — sunscreen if you walk or ride exposed.",
    });
  }
  if (focus) {
    tips.push({
      level: focus.rainNow || focus.rainingSoon ? "focus" : "ok",
      icon: route.emoji,
      text: `${focus.name}: ${focus.temp.toFixed(0)}°C · ${focus.text}${
        focus.rainNow ? " · wet now" : focus.rainingSoon ? " · rain soon" : ""
      }.`,
    });
  }
  if (tips.length === 0) {
    tips.push({
      level: "ok",
      icon: "✅",
      text: `No major weather flags on the ${route.name}.`,
    });
  }
  return tips;
}

/** Suggest best leave window from hourly rain on focus/home */
export function leaveWindow(stops) {
  const sample = stops.find((s) => s.focus) || stops[0];
  if (!sample?.hourly?.length) return null;
  const wet = sample.hourly.find(
    (h) => (h.pop ?? 0) >= 50 || (h.rain ?? 0) > 0 || (h.precip ?? 0) > 0.2
  );
  if (!wet) {
    return {
      label: "Good window",
      text: "No strong rain signal in the next few hours — flexible leave time.",
      kind: "ok",
    };
  }
  const t = new Date(wet.time);
  const label = t.toLocaleTimeString("en-IN", {
    timeZone: APP.timezone,
    hour: "2-digit",
    minute: "2-digit",
  });
  return {
    label: "Rain window",
    text: `Higher wet risk around ${label} near ${sample.name} — leave earlier if you can.`,
    kind: "rain",
  };
}
