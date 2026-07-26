import { APP, STOPS, WMO, describeHeat } from "./config.js";

function buildUrl() {
  const lats = STOPS.map((s) => s.lat).join(",");
  const lons = STOPS.map((s) => s.lon).join(",");
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
    timezone: APP.timezone,
    forecast_days: "1",
  });
  return `${APP.apiBase}?${params.toString()}`;
}

function pickWmo(code) {
  return (
    WMO[code] || {
      text: `Code ${code}`,
      icon: "cloud",
      tag: "cloudy",
    }
  );
}

function nextHours(hourly, count = 6) {
  if (!hourly?.time) return [];
  const now = Date.now();
  const out = [];
  for (let i = 0; i < hourly.time.length && out.length < count; i++) {
    const t = new Date(hourly.time[i]).getTime();
    if (t + 60 * 60 * 1000 < now) continue;
    out.push({
      time: hourly.time[i],
      temp: hourly.temperature_2m[i],
      pop: hourly.precipitation_probability?.[i] ?? null,
      precip: hourly.precipitation?.[i] ?? 0,
      rain: hourly.rain?.[i] ?? 0,
      code: hourly.weather_code[i],
      ...pickWmo(hourly.weather_code[i]),
    });
  }
  return out;
}

/**
 * Open-Meteo multi-location returns a JSON array of location payloads
 * (each with its own current + hourly). Single location returns one object.
 */
export async function fetchRouteWeather() {
  const res = await fetch(buildUrl());
  if (!res.ok) {
    throw new Error(`Weather API error ${res.status}`);
  }
  const raw = await res.json();
  const locations = Array.isArray(raw) ? raw : [raw];

  const stops = STOPS.map((stop, i) => {
    const loc = locations[i] || locations[0];
    const cur = loc.current;
    if (!cur) {
      throw new Error(`Missing current weather for ${stop.name}`);
    }
    const hourly = loc.hourly || {};
    const code = cur.weather_code;
    const wmo = pickWmo(code);
    const temp = cur.temperature_2m;
    const heat = describeHeat(temp);
    const rainNow = (cur.rain ?? 0) > 0 || (cur.precipitation ?? 0) > 0;
    const hours = nextHours(hourly, 8);
    const rainingSoon = hours.slice(0, 3).some(
      (h) => (h.rain ?? 0) > 0 || (h.precip ?? 0) > 0.1 || (h.pop ?? 0) >= 50
    );

    return {
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
    };
  });

  return {
    fetchedAt: new Date().toISOString(),
    stops,
    summary: buildSummary(stops),
  };
}

function buildSummary(stops) {
  const home = stops.find((s) => s.role === "home");
  const office = stops.find((s) => s.role === "office");
  const anyRain =
    stops.some((s) => s.rainNow) || stops.some((s) => s.rainingSoon);
  const maxTemp = Math.max(...stops.map((s) => s.temp));
  const minTemp = Math.min(...stops.map((s) => s.temp));
  const storm = stops.some((s) => s.tag === "storm");
  const hotSun =
    maxTemp >= 35 || stops.some((s) => s.tag === "hot-sun" && s.temp >= 33);

  let headline = "Clear commute conditions";
  let tone = "ok";

  if (storm) {
    headline = "Thunderstorm risk along the route";
    tone = "alert";
  } else if (stops.some((s) => s.rainNow)) {
    headline = "Rain on the route right now";
    tone = "rain";
  } else if (anyRain) {
    headline = "Rain likely soon on the commute";
    tone = "rain";
  } else if (hotSun) {
    headline = "Hot sun — hydrate & shade if outdoors";
    tone = "hot";
  }

  const rainyStops = stops
    .filter((s) => s.rainNow || s.rainingSoon)
    .map((s) => s.name);

  return {
    headline,
    tone,
    homeTemp: home?.temp,
    officeTemp: office?.temp,
    minTemp,
    maxTemp,
    anyRain,
    rainyStops,
  };
}
