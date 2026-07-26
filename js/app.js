import { APP, ROUTE_LIST, ROUTES } from "./config.js";
import { fetchRouteWeather, fetchRouteCompare } from "./weather.js";
import { ui, weatherIcon, routeGlyph, tipIcon } from "./icons.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const PAGES = {
  now: { title: "Now" },
  routes: { title: "Routes" },
  more: { title: "More" },
};

const els = {
  status: $("#status"),
  countdown: $("#countdown"),
  headline: $("#headline"),
  heroMeta: $("#hero-meta"),
  route: $("#route"),
  refreshBtn: $("#refresh-btn"),
  routeLine: $("#route-line"),
  pathMap: $("#path-map"),
  pathLabel: $("#path-label"),
  focusCard: $("#focus-card"),
  tips: $("#tips"),
  dirHome: $("#dir-home"),
  dirOffice: $("#dir-office"),
  compare: $("#compare"),
  leaveCard: $("#leave-card"),
  comfortCard: $("#comfort-card"),
  comfortVal: $("#comfort-val"),
  comfortSub: $("#comfort-sub"),
  bannerIcon: $("#banner-icon"),
  pageTitle: $("#page-title"),
  sunTimes: $("#sun-times"),
  stopsIntro: $("#stops-intro"),
  routesNote: $("#routes-note"),
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
let currentPage = PAGES[prefs.page] ? prefs.page : "now";
let lastPayload = null;
let lastCompare = null;
let timerId = null;
let countdownId = null;
let nextRefreshAt = 0;

/* ---------- Navigation ---------- */

function navigate(page, { push = true } = {}) {
  if (!PAGES[page]) page = "now";
  // map old "home" hash if any
  if (page === "home") page = "now";
  if (page === "stops" || page === "tips") page = "more";

  currentPage = page;
  document.body.dataset.page = page;
  savePrefs({ page });

  $$(".page").forEach((el) => {
    const on = el.dataset.page === page;
    el.hidden = !on;
    el.classList.toggle("is-active", on);
  });

  $$(".tab").forEach((btn) => {
    const on = btn.dataset.nav === page;
    btn.classList.toggle("active", on);
    if (on) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });

  els.pageTitle.textContent = PAGES[page].title;

  if (push) {
    history.replaceState({ page }, "", `${location.pathname}${location.search}#${page}`);
  }

  const main = $("#app-main");
  if (main) main.scrollTop = 0;
}

function pageFromHash() {
  let h = (location.hash || "#now").replace("#", "");
  if (h === "home") h = "now";
  if (h === "stops" || h === "tips") h = "more";
  return PAGES[h] ? h : "now";
}

/* ---------- Helpers ---------- */

function setStatus(text, kind = "ok") {
  els.status.innerHTML = `<span class="status-dot"></span><span>${text}</span>`;
  els.status.dataset.kind = kind;
  els.status.title = text;
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
  if (stop.rainNow) return { cls: "rain", text: "Raining", icon: ui.drop() };
  if (stop.rainingSoon)
    return { cls: "rain-soon", text: "Rain soon", icon: ui.umbrella() };
  if (stop.heat.level === "extreme" || stop.heat.level === "very-hot")
    return { cls: "hot", text: stop.heat.label, icon: ui.sunSmall() };
  if (stop.heat.level === "hot")
    return { cls: "hot", text: "Hot sun", icon: ui.sunSmall() };
  return { cls: "ok", text: stop.heat.label, icon: ui.check() };
}

function segmentClass(stop) {
  if (stop.tag === "storm" || stop.code >= 95) return "storm";
  if (stop.rainNow || stop.rainingSoon) return "rain";
  if (stop.temp >= 35 || stop.heat?.level === "very-hot" || stop.heat?.level === "extreme")
    return "hot";
  if (stop.temp >= 32 || stop.heat?.level === "hot") return "hot";
  if (stop.comfort >= 70) return "ok";
  return "mid";
}

function applyScene(summary) {
  document.body.dataset.scene = summary.scene || "cloud";
  document.body.dataset.day = summary.isDay !== false ? "day" : "night";
}

/* ---------- Path map ---------- */

function renderPathMap(data) {
  const stops = reverseRoute ? [...data.stops].reverse() : data.stops;
  const n = stops.length;
  const W = 360;
  const H = 118;
  const padX = 28;
  const y = 48;
  const span = W - padX * 2;
  const xs = stops.map((_, i) => padX + (n === 1 ? span / 2 : (span * i) / (n - 1)));

  let segs = "";
  for (let i = 0; i < n - 1; i++) {
    const cls = segmentClass(stops[i]);
    segs += `<line class="path-seg ${cls}" x1="${xs[i]}" y1="${y}" x2="${xs[i + 1]}" y2="${y}" />`;
  }

  const nodes = stops
    .map((s, i) => {
      const cls = segmentClass(s);
      const colors = {
        ok: "#3ecf8e",
        hot: "#ff8f4a",
        rain: "#4db8ff",
        storm: "#c084fc",
        mid: "#7a90a8",
      };
      const fill = colors[cls] || colors.mid;
      const r = s.role === "home" || s.role === "office" || s.focus ? 9 : 7;
      const short =
        s.name.length > 10 ? s.name.slice(0, 9) + "…" : s.name;
      return `
      <g class="path-node" transform="translate(${xs[i]},${y})">
        <circle class="pin" r="${r}" fill="${fill}" />
        <text class="name" y="-16">${short}</text>
        <text class="temp" y="26">${s.temp.toFixed(0)}°</text>
      </g>`;
    })
    .join("");

  els.pathMap.innerHTML = `
    <svg class="path-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Route path weather">
      ${segs}
      ${nodes}
    </svg>`;

  els.pathLabel.textContent = `${data.route.short} path`;
}

/* ---------- Renders ---------- */

function updateRouteLine(data) {
  const r = data?.route || ROUTES[routeId];
  if (reverseRoute) {
    els.routeLine.innerHTML = `<strong>MSC IT Park</strong> → <strong>Velachery</strong> · ${r.short}`;
  } else {
    els.routeLine.innerHTML = `<strong>Velachery</strong> → <strong>MSC IT Park</strong> · ${r.short}`;
  }
}

function updateDirectionUi() {
  els.dirHome.classList.toggle("active", !reverseRoute);
  els.dirOffice.classList.toggle("active", reverseRoute);
  if (lastPayload) {
    updateRouteLine(lastPayload);
    renderPathMap(lastPayload);
    renderRouteList(lastPayload);
    renderStopsIntro(lastPayload);
  } else {
    updateRouteLine(null);
  }
}

function renderSummary(data) {
  const { summary, fetchedAt, route } = data;
  els.headline.textContent = summary.headline;
  els.heroMeta.textContent = `${summary.minTemp.toFixed(0)}–${summary.maxTemp.toFixed(0)}°C · ${formatTime(fetchedAt)}`;

  const c = summary.avgComfort;
  els.comfortVal.textContent = c;
  els.comfortSub.textContent =
    c >= 75 ? "Good to go" : c >= 50 ? "Manageable" : "Tough stretch";
  els.comfortCard.dataset.level =
    c >= 75 ? "good" : c >= 50 ? "mid" : "low";

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
    els.bannerIcon.innerHTML = weatherIcon(map[summary.scene] || "cloud", {
      size: "lg",
    });
  }

  els.sunTimes.innerHTML = `
    <span class="sun-chip">${ui.sunrise()} ${formatHour(summary.sunrise)}</span>
    <span class="sun-chip">${ui.sunset()} ${formatHour(summary.sunset)}</span>
    <span class="sun-chip">${routeGlyph(route.id)} ${route.short}</span>
  `;

  applyScene(summary);
  updateRouteLine(data);
}

function renderLeave(data) {
  const leave = data.leave;
  if (!leave) {
    els.leaveCard.hidden = true;
    return;
  }
  els.leaveCard.hidden = false;
  els.leaveCard.className = `card leave-card kind-${leave.kind}`;
  const icon = leave.kind === "rain" ? ui.umbrella() : ui.spark();
  els.leaveCard.innerHTML = `
    <div class="leave-ico">${icon}</div>
    <div>
      <span class="card-kicker">Smart leave</span>
      <strong>${leave.label}</strong>
      <p>${leave.text}</p>
    </div>
  `;
}

function renderFocus(data) {
  const stop =
    data.stops.find((s) => s.id === data.route.focusStopId) ||
    data.stops.find((s) => s.focus);
  if (!stop) {
    els.focusCard.hidden = true;
    return;
  }
  const badge = badgeFor(stop);
  els.focusCard.hidden = false;
  els.focusCard.innerHTML = `
    <div class="focus-top">
      <div class="focus-left">
        <div class="wx-bubble">${weatherIcon(stop.icon, { size: "xl" })}</div>
        <div>
          <span class="role-pill">Key stretch · ${data.route.short}</span>
          <h2>${stop.name}</h2>
          <p class="area">${stop.area}</p>
        </div>
      </div>
      <div class="temp-lg">${stop.temp.toFixed(1)}°</div>
    </div>
    <div class="chip-row">
      <span class="badge ${badge.cls}">${badge.icon}<span>${badge.text}</span></span>
      <span class="chip">${stop.text}</span>
      <span class="chip">${ui.thermometer()} Feels ${stop.feelsLike.toFixed(0)}°</span>
      <span class="chip">${ui.wind()} ${stop.wind.toFixed(0)} km/h</span>
      ${
        stop.rainNow
          ? `<span class="chip rain">${ui.drop()} ${stop.rain.toFixed(1)} mm</span>`
          : stop.rainingSoon
            ? `<span class="chip rain">${ui.umbrella()} Rain soon</span>`
            : ""
      }
    </div>
    ${stop.tip ? `<p class="tip-line">${stop.tip}</p>` : ""}
  `;
}

function renderTips(data) {
  els.tips.innerHTML = `
    <ul class="tips-list">
      ${data.tips
        .map(
          (t) => `
        <li class="tip">
          <span class="tip-ico level-${t.level}">${tipIcon(t.level)}</span>
          <span>${t.text}</span>
        </li>`
        )
        .join("")}
    </ul>
  `;
}

function renderStopsIntro(data) {
  const r = data.route;
  const dir = reverseRoute ? "Office → Home" : "Home → Office";
  els.stopsIntro.innerHTML = `
    <div class="intro-row">
      <div class="intro-ico">${routeGlyph(r.id)}</div>
      <div>
        <strong>${r.name}</strong>
        <p>${dir} · ${r.blurb}</p>
      </div>
    </div>
  `;
}

function renderRouteList(data) {
  const stops = reverseRoute ? [...data.stops].reverse() : data.stops;
  els.route.innerHTML = stops
    .map((stop, idx) => {
      const badge = badgeFor(stop);
      const isFocus = stop.id === data.route.focusStopId || stop.focus;
      const hours = stop.hourly
        .slice(0, 5)
        .map(
          (h) => `
          <div class="hour">
            <span>${formatHour(h.time)}</span>
            ${weatherIcon(h.icon, { size: "xs" })}
            <span class="h-temp">${h.temp.toFixed(0)}°</span>
            <span class="h-pop">${h.pop != null ? h.pop + "%" : "—"}</span>
          </div>`
        )
        .join("");

      return `
      <article class="stop role-${stop.role}${isFocus ? " is-focus" : ""}">
        <div class="rail">
          <div class="rail-dot"></div>
          ${idx < stops.length - 1 ? '<div class="rail-line"></div>' : ""}
        </div>
        <div class="stop-body">
          <header class="stop-head">
            <div>
              <span class="role-pill">${stop.label}</span>
              <h2>${stop.name}</h2>
              <p class="area">${stop.area}</p>
            </div>
            <div class="stop-main">
              <span class="wx-inline">${weatherIcon(stop.icon, { size: "sm" })}</span>
              <span class="temp">${stop.temp.toFixed(1)}°</span>
            </div>
          </header>
          <div class="stop-meta">
            <span class="badge ${badge.cls}">${badge.icon}<span>${badge.text}</span></span>
            <span class="chip">Comfort ${stop.comfort}</span>
            <span class="chip">${ui.drop()} ${stop.humidity}%</span>
            <span class="chip">${ui.wind()} ${stop.wind.toFixed(0)}</span>
          </div>
          ${stop.tip && isFocus ? `<p class="tip-line">${stop.tip}</p>` : ""}
          <div class="hourly">${hours}</div>
        </div>
      </article>`;
    })
    .join("");
}

function renderCompare(compare) {
  if (!compare) return;
  lastCompare = compare;
  const bestId = compare.bestId;

  els.compare.innerHTML = compare.cards
    .map((c) => {
      const active = c.route.id === routeId;
      const isBest = c.route.id === bestId;
      return `
      <button type="button" class="r-card ${active ? "active" : ""} ${isBest ? "best" : ""}" data-route="${c.route.id}">
        <div class="r-top">
          <span class="r-name">${routeGlyph(c.route.id)}<span>${c.route.short}</span></span>
          ${isBest ? `<span class="best-pill">${ui.star()} Best</span>` : active ? `<span class="chip ok">Selected</span>` : ""}
        </div>
        <p class="r-meta">${c.route.blurb}</p>
        <div class="r-wx">
          ${weatherIcon(c.focus.icon, { size: "sm" })}
          <span><strong>${c.focus.temp.toFixed(0)}°</strong> at ${c.focus.name}</span>
        </div>
        <div class="r-stats">
          <span class="chip">Comfort ${c.avgComfort}</span>
          <span class="chip ${c.storm ? "rain" : c.wet ? "rain" : "ok"}">${
            c.storm ? "Storm risk" : c.wet ? "Wet risk" : "Mostly dry"
          }</span>
          <span class="chip hot">Max ${c.maxTemp.toFixed(0)}°</span>
        </div>
      </button>`;
    })
    .join("");

  els.compare.querySelectorAll("[data-route]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await selectRoute(btn.getAttribute("data-route"));
      navigate("now");
    });
  });

  if (els.routesNote) {
    const best = ROUTES[bestId];
    els.routesNote.textContent = best
      ? `Best right now: ${best.short}. Tap a card to use it on Home.`
      : "Tap a corridor to select it for your path.";
  }
}

/* ---------- Data load ---------- */

function updateCountdown() {
  const ms = Math.max(0, nextRefreshAt - Date.now());
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  els.countdown.innerHTML = `${ui.clock()} Next refresh ${m}:${String(s).padStart(2, "0")}`;
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
  routeId = id;
  savePrefs({ routeId });
  await loadWeather({ silent: false });
  if (lastCompare) renderCompare(lastCompare);
}

async function loadWeather({ silent = false } = {}) {
  if (!silent) setStatus("Updating…", "loading");
  els.refreshBtn.disabled = true;
  els.refreshBtn.classList.add("is-spinning");
  try {
    const data = await fetchRouteWeather(routeId);
    lastPayload = data;
    renderSummary(data);
    renderPathMap(data);
    renderLeave(data);
    renderFocus(data);
    renderTips(data);
    renderRouteList(data);
    renderStopsIntro(data);
    setStatus("Live", "ok");
  } catch (err) {
    console.error(err);
    setStatus("Error", "error");
    throw err;
  } finally {
    els.refreshBtn.disabled = false;
    els.refreshBtn.classList.remove("is-spinning");
  }
}

async function loadCompare() {
  try {
    renderCompare(await fetchRouteCompare());
  } catch (err) {
    console.error("compare", err);
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
  loadCompare();
}

/* ---------- Wire ---------- */

function wireUi() {
  els.refreshBtn.innerHTML = ui.refresh();
  els.dirHome.innerHTML = `${ui.home()}<span>Home → Office</span>`;
  els.dirOffice.innerHTML = `${ui.building()}<span>Office → Home</span>`;

  $$(".tab").forEach((btn) => {
    const ico = btn.querySelector(".tab-ico");
    const map = { now: ui.spark(), routes: ui.route(), more: ui.list() };
    if (ico) ico.innerHTML = map[btn.dataset.nav] || ui.grid();
    btn.addEventListener("click", () => navigate(btn.dataset.nav));
  });

  $$("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.go));
  });

  // enhance action buttons with icons
  const ch = $("#btn-change-route");
  const st = $("#btn-all-stops");
  if (ch) ch.innerHTML = `${ui.route()} Change route`;
  if (st) st.innerHTML = `${ui.list()} All stops`;

  const initial = pageFromHash() !== "now" ? pageFromHash() : currentPage;
  navigate(initial, { push: true });

  window.addEventListener("hashchange", () => {
    navigate(pageFromHash(), { push: false });
  });

  els.dirHome.addEventListener("click", () => {
    reverseRoute = false;
    savePrefs({ reverseRoute });
    updateDirectionUi();
  });

  els.dirOffice.addEventListener("click", () => {
    reverseRoute = true;
    savePrefs({ reverseRoute });
    updateDirectionUi();
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
