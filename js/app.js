import { APP, ROUTE_LIST, ROUTES } from "./config.js";
import { fetchRouteWeather, fetchRouteCompare } from "./weather.js";

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
  routeSelect: $("#route-select"),
  dirHome: $("#dir-home"),
  dirOffice: $("#dir-office"),
  compare: $("#compare"),
  leaveCard: $("#leave-card"),
  comfortRing: $("#comfort-ring"),
  scene: $("#weather-scene"),
  sceneLabel: $("#scene-label"),
  sunTimes: $("#sun-times"),
};

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
    return JSON.parse(localStorage.getItem(APP.storageKey) || "{}");
  } catch {
    return {};
  }
}

function savePrefs(partial) {
  localStorage.setItem(
    APP.storageKey,
    JSON.stringify({ ...loadPrefs(), ...partial })
  );
}

const prefs = loadPrefs();
let routeId = ROUTES[prefs.routeId] ? prefs.routeId : "porur";
/** false = home → office, true = office → home */
let reverseRoute = !!prefs.reverseRoute;
let lastPayload = null;
let lastCompare = null;
let timerId = null;
let countdownId = null;
let nextRefreshAt = 0;

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
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: APP.timezone,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function badgeFor(stop) {
  if (stop.tag === "storm" || stop.code >= 95)
    return { cls: "storm", text: "Storm" };
  if (stop.rainNow) return { cls: "rain", text: "Raining" };
  if (stop.rainingSoon) return { cls: "rain-soon", text: "Rain soon" };
  if (stop.heat.level === "extreme" || stop.heat.level === "very-hot")
    return { cls: "hot", text: stop.heat.label };
  if (stop.heat.level === "hot") return { cls: "hot", text: "Hot sun" };
  return { cls: "ok", text: stop.heat.label };
}

function applyWeatherScene(summary) {
  const scene = summary.scene || "cloud";
  const day = summary.isDay !== false;
  document.body.dataset.scene = scene;
  document.body.dataset.day = day ? "day" : "night";
  if (els.sceneLabel) {
    const labels = {
      sun: "Hot sun sky",
      partly: "Partly cloudy",
      cloud: "Overcast layers",
      rain: "Rain atmosphere",
      heavyrain: "Heavy rain",
      storm: "Storm mode",
      fog: "Fog veil",
    };
    els.sceneLabel.textContent = labels[scene] || "Live sky";
  }
}

function renderRouteSelect() {
  els.routeSelect.innerHTML = ROUTE_LIST.map(
    (r) =>
      `<option value="${r.id}" ${r.id === routeId ? "selected" : ""}>${r.emoji} ${r.name}</option>`
  ).join("");
}

function updateDirectionUi() {
  els.dirHome.classList.toggle("active", !reverseRoute);
  els.dirOffice.classList.toggle("active", reverseRoute);
  const r = ROUTES[routeId];
  els.direction.textContent = reverseRoute
    ? `MSC IT Park → Velachery · ${r.short} (return)`
    : `Velachery → MSC IT Park · ${r.short} (to office)`;
}

function renderSummary(data) {
  const { summary, fetchedAt, route } = data;
  els.headline.textContent = summary.headline;
  els.banner.className = `banner glass tone-${summary.tone}`;

  const rainy =
    summary.rainyStops.length > 0
      ? `Watch: ${summary.rainyStops.join(", ")}`
      : "";

  els.summaryMeta.innerHTML = `
    <span>Home ${summary.homeTemp?.toFixed(1) ?? "—"}°C</span>
    <span class="dot">→</span>
    <span class="focus-inline">${summary.focusName ?? "Key"} ${summary.focusTemp?.toFixed(1) ?? "—"}°C</span>
    <span class="dot">→</span>
    <span>Office ${summary.officeTemp?.toFixed(1) ?? "—"}°C</span>
    <span class="sep">·</span>
    <span>${summary.minTemp.toFixed(0)}–${summary.maxTemp.toFixed(0)}°C</span>
    <span class="sep">·</span>
    <span>Updated ${formatTime(fetchedAt)}</span>
    ${rainy ? `<span class="sep">·</span><span class="warn">${rainy}</span>` : ""}
  `;

  if (els.comfortRing) {
    const c = summary.avgComfort;
    els.comfortRing.style.setProperty("--p", String(c));
    els.comfortRing.dataset.level =
      c >= 75 ? "good" : c >= 50 ? "mid" : "low";
    els.comfortRing.innerHTML = `
      <span class="ring-val">${c}</span>
      <span class="ring-lbl">Comfort</span>
    `;
  }

  if (els.sunTimes) {
    els.sunTimes.innerHTML = `
      <span>🌅 ${formatHour(summary.sunrise)}</span>
      <span>🌇 ${formatHour(summary.sunset)}</span>
      <span class="route-pill">${route.emoji} ${route.short}</span>
    `;
  }

  applyWeatherScene(summary);
}

function renderLeave(data) {
  if (!els.leaveCard) return;
  const leave = data.leave;
  if (!leave) {
    els.leaveCard.hidden = true;
    return;
  }
  els.leaveCard.hidden = false;
  els.leaveCard.className = `leave-card glass kind-${leave.kind}`;
  els.leaveCard.innerHTML = `
    <span class="leave-kicker">Smart leave · free</span>
    <strong>${leave.label}</strong>
    <p>${leave.text}</p>
  `;
}

function renderFocusCard(data) {
  const stop =
    data.stops.find((s) => s.id === data.route.focusStopId) ||
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
        <span class="role-pill focus-pill">Key stretch · ${data.route.short}</span>
        <h2>${icon} ${stop.name}</h2>
        <p class="area">${stop.area}</p>
      </div>
      <div class="stop-main col">
        <span class="temp">${stop.temp.toFixed(1)}°</span>
        <span class="comfort-mini">Comfort ${stop.comfort}</span>
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
          ? `<span class="rain-amt">Wet risk ~${formatHour(nextRain.time)} (${nextRain.pop ?? "—"}%)</span>`
          : ""
      }
    </div>
    ${stop.tip ? `<p class="focus-tip">${stop.tip}</p>` : ""}
  `;
}

function renderTips(data) {
  if (!els.tips) return;
  els.tips.innerHTML = `
    <h3 class="tips-title">Premium tips · always free</h3>
    <ul class="tips-list">
      ${data.tips
        .map(
          (t) => `
        <li class="tip glass level-${t.level}">
          <span class="tip-icon">${t.icon}</span>
          <span>${t.text}</span>
        </li>`
        )
        .join("")}
    </ul>
  `;
}

function renderRoute(data) {
  const stops = reverseRoute ? [...data.stops].reverse() : data.stops;
  updateDirectionUi();

  els.route.innerHTML = stops
    .map((stop, idx) => {
      const badge = badgeFor(stop);
      const icon = ICONS[stop.icon] || "🌡️";
      const isFocus =
        stop.id === data.route.focusStopId || stop.focus;
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
        <div class="stop-body glass">
          <header class="stop-head">
            <div class="stop-titles">
              <span class="role-pill">${stop.label}</span>
              <h2>${stop.name}</h2>
              <p class="area">${stop.area}</p>
            </div>
            <div class="stop-main col">
              <div class="temp-row">
                <span class="wx-icon">${icon}</span>
                <span class="temp">${stop.temp.toFixed(1)}°</span>
              </div>
              <span class="comfort-mini">Comfort ${stop.comfort}</span>
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
          <div class="hourly">
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

function renderCompare(compare) {
  if (!els.compare || !compare) return;
  lastCompare = compare;
  els.compare.innerHTML = `
    <div class="compare-head">
      <h3>Route compare · free</h3>
      <p>Best right now: <strong>${ROUTES[compare.bestId]?.emoji || ""} ${ROUTES[compare.bestId]?.short || "—"}</strong></p>
    </div>
    <div class="compare-grid">
      ${compare.cards
        .map((c, i) => {
          const active = c.route.id === routeId;
          return `
          <button type="button" class="compare-card glass ${active ? "active" : ""} ${i === 0 ? "best" : ""}" data-route="${c.route.id}">
            <span class="cc-top">
              <span>${c.route.emoji} ${c.route.short}</span>
              ${i === 0 ? '<span class="best-tag">Best</span>' : ""}
            </span>
            <span class="cc-temp">${c.focus.temp.toFixed(0)}° at ${c.focus.name}</span>
            <span class="cc-meta">
              Comfort ${c.avgComfort}
              ${c.storm ? " · Storm" : c.wet ? " · Wet risk" : " · Dry"}
            </span>
          </button>`;
        })
        .join("")}
    </div>
  `;

  els.compare.querySelectorAll("[data-route]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectRoute(btn.getAttribute("data-route"));
    });
  });
}

function updateCountdown() {
  const ms = Math.max(0, nextRefreshAt - Date.now());
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  els.countdown.textContent = `Next refresh ${m}:${String(s).padStart(2, "0")}`;
}

function scheduleRefresh() {
  clearTimeout(timerId);
  clearInterval(countdownId);
  nextRefreshAt = Date.now() + APP.refreshMs;
  updateCountdown();
  countdownId = setInterval(updateCountdown, 1000);
  timerId = setTimeout(() => loadAll({ silent: true }), APP.refreshMs);
}

async function selectRoute(id) {
  if (!ROUTES[id] || id === routeId) {
    if (id === routeId && lastPayload) {
      // still re-render selection state
      renderCompare(lastCompare);
    }
    if (!ROUTES[id]) return;
  }
  routeId = id;
  savePrefs({ routeId });
  els.routeSelect.value = routeId;
  updateDirectionUi();
  await loadWeather({ silent: false });
  if (lastCompare) renderCompare(lastCompare);
}

async function loadWeather({ silent = false } = {}) {
  if (!silent) setStatus("Fetching live weather…", "loading");
  els.refreshBtn.disabled = true;
  try {
    const data = await fetchRouteWeather(routeId);
    lastPayload = data;
    renderSummary(data);
    renderLeave(data);
    renderFocusCard(data);
    renderTips(data);
    renderRoute(data);
    setStatus(`Live · ${data.route.short} · Open-Meteo free`, "ok");
  } catch (err) {
    console.error(err);
    setStatus(err?.message || "Could not load weather.", "error");
    throw err;
  } finally {
    els.refreshBtn.disabled = false;
  }
}

async function loadCompare({ silent = true } = {}) {
  try {
    const compare = await fetchRouteCompare();
    renderCompare(compare);
  } catch (err) {
    console.error("compare", err);
    if (!silent && els.compare) {
      els.compare.innerHTML = `<p class="compare-error">Route compare unavailable right now.</p>`;
    }
  }
}

async function loadAll({ silent = false } = {}) {
  try {
    await loadWeather({ silent });
    scheduleRefresh();
  } catch {
    clearTimeout(timerId);
    nextRefreshAt = Date.now() + 60_000;
    updateCountdown();
    timerId = setTimeout(() => loadAll({ silent: true }), 60_000);
  }
  // compare in parallel after / alongside
  loadCompare({ silent: true });
}

function wireUi() {
  renderRouteSelect();
  updateDirectionUi();

  els.routeSelect.addEventListener("change", (e) => {
    selectRoute(e.target.value);
  });

  els.dirHome.addEventListener("click", () => {
    reverseRoute = false;
    savePrefs({ reverseRoute });
    if (lastPayload) renderRoute(lastPayload);
    else updateDirectionUi();
  });

  els.dirOffice.addEventListener("click", () => {
    reverseRoute = true;
    savePrefs({ reverseRoute });
    if (lastPayload) renderRoute(lastPayload);
    else updateDirectionUi();
  });

  els.refreshBtn.addEventListener("click", () => loadAll({ silent: false }));

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && Date.now() >= nextRefreshAt) {
      loadAll({ silent: true });
    }
  });
}

wireUi();
loadAll();
