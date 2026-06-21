import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createDeck, COLORS, COLOR_DISPLAY, CARD_TYPES, ACTION_TYPES, PROPERTY_SETS } from '../src/game/constants.js';

// Ensure output directory exists
const CARDS_DIR = path.resolve('public/images/cards/generated');
fs.mkdirSync(CARDS_DIR, { recursive: true });

const CACHE_DIR = path.resolve('.font-cache');
const FONT_CACHE_PATH = path.join(CACHE_DIR, 'outfit.base64');

// Dynamic Font Fetching and Caching
async function getBase64Font() {
  if (fs.existsSync(FONT_CACHE_PATH)) {
    console.log('Using cached Outfit font...');
    return fs.readFileSync(FONT_CACHE_PATH, 'utf8');
  }

  console.log('Fetching Outfit font from Google Fonts...');
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  try {
    const cssRes = await fetch('https://fonts.googleapis.com/css2?family=Outfit:wght@800;900');
    const cssText = await cssRes.text();
    const match = cssText.match(/url\(([^)]+)\)/);
    if (!match) throw new Error('Could not parse font URL from CSS');
    
    const fontUrl = match[1];
    console.log(`Downloading font from: ${fontUrl}`);
    const fontRes = await fetch(fontUrl);
    const arrayBuffer = await fontRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    fs.writeFileSync(FONT_CACHE_PATH, base64);
    console.log('Font cached successfully.');
    return base64;
  } catch (err) {
    console.error('Failed to download Outfit font, falling back to basic rendering:', err);
    return '';
  }
}

// Raw SVG inner markup for all 28 property landmarks
const LANDMARK_PATHS = {
  // Brown
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
  // Light Blue
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
  // Pink
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
  // Orange
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
  // Red
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
  // Yellow
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
  // Green
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
  // Dark Blue
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
  // Railroads
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
  // Utilities
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

// SVG templates for Action card icons
const ACTION_ICONS = {
  [ACTION_TYPES.DEAL_BREAKER]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 15 L15 6 L18 9 L9 18 Z" />
      <path d="M15 15 L22 22" stroke-width="3" />
      <path d="M3 18 L9 24" />
      <path d="M12 3 L18 9" />
    </g>
  `,
  [ACTION_TYPES.DEBT_COLLECTOR]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 22 L28 22" stroke-width="3" />
      <path d="M6 10 L6 22 M12 10 L12 22 M18 10 L18 22 M24 10 L24 22" />
      <path d="M4 10 L28 10 M16 3 L4 10 L28 10 Z" fill="currentColor" fill-opacity="0.1" />
    </g>
  `,
  [ACTION_TYPES.FORCED_DEAL]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 8 L25 8 M25 8 L20 3 M25 8 L20 13" />
      <path d="M25 16 L7 16 M7 16 L12 11 M7 16 L12 21" />
    </g>
  `,
  [ACTION_TYPES.SLY_DEAL]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12 S6 4 16 4 S30 12 30 12 S26 20 16 20 S2 12 2 12 Z" />
      <circle cx="16" cy="12" r="5" fill="currentColor" fill-opacity="0.2" />
      <circle cx="16" cy="12" r="2" fill="currentColor" />
    </g>
  `,
  [ACTION_TYPES.PASS_GO]: `
    <g stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="16" cy="6" r="3" fill="currentColor" />
      <path d="M12 11 L16 13 L19 11 M16 13 L16 19 L13 25 M16 19 L19 25" />
      <path d="M9 13 Q12 17 16 17 M16 17 Q20 17 23 13" />
      <path d="M5 28 C10 25 22 25 27 28" />
    </g>
  `,
  [ACTION_TYPES.BIRTHDAY]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="14" width="20" height="12" rx="2" fill="currentColor" fill-opacity="0.1" />
      <line x1="6" y1="19" x2="26" y2="19" />
      <line x1="11" y1="14" x2="11" y2="8" />
      <line x1="16" y1="14" x2="16" y2="8" />
      <line x1="21" y1="14" x2="21" y2="8" />
      <circle cx="11" cy="7" r="1" fill="#FEF200" stroke="none" />
      <circle cx="16" cy="7" r="1" fill="#FEF200" stroke="none" />
      <circle cx="21" cy="7" r="1" fill="#FEF200" stroke="none" />
    </g>
  `,
  [ACTION_TYPES.JUST_SAY_NO]: `
    <g stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="5.64" y1="5.64" x2="18.36" y2="18.36" />
    </g>
  `,
  [ACTION_TYPES.DOUBLE_RENT]: `
    <g stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 20 L11 13 L17 17 L28 6 M28 6 L21 6 M28 6 L28 13" />
      <path d="M4 25 L28 25" stroke-width="1.5" />
    </g>
  `,
  [ACTION_TYPES.HOUSE]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12 L16 2 L29 12 Z" fill="currentColor" fill-opacity="0.1" />
      <rect x="6" y="12" width="20" height="13" />
      <rect x="13" y="16" width="6" height="9" />
    </g>
  `,
  [ACTION_TYPES.HOTEL]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="8" y="3" width="16" height="24" rx="1" fill="currentColor" fill-opacity="0.1" />
      <rect x="11" y="6" width="3" height="4" />
      <rect x="18" y="6" width="3" height="4" />
      <rect x="11" y="13" width="3" height="4" />
      <rect x="18" y="13" width="3" height="4" />
      <rect x="13" y="21" width="6" height="6" />
    </g>
  `,
  [ACTION_TYPES.INSURANCE]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2 L3 6 V12 C3 17.5 7.5 21.5 12 22.5 C16.5 21.5 21 17.5 21 12 V6 Z" fill="currentColor" fill-opacity="0.1" />
    </g>
  `,
  [ACTION_TYPES.SABOTAGE]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="8" cy="8" r="4" />
      <path d="M3 18 C3 15 5 13 8 13 C11 13 13 15 13 18" />
      <circle cx="24" cy="8" r="4" />
      <path d="M19 18 C19 15 21 13 24 13 C27 13 29 15 29 18" />
      <path d="M12 15 L20 15 M12 15 L14 13 M12 15 L14 17 M20 15 L18 13 M20 15 L18 17" stroke-width="1.5" />
    </g>
  `,
};

// Action Descriptions in Hindi
const ACTION_DESCRIPTIONS = {
  [ACTION_TYPES.DEAL_BREAKER]: 'Kisi player ka complete set chura lo (Ghar/Hotel ke saath)',
  [ACTION_TYPES.DEBT_COLLECTOR]: 'Kisi bhi ek player se ₹5Cr collect karo',
  [ACTION_TYPES.FORCED_DEAL]: 'Apni ek property dekar kisi ki property swap karo',
  [ACTION_TYPES.SLY_DEAL]: 'Kisi player ki ek property chura lo (set se nahi)',
  [ACTION_TYPES.PASS_GO]: 'Deck se 2 extra cards draw karo',
  [ACTION_TYPES.BIRTHDAY]: 'Sabhi players se ₹2Cr birthday gift collect karo',
  [ACTION_TYPES.JUST_SAY_NO]: 'Kisi bhi player ke action card ko cancel karo',
  [ACTION_TYPES.DOUBLE_RENT]: 'Apne isi turn mein khele rent card ka value double karo',
  [ACTION_TYPES.HOUSE]: 'Apne kisi bhi complete property set par rent badhane ke liye lagao',
  [ACTION_TYPES.HOTEL]: 'Ghar lage hue complete set par lagakar rent maximum karo',
  [ACTION_TYPES.INSURANCE]: 'Deal Breaker action se apne set ko secure karo',
  [ACTION_TYPES.SABOTAGE]: 'Do players ke beech force trade karwao',
};

// Dynamic Font Styles Block
function getDefs(base64Font) {
  return `
    <defs>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
      </filter>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="moneyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1B5E20" />
        <stop offset="50%" stop-color="#2E7D32" />
        <stop offset="100%" stop-color="#43A047" />
      </linearGradient>
      <linearGradient id="moneyGradGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2E7D32" />
        <stop offset="50%" stop-color="#F57C00" />
        <stop offset="100%" stop-color="#FFD54F" />
      </linearGradient>
      <pattern id="banknotePattern" width="40" height="40" patternUnits="userSpaceOnUse">
        <line x1="0" y1="40" x2="40" y2="0" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1.5" />
        <text x="20" y="25" font-family="Outfit, sans-serif" font-size="8px" fill="#FFFFFF" fill-opacity="0.02" text-anchor="middle">₹</text>
      </pattern>
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

// Generate Property Card SVG
function generatePropertySvg(card, base64Font) {
  const display = COLOR_DISPLAY[card.color] || { hex: '#955436' };
  const set = PROPERTY_SETS[card.color] || { rentValues: [1, 2], cardsNeeded: 2 };
  const rentValues = set.rentValues;
  const cardsNeeded = set.cardsNeeded;
  const textOnBand = getTextColor(display.hex);
  const landmarkPath = LANDMARK_PATHS[card.landmark] || '';

  // Tabular Rent Values rendering
  let rentRowsY = 240;
  let rentRowsSvg = '';
  rentValues.forEach((rent, idx) => {
    const isSet = idx + 1 === cardsNeeded;
    const yVal = rentRowsY + idx * 32;
    if (isSet) {
      // Draw highlighted set row box
      rentRowsSvg += `
        <rect x="30" y="${yVal - 22}" width="190" height="28" rx="6" fill="${display.hex}" />
        <text x="40" y="${yVal - 2}" font-family="Outfit, sans-serif" font-size="15px" font-weight="900" fill="#FFFFFF">${idx + 1} (set)</text>
        <text x="210" y="${yVal - 2}" font-family="Outfit, sans-serif" font-size="16px" font-weight="900" fill="#FFFFFF" text-anchor="end">₹${rent}Cr</text>
      `;
    } else {
      rentRowsSvg += `
        <text x="40" y="${yVal}" font-family="Outfit, sans-serif" font-size="15px" font-weight="700" fill="#555555">${idx + 1}</text>
        <text x="210" y="${yVal}" font-family="Outfit, sans-serif" font-size="16px" font-weight="900" fill="${display.hex}" text-anchor="end">₹${rent}Cr</text>
      `;
    }
  });

  const houseHotelInfo = set.houseBonus > 0
    ? `
      <g transform="translate(30, 532)">
        <g transform="translate(0, 0) scale(0.9)" stroke="#4CAF50" stroke-width="2" fill="#4CAF50" fill-opacity="0.1">
          <path d="M2 10 L8 3 L14 10 Z"/><rect x="4" y="10" width="8" height="8"/>
        </g>
        <text x="20" y="13" font-family="Outfit, sans-serif" font-size="12px" font-weight="900" fill="#4CAF50">Ghar: +₹${set.houseBonus}Cr</text>

        <g transform="translate(190, -2) scale(0.9)" stroke="#F44336" stroke-width="2" fill="#F44336" fill-opacity="0.1">
          <rect x="3" y="2" width="10" height="15" rx="1"/>
          <rect x="5" y="4" width="2" height="2"/><rect x="9" y="4" width="2" height="2"/>
        </g>
        <text x="210" y="13" font-family="Outfit, sans-serif" font-size="12px" font-weight="900" fill="#F44336">Hotel: +₹${set.hotelBonus}Cr</text>
      </g>
    `
    : '';

  return `
    <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
      ${getDefs(base64Font)}
      <!-- Card background & frames -->
      <rect x="0" y="0" width="420" height="610" rx="24" fill="#FFFFFF" stroke="#CCCCCC" stroke-width="2.5" />
      <rect x="15" y="15" width="390" height="580" rx="14" fill="none" stroke="${display.hex}" stroke-opacity="0.1" stroke-width="2" />

      <!-- Color Header Bar -->
      <rect x="15" y="15" width="390" height="110" rx="10" fill="${display.hex}" />
      <rect x="22" y="22" width="376" height="96" rx="6" fill="none" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="2" />
      <text x="210" y="78" font-family="Outfit, sans-serif" font-size="28px" font-weight="900" fill="${textOnBand}" text-anchor="middle" letter-spacing="1px">${card.name.toUpperCase()}</text>

      <!-- Bank Value Corner Circle -->
      <circle cx="48" cy="48" r="22" fill="#FFFFFF" stroke="${display.hex}" stroke-width="3.5" filter="url(#shadow)" />
      <text x="48" y="54" font-family="Outfit, sans-serif" font-size="15px" font-weight="900" fill="${display.hex}" text-anchor="middle">₹${card.value}</text>

      <!-- Rent Label -->
      <text x="40" y="190" font-family="Outfit, sans-serif" font-size="13px" font-weight="900" fill="#888888" letter-spacing="2px">RENT</text>
      <line x1="40" y1="200" x2="380" y2="200" stroke="#E5E5E5" stroke-width="1.5" />

      <!-- Rent Values Ladder -->
      ${rentRowsSvg}

      <!-- Landmark Illustration -->
      <g transform="translate(250, 230) scale(4)" stroke="${display.hex}" stroke-width="2" fill="none" color="${display.hex}">
        ${landmarkPath}
      </g>

      <!-- Bottom cost details -->
      <line x1="40" y1="510" x2="380" y2="510" stroke="#E5E5E5" stroke-width="1.5" />
      ${houseHotelInfo}
    </svg>
  `;
}

// Generate Money Card SVG
function generateMoneySvg(card, base64Font) {
  const isHighValue = card.value >= 10;
  const fillGradient = isHighValue ? 'url(#moneyGradGold)' : 'url(#moneyGrad)';

  return `
    <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
      ${getDefs(base64Font)}
      <!-- Card Background -->
      <rect x="0" y="0" width="420" height="610" rx="24" fill="${fillGradient}" stroke="#1B5E20" stroke-width="2.5" />
      <rect x="15" y="15" width="390" height="580" rx="14" fill="url(#banknotePattern)" />
      <rect x="15" y="15" width="390" height="580" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2.5" />
      <rect x="23" y="23" width="374" height="564" rx="10" fill="none" stroke="#FFD54F" stroke-opacity="0.2" stroke-width="1.5" />

      <!-- Watermark circle & Large Rupee watermark -->
      <circle cx="210" cy="305" r="140" fill="none" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="4" stroke-dasharray="8 8" />
      <text x="210" y="365" font-family="Outfit, sans-serif" font-size="180px" font-weight="900" fill="#FFFFFF" fill-opacity="0.06" text-anchor="middle">₹</text>

      <!-- Small Corner Badges -->
      <text x="45" y="65" font-family="Outfit, sans-serif" font-size="22px" font-weight="900" fill="#FFFFFF" fill-opacity="0.7">₹${card.value}Cr</text>
      <text x="375" y="565" font-family="Outfit, sans-serif" font-size="22px" font-weight="900" fill="#FFFFFF" fill-opacity="0.7" text-anchor="end">₹${card.value}Cr</text>

      <!-- Big Centered Value -->
      <text x="210" y="325" font-family="Outfit, sans-serif" font-size="84px" font-weight="900" fill="#FFFFFF" text-anchor="middle" filter="url(#shadow)">₹${card.value}Cr</text>
      <text x="210" y="375" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#FFD54F" text-anchor="middle" letter-spacing="5px" fill-opacity="0.9">MONEY</text>
    </svg>
  `;
}

// Generate Action Card SVG
function generateActionSvg(card, base64Font) {
  const IconSvg = ACTION_ICONS[card.actionType] || '';
  const descText = ACTION_DESCRIPTIONS[card.actionType] || '';

  let bgGradStart = '#0D47A1';
  let bgGradEnd = '#1976D2';
  let topLabel = 'ACTION CARD';

  if (card.actionType === ACTION_TYPES.INSURANCE) {
    bgGradStart = '#004D40';
    bgGradEnd = '#00796B';
    topLabel = 'CUSTOM ACTION';
  } else if (card.actionType === ACTION_TYPES.SABOTAGE) {
    bgGradStart = '#4A148C';
    bgGradEnd = '#7B1FA2';
    topLabel = 'CUSTOM ACTION';
  }

  const isJSN = card.actionType === ACTION_TYPES.JUST_SAY_NO;
  const redBar = isJSN ? `<rect x="50" y="128" width="320" height="6" rx="3" fill="#ED1C24" />` : '';

  return `
    <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="actionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgGradStart}" />
          <stop offset="100%" stop-color="${bgGradEnd}" />
        </linearGradient>
      </defs>
      ${getDefs(base64Font)}

      <!-- Background & Border -->
      <rect x="0" y="0" width="420" height="610" rx="24" fill="url(#actionGrad)" stroke="#0D47A1" stroke-width="2.5" />
      <rect x="15" y="15" width="390" height="580" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2.5" />
      <rect x="23" y="23" width="374" height="564" rx="10" fill="none" stroke="#FFC107" stroke-opacity="0.2" stroke-width="1.5" />

      <!-- Top Action Label Tab -->
      <path d="M120 15 L300 15 L280 40 L140 40 Z" fill="#FFC107" />
      <text x="210" y="32" font-family="Outfit, sans-serif" font-size="12px" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="3px">${topLabel}</text>

      <!-- Action Card Title -->
      <text x="210" y="115" font-family="Outfit, sans-serif" font-size="34px" font-weight="900" fill="#FFFFFF" text-anchor="middle" filter="url(#shadow)">${card.name.toUpperCase()}</text>
      ${redBar}

      <!-- Corner Value Circle -->
      <circle cx="48" cy="48" r="22" fill="#FFFFFF" stroke="${isJSN ? '#ED1C24' : '#FFC107'}" stroke-width="4" filter="url(#shadow)" />
      <text x="48" y="53" font-family="Outfit, sans-serif" font-size="14px" font-weight="900" fill="${isJSN ? '#ED1C24' : '#0D47A1'}" text-anchor="middle">₹${card.value}Cr</text>

      <!-- Center Seal & Icon -->
      <circle cx="210" cy="275" r="75" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="3" filter="url(#shadow)" />
      <circle cx="210" cy="275" r="67" fill="none" stroke="#FFC107" stroke-opacity="0.3" stroke-width="1.5" />
      <g transform="translate(150, 215) scale(5)" stroke="#FFFFFF" fill="none" color="#FFFFFF" stroke-width="1.3">
        ${IconSvg}
      </g>

      <!-- Description Block -->
      <rect x="40" y="440" width="340" height="100" rx="10" fill="#000000" fill-opacity="0.5" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
      <foreignObject x="50" y="455" width="320" height="75">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Outfit, sans-serif; font-size: 15px; font-weight: 700; color: #FFFFFF; text-align: center; line-height: 1.45;">
          ${descText}
        </div>
      </foreignObject>
    </svg>
  `;
}

// Generate Rent Card SVG
function generateRentSvg(card, base64Font) {
  if (card.wild) {
    return `
      <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
        ${getDefs(base64Font)}
        <!-- Background -->
        <rect x="0" y="0" width="420" height="610" rx="24" fill="url(#moneyGrad)" stroke="#1B5E20" stroke-width="2.5" />
        <rect x="15" y="15" width="390" height="580" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2.5" />
        
        <!-- Corner circle -->
        <circle cx="48" cy="48" r="22" fill="#FFFFFF" stroke="#2E7D32" stroke-width="3.5" filter="url(#shadow)" />
        <text x="48" y="53" font-family="Outfit, sans-serif" font-size="14px" font-weight="900" fill="#2E7D32" text-anchor="middle">₹${card.value}Cr</text>

        <!-- Big Rupee Circle Badge -->
        <circle cx="210" cy="250" r="55" fill="#FFFFFF" stroke="#2E7D32" stroke-width="4" filter="url(#shadow)" />
        <text x="210" y="268" font-family="Outfit, sans-serif" font-size="56px" font-weight="900" fill="#2E7D32" text-anchor="middle">₹</text>

        <!-- Description Box -->
        <rect x="40" y="415" width="340" height="100" rx="12" fill="#000000" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1.5" />
        <text x="210" y="450" font-family="Outfit, sans-serif" font-size="14px" font-weight="800" fill="#FFC107" text-anchor="middle" letter-spacing="2px">WILD RENT</text>
        <text x="210" y="485" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#FFFFFF" text-anchor="middle">KISI SE BHI RENT LO</text>
      </svg>
    `;
  }

  const colors = (card.colors || []).map(c => COLOR_DISPLAY[c]?.hex || '#888888');

  return `
    <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
      ${getDefs(base64Font)}
      <!-- Background Splits -->
      <rect x="0" y="0" width="420" height="610" rx="24" fill="${colors[0]}" stroke="#CCCCCC" stroke-width="2.5" />
      <polygon points="0,610 420,610 420,0" fill="${colors[1]}" />
      <line x1="0" y1="610" x2="420" y2="0" stroke="#FFFFFF" stroke-width="5" />

      <!-- Inset Border -->
      <rect x="15" y="15" width="390" height="580" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="2" />

      <!-- Corner circle -->
      <circle cx="48" cy="48" r="22" fill="#FFFFFF" stroke="#333333" stroke-width="3" filter="url(#shadow)" />
      <text x="48" y="53" font-family="Outfit, sans-serif" font-size="14px" font-weight="900" fill="#333333" text-anchor="middle">₹${card.value}Cr</text>

      <!-- Center Rupee Badge -->
      <circle cx="210" cy="250" r="50" fill="#FFFFFF" stroke="#333333" stroke-width="3" filter="url(#shadow)" />
      <text x="210" y="268" font-family="Outfit, sans-serif" font-size="52px" font-weight="900" fill="#333333" text-anchor="middle">₹</text>

      <!-- Description Box -->
      <rect x="40" y="415" width="340" height="100" rx="12" fill="#000000" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1.5" />
      <text x="210" y="450" font-family="Outfit, sans-serif" font-size="14px" font-weight="800" fill="#FFC107" text-anchor="middle" letter-spacing="2px">RENT CARD</text>
      <text x="210" y="485" font-family="Outfit, sans-serif" font-size="18px" font-weight="900" fill="#FFFFFF" text-anchor="middle">${card.name.replace('Rent: ', '').toUpperCase()}</text>
    </svg>
  `;
}

// Generate Wild Property Card SVG
function generateWildPropertySvg(card, base64Font) {
  const isFullWild = card.colors?.[0] === 'wild';
  
  if (isFullWild) {
    return `
      <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF6B6B" />
            <stop offset="25%" stop-color="#FFE66D" />
            <stop offset="50%" stop-color="#4ECDC4" />
            <stop offset="75%" stop-color="#45B7D1" />
            <stop offset="100%" stop-color="#A855F7" />
          </linearGradient>
        </defs>
        ${getDefs(base64Font)}

        <!-- Background & Borders -->
        <rect x="0" y="0" width="420" height="610" rx="24" fill="url(#rainbowGrad)" stroke="#A855F7" stroke-width="2.5" />
        <rect x="15" y="15" width="390" height="580" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="2.5" />
        
        <!-- Big text centered -->
        <text x="210" y="290" font-family="Outfit, sans-serif" font-size="64px" font-weight="900" fill="#FFFFFF" text-anchor="middle" filter="url(#shadow)">WILD</text>
        <text x="210" y="340" font-family="Outfit, sans-serif" font-size="20px" font-weight="800" fill="#FFFFFF" text-anchor="middle" filter="url(#shadow)">KISI BHI COLOR MEIN</text>
        <text x="210" y="550" font-family="Outfit, sans-serif" font-size="14px" font-weight="800" fill="#FFFFFF" text-anchor="middle" fill-opacity="0.8">PROPERTY WILD CARD</text>
      </svg>
    `;
  }

  const colorKeys = card.colors || [];
  const c1 = COLOR_DISPLAY[colorKeys[0]] || { hex: '#888' };
  const c2 = COLOR_DISPLAY[colorKeys[1]] || { hex: '#888' };
  
  const set1 = PROPERTY_SETS[colorKeys[0]] || { rentValues: [] };
  const set2 = PROPERTY_SETS[colorKeys[1]] || { rentValues: [] };

  // Render Horizontal Split wild card showing BOTH rent ladders
  let rentRows1 = '';
  set1.rentValues.forEach((rent, i) => {
    rentRows1 += `<text x="40" y="${118 + i * 22}" font-family="Outfit, sans-serif" font-size="12px" font-weight="700" fill="#FFFFFF">${i + 1}: ₹${rent}Cr</text>`;
  });

  let rentRows2 = '';
  set2.rentValues.forEach((rent, i) => {
    rentRows2 += `<text x="250" y="${428 + i * 22}" font-family="Outfit, sans-serif" font-size="12px" font-weight="700" fill="#FFFFFF">${i + 1}: ₹${rent}Cr</text>`;
  });

  return `
    <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
      ${getDefs(base64Font)}
      <!-- Top Half Background -->
      <rect x="0" y="0" width="420" height="305" fill="${c1.hex}" rx="24" />
      <!-- Bottom Half Background -->
      <rect x="0" y="305" width="420" height="305" fill="${c2.hex}" rx="24" />
      
      <!-- Border and divider -->
      <rect x="0" y="0" width="420" height="610" rx="24" fill="none" stroke="#CCCCCC" stroke-width="2.5" />
      <line x1="0" y1="305" x2="420" y2="305" stroke="#FFFFFF" stroke-width="5" />
      <rect x="15" y="15" width="390" height="580" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2" />

      <!-- Cash Value circle -->
      <circle cx="48" cy="48" r="22" fill="#FFFFFF" stroke="#333333" stroke-width="3" filter="url(#shadow)" />
      <text x="48" y="53" font-family="Outfit, sans-serif" font-size="14px" font-weight="900" fill="#333333" text-anchor="middle">₹${card.value}Cr</text>

      <!-- Color 1 Header -->
      <rect x="30" y="65" width="180" height="30" rx="4" fill="#000000" fill-opacity="0.25" />
      <text x="120" y="85" font-family="Outfit, sans-serif" font-size="14px" font-weight="900" fill="#FFFFFF" text-anchor="middle">${c1.name.toUpperCase()}</text>
      ${rentRows1}

      <!-- Color 2 Header -->
      <rect x="210" y="375" width="180" height="30" rx="4" fill="#000000" fill-opacity="0.25" />
      <text x="300" y="395" font-family="Outfit, sans-serif" font-size="14px" font-weight="900" fill="#FFFFFF" text-anchor="middle">${c2.name.toUpperCase()}</text>
      ${rentRows2}

      <!-- Center Wild Badge -->
      <circle cx="210" cy="305" r="46" fill="#FFFFFF" stroke="#333333" stroke-width="3" filter="url(#shadow)" />
      <text x="210" y="312" font-family="Outfit, sans-serif" font-size="20px" font-weight="900" fill="#333333" text-anchor="middle" letter-spacing="1px">WILD</text>
    </svg>
  `;
}

// Readability helper
function getTextColor(hexBg) {
  if (!hexBg) return '#ffffff';
  const hex = hexBg.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#000000' : '#ffffff';
}

// Generate the specific card PNG file
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

// Main execution block
async function run() {
  console.log('Starting card polish generation...');
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

  console.log(`Successfully generated ${uniqueCards.length} polished cards in public/images/cards/generated/`);
}

run();
