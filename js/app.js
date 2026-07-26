import { APP, ROUTE_LIST, ROUTES } from "./config.js";
import { fetchRouteWeather, fetchRouteCompare } from "./weather.js";
import {
  ui,
  weatherIcon,
  routeGlyph,
  tipIcon,
  iconBadge,
} from "./icons.js";

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
  sceneLabel: $("#scene-label"),
  sunTimes: $("#sun-times"),
  bannerIcon: $("#banner-icon"),
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
let reverseRoute = !!prefs.reverseRoute;
let lastPayload = null;
let lastCompare = null;
let timerId = null;
let countdownId = null;
let nextRefreshAt = 0;

function setStatus(text, kind = "ok") {
  els.status.innerHTML = `<span class="status-dot"></span><span>${text}</span>`;
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
    return { cls: "storm", text: "Storm", icon: ui.zap() };
  if (stop.rainNow)
    return { cls: "rain", text: "Raining", icon: ui.drop() };
  if (stop.rainingSoon)
    return { cls: "rain-soon", text: "Rain soon", icon: ui.umbrella() };
  if (stop.heat.level === "extreme" || stop.heat.level === "very-hot")
    return { cls: "hot", text: stop.heat.label, icon: ui.sunSmall() };
  if (stop.heat.level === "hot")
    return { cls: "hot", text: "Hot sun", icon: ui.sunSmall() };
  return { cls: "ok", text: stop.heat.label, icon: ui.check() };
}

function metaChip(svg, text, extra = "") {
  return `<span class="meta-chip ${extra}">${svg}<span>${text}</span></span>`;
}

function applyWeatherScene(summary) {
  const scene = summary.scene || "cloud";
  const day = summary.isDay !== false;
  document.body.dataset.scene = scene;
  document.body.dataset.day = day ? "day" : "night";
  if (els.sceneLabel) {
    const labels = {
      sun: "Clear & hot",
      partly: "Partly cloudy",
      cloud: "Overcast",
      rain: "Rainy sky",
      heavyrain: "Heavy rain",
      storm: "Storm mode",
      fog: "Foggy",
    };
    const iconName =
      scene === "heavyrain" ? "heavyrain" : scene === "partly" ? "partly" : scene;
    els.sceneLabel.innerHTML = `${weatherIcon(iconName, { size: "xs" })}<span>${labels[scene] || "Live sky"}</span>`;
  }
  if (els.bannerIcon) {
    const map = {
      sun: "sun",
      partly: "partly",
      cloud: "cloud",
      rain: "rain",
      heavyrain: "heavyrain",
      storm: "storm",
      fog: "fog",
    };
    els.bannerIcon.innerHTML = weatherIcon(map[scene] || "cloud", { size: "lg" });
  }
}

function renderRouteSelect() {
  els.routeSelect.innerHTML = ROUTE_LIST.map(
    (r) =>
      `<option value="${r.id}" ${r.id === routeId ? "selected" : ""}>${r.name}</option>`
  ).join("");
}

function updateDirectionUi() {
  els.dirHome.classList.toggle("active", !reverseRoute);
  els.dirOffice.classList.toggle("active", reverseRoute);
  const r = ROUTES[routeId];
  if (els.direction) {
    els.direction.innerHTML = reverseRoute
      ? `${iconBadge(ui.building(), "ib-office")}<span>MSC IT Park</span>${iconBadge(ui.arrowRight(), "ib-arrow")}<span>Velachery</span><span class="dir-route">· ${r.short}</span>`
      : `${iconBadge(ui.home(), "ib-home")}<span>Velachery</span>${iconBadge(ui.arrowRight(), "ib-arrow")}<span>MSC IT Park</span><span class="dir-route">· ${r.short}</span>`;
  }
}

function renderSummary(data) {
  const { summary, fetchedAt, route } = data;
  els.headline.textContent = summary.headline;
  els.banner.className = `banner glass tone-${summary.tone}`;

  const rainy =
    summary.rainyStops.length > 0
      ? metaChip(ui.alert(), `Watch: ${summary.rainyStops.join(", ")}`, "warn-chip")
      : "";

  els.summaryMeta.innerHTML = `
    ${metaChip(ui.home(), `Home ${summary.homeTemp?.toFixed(1) ?? "—"}°C`, "chip-home")}
    <span class="flow-arrow">${ui.arrowRight()}</span>
    ${metaChip(ui.mapPin(), `${summary.focusName ?? "Key"} ${summary.focusTemp?.toFixed(1) ?? "—"}°C`, "chip-focus")}
    <span class="flow-arrow">${ui.arrowRight()}</span>
    ${metaChip(ui.building(), `Office ${summary.officeTemp?.toFixed(1) ?? "—"}°C`, "chip-office")}
    ${metaChip(ui.thermometer(), `${summary.minTemp.toFixed(0)}–${summary.maxTemp.toFixed(0)}°C`)}
    ${metaChip(ui.clock(), formatTime(fetchedAt))}
    ${rainy}
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
      <span class="sun-chip">${ui.sunrise()}<span>${formatHour(summary.sunrise)}</span></span>
      <span class="sun-chip">${ui.sunset()}<span>${formatHour(summary.sunset)}</span></span>
      <span class="route-pill">${routeGlyph(route.id)}<span>${route.short}</span></span>
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
  const icon = leave.kind === "rain" ? ui.umbrella() : ui.spark();
  els.leaveCard.innerHTML = `
    <div class="leave-icon">${icon}</div>
    <div class="leave-body">
      <span class="leave-kicker">Smart leave · free</span>
      <strong>${leave.label}</strong>
      <p>${leave.text}</p>
    </div>
  `;
}

function renderFocusCard(data) {
  const stop =
    data.stops.find((s) => s.id === data.route.focusStopId) ||
    data.stops.find((s) => s.focus);
  if (!stop || !els.focusCard) return;

  const badge = badgeFor(stop);
  const nextRain = stop.hourly.find(
    (h) => (h.pop ?? 0) >= 40 || (h.rain ?? 0) > 0 || (h.precip ?? 0) > 0.1
  );

  els.focusCard.hidden = false;
  els.focusCard.innerHTML = `
    <div class="focus-top">
      <div class="focus-left">
        <div class="wx-hero">${weatherIcon(stop.icon, { size: "xl" })}</div>
        <div>
          <span class="role-pill focus-pill">${iconBadge(routeGlyph(data.route.id))} Key · ${data.route.short}</span>
          <h2>${stop.name}</h2>
          <p class="area">${stop.area}</p>
        </div>
      </div>
      <div class="stop-main col">
        <span class="temp">${stop.temp.toFixed(1)}°</span>
        <span class="comfort-mini">${ui.spark()} Comfort ${stop.comfort}</span>
      </div>
    </div>
    <div class="stop-meta">
      <span class="badge ${badge.cls}">${badge.icon}<span>${badge.text}</span></span>
      <span class="cond-text">${stop.text}</span>
      ${metaChip(ui.thermometer(), `Feels ${stop.feelsLike.toFixed(0)}°`)}
      ${metaChip(ui.wind(), `${stop.wind.toFixed(0)} km/h`)}
      ${metaChip(ui.drop(), `${stop.humidity}%`)}
      ${
        stop.rainNow
          ? metaChip(ui.drop(), `${stop.rain.toFixed(1)} mm now`, "rain-amt")
          : ""
      }
      ${
        nextRain && !stop.rainNow
          ? metaChip(ui.clock(), `Wet ~${formatHour(nextRain.time)} (${nextRain.pop ?? "—"}%)`, "rain-amt")
          : ""
      }
    </div>
    ${stop.tip ? `<p class="focus-tip">${ui.mapPin()} ${stop.tip}</p>` : ""}
  `;
}

function renderTips(data) {
  if (!els.tips) return;
  els.tips.innerHTML = `
    <div class="section-head">
      <h3 class="tips-title">${ui.spark()} Premium tips <span class="free-tag">free</span></h3>
    </div>
    <ul class="tips-list">
      ${data.tips
        .map(
          (t) => `
        <li class="tip glass level-${t.level}">
          <span class="tip-icon-wrap level-${t.level}">${tipIcon(t.level)}</span>
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
      const isFocus = stop.id === data.route.focusStopId || stop.focus;
      const roleIcon =
        stop.role === "home"
          ? ui.home()
          : stop.role === "office"
            ? ui.building()
            : isFocus
              ? ui.mapPin()
              : ui.route();

      const hours = stop.hourly
        .slice(0, 5)
        .map(
          (h) => `
          <div class="hour">
            <span class="h-time">${formatHour(h.time)}</span>
            <span class="h-icon">${weatherIcon(h.icon, { size: "xs" })}</span>
            <span class="h-temp">${h.temp.toFixed(0)}°</span>
            <span class="h-pop">${ui.drop()} ${h.pop != null ? `${h.pop}%` : "—"}</span>
          </div>`
        )
        .join("");

      return `
      <article class="stop role-${stop.role} tag-${stop.tag}${isFocus ? " is-focus" : ""}" data-id="${stop.id}" id="stop-${stop.id}">
        <div class="stop-rail">
          <div class="rail-dot">${roleIcon}</div>
          ${idx < stops.length - 1 ? '<div class="rail-line"></div>' : ""}
        </div>
        <div class="stop-body glass">
          <header class="stop-head">
            <div class="stop-titles">
              <span class="role-pill">${roleIcon}<span>${stop.label}</span></span>
              <h2>${stop.name}</h2>
              <p class="area">${stop.area}</p>
            </div>
            <div class="stop-main col">
              <div class="temp-row">
                <span class="wx-icon-wrap">${weatherIcon(stop.icon, { size: "lg" })}</span>
                <span class="temp">${stop.temp.toFixed(1)}°</span>
              </div>
              <span class="comfort-mini">${ui.spark()} ${stop.comfort}</span>
            </div>
          </header>
          <div class="stop-meta">
            <span class="badge ${badge.cls}">${badge.icon}<span>${badge.text}</span></span>
            <span class="cond-text">${stop.text}</span>
            ${metaChip(ui.thermometer(), `Feels ${stop.feelsLike.toFixed(0)}°`)}
            ${metaChip(ui.drop(), `${stop.humidity}%`)}
            ${metaChip(ui.wind(), `${stop.wind.toFixed(0)} km/h`)}
            ${metaChip(ui.sunSmall(), `UV ${stop.uv ?? "—"}`)}
            ${
              stop.rainNow
                ? metaChip(ui.drop(), `${stop.rain.toFixed(1)} mm`, "rain-amt")
                : ""
            }
          </div>
          ${
            stop.tip && isFocus
              ? `<p class="focus-tip inline-tip">${ui.mapPin()} ${stop.tip}</p>`
              : ""
          }
          <div class="hourly">
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
  const best = ROUTES[compare.bestId];
  els.compare.innerHTML = `
    <div class="section-head">
      <h3 class="tips-title">${ui.layers()} Route compare <span class="free-tag">free</span></h3>
      <p class="compare-best">Best now: <strong>${routeGlyph(best?.id)}${best?.short || "—"}</strong></p>
    </div>
    <div class="compare-grid">
      ${compare.cards
        .map((c, i) => {
          const active = c.route.id === routeId;
          return `
          <button type="button" class="compare-card glass ${active ? "active" : ""} ${i === 0 ? "best" : ""}" data-route="${c.route.id}">
            <span class="cc-top">
              <span class="cc-name">${routeGlyph(c.route.id)}<span>${c.route.short}</span></span>
              ${i === 0 ? `<span class="best-tag">${ui.star()} Best</span>` : ""}
            </span>
            <span class="cc-wx">${weatherIcon(c.focus.icon, { size: "sm" })}<span class="cc-temp">${c.focus.temp.toFixed(0)}° · ${c.focus.name}</span></span>
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
  els.countdown.innerHTML = `${ui.clock()} <span>${m}:${String(s).padStart(2, "0")}</span>`;
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
  if (!ROUTES[id]) return;
  if (id === routeId) {
    if (lastCompare) renderCompare(lastCompare);
    return;
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
  els.refreshBtn.classList.add("is-spinning");
  try {
    const data = await fetchRouteWeather(routeId);
    lastPayload = data;
    renderSummary(data);
    renderLeave(data);
    renderFocusCard(data);
    renderTips(data);
    renderRoute(data);
    setStatus(`Live · ${data.route.short} · Open-Meteo`, "ok");
  } catch (err) {
    console.error(err);
    setStatus(err?.message || "Could not load weather.", "error");
    throw err;
  } finally {
    els.refreshBtn.disabled = false;
    els.refreshBtn.classList.remove("is-spinning");
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
  loadCompare({ silent: true });
}

function wireUi() {
  // Icon-enhanced static chrome
  if (els.refreshBtn) {
    els.refreshBtn.innerHTML = `${ui.refresh()}<span>Refresh</span>`;
  }
  if (els.dirHome) {
    els.dirHome.innerHTML = `${ui.home()}<span>Home → Office</span>`;
  }
  if (els.dirOffice) {
    els.dirOffice.innerHTML = `${ui.building()}<span>Office → Home</span>`;
  }

  const brandIcon = $("#brand-icon");
  if (brandIcon) brandIcon.innerHTML = weatherIcon("partly", { size: "md" });

  const selectWrapIcon = $("#route-field-icon");
  if (selectWrapIcon) selectWrapIcon.innerHTML = ui.route();

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
