import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createDeck, COLORS, COLOR_DISPLAY, CARD_TYPES, ACTION_TYPES, PROPERTY_SETS } from '../src/game/constants.js';

// Ensure output directory exists
const CARDS_DIR = path.resolve('public/images/cards/generated');
fs.mkdirSync(CARDS_DIR, { recursive: true });

const CACHE_DIR = path.resolve('.font-cache');
const FONT_CACHE_PATH = path.join(CACHE_DIR, 'outfit.base64');

async function getBase64Font() {
  if (fs.existsSync(FONT_CACHE_PATH)) return fs.readFileSync(FONT_CACHE_PATH, 'utf8');
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  try {
    const cssRes = await fetch('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900');
    const cssText = await cssRes.text();
    const match = cssText.match(/url\(([^)]+)\)/);
    if (!match) throw new Error('Could not parse font URL from CSS');
    const fontRes = await fetch(match[1]);
    const buffer = Buffer.from(await fontRes.arrayBuffer());
    const base64 = buffer.toString('base64');
    fs.writeFileSync(FONT_CACHE_PATH, base64);
    return base64;
  } catch (err) {
    console.error('Failed to download font:', err);
    return '';
  }
}

// Reuse the existing landmarks
const LANDMARK_PATHS = {
  indore: `
    <ellipse cx="16" cy="20" rx="11" ry="6" stroke="currentColor" stroke-width="2"/>
    <path d="M8 20 Q10 14 16 13 Q22 14 24 20" stroke="currentColor" stroke-width="2"/>
    <circle cx="16" cy="12" r="2.5" stroke="currentColor" stroke-width="2"/>
    <path d="M13 9 Q16 6 19 9" stroke="currentColor" stroke-width="1.5"/>
  `,
  lucknow: `
    <path d="M5 26 L5 14 Q5 8 16 8 Q27 8 27 14 L27 26" stroke="currentColor" stroke-width="2"/>
    <path d="M11 26 L11 18 Q11 15 16 15 Q21 15 21 18 L21 26" stroke="currentColor" stroke-width="2"/>
    <path d="M16 8 L16 4" stroke="currentColor" stroke-width="2"/>
    <circle cx="16" cy="3.5" r="1.5" fill="currentColor"/>
    <path d="M5 26 L27 26" stroke="currentColor" stroke-width="2"/>
  `,
  chandigarh: `
    <path d="M16 4 L20 10 L26 10 L21 14 L23 21 L16 17 L9 21 L11 14 L6 10 L12 10 Z" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <line x1="16" y1="21" x2="16" y2="28" stroke="currentColor" stroke-width="2"/>
    <line x1="10" y1="28" x2="22" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  bhopal: `
    <path d="M4 22 Q8 14 16 14 Q24 14 28 22" stroke="currentColor" stroke-width="2.2" fill="none"/>
    <path d="M4 26 Q8 18 16 18 Q24 18 28 26" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M4 22 Q8 30 16 30 Q24 30 28 22" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <circle cx="16" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
  `,
  kochi: `
    <path d="M4 8 L28 8" stroke="currentColor" stroke-width="2"/>
    <path d="M4 8 L16 24 L28 8" stroke="currentColor" stroke-width="2"/>
    <path d="M10 8 L16 18 L22 8" stroke="currentColor" stroke-width="1.5"/>
    <path d="M16 24 L16 28" stroke="currentColor" stroke-width="2"/>
    <line x1="8" y1="28" x2="24" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  jaipur: `
    <rect x="4" y="16" width="24" height="12" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <path d="M5 16 Q7 10 9 16" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M9 16 Q11 10 13 16" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M13 16 Q15 10 17 16" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M17 16 Q19 10 21 16" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M21 16 Q23 10 25 16" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M9 12 Q11 7 13 12" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M19 12 Q21 7 23 12" stroke="currentColor" stroke-width="1.5" fill="none"/>
  `,
  ahmedabad: `
    <path d="M16 4 L26 16 L16 28 L6 16 Z" stroke="currentColor" stroke-width="2"/>
    <line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" stroke-width="1.2"/>
    <line x1="6" y1="16" x2="26" y2="16" stroke="currentColor" stroke-width="1.2"/>
    <path d="M16 28 Q18 31 20 33" stroke="currentColor" stroke-width="1.5"/>
  `,
  kolkata: `
    <path d="M4 22 Q16 6 28 22" stroke="currentColor" stroke-width="2.5" fill="none"/>
    <line x1="4" y1="22" x2="28" y2="22" stroke="currentColor" stroke-width="2"/>
    <line x1="9" y1="22" x2="12" y2="14" stroke="currentColor" stroke-width="1.3"/>
    <line x1="16" y1="22" x2="16" y2="10" stroke="currentColor" stroke-width="1.3"/>
    <line x1="23" y1="22" x2="20" y2="14" stroke="currentColor" stroke-width="1.3"/>
    <line x1="4" y1="22" x2="4" y2="27" stroke="currentColor" stroke-width="2"/>
    <line x1="28" y1="22" x2="28" y2="27" stroke="currentColor" stroke-width="2"/>
    <line x1="2" y1="27" x2="30" y2="27" stroke="currentColor" stroke-width="2"/>
  `,
  chennai: `
    <rect x="13" y="22" width="6" height="6" stroke="currentColor" stroke-width="1.8"/>
    <path d="M11 22 L13 16 L19 16 L21 22 Z" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M13 16 L14 11 L18 11 L19 16 Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M14 11 L15 7 L17 7 L18 11 Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <line x1="16" y1="7" x2="16" y2="4" stroke="currentColor" stroke-width="1.8"/>
  `,
  hyderabad: `
    <rect x="10" y="14" width="12" height="14" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M13 28 L13 14 L13 10 Q13 7 11 7 Q9 7 9 10 L9 14" stroke="currentColor" stroke-width="1.5"/>
    <path d="M19 28 L19 14 L19 10 Q19 7 21 7 Q23 7 23 10 L23 14" stroke="currentColor" stroke-width="1.5"/>
    <line x1="9" y1="14" x2="23" y2="14" stroke="currentColor" stroke-width="1.8"/>
    <path d="M12 28 Q16 22 20 28" stroke="currentColor" stroke-width="1.5" fill="none"/>
  `,
  noida: `
    <rect x="4"  y="16" width="5" height="12" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <rect x="10" y="10" width="5" height="18" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <rect x="17" y="13" width="5" height="15" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <rect x="23" y="18" width="5" height="10" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <line x1="2" y1="28" x2="30" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  pune: `
    <path d="M4 28 L4 14 L8 14 L8 10 L12 10 L12 14 L16 14 L16 10 L20 10 L20 14 L24 14 L24 10 L28 10 L28 14 L28 28 Z" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" stroke-width="2"/>
    <rect x="13" y="20" width="6" height="8" stroke="currentColor" stroke-width="1.5"/>
  `,
  bengaluru: `
    <path d="M16 28 Q6 20 6 12 Q6 4 16 4 Q26 4 26 12 Q26 20 16 28 Z" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M16 4 L16 28" stroke="currentColor" stroke-width="1.5"/>
    <path d="M6 12 Q11 16 16 14 Q21 12 26 16" stroke="currentColor" stroke-width="1.3"/>
    <circle cx="16" cy="16" r="2" fill="currentColor"/>
  `,
  gurugram: `
    <rect x="8" y="10" width="6" height="18" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <rect x="16" y="14" width="8" height="14" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <line x1="8" y1="16" x2="14" y2="16" stroke="currentColor" stroke-width="1"/>
    <line x1="8" y1="20" x2="14" y2="20" stroke="currentColor" stroke-width="1"/>
    <line x1="16" y1="18" x2="24" y2="18" stroke="currentColor" stroke-width="1"/>
    <line x1="16" y1="22" x2="24" y2="22" stroke="currentColor" stroke-width="1"/>
    <line x1="6" y1="28" x2="26" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  goa: `
    <line x1="16" y1="28" x2="16" y2="12" stroke="currentColor" stroke-width="2"/>
    <path d="M16 12 Q10 10 8 6 Q14 6 16 12" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M16 14 Q22 10 24 6 Q18 7 16 14" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M4 24 Q8 21 12 24 Q16 27 20 24 Q24 21 28 24" stroke="currentColor" stroke-width="1.8" fill="none"/>
  `,
  coimbatore: `
    <circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="2"/>
    <circle cx="16" cy="16" r="3" stroke="currentColor" stroke-width="2"/>
    <line x1="19" y1="16" x2="28" y2="16" stroke="currentColor" stroke-width="1.5"/>
    <line x1="13" y1="16" x2="4" y2="16" stroke="currentColor" stroke-width="1.5"/>
    <line x1="16" y1="19" x2="16" y2="28" stroke="currentColor" stroke-width="1.5"/>
    <line x1="16" y1="13" x2="16" y2="4" stroke="currentColor" stroke-width="1.5"/>
    <line x1="18.12" y1="18.12" x2="24.48" y2="24.48" stroke="currentColor" stroke-width="1.5"/>
    <line x1="13.88" y1="13.88" x2="7.52" y2="7.52" stroke="currentColor" stroke-width="1.5"/>
    <line x1="13.88" y1="18.12" x2="7.52" y2="24.48" stroke="currentColor" stroke-width="1.5"/>
    <line x1="18.12" y1="13.88" x2="24.48" y2="7.52" stroke="currentColor" stroke-width="1.5"/>
  `,
  vizag: `
    <path d="M6 16 Q6 12 16 12 Q26 12 26 16 Q26 20 16 20 Q6 20 6 16 Z" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M22 12 L22 8 L26 8" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="16" r="1.5" fill="currentColor"/>
    <path d="M26 16 L30 16" stroke="currentColor" stroke-width="2"/>
    <path d="M26 14 L29 12 L29 20 L26 18" stroke="currentColor" stroke-width="1.5" fill="none"/>
  `,
  newdelhi: `
    <path d="M10 28 L10 16 Q10 10 16 10 Q22 10 22 16 L22 28" stroke="currentColor" stroke-width="2.2" fill="none"/>
    <path d="M10 28 L22 28" stroke="currentColor" stroke-width="2.2"/>
    <path d="M8 28 L24 28" stroke="currentColor" stroke-width="2.2"/>
    <path d="M13 16 L19 16" stroke="currentColor" stroke-width="1.5"/>
    <line x1="16" y1="10" x2="16" y2="7" stroke="currentColor" stroke-width="2"/>
    <line x1="14" y1="7" x2="18" y2="7" stroke="currentColor" stroke-width="2"/>
    <line x1="6" y1="28" x2="26" y2="28" stroke="currentColor" stroke-width="1.5"/>
  `,
  navimumbai: `
    <path d="M4 24 Q16 8 28 24" stroke="currentColor" stroke-width="2.5" fill="none"/>
    <line x1="4" y1="24" x2="28" y2="24" stroke="currentColor" stroke-width="2"/>
    <line x1="12" y1="24" x2="14" y2="14" stroke="currentColor" stroke-width="1.2"/>
    <line x1="14" y1="24" x2="15" y2="13" stroke="currentColor" stroke-width="1.2"/>
    <line x1="18" y1="24" x2="17" y2="13" stroke="currentColor" stroke-width="1.2"/>
    <line x1="20" y1="24" x2="18" y2="14" stroke="currentColor" stroke-width="1.2"/>
    <line x1="4" y1="18" x2="4" y2="28" stroke="currentColor" stroke-width="2"/>
    <line x1="28" y1="18" x2="28" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  thane: `
    <path d="M16 26 Q10 20 10 14 Q10 10 16 10 Q22 10 22 14 Q22 20 16 26 Z" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M16 10 Q8 6 6 12 Q10 16 16 14" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M16 10 Q24 6 26 12 Q22 16 16 14" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <line x1="16" y1="26" x2="16" y2="30" stroke="currentColor" stroke-width="2"/>
    <path d="M12 30 Q16 28 20 30" stroke="currentColor" stroke-width="1.5"/>
  `,
  southmumbai: `
    <path d="M8 28 L8 14 Q8 6 16 6 Q24 6 24 14 L24 28" stroke="currentColor" stroke-width="2.2" fill="none"/>
    <path d="M12 28 L12 18 Q12 14 16 14 Q20 14 20 18 L20 28" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M8 14 L12 14" stroke="currentColor" stroke-width="1.8"/>
    <path d="M20 14 L24 14" stroke="currentColor" stroke-width="1.8"/>
    <line x1="16" y1="6" x2="16" y2="3" stroke="currentColor" stroke-width="2"/>
    <path d="M14 3 L18 3" stroke="currentColor" stroke-width="2"/>
    <line x1="6" y1="28" x2="26" y2="28" stroke="currentColor" stroke-width="2.2"/>
  `,
  lutyensdelhi: `
    <line x1="6" y1="28" x2="6" y2="14" stroke="currentColor" stroke-width="2"/>
    <line x1="10" y1="28" x2="10" y2="14" stroke="currentColor" stroke-width="2"/>
    <line x1="14" y1="28" x2="14" y2="14" stroke="currentColor" stroke-width="2"/>
    <line x1="18" y1="28" x2="18" y2="14" stroke="currentColor" stroke-width="2"/>
    <line x1="22" y1="28" x2="22" y2="14" stroke="currentColor" stroke-width="2"/>
    <line x1="26" y1="28" x2="26" y2="14" stroke="currentColor" stroke-width="2"/>
    <line x1="4" y1="14" x2="28" y2="14" stroke="currentColor" stroke-width="2"/>
    <path d="M4 14 Q16 6 28 14" stroke="currentColor" stroke-width="2" fill="none"/>
    <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  mumbailocal: `
    <rect x="3" y="10" width="26" height="14" stroke="currentColor" stroke-width="2" rx="3"/>
    <path d="M3 16 L29 16" stroke="currentColor" stroke-width="1.5"/><rect x="6" y="12" width="6" height="4" stroke="currentColor" stroke-width="1.3" rx="1"/>
    <rect x="14" y="12" width="6" height="4" stroke="currentColor" stroke-width="1.3" rx="1"/>
    <circle cx="9" cy="26" r="2.5" stroke="currentColor" stroke-width="1.8"/>
    <circle cx="23" cy="26" r="2.5" stroke="currentColor" stroke-width="1.8"/>
    <line x1="2" y1="29" x2="30" y2="29" stroke="currentColor" stroke-width="1.5"/>
  `,
  delhimetro: `
    <rect x="4" y="8" width="24" height="14" stroke="currentColor" stroke-width="2" rx="4"/>
    <path d="M4 14 L28 14" stroke="currentColor" stroke-width="1.5"/>
    <rect x="7" y="10" width="5" height="4" stroke="currentColor" stroke-width="1.3" rx="1"/>
    <rect x="20" y="10" width="5" height="4" stroke="currentColor" stroke-width="1.3" rx="1"/>
    <line x1="10" y1="22" x2="10" y2="28" stroke="currentColor" stroke-width="1.8"/>
    <line x1="22" y1="22" x2="22" y2="28" stroke="currentColor" stroke-width="1.8"/>
    <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  nammametro: `
    <rect x="5" y="6" width="22" height="12" stroke="currentColor" stroke-width="2" rx="3"/>
    <path d="M5 12 L27 12" stroke="currentColor" stroke-width="1.5"/><rect x="8" y="8" width="5" height="4" stroke="currentColor" stroke-width="1.3" rx="1"/>
    <rect x="19" y="8" width="5" height="4" stroke="currentColor" stroke-width="1.3" rx="1"/>
    <path d="M8 18 L8 24 L4 28" stroke="currentColor" stroke-width="2"/>
    <path d="M24 18 L24 24 L28 28" stroke="currentColor" stroke-width="2"/>
    <line x1="2" y1="28" x2="30" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  howrahexpress: `
    <rect x="2" y="16" width="22" height="10" stroke="currentColor" stroke-width="2" rx="2"/>
    <circle cx="28" cy="20" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M6 16 L6 10 Q6 8 12 8 L18 8 L18 16" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M10 8 L10 4 Q12 2 14 4" stroke="currentColor" stroke-width="1.8"/><circle cx="8"  cy="28" r="2.5" stroke="currentColor" stroke-width="1.8"/>
    <circle cx="18" cy="28" r="2.5" stroke="currentColor" stroke-width="1.8"/>
  `,
  powergrid: `
    <line x1="16" y1="2" x2="16" y2="30" stroke="currentColor" stroke-width="1.5"/>
    <path d="M7 10 L16 14 L25 10" stroke="currentColor" stroke-width="1.8"/>
    <path d="M9 18 L16 22 L23 18" stroke="currentColor" stroke-width="1.8"/>
    <path d="M7 10 L9 18" stroke="currentColor" stroke-width="1.5"/>
    <path d="M25 10 L23 18" stroke="currentColor" stroke-width="1.5"/>
    <path d="M4 10 L8 10" stroke="currentColor" stroke-width="2"/>
    <path d="M24 10 L28 10" stroke="currentColor" stroke-width="2"/>
    <path d="M6 18 L10 18" stroke="currentColor" stroke-width="2"/>
    <path d="M22 18 L26 18" stroke="currentColor" stroke-width="2"/>
  `,
  waterworks: `
    <path d="M16 6 Q16 6 14 12 Q12 18 16 22 Q20 18 18 12 Q16 6 16 6 Z" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M8 12 L24 12" stroke="currentColor" stroke-width="2"/><rect x="13" y="12" width="6" height="5" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <path d="M16 17 L16 22" stroke="currentColor" stroke-width="2"/>
    <path d="M13 22 Q16 28 19 22" stroke="currentColor" stroke-width="1.8" fill="none"/>
  `
};

const ACTION_DESCRIPTIONS = {
  [ACTION_TYPES.DEAL_BREAKER]: 'Steal a complete set of properties from any player. (Includes any buildings.) Play into center to use.',
  [ACTION_TYPES.DEBT_COLLECTOR]: 'Force any player to pay you ₹5Cr. Play into center to use.',
  [ACTION_TYPES.FORCED_DEAL]: 'Swap any property with another player. (Cannot be part of a full set.) Play into center to use.',
  [ACTION_TYPES.SLY_DEAL]: 'Steal a property from the player of your choice. (Cannot be part of a full set.) Play into center to use.',
  [ACTION_TYPES.PASS_GO]: 'Draw 2 extra cards. Play into center to use.',
  [ACTION_TYPES.BIRTHDAY]: "All players give you ₹2Cr as a 'gift'. Play into center to use.",
  [ACTION_TYPES.JUST_SAY_NO]: 'Use any time when an action card is played against you. Play into center to use.',
  [ACTION_TYPES.DOUBLE_RENT]: 'Must be played with a Rent card. Play into center to use.',
  [ACTION_TYPES.HOUSE]: 'Add onto any full set you own to add ₹3Cr to the rent value. (Except railroads and utilities.)',
  [ACTION_TYPES.HOTEL]: 'Add onto any full set you own to add ₹4Cr to the rent value. (Except railroads and utilities. Must be played on a set with a Ghar.)',
  [ACTION_TYPES.INSURANCE]: 'Lay this card face-up on your table. Discard to cancel a Deal Breaker played against any of your complete sets.',
  [ACTION_TYPES.SABOTAGE]: 'Force any two other players to swap one property card of your choice with each other. (Cannot be part of a full set.) Play into center to use.',
};

function wrapText(text, maxChars = 32) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function generateSvgTextLines(text, startY, maxChars = 32, fontSize = 16, lineHeight = 22) {
  const lines = wrapText(text, maxChars);
  return `
    <text font-family="Outfit, sans-serif" font-size="${fontSize}px" font-weight="700" fill="#000000" text-anchor="middle">
      ${lines.map((line, idx) => {
        const yAttr = idx === 0 ? `y="${startY}"` : '';
        const dyAttr = idx === 0 ? '' : `dy="${lineHeight}"`;
        const escapedLine = line
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
        return `<tspan x="210" ${yAttr} ${dyAttr}>${escapedLine}</tspan>`;
      }).join('\n')}
    </text>
  `;
}

function getDefs(base64Font) {
  return `
    <defs>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
      </filter>
      <pattern id="borderPattern" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="2" fill="#000000" fill-opacity="0.15" />
        <path d="M 0 0 L 20 20 M 20 0 L 0 20" stroke="#000000" stroke-opacity="0.05" stroke-width="1" />
      </pattern>
      <!-- Color wheel for wildcard -->
      <g id="colorWheel">
        <path d="M 0,0 L 0,-100 A 100,100 0 0,1 58.8,-80.9 Z" fill="#955436" />
        <path d="M 0,0 L 58.8,-80.9 A 100,100 0 0,1 95.1,-30.9 Z" fill="#55C3F0" />
        <path d="M 0,0 L 95.1,-30.9 A 100,100 0 0,1 95.1,30.9 Z" fill="#D93A96" />
        <path d="M 0,0 L 95.1,30.9 A 100,100 0 0,1 58.8,80.9 Z" fill="#F7941D" />
        <path d="M 0,0 L 58.8,80.9 A 100,100 0 0,1 0,100 Z" fill="#ED1C24" />
        <path d="M 0,0 L 0,100 A 100,100 0 0,1 -58.8,80.9 Z" fill="#FEF200" />
        <path d="M 0,0 L -58.8,80.9 A 100,100 0 0,1 -95.1,30.9 Z" fill="#1FB25A" />
        <path d="M 0,0 L -95.1,30.9 A 100,100 0 0,1 -95.1,-30.9 Z" fill="#003F9E" />
        <path d="M 0,0 L -95.1,-30.9 A 100,100 0 0,1 -58.8,-80.9 Z" fill="#2C2C2C" />
        <path d="M 0,0 L -58.8,-80.9 A 100,100 0 0,1 0,-100 Z" fill="#00796B" />
      </g>
      <style>
        @font-face {
          font-family: 'Outfit';
          src: url('data:font/ttf;base64,${base64Font}') format('truetype');
          font-weight: 800;
          font-style: normal;
        }
      </style>
    </defs>
  `;
}

function getTextColor(hexBg) {
  if (!hexBg) return '#ffffff';
  const hex = hexBg.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#000000' : '#ffffff';
}

function generatePropertySvg(card, base64Font) {
  const display = COLOR_DISPLAY[card.color] || { hex: '#955436' };
  const set = PROPERTY_SETS[card.color] || { rentValues: [1, 2], cardsNeeded: 2 };
  const textOnBand = getTextColor(display.hex);
  
  let titleFontSize = 28;
  if (card.name.length > 12) titleFontSize = 24;
  if (card.name.length > 15) titleFontSize = 20;
  if (card.name.length > 18) titleFontSize = 18;

  let rentRowsY = 240;
  let rentRowsSvg = '';
  set.rentValues.forEach((rent, idx) => {
    const isSet = idx + 1 === set.cardsNeeded;
    const yVal = rentRowsY + idx * 32;
    rentRowsSvg += `
      <!-- Tiny card stack icon -->
      <g transform="translate(60, ${yVal - 14}) scale(0.6)" fill="${display.hex}">
        <rect x="0" y="0" width="16" height="24" rx="2" />
        <rect x="4" y="4" width="16" height="24" rx="2" stroke="#fff" stroke-width="1.5" />
        <text x="35" y="20" font-family="Outfit, sans-serif" font-size="24px" font-weight="900" fill="#444">${idx + 1}</text>
      </g>
      <!-- Dotted line -->
      <line x1="120" y1="${yVal - 5}" x2="280" y2="${yVal - 5}" stroke="#ccc" stroke-dasharray="4 4" stroke-width="2" />
      <!-- Value -->
      <text x="290" y="${yVal}" font-family="Outfit, sans-serif" font-size="20px" font-weight="900" fill="#000">₹${rent}Cr</text>
    `;
    if (isSet) {
      rentRowsSvg += `<text x="280" y="${yVal}" font-family="Outfit, sans-serif" font-size="16px" font-weight="900" fill="#000" text-anchor="end">FULL SET.</text>`;
    }
  });

  return `
    <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
      ${getDefs(base64Font)}
      <rect x="0" y="0" width="420" height="610" rx="20" fill="#FFFFFF" />
      <rect x="10" y="10" width="400" height="590" rx="15" fill="none" stroke="${display.hex}" stroke-width="3" />
      <rect x="25" y="25" width="370" height="100" fill="${display.hex}" rx="10" />
      
      <!-- Value circle top left -->
      <circle cx="55" cy="55" r="25" fill="#FFFFFF" stroke="#333333" stroke-width="2" filter="url(#shadow)" />
      <text x="55" y="62" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#000000" text-anchor="middle">₹${card.value}Cr</text>

      <!-- Property Name -->
      <text x="210" y="85" font-family="Outfit, sans-serif" font-size="${titleFontSize}px" font-weight="900" fill="${textOnBand}" text-anchor="middle" letter-spacing="1px">${card.name.toUpperCase()}</text>

      <!-- RENT label -->
      <text x="210" y="190" font-family="Outfit, sans-serif" font-size="24px" font-weight="900" fill="#000000" text-anchor="middle">RENT</text>
      
      ${rentRowsSvg}

      <!-- Copyright text at bottom -->
      <text x="210" y="580" font-family="Outfit, sans-serif" font-size="12px" font-weight="700" fill="#999999" text-anchor="middle">© Indian Edition</text>
    </svg>
  `;
}

function generateActionSvg(card, base64Font) {
  let bgColor = '#C0C0C0';
  if (card.actionType === ACTION_TYPES.DEAL_BREAKER) bgColor = '#C8A2C8';
  else if (card.actionType === ACTION_TYPES.JUST_SAY_NO) bgColor = '#ADD8E6';
  else if (card.actionType === ACTION_TYPES.PASS_GO) bgColor = '#F5F0DC';
  else if (card.actionType === ACTION_TYPES.DEBT_COLLECTOR) bgColor = '#C5D5C5';
  else if (card.actionType === ACTION_TYPES.BIRTHDAY) bgColor = '#ADD8E6';
  else if (card.actionType === ACTION_TYPES.DOUBLE_RENT) bgColor = '#F5F0DC';
  else if (card.actionType === ACTION_TYPES.HOUSE) bgColor = '#F0F0F0';
  else if (card.actionType === ACTION_TYPES.HOTEL) bgColor = '#ADD8E6';

  const descText = ACTION_DESCRIPTIONS[card.actionType] || '';
  const isJSN = card.actionType === ACTION_TYPES.JUST_SAY_NO;

  return `
    <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
      ${getDefs(base64Font)}
      <rect x="0" y="0" width="420" height="610" rx="20" fill="${bgColor}" />
      
      <rect x="15" y="15" width="390" height="580" rx="15" fill="none" stroke="#333333" stroke-width="2" />
      <rect x="25" y="25" width="370" height="560" rx="10" fill="none" stroke="#333333" stroke-width="4" />
      <rect x="15" y="15" width="390" height="580" rx="15" fill="url(#borderPattern)" />
      
      <text x="210" y="80" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="2px">ACTION CARD</text>

      <circle cx="55" cy="55" r="25" fill="#FFFFFF" stroke="#ED1C24" stroke-width="3" filter="url(#shadow)" />
      <text x="55" y="62" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#ED1C24" text-anchor="middle">₹${card.value}Cr</text>

      <g transform="translate(365, 555) rotate(180)">
        <circle cx="0" cy="0" r="25" fill="#FFFFFF" stroke="#ED1C24" stroke-width="3" filter="url(#shadow)" />
        <text x="0" y="7" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#ED1C24" text-anchor="middle">₹${card.value}Cr</text>
      </g>

      <circle cx="210" cy="250" r="120" fill="#FFFFFF" stroke="#333333" stroke-width="5" filter="url(#shadow)" />
      ${(() => {
        const cleanName = card.name.toUpperCase().replace('!', '');
        const nameParts = cleanName.split(' ');
        if (nameParts.length > 1) {
          return `
            <text x="210" y="242" font-family="Outfit, sans-serif" font-size="34px" font-weight="900" fill="#000000" text-anchor="middle">${nameParts[0]}</text>
            <text x="210" y="280" font-family="Outfit, sans-serif" font-size="34px" font-weight="900" fill="#000000" text-anchor="middle">${nameParts.slice(1).join(' ')}</text>
          `;
        } else {
          return `<text x="210" y="262" font-family="Outfit, sans-serif" font-size="34px" font-weight="900" fill="#000000" text-anchor="middle">${cleanName}</text>`;
        }
      })()}
      ${isJSN ? '<circle cx="210" cy="250" r="110" fill="none" stroke="#ED1C24" stroke-width="12" /><line x1="130" y1="170" x2="290" y2="330" stroke="#ED1C24" stroke-width="12" />' : ''}

      ${generateSvgTextLines(descText, 415, 30, 18, 26)}
    </svg>
  `;
}

function generateRentSvg(card, base64Font) {
  if (card.wild) {
    return `
      <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
        ${getDefs(base64Font)}
        <rect x="0" y="0" width="420" height="610" rx="20" fill="#E0E0E0" />
        <rect x="15" y="15" width="390" height="580" rx="15" fill="none" stroke="#333333" stroke-width="2" />
        <rect x="25" y="25" width="370" height="560" rx="10" fill="none" stroke="#333333" stroke-width="4" />
        <rect x="15" y="15" width="390" height="580" rx="15" fill="url(#borderPattern)" />

        <text x="210" y="80" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="2px">ACTION CARD</text>

        <circle cx="55" cy="55" r="25" fill="#FFFFFF" stroke="#ED1C24" stroke-width="3" filter="url(#shadow)" />
        <text x="55" y="62" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#ED1C24" text-anchor="middle">₹${card.value}Cr</text>
        <g transform="translate(365, 555) rotate(180)">
          <circle cx="0" cy="0" r="25" fill="#FFFFFF" stroke="#ED1C24" stroke-width="3" filter="url(#shadow)" />
          <text x="0" y="7" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#ED1C24" text-anchor="middle">₹${card.value}Cr</text>
        </g>

        <g transform="translate(210, 250) scale(1.2)" stroke="#333333" stroke-width="2" filter="url(#shadow)">
          <use href="#colorWheel" />
          <circle cx="0" cy="0" r="50" fill="#FFFFFF" stroke="#333333" stroke-width="4" />
          <text x="0" y="10" font-family="Outfit, sans-serif" font-size="28px" font-weight="900" fill="#000000" text-anchor="middle" stroke="none">RENT</text>
        </g>

        ${generateSvgTextLines('Charge rent on ANY property set.', 435, 30, 18, 26)}
      </svg>
    `;
  }

  const c1 = COLOR_DISPLAY[card.colors[0]]?.hex || '#888';
  const c2 = COLOR_DISPLAY[card.colors[1]]?.hex || '#888';

  return `
    <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
      ${getDefs(base64Font)}
      <rect x="0" y="0" width="420" height="610" rx="20" fill="#E0E0E0" />
      <rect x="15" y="15" width="390" height="580" rx="15" fill="none" stroke="#333333" stroke-width="2" />
      <rect x="25" y="25" width="370" height="560" rx="10" fill="none" stroke="#333333" stroke-width="4" />
      <rect x="15" y="15" width="390" height="580" rx="15" fill="url(#borderPattern)" />

      <text x="210" y="80" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="2px">ACTION CARD</text>

      <circle cx="55" cy="55" r="25" fill="#FFFFFF" stroke="#ED1C24" stroke-width="3" filter="url(#shadow)" />
      <text x="55" y="62" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#ED1C24" text-anchor="middle">₹${card.value}Cr</text>
      <g transform="translate(365, 555) rotate(180)">
        <circle cx="0" cy="0" r="25" fill="#FFFFFF" stroke="#ED1C24" stroke-width="3" filter="url(#shadow)" />
        <text x="0" y="7" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#ED1C24" text-anchor="middle">₹${card.value}Cr</text>
      </g>

      <circle cx="210" cy="250" r="120" fill="${c1}" stroke="#333333" stroke-width="5" filter="url(#shadow)" />
      <circle cx="210" cy="250" r="85" fill="${c2}" stroke="#333333" stroke-width="4" />
      <circle cx="210" cy="250" r="55" fill="#FFFFFF" stroke="#333333" stroke-width="4" />
      <text x="210" y="260" font-family="Outfit, sans-serif" font-size="32px" font-weight="900" fill="#000000" text-anchor="middle">RENT</text>

      ${generateSvgTextLines(`Charge rent on ${card.colors[0].toUpperCase()} or ${card.colors[1].toUpperCase()} properties.`, 435, 30, 18, 26)}
    </svg>
  `;
}

function generateWildPropertySvg(card, base64Font) {
  if (card.colors[0] === 'wild') {
    return `
      <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
        ${getDefs(base64Font)}
        <rect x="0" y="0" width="420" height="610" rx="20" fill="#FFFFFF" />
        <rect x="15" y="15" width="390" height="580" rx="15" fill="none" stroke="#333333" stroke-width="2" />
        
        <g transform="translate(15, 25)">
          <rect x="0" y="0" width="39" height="40" fill="#955436" />
          <rect x="39" y="0" width="39" height="40" fill="#55C3F0" />
          <rect x="78" y="0" width="39" height="40" fill="#D93A96" />
          <rect x="117" y="0" width="39" height="40" fill="#F7941D" />
          <rect x="156" y="0" width="39" height="40" fill="#ED1C24" />
          <rect x="195" y="0" width="39" height="40" fill="#FEF200" />
          <rect x="234" y="0" width="39" height="40" fill="#1FB25A" />
          <rect x="273" y="0" width="39" height="40" fill="#003F9E" />
          <rect x="312" y="0" width="39" height="40" fill="#2C2C2C" />
          <rect x="351" y="0" width="39" height="40" fill="#00796B" />
        </g>
        
        <text x="210" y="110" font-family="Outfit, sans-serif" font-size="28px" font-weight="900" fill="#000000" text-anchor="middle">PROPERTY WILD CARD</text>

        <!-- Value circle top left -->
        <circle cx="55" cy="55" r="25" fill="#FFFFFF" stroke="#333333" stroke-width="2" filter="url(#shadow)" />
        <text x="55" y="62" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#000000" text-anchor="middle">₹${card.value}Cr</text>
        
        <!-- Value circle bottom right -->
        <g transform="translate(365, 555) rotate(180)">
          <circle cx="0" cy="0" r="25" fill="#FFFFFF" stroke="#333333" stroke-width="2" filter="url(#shadow)" />
          <text x="0" y="7" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#000000" text-anchor="middle">₹${card.value}Cr</text>
        </g>
        
        <circle cx="210" cy="270" r="90" fill="#FFFFFF" stroke="#333333" stroke-width="4" filter="url(#shadow)" />
        <text x="210" y="315" font-family="Outfit, sans-serif" font-size="120px" font-weight="900" fill="#000000" text-anchor="middle">₹</text>

        ${generateSvgTextLines('This card can be used as part of any property set. This card has no monetary value.', 435, 30, 18, 26)}
      </svg>
    `;
  }

  const c1 = COLOR_DISPLAY[card.colors[0]]?.hex || '#888';
  const c2 = COLOR_DISPLAY[card.colors[1]]?.hex || '#888';
  const set1 = PROPERTY_SETS[card.colors[0]] || { rentValues: [] };
  const set2 = PROPERTY_SETS[card.colors[1]] || { rentValues: [] };

  const rent1 = set1.rentValues.map((r, i) => `<text x="80" y="${140 + i*25}" font-family="Outfit, sans-serif" font-size="16px" font-weight="700" fill="${getTextColor(c1)}">${i+1} : ₹${r}Cr</text>`).join('');
  const rent2 = set2.rentValues.map((r, i) => `<text x="80" y="${140 + i*25}" font-family="Outfit, sans-serif" font-size="16px" font-weight="700" fill="${getTextColor(c2)}">${i+1} : ₹${r}Cr</text>`).join('');

  return `
    <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
      ${getDefs(base64Font)}
      <rect x="0" y="0" width="420" height="610" rx="20" fill="#FFFFFF" />
      <rect x="10" y="10" width="400" height="590" rx="15" fill="none" stroke="#333333" stroke-width="2" />
      
      <g>
        <rect x="15" y="15" width="390" height="280" fill="${c1}" />
        <circle cx="55" cy="55" r="25" fill="#FFFFFF" stroke="${c1}" stroke-width="4" filter="url(#shadow)" />
        <text x="55" y="62" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#000000" text-anchor="middle">₹${card.value}Cr</text>
        <text x="210" y="70" font-family="Outfit, sans-serif" font-size="${card.colors[0].length > 10 ? 24 : 32}px" font-weight="900" fill="${getTextColor(c1)}" text-anchor="middle">${card.colors[0].toUpperCase()}</text>
        <text x="210" y="100" font-family="Outfit, sans-serif" font-size="14px" font-weight="900" fill="${getTextColor(c1)}" text-anchor="middle">PROPERTY WILD CARD</text>
        ${rent1}
      </g>

      <line x1="15" y1="305" x2="405" y2="305" stroke="#000000" stroke-width="4" stroke-dasharray="8 4" />

      <g transform="translate(420, 610) rotate(180)">
        <rect x="15" y="15" width="390" height="280" fill="${c2}" />
        <circle cx="55" cy="55" r="25" fill="#FFFFFF" stroke="${c2}" stroke-width="4" filter="url(#shadow)" />
        <text x="55" y="62" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#000000" text-anchor="middle">₹${card.value}Cr</text>
        <text x="210" y="70" font-family="Outfit, sans-serif" font-size="${card.colors[1].length > 10 ? 24 : 32}px" font-weight="900" fill="${getTextColor(c2)}" text-anchor="middle">${card.colors[1].toUpperCase()}</text>
        <text x="210" y="100" font-family="Outfit, sans-serif" font-size="14px" font-weight="900" fill="${getTextColor(c2)}" text-anchor="middle">PROPERTY WILD CARD</text>
        ${rent2}
      </g>
    </svg>
  `;
}

function generateMoneySvg(card, base64Font) {
  let innerBg = '#D4DCC4';
  if (card.value >= 10) innerBg = '#FFE8A1';
  
  return `
    <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
      ${getDefs(base64Font)}
      <rect x="0" y="0" width="420" height="610" rx="20" fill="#ADD8E6" />
      <rect x="15" y="15" width="390" height="580" rx="15" fill="none" stroke="#333333" stroke-width="2" />
      
      <rect x="25" y="25" width="370" height="560" rx="10" fill="${innerBg}" stroke="#333333" stroke-width="4" />
      <rect x="25" y="25" width="370" height="560" rx="10" fill="url(#borderPattern)" />
      
      <circle cx="60" cy="60" r="30" fill="#FFFFFF" stroke="#333333" stroke-width="3" filter="url(#shadow)" />
      <text x="60" y="68" font-family="Outfit, sans-serif" font-size="22px" font-weight="900" fill="#000000" text-anchor="middle">₹${card.value}Cr</text>

      <g transform="translate(360, 550) rotate(180)">
        <circle cx="0" cy="0" r="30" fill="#FFFFFF" stroke="#333333" stroke-width="3" filter="url(#shadow)" />
        <text x="0" y="8" font-family="Outfit, sans-serif" font-size="22px" font-weight="900" fill="#000000" text-anchor="middle">₹${card.value}Cr</text>
      </g>

      <circle cx="210" cy="305" r="140" fill="#FFFFFF" stroke="#333333" stroke-width="6" filter="url(#shadow)" />
      <circle cx="210" cy="305" r="128" fill="none" stroke="#333333" stroke-width="2" />
      <text x="210" y="330" font-family="Outfit, sans-serif" font-size="70px" font-weight="900" fill="#000000" text-anchor="middle">₹${card.value}Cr</text>
      
      <text x="210" y="415" font-family="Outfit, sans-serif" font-size="24px" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="4px">MONEY</text>
    </svg>
  `;
}

async function generateCardFile(card, base64Font) {
  let svgString = '';
  let filename = '';

  if (card.type === CARD_TYPES.PROPERTY) {
    svgString = generatePropertySvg(card, base64Font);
    filename = `prop-${card.color}-${card.landmark}.png`;
  } else if (card.type === CARD_TYPES.MONEY) {
    svgString = generateMoneySvg(card, base64Font);
    filename = `money-${card.value}cr.png`;
  } else if (card.type === CARD_TYPES.ACTION) {
    svgString = generateActionSvg(card, base64Font);
    filename = `action-${card.actionType}.png`;
  } else if (card.type === CARD_TYPES.RENT) {
    svgString = generateRentSvg(card, base64Font);
    filename = card.wild ? 'rent-wild.png' : `rent-${card.colors[0]}-${card.colors[1]}.png`;
  } else if (card.type === CARD_TYPES.WILD_PROPERTY) {
    svgString = generateWildPropertySvg(card, base64Font);
    filename = card.colors[0] === 'wild' ? 'wild-rainbow.png' : `wild-${card.colors.join('-')}.png`;
  }

  if (!svgString || !filename) return;

  const buffer = Buffer.from(svgString);
  const outputPath = path.join(CARDS_DIR, filename);

  try {
    await sharp(buffer)
      .png()
      .toFile(outputPath);
    console.log(`Generated: ${filename}`);
  } catch (err) {
    console.error(`Failed to generate ${filename}:`, err);
  }
}

async function run() {
  console.log('Starting exact official layout card generation...');
  const base64Font = await getBase64Font();

  const deck = createDeck(true, 4);
  const uniqueCardKeys = new Set();
  const uniqueCards = [];

  for (const card of deck) {
    let uniqueKey = '';
    if (card.type === CARD_TYPES.PROPERTY) {
      uniqueKey = `prop-${card.color}-${card.landmark}`;
    } else if (card.type === CARD_TYPES.MONEY) {
      uniqueKey = `money-${card.value}cr`;
    } else if (card.type === CARD_TYPES.ACTION) {
      uniqueKey = `action-${card.actionType}`;
    } else if (card.type === CARD_TYPES.RENT) {
      uniqueKey = card.wild ? 'rent-wild' : `rent-${card.colors[0]}-${card.colors[1]}`;
    } else if (card.type === CARD_TYPES.WILD_PROPERTY) {
      uniqueKey = card.colors[0] === 'wild' ? 'wild-rainbow' : `wild-${card.colors.join('-')}`;
    }

    if (uniqueKey && !uniqueCardKeys.has(uniqueKey)) {
      uniqueCardKeys.add(uniqueKey);
      uniqueCards.push(card);
    }
  }

  for (const card of uniqueCards) {
    await generateCardFile(card, base64Font);
  }

  console.log(`Successfully generated ${uniqueCards.length} official-style cards in public/images/cards/generated/`);
}

run();
