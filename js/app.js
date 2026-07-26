import { APP } from "./config.js";
import { fetchRouteWeather } from "./weather.js";

const $ = (sel) => document.querySelector(sel);

const els = {
  status: $("#status"),
  countdown: $("#countdown"),
  headline: $("#headline"),
  summaryMeta: $("#summary-meta"),
  route: $("#route"),
  banner: $("#banner"),
  refreshBtn: $("#refresh-btn"),
  direction: $("#direction"),
};

let lastPayload = null;
let timerId = null;
let countdownId = null;
let nextRefreshAt = 0;
let reverseRoute = false;

const ICONS = {
  sun: "☀️",
  partly: "⛅",
  cloud: "☁️",
  fog: "🌫️",
  drizzle: "🌦️",
  rain: "🌧️",
  heavyrain: "⛈️",
  shower: "🌦️",
  snow: "❄️",
  storm: "⛈️",
};

function setStatus(text, kind = "ok") {
  els.status.textContent = text;
  els.status.dataset.kind = kind;
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      timeZone: APP.timezone,
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

function formatHour(iso) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: APP.timezone,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function badgeFor(stop) {
  if (stop.tag === "storm" || stop.code >= 95) return { cls: "storm", text: "Storm" };
  if (stop.rainNow) return { cls: "rain", text: "Raining" };
  if (stop.rainingSoon) return { cls: "rain-soon", text: "Rain soon" };
  if (stop.heat.level === "extreme" || stop.heat.level === "very-hot")
    return { cls: "hot", text: stop.heat.label };
  if (stop.heat.level === "hot") return { cls: "hot", text: "Hot sun" };
  return { cls: "ok", text: stop.heat.label };
}

function renderSummary(data) {
  const { summary, fetchedAt } = data;
  els.headline.textContent = summary.headline;
  els.banner.className = `banner tone-${summary.tone}`;

  const rainy =
    summary.rainyStops.length > 0
      ? ` · Watch: ${summary.rainyStops.join(", ")}`
      : "";

  els.summaryMeta.innerHTML = `
    <span>Home ${summary.homeTemp?.toFixed(1) ?? "—"}°C</span>
    <span class="dot">→</span>
    <span>Office ${summary.officeTemp?.toFixed(1) ?? "—"}°C</span>
    <span class="sep">·</span>
    <span>Route ${summary.minTemp.toFixed(0)}–${summary.maxTemp.toFixed(0)}°C</span>
    <span class="sep">·</span>
    <span>Updated ${formatTime(fetchedAt)}</span>
    ${rainy ? `<span class="sep">·</span><span class="warn">${rainy.replace(/^ · /, "")}</span>` : ""}
  `;
}

function renderRoute(data) {
  const stops = reverseRoute ? [...data.stops].reverse() : data.stops;
  const dirLabel = reverseRoute
    ? "Office → Home (evening)"
    : "Home → Office (morning)";
  els.direction.textContent = dirLabel;

  els.route.innerHTML = stops
    .map((stop, idx) => {
      const badge = badgeFor(stop);
      const icon = ICONS[stop.icon] || "🌡️";
      const hours = stop.hourly
        .slice(0, 5)
        .map(
          (h) => `
          <div class="hour">
            <span class="h-time">${formatHour(h.time)}</span>
            <span class="h-icon">${ICONS[h.icon] || "·"}</span>
            <span class="h-temp">${h.temp.toFixed(0)}°</span>
            <span class="h-pop">${h.pop != null ? `${h.pop}%` : "—"}</span>
          </div>`
        )
        .join("");

      return `
      <article class="stop role-${stop.role} tag-${stop.tag}" data-id="${stop.id}">
        <div class="stop-rail">
          <div class="rail-dot"></div>
          ${idx < stops.length - 1 ? '<div class="rail-line"></div>' : ""}
        </div>
        <div class="stop-body">
          <header class="stop-head">
            <div class="stop-titles">
              <span class="role-pill">${stop.label}</span>
              <h2>${stop.name}</h2>
              <p class="area">${stop.area}</p>
            </div>
            <div class="stop-main">
              <span class="wx-icon" aria-hidden="true">${icon}</span>
              <span class="temp">${stop.temp.toFixed(1)}°</span>
            </div>
          </header>
          <div class="stop-meta">
            <span class="badge ${badge.cls}">${badge.text}</span>
            <span>${stop.text}</span>
            <span>Feels ${stop.feelsLike.toFixed(0)}°</span>
            <span>Humidity ${stop.humidity}%</span>
            <span>Wind ${stop.wind.toFixed(0)} km/h</span>
            <span>UV ${stop.uv ?? "—"}</span>
            ${
              stop.rainNow
                ? `<span class="rain-amt">Rain ${stop.rain.toFixed(1)} mm</span>`
                : ""
            }
          </div>
          <div class="hourly" aria-label="Next hours">
            <div class="hour head">
              <span class="h-time">Time</span>
              <span class="h-icon"></span>
              <span class="h-temp">°C</span>
              <span class="h-pop">Rain%</span>
            </div>
            ${hours}
          </div>
        </div>
      </article>`;
    })
    .join("");
}

function updateCountdown() {
  const ms = Math.max(0, nextRefreshAt - Date.now());
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  els.countdown.textContent = `Next refresh in ${m}:${String(s).padStart(2, "0")}`;
}

function scheduleRefresh() {
  clearTimeout(timerId);
  clearInterval(countdownId);
  nextRefreshAt = Date.now() + APP.refreshMs;
  updateCountdown();
  countdownId = setInterval(updateCountdown, 1000);
  timerId = setTimeout(() => loadWeather({ silent: true }), APP.refreshMs);
}

async function loadWeather({ silent = false } = {}) {
  if (!silent) setStatus("Fetching live weather…", "loading");
  els.refreshBtn.disabled = true;
  try {
    const data = await fetchRouteWeather();
    lastPayload = data;
    renderSummary(data);
    renderRoute(data);
    setStatus("Live · Open-Meteo (free)", "ok");
    scheduleRefresh();
  } catch (err) {
    console.error(err);
    setStatus(
      err?.message || "Could not load weather. Check internet and retry.",
      "error"
    );
    // Retry sooner on failure
    clearTimeout(timerId);
    nextRefreshAt = Date.now() + 60_000;
    updateCountdown();
    timerId = setTimeout(() => loadWeather({ silent: true }), 60_000);
  } finally {
    els.refreshBtn.disabled = false;
  }
}

function wireUi() {
  els.refreshBtn.addEventListener("click", () => loadWeather());
  $("#flip-btn").addEventListener("click", () => {
    reverseRoute = !reverseRoute;
    if (lastPayload) renderRoute(lastPayload);
  });

  // Visibility: refresh when tab becomes active if data is stale
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && Date.now() >= nextRefreshAt) {
      loadWeather({ silent: true });
    }
  });
}

wireUi();
loadWeather();
