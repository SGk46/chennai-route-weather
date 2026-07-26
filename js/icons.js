/**
 * Rich inline SVG icons — free, no CDN dependency for icons.
 * Styled via CSS classes: .icon, .icon--lg, .wx-icon-wrap, etc.
 */

function svg(body, { view = "0 0 24 24", className = "icon" } = {}) {
  return `<svg class="${className}" viewBox="${view}" width="1em" height="1em" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${body}</svg>`;
}

/** UI icons (stroke, currentColor) */
export const ui = {
  home: () =>
    svg(`
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
    `),
  building: () =>
    svg(`
      <path d="M4 20V6.5A1.5 1.5 0 0 1 5.5 5H12v15H4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="M12 20V9h6.5A1.5 1.5 0 0 1 20 10.5V20" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="M7 9h2M7 12h2M7 15h2M15 12h2M15 15h2M4 20h16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    `),
  route: () =>
    svg(`
      <circle cx="6" cy="6" r="2.2" stroke="currentColor" stroke-width="1.7"/>
      <circle cx="18" cy="18" r="2.2" stroke="currentColor" stroke-width="1.7"/>
      <path d="M8 7.2c2.5 0 3.5 2.3 5 4.3s2.8 4.3 5.2 4.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    `),
  arrowRight: () =>
    svg(`
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    `),
  refresh: () =>
    svg(`
      <path d="M20 12a8 8 0 1 1-2.3-5.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M20 5v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    `),
  chevronDown: () =>
    svg(`
      <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    `),
  clock: () =>
    svg(`
      <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.7"/>
      <path d="M12 8v4.5l3 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    `),
  drop: () =>
    svg(`
      <path d="M12 3s6 6.2 6 10.2A6 6 0 1 1 6 13.2C6 9.2 12 3 12 3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
    `),
  wind: () =>
    svg(`
      <path d="M3 8h11a2.5 2.5 0 1 0-1.8-4.2M3 12h15a2.5 2.5 0 1 1-1.8 4.2M3 16h8a2.5 2.5 0 1 1-1.8 4.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    `),
  sunSmall: () =>
    svg(`
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="1.7"/>
      <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    `),
  thermometer: () =>
    svg(`
      <path d="M10 14.5V6.5a2 2 0 1 1 4 0v8a3.5 3.5 0 1 1-4 0Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="M12 17.5v-7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    `),
  umbrella: () =>
    svg(`
      <path d="M12 12v7a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8H4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
    `),
  zap: () =>
    svg(`
      <path d="M13 3 5.5 13.5H12l-1 7.5L18.5 10H12l1-7Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
    `),
  spark: () =>
    svg(`
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
    `),
  mapPin: () =>
    svg(`
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <circle cx="12" cy="10" r="2.3" stroke="currentColor" stroke-width="1.7"/>
    `),
  bus: () =>
    svg(`
      <rect x="4" y="4" width="16" height="13" rx="2.5" stroke="currentColor" stroke-width="1.7"/>
      <path d="M4 11h16M8 17v2M16 17v2M7 7.5h3M14 7.5h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    `),
  road: () =>
    svg(`
      <path d="M6 21 9 3h6l3 18" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="M12 7v2.5M12 13v2.5M12 18.5V21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    `),
  check: () =>
    svg(`
      <path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
    `),
  alert: () =>
    svg(`
      <path d="M12 4 3.5 19h17L12 4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="M12 10v4M12 16.5v.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    `),
  sunrise: () =>
    svg(`
      <path d="M4 18h16M6.5 15a5.5 5.5 0 0 1 11 0M12 5v3M4.8 10.2l1.8 1.8M19.2 10.2l-1.8 1.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    `),
  sunset: () =>
    svg(`
      <path d="M4 18h16M6.5 15a5.5 5.5 0 0 1 11 0M12 12v-3M4.8 10.2l1.8 1.8M19.2 10.2l-1.8 1.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    `),
  layers: () =>
    svg(`
      <path d="M12 4 3 9l9 5 9-5-9-5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="m3 14 9 5 9-5M3 19l9 5 9-5" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
    `),
  star: () =>
    svg(`
      <path d="m12 3.5 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.8 7.2 18.4l.9-5.4L4.2 9.2l5.4-.8L12 3.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    `),
};

/**
 * Rich gradient weather glyphs (48 viewBox for detail).
 */
let _wxSeq = 0;

export function weatherIcon(name, { size = "md" } = {}) {
  const cls = `wx-svg wx-svg--${size} wx-${name}`;
  const common = `class="${cls}" viewBox="0 0 64 64" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"`;
  _wxSeq += 1;

  const defs = (id) => `
    <defs>
      <linearGradient id="${id}-sun" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFE56A"/>
        <stop offset="55%" stop-color="#FF9A3C"/>
        <stop offset="100%" stop-color="#FF6B2C"/>
      </linearGradient>
      <linearGradient id="${id}-cloud" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F5F8FF"/>
        <stop offset="100%" stop-color="#B7C5DE"/>
      </linearGradient>
      <linearGradient id="${id}-rain" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8ADAFF"/>
        <stop offset="100%" stop-color="#3B8CFF"/>
      </linearGradient>
      <linearGradient id="${id}-storm" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#E9D5FF"/>
        <stop offset="100%" stop-color="#8B5CF6"/>
      </linearGradient>
      <filter id="${id}-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="1.6" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;

  const sunCore = (id) => `
    <g filter="url(#${id}-glow)">
      <circle cx="32" cy="28" r="11" fill="url(#${id}-sun)"/>
      <g stroke="url(#${id}-sun)" stroke-width="3" stroke-linecap="round">
        <path d="M32 8v5M32 43v5M12 28h5M47 28h5M17 13l3.5 3.5M41.5 39.5 45 43M45 13l-3.5 3.5M19 42.5 15.5 46"/>
      </g>
    </g>`;

  const cloud = (id, y = 34) => `
    <path fill="url(#${id}-cloud)" d="M20 ${y}c0-6 4.5-10.5 10.5-10.5 1.2 0 2.4.2 3.5.6A9 9 0 0 1 50 ${y}c0 .4 0 .7-.1 1.1H20.2c-.1-.4-.2-.7-.2-1.1Z"/>
    <ellipse cx="32" cy="${y + 2}" rx="16" ry="3.5" fill="rgba(20,30,50,.12)"/>`;

  const drops = (id, heavy = false) =>
    heavy
      ? `<g stroke="url(#${id}-rain)" stroke-width="2.4" stroke-linecap="round">
          <path d="M20 44v8M28 42v10M36 44v8M44 42v10M24 48v6M40 48v6"/>
        </g>`
      : `<g stroke="url(#${id}-rain)" stroke-width="2.4" stroke-linecap="round">
          <path d="M22 44v7M32 42v9M42 44v7"/>
        </g>`;

  const bolt = (id) =>
    `<path fill="url(#${id}-storm)" d="M34 40 28 50h6l-2 10 12-14h-7l3-6Z"/>`;

  const id = `i${name}${size}${_wxSeq}`;

  const map = {
    sun: `<svg ${common}>${defs(id)}${sunCore(id)}</svg>`,
    partly: `<svg ${common}>${defs(id)}
      <g transform="translate(-6,-4) scale(.78)">${sunCore(id)}</g>
      ${cloud(id, 40)}
    </svg>`,
    cloud: `<svg ${common}>${defs(id)}${cloud(id, 34)}
      <path fill="url(#${id}-cloud)" opacity=".85" d="M16 38c0-5 3.8-9 9-9 1 0 2 .2 2.9.5A7.5 7.5 0 0 1 46 38H16Z"/>
    </svg>`,
    fog: `<svg ${common}>${defs(id)}
      ${cloud(id, 28)}
      <g stroke="#C9D4E8" stroke-width="2.5" stroke-linecap="round" opacity=".85">
        <path d="M14 42h36M18 48h28M16 54h32"/>
      </g>
    </svg>`,
    drizzle: `<svg ${common}>${defs(id)}${cloud(id, 30)}
      <g stroke="url(#${id}-rain)" stroke-width="2" stroke-linecap="round" opacity=".85">
        <path d="M24 42v5M34 40v5M44 42v5"/>
      </g>
    </svg>`,
    rain: `<svg ${common}>${defs(id)}${cloud(id, 28)}${drops(id, false)}</svg>`,
    heavyrain: `<svg ${common}>${defs(id)}${cloud(id, 26)}${drops(id, true)}</svg>`,
    shower: `<svg ${common}>${defs(id)}
      <g transform="translate(-8,-6) scale(.7)">${sunCore(id)}</g>
      ${cloud(id, 32)}${drops(id, false)}
    </svg>`,
    snow: `<svg ${common}>${defs(id)}${cloud(id, 28)}
      <g fill="#E8F1FF">
        <circle cx="22" cy="46" r="2.2"/><circle cx="32" cy="50" r="2.2"/><circle cx="42" cy="46" r="2.2"/>
        <circle cx="27" cy="52" r="1.6"/><circle cx="37" cy="43" r="1.6"/>
      </g>
    </svg>`,
    storm: `<svg ${common}>${defs(id)}
      <path fill="url(#${id}-storm)" d="M18 34c0-7 5.5-12 12.5-12 1.5 0 2.9.3 4.2.8A10 10 0 0 1 52 34c0 .5 0 .9-.1 1.3H18.2c-.1-.4-.2-.8-.2-1.3Z"/>
      ${bolt(id)}
      <g stroke="url(#${id}-rain)" stroke-width="2.2" stroke-linecap="round">
        <path d="M18 48v6M26 50v6M46 48v6"/>
      </g>
    </svg>`,
  };

  return map[name] || map.cloud;
}

export function routeGlyph(routeId) {
  if (routeId === "koyambedu") return ui.bus();
  if (routeId === "porur") return ui.road();
  if (routeId === "dlf") return ui.building();
  return ui.route();
}

export function tipIcon(level) {
  if (level === "rain") return ui.umbrella();
  if (level === "hot") return ui.sunSmall();
  if (level === "alert") return ui.zap();
  if (level === "focus") return ui.mapPin();
  return ui.check();
}

export function iconBadge(svgHtml, extraClass = "") {
  return `<span class="icon-badge ${extraClass}">${svgHtml}</span>`;
}
