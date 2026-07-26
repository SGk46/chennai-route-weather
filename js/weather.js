import {
  APP,
  ROUTES,
  ROUTE_LIST,
  pickWmo,
  describeHeat,
  comfortScore,
  buildCommuteTips,
  leaveWindow,
} from "./config.js";

function nextHours(hourly, count = 8) {
  if (!hourly?.time) return [];
  const now = Date.now();
  const out = [];
  for (let i = 0; i < hourly.time.length && out.length < count; i++) {
    const t = new Date(hourly.time[i]).getTime();
    if (t + 60 * 60 * 1000 < now) continue;
    const code = hourly.weather_code[i];
    out.push({
      time: hourly.time[i],
      temp: hourly.temperature_2m[i],
      pop: hourly.precipitation_probability?.[i] ?? null,
      precip: hourly.precipitation?.[i] ?? 0,
      rain: hourly.rain?.[i] ?? 0,
      code,
      ...pickWmo(code),
    });
  }
  return out;
}

function buildUrl(stops) {
  const lats = stops.map((s) => s.lat).join(",");
  const lons = stops.map((s) => s.lon).join(",");
  const params = new URLSearchParams({
    latitude: lats,
    longitude: lons,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "rain",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "uv_index",
      "is_day",
    ].join(","),
    hourly: [
      "temperature_2m",
      "precipitation_probability",
      "precipitation",
      "rain",
      "weather_code",
    ].join(","),
    daily: "sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max",
    timezone: APP.timezone,
    forecast_days: "1",
  });
  return `${APP.apiBase}?${params.toString()}`;
}

function mapStops(routeStops, locations) {
  return routeStops.map((stop, i) => {
    const loc = locations[i] || locations[0];
    const cur = loc.current;
    if (!cur) throw new Error(`Missing weather for ${stop.name}`);
    const hourly = loc.hourly || {};
    const daily = loc.daily || {};
    const code = cur.weather_code;
    const wmo = pickWmo(code);
    const temp = cur.temperature_2m;
    const heat = describeHeat(temp);
    const rainNow = (cur.rain ?? 0) > 0 || (cur.precipitation ?? 0) > 0;
    const hours = nextHours(hourly, 8);
    const rainingSoon = hours.slice(0, 3).some(
      (h) => (h.rain ?? 0) > 0 || (h.precip ?? 0) > 0.1 || (h.pop ?? 0) >= 50
    );

    const mapped = {
      ...stop,
      updatedAt: cur.time,
      temp,
      feelsLike: cur.apparent_temperature,
      humidity: cur.relative_humidity_2m,
      precip: cur.precipitation,
      rain: cur.rain,
      cloud: cur.cloud_cover,
      wind: cur.wind_speed_10m,
      uv: cur.uv_index,
      isDay: cur.is_day === 1,
      code,
      ...wmo,
      heat,
      rainNow,
      rainingSoon,
      hourly: hours,
      sunrise: daily.sunrise?.[0],
      sunset: daily.sunset?.[0],
      dayRainSum: daily.precipitation_sum?.[0],
      dayPopMax: daily.precipitation_probability_max?.[0],
      uvMax: daily.uv_index_max?.[0],
    };
    mapped.comfort = comfortScore(mapped);
    return mapped;
  });
}

async function fetchLocations(stops) {
  const res = await fetch(buildUrl(stops));
  if (!res.ok) throw new Error(`Weather API error ${res.status}`);
  const raw = await res.json();
  return Array.isArray(raw) ? raw : [raw];
}

function buildSummary(stops, route) {
  const home = stops.find((s) => s.role === "home");
  const office = stops.find((s) => s.role === "office");
  const focus =
    stops.find((s) => s.id === route.focusStopId) || stops.find((s) => s.focus);
  const anyRain =
    stops.some((s) => s.rainNow) || stops.some((s) => s.rainingSoon);
  const maxTemp = Math.max(...stops.map((s) => s.temp));
  const minTemp = Math.min(...stops.map((s) => s.temp));
  const avgComfort = Math.round(
    stops.reduce((a, s) => a + s.comfort, 0) / stops.length
  );
  const storm = stops.some((s) => s.tag === "storm" || s.code >= 95);
  const sceneStop =
    stops.find((s) => s.tag === "storm") ||
    stops.find((s) => s.rainNow) ||
    stops.find((s) => s.rainingSoon) ||
    focus ||
    home;
  const hotSun = maxTemp >= 35 || stops.some((s) => s.scene === "sun" && s.temp >= 33);

  let headline = `Clear on ${route.short}`;
  let tone = "ok";

  if (storm) {
    headline = `Storm risk · ${route.short}`;
    tone = "alert";
  } else if (focus?.rainNow) {
    headline = `Rain at ${focus.name}`;
    tone = "rain";
  } else if (stops.some((s) => s.rainNow)) {
    headline = `Rain on ${route.short}`;
    tone = "rain";
  } else if (anyRain) {
    headline = `Rain soon · ${route.short}`;
    tone = "rain";
  } else if (hotSun) {
    headline = `Hot sun · ${route.short}`;
    tone = "hot";
  }

  return {
    headline,
    tone,
    scene: sceneStop?.scene || "cloud",
    isDay: sceneStop?.isDay !== false,
    homeTemp: home?.temp,
    officeTemp: office?.temp,
    focusTemp: focus?.temp,
    focusName: focus?.name,
    minTemp,
    maxTemp,
    avgComfort,
    anyRain,
    rainyStops: stops.filter((s) => s.rainNow || s.rainingSoon).map((s) => s.name),
    sunrise: home?.sunrise,
    sunset: home?.sunset,
  };
}

export async function fetchRouteWeather(routeId) {
  const route = ROUTES[routeId];
  if (!route) throw new Error(`Unknown route: ${routeId}`);

  const locations = await fetchLocations(route.stops);
  const stops = mapStops(route.stops, locations);
  const summary = buildSummary(stops, route);
  const tips = buildCommuteTips(stops, route);
  const leave = leaveWindow(stops);

  return {
    routeId: route.id,
    route,
    fetchedAt: new Date().toISOString(),
    stops,
    summary,
    tips,
    leave,
  };
}

/**
 * Lightweight compare: home + focus + office per route (free multi-point API).
 */
export async function fetchRouteCompare() {
  const sampleStops = [];
  const meta = [];

  for (const route of ROUTE_LIST) {
    const focus =
      route.stops.find((s) => s.id === route.focusStopId) ||
      route.stops.find((s) => s.focus) ||
      route.stops[1];
    const home = route.stops[0];
    const office = route.stops[route.stops.length - 1];
    // unique keys for mapping back
    sampleStops.push(
      { ...home, _rid: route.id, _kind: "home" },
      { ...focus, _rid: route.id, _kind: "focus" },
      { ...office, _rid: route.id, _kind: "office" }
    );
    meta.push(route);
  }

  const locations = await fetchLocations(sampleStops);
  const mapped = mapStops(
    sampleStops.map(({ _rid, _kind, ...rest }) => rest),
    locations
  );

  const byRoute = {};
  sampleStops.forEach((s, i) => {
    if (!byRoute[s._rid]) byRoute[s._rid] = { route: ROUTES[s._rid], points: {} };
    byRoute[s._rid].points[s._kind] = mapped[i];
  });

  const cards = ROUTE_LIST.map((route) => {
    const pack = byRoute[route.id];
    const pts = [pack.points.home, pack.points.focus, pack.points.office];
    const avgComfort = Math.round(
      pts.reduce((a, p) => a + p.comfort, 0) / pts.length
    );
    const wet = pts.some((p) => p.rainNow || p.rainingSoon);
    const storm = pts.some((p) => p.tag === "storm" || p.code >= 95);
    const maxTemp = Math.max(...pts.map((p) => p.temp));
    return {
      route,
      home: pack.points.home,
      focus: pack.points.focus,
      office: pack.points.office,
      avgComfort,
      wet,
      storm,
      maxTemp,
      score: avgComfort - (storm ? 25 : 0) - (wet ? 12 : 0),
    };
  }).sort((a, b) => b.score - a.score);

  return {
    fetchedAt: new Date().toISOString(),
    bestId: cards[0]?.route.id,
    cards,
  };
}
