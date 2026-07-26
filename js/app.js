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
  focusCard: $("#focus-card"),
  tips: $("#tips"),
  routeChip: $("#route-chip"),
};

const STORAGE_KEY = "chennai-route-weather:v2";

let lastPayload = null;
let timerId = null;
let countdownId = null;
let nextRefreshAt = 0;
let reverseRoute = loadPrefs().reverseRoute ?? false;

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

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function savePrefs(partial) {
  const next = { ...loadPrefs(), ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

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
      ? `Watch: ${summary.rainyStops.join(", ")}`
      : "";

  els.summaryMeta.innerHTML = `
    <span>Home ${summary.homeTemp?.toFixed(1) ?? "—"}°C</span>
    <span class="dot">→</span>
    <span class="focus-inline">${summary.focusName} ${summary.focusTemp?.toFixed(1) ?? "—"}°C</span>
    <span class="dot">→</span>
    <span>Office ${summary.officeTemp?.toFixed(1) ?? "—"}°C</span>
    <span class="sep">·</span>
    <span>Route ${summary.minTemp.toFixed(0)}–${summary.maxTemp.toFixed(0)}°C</span>
    <span class="sep">·</span>
    <span>Updated ${formatTime(fetchedAt)}</span>
    ${rainy ? `<span class="sep">·</span><span class="warn">${rainy}</span>` : ""}
  `;
}

function renderFocusCard(data) {
  const stop =
    data.stops.find((s) => s.id === APP.focusStopId) ||
    data.stops.find((s) => s.focus);
  if (!stop || !els.focusCard) return;

  const badge = badgeFor(stop);
  const icon = ICONS[stop.icon] || "🛣️";
  const nextRain = stop.hourly.find(
    (h) => (h.pop ?? 0) >= 40 || (h.rain ?? 0) > 0 || (h.precip ?? 0) > 0.1
  );

  els.focusCard.hidden = false;
  els.focusCard.innerHTML = `
    <div class="focus-top">
      <div>
        <span class="role-pill focus-pill">Your path · Key stretch</span>
        <h2>${icon} ${stop.name}</h2>
        <p class="area">${stop.area}</p>
      </div>
      <div class="stop-main">
        <span class="temp">${stop.temp.toFixed(1)}°</span>
      </div>
    </div>
    <div class="stop-meta">
      <span class="badge ${badge.cls}">${badge.text}</span>
      <span>${stop.text}</span>
      <span>Feels ${stop.feelsLike.toFixed(0)}°</span>
      <span>Wind ${stop.wind.toFixed(0)} km/h</span>
      <span>Humidity ${stop.humidity}%</span>
      ${
        stop.rainNow
          ? `<span class="rain-amt">Rain ${stop.rain.toFixed(1)} mm now</span>`
          : ""
      }
      ${
        nextRain && !stop.rainNow
          ? `<span class="rain-amt">Next wet risk ~${formatHour(nextRain.time)} (${nextRain.pop ?? "—"}%)</span>`
          : ""
      }
    </div>
    ${
      stop.tip
        ? `<p class="focus-tip">${stop.tip}</p>`
        : ""
    }
  `;
}

function renderTips(data) {
  if (!els.tips) return;
  const tips = data.tips || [];
  els.tips.innerHTML = `
    <h3 class="tips-title">Commute tips</h3>
    <ul class="tips-list">
      ${tips
        .map(
          (t) => `
        <li class="tip level-${t.level}">
          <span class="tip-icon" aria-hidden="true">${t.icon}</span>
          <span>${t.text}</span>
        </li>`
        )
        .join("")}
    </ul>
  `;
}

function renderRoute(data) {
  const stops = reverseRoute ? [...data.stops].reverse() : data.stops;
  const dirLabel = reverseRoute
    ? "Office → Home via Porur Bypass (evening)"
    : "Home → Office via Porur Bypass (morning)";
  els.direction.textContent = dirLabel;
  if (els.routeChip) {
    els.routeChip.textContent = "Via Porur Bypass";
  }

  els.route.innerHTML = stops
    .map((stop, idx) => {
      const badge = badgeFor(stop);
      const icon = ICONS[stop.icon] || "🌡️";
      const isFocus = stop.id === APP.focusStopId || stop.focus;
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
      <article class="stop role-${stop.role} tag-${stop.tag}${isFocus ? " is-focus" : ""}" data-id="${stop.id}" id="stop-${stop.id}">
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
          ${
            stop.tip && isFocus
              ? `<p class="focus-tip inline-tip">${stop.tip}</p>`
              : ""
          }
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
    renderFocusCard(data);
    renderTips(data);
    renderRoute(data);
    setStatus("Live · Open-Meteo (free) · Porur Bypass route", "ok");
    scheduleRefresh();
  } catch (err) {
    console.error(err);
    setStatus(
      err?.message || "Could not load weather. Check internet and retry.",
      "error"
    );
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
    savePrefs({ reverseRoute });
    if (lastPayload) renderRoute(lastPayload);
  });

  const jump = $("#jump-porur");
  if (jump) {
    jump.addEventListener("click", () => {
      const el = document.getElementById("stop-porur-bypass");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && Date.now() >= nextRefreshAt) {
      loadWeather({ silent: true });
    }
  });
}

wireUi();
loadWeather();
