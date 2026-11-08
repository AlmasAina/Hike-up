/**
 * Generates the original, brand-consistent scene illustrations used as initial service imagery
 * (public/images/services/<slug>.svg). Everything is drawn here from basic shapes in the HIKE UP
 * palette, so there is no third-party artwork and nothing is hot-linked.
 *
 *   node scripts/generate-illustrations.mjs
 *
 * Replace them at any time by uploading real photos in Admin → Services.
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = new URL('../public/images/services/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const C = {
  navy950: '#020b20',
  navy900: '#031c4a',
  navy800: '#0a3175',
  navy600: '#1d4fa3',
  navy300: '#9fb6e0',
  gold: '#f3a60c',
  gold300: '#fdcf6a',
  wall: '#eef3fb',
  wall2: '#dfe8f6',
  floor: '#c9d6ea',
  white: '#ffffff',
  steel: '#b8c4d6',
  steelDark: '#7f8ea6',
  skin: '#c98b62',
  water: '#4fb3ff',
  red: '#e2483d',
  green: '#22a66e',
};

/** Shared defs: gradients, soft shadow filter. */
const defs = `
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.wall}"/><stop offset="1" stop-color="${C.wall2}"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.floor}"/><stop offset="1" stop-color="#b3c3dc"/>
    </linearGradient>
    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1b3d"/><stop offset="1" stop-color="#162c58"/>
    </linearGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7cc0f5"/><stop offset="0.7" stop-color="#cfe7fb"/><stop offset="1" stop-color="#f6e7c8"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8fc3ef"/><stop offset="0.5" stop-color="#3f79c4"/><stop offset="1" stop-color="#1d4fa3"/>
    </linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#d6deea"/><stop offset="0.5" stop-color="#f4f7fb"/><stop offset="1" stop-color="#b8c4d6"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.gold300}"/><stop offset="1" stop-color="${C.gold}"/>
    </linearGradient>
    <radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fff3c4" stop-opacity="0.95"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#031c4a" flood-opacity="0.22"/>
    </filter>
  </defs>`;

/** Indoor room: wall, skirting, floor, brand stripe. */
const room = (floorY = 600) => `
  <rect width="1200" height="800" fill="url(#wall)"/>
  <rect y="${floorY}" width="1200" height="${800 - floorY}" fill="url(#floor)"/>
  <rect y="${floorY - 14}" width="1200" height="14" fill="#d2dcec"/>
  <rect y="${floorY}" width="1200" height="4" fill="#a9b9d3"/>
  <ellipse cx="600" cy="${floorY + 120}" rx="520" ry="40" fill="#031c4a" opacity="0.05"/>`;

/** Gold brand accent stripe across the bottom. */
const brandBar = `<rect y="770" width="1200" height="30" fill="${C.navy900}"/><rect y="770" width="420" height="30" fill="${C.gold}"/>`;

const wrap = (slug, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${slug.replace(/-/g, ' ')} illustration">${defs}
${body}
${brandBar}
</svg>
`;

/** Gloved hand/arm coming in from an edge (sleeve in navy uniform). */
const arm = ({ x, y, angle = 0, length = 260, glove = C.white }) => `
  <g transform="translate(${x} ${y}) rotate(${angle})">
    <rect x="${-length}" y="-34" width="${length}" height="68" rx="30" fill="${C.navy800}"/>
    <rect x="-46" y="-36" width="22" height="72" rx="8" fill="${C.gold}"/>
    <rect x="-26" y="-38" width="74" height="76" rx="34" fill="${glove}" stroke="#cdd6e4" stroke-width="3"/>
  </g>`;

const toolbox = (x, y, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})" filter="url(#shadow)">
    <path d="M60 0 h80 a12 12 0 0 1 12 12 v18 h-18 v-12 h-68 v12 h-18 v-18 a12 12 0 0 1 12 -12z" fill="${C.navy900}"/>
    <rect x="0" y="28" width="200" height="110" rx="14" fill="${C.gold}"/>
    <rect x="0" y="62" width="200" height="12" fill="#d48f06"/>
    <rect x="86" y="54" width="28" height="28" rx="6" fill="${C.navy900}"/>
  </g>`;

const wrench = (x, y, angle = 0, s = 1, color = C.steelDark) => `
  <g transform="translate(${x} ${y}) rotate(${angle}) scale(${s})">
    <rect x="-8" y="0" width="16" height="150" rx="8" fill="${color}"/>
    <path d="M-26 -20 a30 30 0 1 0 52 0 l-14 0 l0 22 l-24 0 l0 -22z" fill="${color}"/>
  </g>`;

const clipboard = (x, y, s = 1, rows = 4) => {
  const lines = Array.from({ length: rows }, (_, i) => {
    const ly = 80 + i * 44;
    return `<rect x="34" y="${ly - 14}" width="26" height="26" rx="6" fill="none" stroke="${C.navy600}" stroke-width="4"/>
      <path d="M38 ${ly} l8 8 l14 -18" fill="none" stroke="${C.green}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="76" y="${ly - 6}" width="${110 - (i % 2) * 30}" height="12" rx="6" fill="#c3cfe2"/>`;
  }).join('');
  return `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#shadow)">
    <rect width="220" height="${110 + rows * 44}" rx="16" fill="${C.navy800}"/>
    <rect x="12" y="20" width="196" height="${80 + rows * 44}" rx="8" fill="${C.white}"/>
    <rect x="70" y="-12" width="80" height="34" rx="10" fill="${C.steelDark}"/>
    ${lines}
  </g>`;
};

const plant = (x, y, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M40 0 C 10 -60 -10 -90 10 -140 C 30 -90 50 -60 40 0z" fill="#2f8f63"/>
    <path d="M44 0 C 70 -50 100 -70 100 -120 C 70 -90 50 -60 44 0z" fill="#3aa877"/>
    <path d="M38 0 C 10 -30 -30 -40 -40 -80 C -10 -60 20 -40 38 0z" fill="#267a54"/>
    <path d="M0 0 h84 l-10 70 h-64z" fill="${C.navy900}"/>
  </g>`;

const window_ = (x, y, w, h) => `
  <g transform="translate(${x} ${y})">
    <rect width="${w}" height="${h}" rx="10" fill="#ffffff"/>
    <rect x="12" y="12" width="${w - 24}" height="${h - 24}" rx="4" fill="url(#sky)"/>
    <rect x="${w / 2 - 5}" y="12" width="10" height="${h - 24}" fill="#ffffff"/>
    <g opacity="0.45" fill="#7f9cc8">
      <rect x="30" y="${h - 110}" width="40" height="98"/><rect x="78" y="${h - 150}" width="34" height="138"/>
      <rect x="${w - 120}" y="${h - 130}" width="46" height="118"/><rect x="${w - 66}" y="${h - 90}" width="36" height="78"/>
    </g>
    <path d="M12 12 L${w / 2 - 5} 12 L12 ${h / 2}z" fill="#ffffff" opacity="0.25"/>
  </g>`;

// ---------------------------------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------------------------------

function electrical() {
  const breakers = [];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 9; i++) {
      const on = (row * 9 + i) % 4 !== 1;
      breakers.push(`<g transform="translate(${48 + i * 44} ${92 + row * 120})">
        <rect width="34" height="78" rx="5" fill="#f4f7fb" stroke="#c4cfdf" stroke-width="2"/>
        <rect x="9" y="${on ? 14 : 38}" width="16" height="26" rx="3" fill="${on ? C.navy800 : C.steelDark}"/>
        <circle cx="17" cy="66" r="4" fill="${on ? C.green : C.red}"/>
      </g>`);
    }
  }
  const wires = ['#e2483d', '#1d4fa3', '#f3a60c', '#22a66e', '#2b2b2b']
    .map((c, i) => `<path d="M${120 + i * 70} 470 C ${120 + i * 70} 560, ${60 + i * 50} 600, ${40 + i * 40} 720" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`)
    .join('');
  return wrap(
    'electrical-services',
    `${room(640)}
  <circle cx="1010" cy="120" r="150" fill="url(#lamp)"/>
  <line x1="1010" y1="0" x2="1010" y2="70" stroke="${C.navy900}" stroke-width="5"/>
  <path d="M985 70 h50 l-6 30 h-38z" fill="${C.navy900}"/>
  <circle cx="1010" cy="128" r="32" fill="#fff6cf" stroke="#f3d27a" stroke-width="4"/>
  <g transform="translate(250 90)" filter="url(#shadow)">
    <rect width="500" height="470" rx="18" fill="${C.steel}"/>
    <rect x="18" y="18" width="464" height="434" rx="10" fill="#e6ecf5"/>
    <rect x="34" y="70" width="432" height="2" fill="#c4cfdf"/><rect x="34" y="190" width="432" height="2" fill="#c4cfdf"/>
    <rect x="34" y="310" width="432" height="2" fill="#c4cfdf"/>
    <rect x="40" y="32" width="150" height="26" rx="6" fill="${C.navy900}"/>
    <path d="M440 30 l-14 24 h12 l-8 20 l22 -28 h-12 l8 -16z" fill="${C.gold}"/>
    ${breakers.join('')}
  </g>
  ${wires}
  <g transform="translate(760 330) rotate(-12)" filter="url(#shadow)">
    <rect width="190" height="300" rx="28" fill="url(#goldGrad)"/>
    <rect x="22" y="24" width="146" height="92" rx="10" fill="#1a2a3f"/>
    <text x="95" y="90" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="#9ef0c6" text-anchor="middle">230V</text>
    <circle cx="95" cy="190" r="52" fill="${C.navy900}"/><circle cx="95" cy="190" r="36" fill="#25375a"/>
    <rect x="89" y="146" width="12" height="40" rx="5" fill="${C.gold300}"/>
    <circle cx="60" cy="266" r="12" fill="${C.red}"/><circle cx="130" cy="266" r="12" fill="#1b1b1b"/>
  </g>
  <path d="M797 610 C 760 680, 700 650, 640 600 L 560 520" fill="none" stroke="${C.red}" stroke-width="8" stroke-linecap="round"/>
  <path d="M870 618 C 900 700, 980 690, 1000 600 L 980 480" fill="none" stroke="#1b1b1b" stroke-width="8" stroke-linecap="round"/>
  <path d="M556 516 l-40 -40" stroke="${C.steelDark}" stroke-width="10" stroke-linecap="round"/>
  ${arm({ x: 1010, y: 600, angle: -150, length: 300 })}`,
  );
}

function plumbing() {
  return wrap(
    'plumbing-services',
    `${room(640)}
  <rect x="140" y="80" width="920" height="200" rx="6" fill="#f7f9fd"/>
  ${Array.from({ length: 6 }, (_, i) => `<rect x="${140 + i * 153}" y="80" width="2" height="200" fill="#dbe3f0"/>`).join('')}
  <rect x="140" y="178" width="920" height="2" fill="#dbe3f0"/>
  <rect x="120" y="280" width="960" height="34" rx="6" fill="#2b3d5e"/>
  <g transform="translate(130 314)" filter="url(#shadow)">
    <rect width="940" height="300" rx="8" fill="${C.white}"/>
    <rect x="20" y="20" width="270" height="260" rx="6" fill="#f2f5fa" stroke="#dce4f0" stroke-width="3"/>
    <rect x="650" y="20" width="270" height="260" rx="6" fill="#f2f5fa" stroke="#dce4f0" stroke-width="3"/>
    <rect x="310" y="20" width="320" height="260" rx="6" fill="#1b2a47"/>
    <rect x="260" y="130" width="12" height="60" rx="6" fill="${C.steelDark}"/><rect x="668" y="130" width="12" height="60" rx="6" fill="${C.steelDark}"/>
  </g>
  <path d="M470 300 v80 a50 50 0 0 0 100 0 v-10" fill="none" stroke="url(#metal)" stroke-width="30"/>
  <path d="M570 370 h120 v220" fill="none" stroke="url(#metal)" stroke-width="30"/>
  <rect x="452" y="370" width="36" height="22" rx="4" fill="${C.steelDark}"/>
  <rect x="552" y="358" width="36" height="22" rx="4" fill="${C.steelDark}"/>
  <path d="M520 250 h170 a20 20 0 0 1 20 20 v14 h-210 v-14 a20 20 0 0 1 20 -20z" fill="#cfd8e6"/>
  <path d="M640 250 v-110 a40 40 0 0 0 -80 0 v20" fill="none" stroke="url(#metal)" stroke-width="18" stroke-linecap="round"/>
  <path d="M560 166 q-6 24 0 40 q6 -16 0 -40z" fill="${C.water}"/>
  <g fill="${C.water}">
    <path d="M520 470 q-12 22 0 34 q12 -12 0 -34z"/><path d="M548 500 q-10 18 0 28 q10 -10 0 -28z"/>
  </g>
  <ellipse cx="530" cy="606" rx="70" ry="10" fill="${C.water}" opacity="0.45"/>
  <g transform="rotate(-38 600 520)">${wrench(600, 440, 0, 1.15, '#d14b3d')}</g>
  ${arm({ x: 880, y: 470, angle: 200, length: 330 })}
  ${toolbox(840, 610, 0.95)}
  ${plant(70, 640, 0.9)}`,
  );
}

function ac() {
  const flow = [0, 1, 2]
    .map((i) => `<path d="M${380 + i * 150} 330 c 20 40, -20 70, 0 110 s -20 70, 0 110" fill="none" stroke="#8ccaf7" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 16" opacity="0.9"/>`)
    .join('');
  const flake = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="#5fb4f2" stroke-width="5" stroke-linecap="round">
    <line x1="0" y1="-24" x2="0" y2="24"/><line x1="-21" y1="-12" x2="21" y2="12"/><line x1="-21" y1="12" x2="21" y2="-12"/></g>`;
  return wrap(
    'ac-hvac-services',
    `${room(650)}
  ${window_(870, 150, 250, 330)}
  <g transform="translate(250 130)" filter="url(#shadow)">
    <rect width="560" height="190" rx="40" fill="${C.white}"/>
    <rect x="0" y="120" width="560" height="70" rx="0" fill="#f1f4f9"/>
    <path d="M0 150 h560 v0 a40 40 0 0 1 -40 40 h-480 a40 40 0 0 1 -40 -40z" fill="#e3e9f2"/>
    <rect x="40" y="160" width="480" height="8" rx="4" fill="#c3cede"/>
    <circle cx="500" cy="60" r="8" fill="${C.green}"/>
    <rect x="40" y="44" width="150" height="10" rx="5" fill="#d7dfeb"/>
    <rect x="420" y="88" width="90" height="34" rx="8" fill="#1a2a3f"/>
    <text x="465" y="114" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#8ccaf7" text-anchor="middle">22°</text>
  </g>
  ${flow}
  ${flake(330, 470, 1.1)}${flake(700, 520, 0.9)}${flake(560, 600, 0.7)}
  <g transform="translate(120 330)" filter="url(#shadow)">
    <rect width="90" height="130" rx="14" fill="${C.white}"/>
    <circle cx="45" cy="52" r="30" fill="none" stroke="${C.navy600}" stroke-width="8"/>
    <text x="45" y="62" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="${C.navy900}" text-anchor="middle">22</text>
    <rect x="22" y="98" width="46" height="10" rx="5" fill="${C.gold}"/>
  </g>
  <g transform="translate(860 330)">
    <path d="M40 0 L0 330 M150 0 L190 330" stroke="${C.gold}" stroke-width="18" stroke-linecap="round"/>
    ${[70, 150, 230].map((y) => `<line x1="${36 - y * 0.12}" y1="${y}" x2="${154 + y * 0.12}" y2="${y}" stroke="${C.gold}" stroke-width="14" stroke-linecap="round"/>`).join('')}
    <rect x="30" y="-16" width="130" height="24" rx="8" fill="#d48f06"/>
  </g>
  ${arm({ x: 760, y: 300, angle: 160, length: 220 })}
  ${toolbox(640, 640, 0.8)}`,
  );
}

function painting() {
  return wrap(
    'painting-services',
    `${room(650)}
  <rect x="0" y="0" width="560" height="636" fill="#f6efe1"/>
  <path d="M560 0 C 590 120, 540 240, 580 360 C 610 460, 560 560, 590 636 L560 636 L560 0z" fill="#f6efe1"/>
  <rect x="0" y="0" width="1200" height="40" fill="${C.white}"/>
  <path d="M0 650 h1200 v120 h-1200z" fill="#e8edf5"/>
  <path d="M40 660 C 300 640, 700 690, 1160 655 L1180 770 L20 770z" fill="#f4f6fa"/>
  <g transform="translate(470 120) rotate(14)" filter="url(#shadow)">
    <rect x="-20" y="0" width="230" height="86" rx="40" fill="#f2e6cf"/>
    <rect x="-20" y="0" width="230" height="86" rx="40" fill="none" stroke="#e1cfa9" stroke-width="4"/>
    <path d="M95 86 v40 h-60 v40" fill="none" stroke="${C.steelDark}" stroke-width="12" stroke-linejoin="round"/>
    <rect x="22" y="166" width="26" height="380" rx="12" fill="${C.navy900}"/>
    <rect x="18" y="166" width="34" height="80" rx="14" fill="${C.gold}"/>
  </g>
  <path d="M600 150 c-10 30 6 40 0 60" stroke="#f2e6cf" stroke-width="10" stroke-linecap="round" fill="none"/>
  ${arm({ x: 405, y: 520, angle: -100, length: 300 })}
  <g transform="translate(760 560)" filter="url(#shadow)">
    <path d="M0 0 h220 l-20 120 h-180z" fill="${C.navy800}"/>
    <ellipse cx="110" cy="0" rx="110" ry="22" fill="${C.navy900}"/>
    <ellipse cx="110" cy="2" rx="96" ry="16" fill="#f2e6cf"/>
    <path d="M40 0 c0 30 10 40 0 60" stroke="#f2e6cf" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M10 -6 C 40 -90, 180 -90, 210 -6" fill="none" stroke="${C.steelDark}" stroke-width="6"/>
    <rect x="70" y="50" width="80" height="34" rx="6" fill="${C.gold}"/>
  </g>
  <g transform="translate(220 640)" filter="url(#shadow)">
    <path d="M0 0 l220 0 l40 50 l-300 0z" fill="#cfd8e6"/>
    <path d="M30 10 l170 0 l26 32 l-226 0z" fill="#f2e6cf"/>
  </g>
  <g transform="translate(1000 330) rotate(25)">
    <rect width="22" height="170" rx="10" fill="#8b5a2b"/><rect x="-6" y="168" width="34" height="40" rx="4" fill="${C.steelDark}"/>
    <path d="M-8 206 h38 l-6 50 h-26z" fill="#f2e6cf"/>
  </g>
  <rect x="720" y="70" width="130" height="130" rx="16" fill="#f2e6cf" stroke="#e1cfa9" stroke-width="4"/>
  <rect x="870" y="70" width="130" height="130" rx="16" fill="#cfe0f2" stroke="#b5cbe6" stroke-width="4"/>
  <rect x="1020" y="70" width="130" height="130" rx="16" fill="#e7d3c1" stroke="#d5bca6" stroke-width="4"/>`,
  );
}

function handyman() {
  const peg = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 15; c++) peg.push(`<circle cx="${40 + c * 40}" cy="${40 + r * 40}" r="4" fill="#c09a6b"/>`);
  return wrap(
    'handyman-services',
    `${room(640)}
  <g transform="translate(160 70)" filter="url(#shadow)">
    <rect width="640" height="320" rx="12" fill="#d8b384"/>
    ${peg.join('')}
    <g transform="translate(60 60)"><rect x="40" y="0" width="22" height="200" rx="8" fill="#8b5a2b"/><path d="M0 0 h100 a20 20 0 0 1 0 40 h-30 v-12 h-70z" fill="${C.steelDark}"/></g>
    <g transform="translate(220 50)"><rect x="0" y="0" width="26" height="150" rx="12" fill="${C.gold}"/><rect x="9" y="150" width="8" height="90" rx="3" fill="${C.steel}"/></g>
    <g transform="translate(300 50)"><rect x="0" y="0" width="26" height="150" rx="12" fill="${C.red}"/><rect x="9" y="150" width="8" height="70" rx="3" fill="${C.steel}"/></g>
    ${wrench(420, 80, 0, 1, C.steelDark)}
    <g transform="translate(480 70)"><path d="M0 0 h110 v40 h-60 v140 h-30 v-140 h-20z" fill="${C.navy800}"/><rect x="100" y="12" width="40" height="16" rx="6" fill="${C.steel}"/><rect x="18" y="150" width="34" height="50" rx="8" fill="${C.gold}"/></g>
  </g>
  <g transform="translate(880 210)" filter="url(#shadow)">
    <rect width="230" height="16" rx="4" fill="#8b5a2b"/>
    <path d="M20 16 v60 l40 -60z M210 16 v60 l-40 -60z" fill="${C.steelDark}"/>
    <rect x="20" y="-90" width="40" height="90" rx="4" fill="${C.navy600}"/><rect x="66" y="-70" width="36" height="70" rx="4" fill="${C.gold}"/>
    <rect x="108" y="-100" width="30" height="100" rx="4" fill="${C.navy900}"/>
    <path d="M150 0 c0 -50 60 -50 60 0z" fill="#3aa877"/>
  </g>
  <g transform="translate(160 440)" filter="url(#shadow)">
    <rect width="760" height="40" rx="6" fill="#a8743f"/>
    <rect x="30" y="40" width="30" height="160" fill="#8b5a2b"/><rect x="700" y="40" width="30" height="160" fill="#8b5a2b"/>
    <rect x="30" y="140" width="700" height="18" fill="#8b5a2b"/>
  </g>
  <g transform="translate(560 410)"><rect width="200" height="30" rx="4" fill="#e7c89a"/><rect x="0" y="0" width="200" height="6" fill="#d7b27c"/></g>
  ${arm({ x: 820, y: 400, angle: 190, length: 260 })}
  ${toolbox(900, 600, 0.95)}`,
  );
}

function preventive() {
  return wrap(
    'preventive-maintenance',
    `${room(640)}
  ${window_(80, 110, 300, 360)}
  <g transform="translate(470 330)" filter="url(#shadow)">
    <rect width="360" height="300" rx="18" fill="#e9eef6"/>
    <rect x="16" y="16" width="230" height="268" rx="10" fill="#d6dfec"/>
    ${Array.from({ length: 11 }, (_, i) => `<rect x="28" y="${30 + i * 23}" width="206" height="8" rx="4" fill="#b8c5d9"/>`).join('')}
    <circle cx="300" cy="150" r="48" fill="#cfd9e8" stroke="${C.steelDark}" stroke-width="6"/>
    <g fill="${C.navy600}" opacity="0.85">
      ${[0, 90, 180, 270].map((a) => `<path d="M300 150 C 290 120, 318 106, 330 120 C 322 132, 312 140, 300 150z" transform="rotate(${a} 300 150)"/>`).join('')}
    </g>
    <circle cx="300" cy="150" r="9" fill="${C.navy900}"/>
    <circle cx="300" cy="150" r="30" fill="none" stroke="${C.steelDark}" stroke-width="3" opacity="0.6"/>
    <rect x="20" y="300" width="40" height="20" fill="${C.steelDark}"/><rect x="300" y="300" width="40" height="20" fill="${C.steelDark}"/>
  </g>
  <g transform="translate(470 120)" filter="url(#shadow)">
    <rect width="230" height="180" rx="16" fill="${C.white}"/>
    <rect width="230" height="48" rx="16" fill="${C.navy900}"/><rect y="30" width="230" height="18" fill="${C.navy900}"/>
    <rect x="50" y="-14" width="14" height="34" rx="6" fill="${C.steelDark}"/><rect x="166" y="-14" width="14" height="34" rx="6" fill="${C.steelDark}"/>
    ${Array.from({ length: 12 }, (_, i) => {
      const cx = 30 + (i % 4) * 56;
      const cy = 76 + Math.floor(i / 4) * 36;
      return i === 6
        ? `<circle cx="${cx}" cy="${cy}" r="15" fill="${C.gold}"/><path d="M${cx - 7} ${cy} l5 6 l10 -12" stroke="${C.navy900}" stroke-width="4" fill="none" stroke-linecap="round"/>`
        : `<rect x="${cx - 12}" y="${cy - 8}" width="24" height="16" rx="4" fill="#dbe3f0"/>`;
    }).join('')}
  </g>
  ${clipboard(880, 150, 1.05, 5)}
  <g transform="translate(760 220)" filter="url(#shadow)">
    <circle r="64" fill="${C.white}" stroke="${C.navy800}" stroke-width="10"/>
    <path d="M-44 20 A 48 48 0 0 1 44 20" fill="none" stroke="#dbe3f0" stroke-width="12"/>
    <path d="M-44 20 A 48 48 0 0 1 20 -40" fill="none" stroke="${C.green}" stroke-width="12"/>
    <line x1="0" y1="10" x2="26" y2="-28" stroke="${C.navy900}" stroke-width="8" stroke-linecap="round"/>
    <circle cy="10" r="9" fill="${C.navy900}"/>
  </g>
  ${arm({ x: 1120, y: 520, angle: -140, length: 240 })}
  ${toolbox(220, 600, 0.9)}`,
  );
}

function property() {
  return wrap(
    'property-maintenance',
    `<rect width="1200" height="800" fill="url(#sky)"/>
  <circle cx="1040" cy="130" r="70" fill="#ffe8a3"/><circle cx="1040" cy="130" r="120" fill="#ffe8a3" opacity="0.25"/>
  <g fill="#ffffff" opacity="0.85"><ellipse cx="220" cy="120" rx="90" ry="26"/><ellipse cx="290" cy="104" rx="60" ry="24"/><ellipse cx="760" cy="90" rx="80" ry="22"/></g>
  <g opacity="0.35" fill="#7f9cc8">
    <rect x="40" y="360" width="70" height="220"/><rect x="120" y="300" width="60" height="280"/><rect x="1080" y="330" width="80" height="250"/>
  </g>
  <rect y="580" width="1200" height="190" fill="#e9dcc0"/>
  <rect y="580" width="1200" height="20" fill="#d9c8a4"/>
  <g transform="translate(260 250)" filter="url(#shadow)">
    <rect x="0" y="80" width="420" height="270" fill="#f7f3ea"/>
    <rect x="300" y="0" width="360" height="350" fill="#fbf8f2"/>
    <rect x="-20" y="64" width="460" height="24" fill="${C.navy900}"/>
    <rect x="280" y="-16" width="400" height="24" fill="${C.navy900}"/>
    <rect x="40" y="130" width="200" height="130" rx="4" fill="url(#glass)"/>
    <rect x="138" y="130" width="6" height="130" fill="#f7f3ea"/>
    <rect x="350" y="50" width="250" height="110" rx="4" fill="url(#glass)"/>
    <rect x="350" y="200" width="110" height="150" rx="4" fill="${C.navy800}"/>
    <circle cx="444" cy="280" r="6" fill="${C.gold}"/>
    <rect x="490" y="200" width="110" height="110" rx="4" fill="url(#glass)"/>
    <rect x="300" y="160" width="360" height="8" fill="${C.gold}"/>
    <rect x="0" y="330" width="660" height="20" fill="#d9cdb6"/>
  </g>
  <g transform="translate(120 330)">
    <path d="M40 260 C 30 180, 50 90, 44 0" stroke="#8b6a43" stroke-width="18" fill="none" stroke-linecap="round"/>
    ${[-70, -30, 10, 50, 90, 140].map((a) => `<path d="M44 0 q ${Math.cos((a * Math.PI) / 180) * 70} ${Math.sin((a * Math.PI) / 180) * 30 - 30} ${Math.cos((a * Math.PI) / 180) * 130} ${Math.sin((a * Math.PI) / 180) * 70 + 10}" stroke="#2f8f63" stroke-width="16" fill="none" stroke-linecap="round"/>`).join('')}
  </g>
  <g transform="translate(760 520)" filter="url(#shadow)">
    <path d="M0 40 h250 l60 50 v80 h-310z" fill="${C.white}"/>
    <path d="M250 40 l50 44 h-50z" fill="url(#glass)"/>
    <rect x="0" y="110" width="310" height="22" fill="${C.navy900}"/>
    <rect x="0" y="118" width="140" height="8" fill="${C.gold}"/>
    <circle cx="70" cy="172" r="30" fill="#1b1b1b"/><circle cx="70" cy="172" r="12" fill="${C.steel}"/>
    <circle cx="250" cy="172" r="30" fill="#1b1b1b"/><circle cx="250" cy="172" r="12" fill="${C.steel}"/>
    <rect x="20" y="56" width="90" height="40" rx="6" fill="url(#glass)"/>
  </g>
  <g transform="translate(1110 600)"><path d="M0 120 l30 -120 l30 120z" fill="${C.gold}"/><rect x="6" y="44" width="48" height="12" fill="${C.white}"/><rect x="-6" y="118" width="72" height="12" rx="4" fill="${C.navy900}"/></g>`,
  );
}

function moveInOut() {
  return wrap(
    'move-in-move-out-inspection',
    `${room(620)}
  ${window_(700, 90, 380, 400)}
  <g transform="translate(160 120)">
    <rect width="250" height="500" rx="6" fill="#d9c2a0"/>
    <rect x="18" y="18" width="214" height="482" rx="4" fill="#e9d6b8"/>
    <rect x="36" y="40" width="178" height="190" rx="4" fill="none" stroke="#d1b78f" stroke-width="5"/>
    <rect x="36" y="260" width="178" height="210" rx="4" fill="none" stroke="#d1b78f" stroke-width="5"/>
    <circle cx="200" cy="260" r="12" fill="${C.gold}"/>
  </g>
  <rect x="460" y="150" width="56" height="80" rx="8" fill="#ffffff" stroke="#cfd8e6" stroke-width="4"/>
  <rect x="478" y="170" width="20" height="36" rx="6" fill="#dbe3f0"/>
  <g transform="translate(470 470)" filter="url(#shadow)">
    <path d="M0 40 l90 -40 l90 40 v120 l-90 30 l-90 -30z" fill="#d8b384"/>
    <path d="M0 40 l90 30 l90 -30" fill="none" stroke="#b98f5c" stroke-width="5"/><path d="M90 70 v120" stroke="#b98f5c" stroke-width="5"/>
    <rect x="70" y="40" width="40" height="30" fill="#efe1c7" transform="skewY(18)"/>
  </g>
  <g transform="translate(600 530)" filter="url(#shadow)">
    <path d="M0 30 l70 -30 l70 30 v90 l-70 24 l-70 -24z" fill="#cfa776"/>
    <path d="M0 30 l70 24 l70 -24" fill="none" stroke="#b98f5c" stroke-width="5"/><path d="M70 54 v90" stroke="#b98f5c" stroke-width="5"/>
  </g>
  ${clipboard(860, 380, 0.95, 4)}
  <g transform="translate(1110 190) rotate(30)" filter="url(#shadow)">
    <circle r="62" fill="#ffffff" fill-opacity="0.35" stroke="${C.navy900}" stroke-width="16"/>
    <rect x="-12" y="62" width="24" height="120" rx="10" fill="${C.navy900}"/><rect x="-14" y="120" width="28" height="60" rx="10" fill="${C.gold}"/>
  </g>
  <g transform="translate(330 660) rotate(-15)">
    <circle r="30" fill="none" stroke="${C.gold}" stroke-width="10"/>
    <rect x="26" y="-8" width="110" height="16" rx="6" fill="${C.gold}"/><rect x="104" y="6" width="12" height="22" fill="${C.gold}"/><rect x="124" y="6" width="12" height="16" fill="${C.gold}"/>
  </g>`,
  );
}

function emergency() {
  return wrap(
    'emergency-maintenance',
    `<rect width="1200" height="800" fill="url(#night)"/>
  <rect y="600" width="1200" height="170" fill="#22385f"/>
  <rect y="590" width="1200" height="12" fill="#2d4776"/>
  <g opacity="0.5">${Array.from({ length: 5 }, (_, i) => `<rect x="${60 + i * 240}" y="140" width="120" height="300" rx="6" fill="#1a2f57"/>`).join('')}</g>
  <path d="M0 210 h1200" stroke="#56719f" stroke-width="40"/>
  <path d="M0 210 h1200" stroke="#7b93bd" stroke-width="10" opacity="0.6"/>
  <rect x="520" y="180" width="80" height="60" rx="8" fill="#41598a"/>
  <path d="M560 240 C 520 320, 470 380, 430 470 M560 240 C 600 330, 650 380, 690 470 M560 240 C 560 340, 552 420, 556 520" stroke="${C.water}" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.85"/>
  <g fill="${C.water}" opacity="0.9">
    ${[[470, 300], [640, 320], [500, 420], [620, 430], [580, 360], [450, 500], [690, 520]].map(([x, y]) => `<path d="M${x} ${y} q-10 18 0 28 q10 -10 0 -28z"/>`).join('')}
  </g>
  <ellipse cx="560" cy="640" rx="300" ry="30" fill="${C.water}" opacity="0.35"/>
  <g transform="translate(150 520)" filter="url(#shadow)">
    <path d="M90 0 L180 160 H0z" fill="${C.gold}" stroke="${C.navy950}" stroke-width="8" stroke-linejoin="round"/>
    <rect x="82" y="50" width="16" height="60" rx="6" fill="${C.navy950}"/><circle cx="90" cy="132" r="10" fill="${C.navy950}"/>
  </g>
  <g transform="translate(960 400)" filter="url(#shadow)">
    <circle r="80" fill="${C.white}"/><circle r="80" fill="none" stroke="${C.red}" stroke-width="12"/>
    <line x1="0" y1="0" x2="0" y2="-50" stroke="${C.navy900}" stroke-width="10" stroke-linecap="round"/>
    <line x1="0" y1="0" x2="36" y2="18" stroke="${C.navy900}" stroke-width="10" stroke-linecap="round"/>
    <circle r="10" fill="${C.navy900}"/>
  </g>
  <g transform="translate(1000 80)">
    <path d="M0 80 a60 60 0 0 1 120 0z" fill="${C.red}"/><rect x="-14" y="80" width="148" height="24" rx="6" fill="#9c2a22"/>
    <circle cx="60" cy="60" r="90" fill="${C.red}" opacity="0.15"/>
  </g>
  ${toolbox(880, 610, 0.95)}`,
  );
}

function building() {
  const panes = [];
  for (let r = 0; r < 12; r++) for (let c = 0; c < 6; c++) panes.push(`<rect x="${20 + c * 50}" y="${30 + r * 46}" width="40" height="36" rx="3" fill="url(#glass)" opacity="${0.75 + ((r + c) % 3) * 0.08}"/>`);
  return wrap(
    'building-maintenance',
    `<rect width="1200" height="800" fill="url(#sky)"/>
  <g opacity="0.4" fill="#7f9cc8">
    <rect x="40" y="380" width="90" height="390"/><rect x="140" y="300" width="70" height="470"/><rect x="900" y="340" width="90" height="430"/><rect x="1000" y="260" width="70" height="510"/><rect x="1080" y="400" width="100" height="370"/>
  </g>
  <g transform="translate(430 120)" filter="url(#shadow)">
    <path d="M0 40 L170 0 L340 40 V650 H0z" fill="#e9eef6"/>
    ${panes.join('')}
    <rect x="0" y="600" width="340" height="50" fill="${C.navy900}"/>
    <rect x="130" y="610" width="80" height="40" fill="url(#glass)"/>
    <rect x="0" y="40" width="340" height="10" fill="${C.gold}"/>
  </g>
  <g>
    <line x1="560" y1="160" x2="560" y2="330" stroke="${C.navy900}" stroke-width="4"/>
    <line x1="700" y1="160" x2="700" y2="330" stroke="${C.navy900}" stroke-width="4"/>
    <rect x="540" y="330" width="180" height="40" rx="6" fill="${C.gold}"/>
    <rect x="540" y="300" width="180" height="10" fill="${C.navy900}"/>
    <rect x="590" y="270" width="26" height="40" rx="10" fill="${C.navy800}"/><circle cx="603" cy="262" r="14" fill="${C.skin}"/><path d="M587 258 a16 16 0 0 1 32 0z" fill="${C.gold}"/>
  </g>
  <rect y="760" width="1200" height="10" fill="#c7b48f"/>
  <g transform="translate(200 610)" filter="url(#shadow)">
    <path d="M0 80 a90 80 0 0 1 180 0z" fill="${C.gold}"/>
    <rect x="-20" y="76" width="220" height="22" rx="10" fill="#d48f06"/>
    <rect x="80" y="4" width="20" height="74" rx="8" fill="#ffd675"/>
  </g>
  ${toolbox(920, 610, 1)}`,
  );
}

const SCENES = {
  'electrical-services': electrical,
  'plumbing-services': plumbing,
  'ac-hvac-services': ac,
  'painting-services': painting,
  'handyman-services': handyman,
  'preventive-maintenance': preventive,
  'property-maintenance': property,
  'move-in-move-out-inspection': moveInOut,
  'emergency-maintenance': emergency,
  'building-maintenance': building,
};

for (const [slug, scene] of Object.entries(SCENES)) {
  writeFileSync(new URL(`${slug}.svg`, OUT), scene());
}
console.log(`Generated ${Object.keys(SCENES).length} illustrations in public/images/services`);
