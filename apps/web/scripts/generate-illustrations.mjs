/**
 * Generates the original, brand-consistent SVG illustrations used as initial service and hero
 * imagery (public/images/services/*.svg). They are original artwork produced from the HIKE UP
 * palette and open-source Lucide icon geometry (ISC licence) — no stock photos are hot-linked.
 *
 *   node scripts/generate-illustrations.mjs
 *
 * Replace them at any time by uploading real photos in Admin → Services.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as Lucide from 'lucide-react';

const OUT = new URL('../public/images/services/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const icon = (name, size, color, stroke = 1.6) => {
  const markup = renderToStaticMarkup(createElement(Lucide[name]));
  const inner = markup.replace(/<svg[^>]*>/, '').replace('</svg>', '');
  return `<g transform="scale(${size / 24})" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
};

const SERVICES = [
  ['electrical-services', 'Zap', ['Lightbulb', 'Plug', 'Cable'], 20],
  ['plumbing-services', 'Droplets', ['Wrench', 'ShowerHead', 'Waves'], 160],
  ['ac-hvac-services', 'AirVent', ['Snowflake', 'Thermometer', 'Fan'], 200],
  ['painting-services', 'PaintRoller', ['Paintbrush', 'Palette', 'Ruler'], 300],
  ['handyman-services', 'Wrench', ['Hammer', 'Drill', 'Ruler'], 60],
  ['preventive-maintenance', 'ShieldCheck', ['CalendarCheck', 'ClipboardList', 'Gauge'], 120],
  ['property-maintenance', 'House', ['KeyRound', 'Wrench', 'Sparkles'], 240],
  ['move-in-move-out-inspection', 'ClipboardCheck', ['Search', 'KeyRound', 'Camera'], 330],
  ['emergency-maintenance', 'Siren', ['Clock', 'PhoneCall', 'TriangleAlert'], 10],
  ['building-maintenance', 'Building2', ['HardHat', 'Cog', 'Wrench'], 280],
];

const skyline = `
  <g opacity="0.22" fill="#0a3175">
    <rect x="60" y="560" width="90" height="240" rx="4"/><rect x="160" y="500" width="70" height="300" rx="4"/>
    <rect x="240" y="590" width="110" height="210" rx="4"/><rect x="860" y="470" width="80" height="330" rx="4"/>
    <rect x="950" y="540" width="120" height="260" rx="4"/><rect x="1080" y="600" width="80" height="200" rx="4"/>
  </g>`;

function illustration(slug, main, accents, hue) {
  const chips = accents
    .map((name, i) => {
      const positions = [
        [180, 170],
        [930, 150],
        [960, 520],
      ];
      const [x, y] = positions[i];
      return `<g transform="translate(${x} ${y})">
        <rect width="120" height="120" rx="30" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.18"/>
        <g transform="translate(30 30)">${icon(name, 60, i === 1 ? '#fdb924' : '#d9e3f5', 1.7)}</g>
      </g>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${slug.replace(/-/g, ' ')} illustration">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(${hue % 90 + 20})">
      <stop offset="0" stop-color="#02112f"/><stop offset="0.55" stop-color="#031c4a"/><stop offset="1" stop-color="#0a3175"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#f3a60c" stop-opacity="0.55"/><stop offset="1" stop-color="#f3a60c" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#153f8a"/><stop offset="1" stop-color="#04265f"/>
    </linearGradient>
    <linearGradient id="swoosh" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#f3a60c" stop-opacity="0"/><stop offset="0.5" stop-color="#fdb924"/><stop offset="1" stop-color="#f3a60c"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <rect width="1200" height="800" fill="url(#grid)"/>
  <circle cx="${600 + Math.round(Math.cos(hue) * 120)}" cy="360" r="360" fill="url(#glow)"/>
  ${skyline}
  <circle cx="600" cy="400" r="250" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2"/>
  <circle cx="600" cy="400" r="320" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="2" stroke-dasharray="6 14"/>
  <path d="M60 740 C 380 720, 760 650, 1110 470" fill="none" stroke="url(#swoosh)" stroke-width="14" stroke-linecap="round"/>
  <path d="M1124 462 l-52 -2 l26 42 z" fill="#f3a60c"/>
  <g transform="translate(430 210)">
    <rect width="340" height="340" rx="84" fill="url(#tile)" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2"/>
    <rect x="18" y="18" width="304" height="304" rx="70" fill="none" stroke="#f3a60c" stroke-opacity="0.35" stroke-width="2"/>
    <g transform="translate(70 70)">${icon(main, 200, '#ffffff', 1.4)}</g>
  </g>
  ${chips}
</svg>
`;
}

for (const [slug, main, accents, hue] of SERVICES) {
  writeFileSync(new URL(`${slug}.svg`, OUT), illustration(slug, main, accents, hue));
}
console.log(`Generated ${SERVICES.length} illustrations in public/images/services`);
